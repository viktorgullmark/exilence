import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStep, MatStepper, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { delay, catchError } from 'rxjs/operators';
import { forkJoin, of, throwError } from 'rxjs';

import { AccountInfo } from '../shared/interfaces/account-info.interface';
import { ExtendedAreaInfo } from '../shared/interfaces/area.interface';
import { Character } from '../shared/interfaces/character.interface';
import { EquipmentResponse } from '../shared/interfaces/equipment-response.interface';
import { NetWorthHistory } from '../shared/interfaces/income.interface';
import { League } from '../shared/interfaces/league.interface';
import { Player } from '../shared/interfaces/player.interface';
import { AccountService } from '../shared/providers/account.service';
import { AnalyticsService } from '../shared/providers/analytics.service';
import { ElectronService } from '../shared/providers/electron.service';
import { ExternalService } from '../shared/providers/external.service';
import { IncomeService } from '../shared/providers/income.service';
import { LadderService } from '../shared/providers/ladder.service';
import { SessionService } from '../shared/providers/session.service';
import { SettingsService } from '../shared/providers/settings.service';
import { LeagueChangedDialogComponent } from '../shared/components/league-changed-dialog/league-changed-dialog.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    accFormGroup: FormGroup;
    leagueFormGroup: FormGroup;
    sessFormGroup: FormGroup;
    charFormGroup: FormGroup;
    pathFormGroup: FormGroup;
    pathValid = false;
    isLoading = false;
    isFetching = false;
    isFetchingLeagues = false;
    fetchedLeagues = false;
    fetched = false;
    characterList: Character[] = [];
    leagues: League[];
    tradeLeagues: League[];
    player = {} as Player;
    leagueName: string;
    tradeLeagueName: string;
    characterName: string;
    accountName: string;
    sessionId: string;
    sessionIdValid = false;
    filePath: string;
    netWorthHistory: NetWorthHistory;
    areaHistory: ExtendedAreaInfo[];
    form: any;
    needsValidation: boolean;

    private twelveHoursAgo = (Date.now() - (12 * 60 * 60 * 1000));

    @ViewChild('stepper') stepper: MatStepper;
    @ViewChild('lastStep') lastStep: MatStep;

    constructor(@Inject(FormBuilder) fb: FormBuilder,
        private router: Router,
        private externalService: ExternalService,
        private electronService: ElectronService,
        private accountService: AccountService,
        private sessionService: SessionService,
        private settingsService: SettingsService,
        private analyticsService: AnalyticsService,
        private ladderService: LadderService,
        private incomeService: IncomeService,
        private dialog: MatDialog
    ) {
        this.externalService.leagues.subscribe((res: League[]) => {
            this.leagues = res;
        });

        this.fetchSettings();

        this.accFormGroup = fb.group({
            accountName: [this.accountName !== undefined ? this.accountName : '', Validators.required]
        });
        this.leagueFormGroup = fb.group({
            leagueName: [this.leagueName !== undefined ? this.leagueName : '', Validators.required],
            tradeLeagueName: [this.tradeLeagueName !== undefined ? this.tradeLeagueName : '', Validators.required]
        });
        this.sessFormGroup = fb.group({
            sessionId: [this.sessionId !== undefined ? this.sessionId : '']
        });
        this.charFormGroup = fb.group({
            characterName: [this.characterName !== undefined ? this.characterName : '', Validators.required]
        });
        this.pathFormGroup = fb.group({
            filePath: [this.filePath !== undefined ? this.filePath :
                'C:/Program Files (x86)/Steam/steamapps/common/Path of Exile/logs/Client.txt', Validators.required]
        });
    }

    checkPath() {
        this.pathValid = this.electronService.fs.existsSync(this.pathFormGroup.controls.filePath.value)
            && this.pathFormGroup.controls.filePath.value.toLowerCase().endsWith('client.txt');
    }

    openLink(link: string) {
        this.electronService.shell.openExternal(link);
    }

    fetchSettings() {
        this.characterName = this.settingsService.get('account.characterName');
        this.sessionId = this.settingsService.get('account.sessionId');
        this.accountName = this.settingsService.get('account.accountName');
        this.leagueName = this.settingsService.get('account.leagueName');
        this.tradeLeagueName = this.settingsService.get('account.tradeLeagueName');
        this.sessionIdValid = this.settingsService.get('account.sessionIdValid');
        this.filePath = this.settingsService.get('account.filePath');
        this.netWorthHistory = this.settingsService.get('networth');
        this.areaHistory = this.settingsService.get('areas');

        if (this.areaHistory === undefined) {
            this.areaHistory = [];
            this.settingsService.set('areas', this.areaHistory);
        }

        // Set up placeholder history if we don't have any
        if (!this.netWorthHistory || this.netWorthHistory.history.length === 0) {
            this.netWorthHistory = {
                lastSnapshot: 0,
                history: [{
                    timestamp: 0,
                    value: 0,
                    items: []
                }]
            };
            this.settingsService.set('networth', this.netWorthHistory);
        }
    }

    ngOnInit() {
        this.accountService.characterList.subscribe(res => {
            if (res !== undefined) {
                this.characterList = res;
            }
        });
        this.checkPath();
        this.sessFormGroup.valueChanges.subscribe(val => {
            this.needsValidation = true;
        });

        // bypass to complete if settings are prefilled
        if (this.characterName !== undefined &&
            this.sessionId !== undefined &&
            this.accountName !== undefined &&
            this.leagueName !== undefined &&
            this.tradeLeagueName !== undefined &&
            this.sessionIdValid !== undefined &&
            this.filePath !== undefined &&
            this.netWorthHistory !== undefined &&
            this.areaHistory !== undefined) {

            this.stepper.selectedIndex = 5;
            this.getLeagues(undefined, false);
            this.getCharacterList(undefined, false);
        }
    }

    getLeagues(accountName?: string, skipStep?: boolean) {
        this.isFetchingLeagues = true;

        const request = forkJoin(
            this.externalService.getCharacterList(accountName !== undefined ? accountName :
                this.accFormGroup.controls.accountName.value),
            this.externalService.getLeagues('main', 1)
        );

        request.subscribe(res => {
            // filter out SSF-leagues when listing trade-leagues
            this.tradeLeagues = res[1].filter(x => x.id.indexOf('SSF') === -1);

            // map character-leagues to new array
            const distinctLeagues = [];
            res[0].forEach(char => {
                if (distinctLeagues.find(l => l.id === char.league) === undefined) {
                    distinctLeagues.push({ id: char.league } as League);
                }
            });

            this.externalService.leagues.next(distinctLeagues);
            this.fetchedLeagues = true;
            if (skipStep) {
                setTimeout(() => {
                    this.stepper.selectedIndex = 1;
                }, 250);
            }
            setTimeout(() => {
                this.isFetchingLeagues = false;
            }, 500);
        });
    }

    mapTradeLeague(event) {
        // if the league is a tradeleague, auto-select tradeleague
        if (this.tradeLeagues.find(x => x.id === event.value)) {
            this.leagueFormGroup.controls.tradeLeagueName.setValue(event.value);
        }
    }

    getCharacterList(accountName?: string, skipStep?: boolean) {
        this.isFetching = true;
        this.externalService.getCharacterList(accountName !== undefined ? accountName : this.accFormGroup.controls.accountName.value)
            .subscribe((res: Character[]) => {
                const charactersByLeague = res.filter(x => x.league === this.leagueFormGroup.controls.leagueName.value);
                this.accountService.characterList.next(charactersByLeague);
                this.fetched = true;

                if (this.characterList.find(x => x.name === this.characterName) === undefined) {
                    this.charFormGroup.controls.characterName.setValue('');
                }
                if (skipStep) {
                    setTimeout(() => {
                        this.stepper.selectedIndex = 2;
                    }, 250);
                }
                setTimeout(() => {
                    this.isFetching = false;
                }, 500);
            },
                error => {
                    this.accountService.characterList.next([]);
                    this.isFetching = false;
                }
            );
    }

    getFormObj() {
        return {
            accountName: this.accFormGroup.controls.accountName.value,
            characterName: this.charFormGroup.controls.characterName.value,
            leagueName: this.leagueFormGroup.controls.leagueName.value,
            tradeLeagueName: this.leagueFormGroup.controls.tradeLeagueName.value,
            sessionId: this.sessFormGroup.controls.sessionId.value,
            filePath: this.pathFormGroup.controls.filePath.value,
            sessionIdValid: this.sessionIdValid
        } as AccountInfo;
    }

    browse() {
        this.electronService.remote.dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] },
            selectedFiles => this.directorySelectorCallback(selectedFiles));
    }

    directorySelectorCallback(filePath) {
        this.pathFormGroup.controls.filePath.setValue(filePath[0]);
        setTimeout(() => {
            this.checkPath();
        }, 500);
    }

    checkLeagueChange(event) {
        if (event.selectedIndex === 3 &&
            (this.settingsService.get('lastLeague') !== undefined
                && (this.settingsService.get('lastLeague') !== this.leagueFormGroup.controls.leagueName.value)
                ||
                (this.settingsService.get('account.tradeLeagueName') !== undefined
                    && this.settingsService.get('account.tradeLeagueName') !== this.leagueFormGroup.controls.tradeLeagueName.value))) {
            // league changed since last log-in
            const dialogRef = this.dialog.open(LeagueChangedDialogComponent, {
                width: '650px',
                data: {
                    icon: 'swap_horiz',
                    title: 'League changed',
                    // tslint:disable-next-line:max-line-length
                    content: 'We detected that you changed league-settings since your last login. Please note that your networth and area history will be mixed between leagues if you continue without clearing the history.<br/><br/>' +
                        'Do you want to clear the history?'
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result !== undefined) {
                    this.netWorthHistory = result.networthHistory;
                    this.areaHistory = result.areaHistory;
                }
            });
        }
    }

    login() {
        this.isLoading = true;
        this.form = this.getFormObj();
        this.analyticsService.startTracking(this.form.accountName);
        this.externalService.getCharacter(this.form)
            .subscribe((data: EquipmentResponse) => {

                const player = this.externalService.setCharacter(data, this.player);
                this.player = player;
                this.ladderService.getLadderInfoForCharacter(this.player.character.league, this.player.character.name).subscribe(
                    res => {
                        if (res !== null && res.list !== null) {
                            this.player.ladderInfo = res.list;
                        }
                        this.completeLogin();
                    },
                    err => this.completeLogin()
                );
            });
    }

    validateSessionId() {
        const form = this.getFormObj();
        this.externalService.validateSessionId(
            form.sessionId,
            form.accountName,
            form.leagueName,
            0
        ).subscribe(res => {
            this.needsValidation = false;
            this.sessionIdValid = res !== false;
        });
    }

    completeLogin() {
        this.player.account = this.form.accountName;
        this.player.netWorthSnapshots = this.netWorthHistory.history;
        this.player.pastAreas = this.areaHistory;

        this.externalService.validateSessionId(
            this.form.sessionId,
            this.player.account,
            this.player.character.league,
            0
        ).subscribe(res => {
            this.sessionIdValid = res !== false;
            this.form = this.getFormObj();
            this.player.sessionIdProvided = this.sessionIdValid;
            this.accountService.player.next(this.player);
            this.accountService.accountInfo.next(this.form);

            // if trade-league has changed since last login, we should update ninjaprices
            if (this.settingsService.get('account.tradeLeagueName') !== this.leagueFormGroup.controls.tradeLeagueName.value) {
                this.externalService.tradeLeagueChanged = true;
            } else {
                this.externalService.tradeLeagueChanged = false;
            }

            this.settingsService.set('account', this.form);
            this.sessionService.initSession(this.form.sessionId);
            this.isLoading = false;
            this.settingsService.set('lastLeague', this.leagueFormGroup.controls.leagueName.value);
            this.router.navigate(['/authorized/dashboard']);
        });
    }
}
