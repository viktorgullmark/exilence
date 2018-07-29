import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material';
import { Router } from '@angular/router';

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
    fetched = false;
    characterList: Character[] = [];
    leagues: League[];
    player = {} as Player;
    leagueName: string;
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
        private incomeService: IncomeService
    ) {
        this.externalService.leagues.subscribe((res: League[]) => {
            this.leagues = res;
        });

        this.externalService.getLeagues().subscribe(res => {
            this.externalService.leagues.next(res);
        });
        this.fetchSettings();

        this.accFormGroup = fb.group({
            accountName: [this.accountName !== undefined ? this.accountName : '', Validators.required]
        });
        this.leagueFormGroup = fb.group({
            leagueName: [this.leagueName !== undefined ? this.leagueName : '', Validators.required]
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
            && this.pathFormGroup.controls.filePath.value.endsWith('Client.txt');
    }

    openLink(link: string) {
        this.electronService.shell.openExternal(link);
    }

    fetchSettings() {
        this.characterName = this.settingsService.get('account.characterName');
        this.sessionId = this.settingsService.get('account.sessionId');
        this.accountName = this.settingsService.get('account.accountName');
        this.leagueName = this.settingsService.get('account.leagueName');
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
    }

    getCharacterList(accountName?: string) {
        this.isFetching = true;
        this.externalService.getCharacterList(accountName !== undefined ? accountName : this.accFormGroup.controls.accountName.value)
            .subscribe((res: Character[]) => {
                const charactersByLeague = res.filter(x => x.league === this.leagueFormGroup.controls.leagueName.value);
                this.accountService.characterList.next(charactersByLeague);
                this.fetched = true;

                if (this.characterList.find(x => x.name === this.characterName) === undefined) {
                    this.charFormGroup.controls.characterName.setValue('');
                }
                setTimeout(() => {
                    this.stepper.selectedIndex = 2;
                }, 250);
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

    login() {
        this.isLoading = true;
        this.form = this.getFormObj();
        this.analyticsService.startTracking(this.form.accountName);
        this.externalService.getCharacter(this.form)
            .subscribe((data: EquipmentResponse) => {

                const player = this.externalService.setCharacter(data, this.player);
                this.player = player;
                this.ladderService.getLadderInfoForCharacter(this.player.character.league, this.player.character.name).subscribe(res => {
                    if (res !== null && res.list !== null) {
                        this.player.ladderInfo = res.list;
                    }
                    this.completeLogin();
                });
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
            this.settingsService.set('account', this.form);
            this.sessionService.initSession(this.form.sessionId);
            this.incomeService.Snapshot();
            this.isLoading = false;
            this.router.navigate(['/authorized/dashboard']);
        });
    }
}
