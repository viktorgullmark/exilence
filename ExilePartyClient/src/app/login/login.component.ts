import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material';
import { Router } from '@angular/router';

import { AccountInfo } from '../shared/interfaces/account-info.interface';
import { Character } from '../shared/interfaces/character.interface';
import { EquipmentResponse } from '../shared/interfaces/equipment-response.interface';
import { NetWorthHistory, NetWorthSnapshot } from '../shared/interfaces/income.interface';
import { Player } from '../shared/interfaces/player.interface';
import { AccountService } from '../shared/providers/account.service';
import { AnalyticsService } from '../shared/providers/analytics.service';
import { ElectronService } from '../shared/providers/electron.service';
import { ExternalService } from '../shared/providers/external.service';
import { SessionService } from '../shared/providers/session.service';
import { SettingsService } from '../shared/providers/settings.service';
import { LadderService } from '../shared/providers/ladder.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    accFormGroup: FormGroup;
    sessFormGroup: FormGroup;
    charFormGroup: FormGroup;
    pathFormGroup: FormGroup;
    pathValid = false;
    isLoading = false;
    isFetching = false;
    fetched = false;
    characterList: Character[] = [];
    player = {} as Player;
    characterName: string;
    accountName: string;
    sessionId: string;
    filePath: string;
    netWorthHistory: NetWorthHistory;
    form: any;

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
        private ladderService: LadderService
    ) {

        this.fetchSettings();

        this.accFormGroup = fb.group({
            accountName: [this.accountName !== undefined ? this.accountName : '', Validators.required]
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
        if (this.characterName !== undefined) {
            this.getCharacterList(this.accountName);
        }
    }

    checkPath() {
        this.pathValid = this.electronService.fs.existsSync(this.pathFormGroup.controls.filePath.value)
            && this.pathFormGroup.controls.filePath.value.endsWith('Client.txt');
    }

    checkSessionId() {
        const form = this.getFormObj();
        this.externalService.getCharacter(form).subscribe(
            success => {

            },
            error => {

            });
    }

    openLink(link: string) {
        this.electronService.shell.openExternal(link);
    }

    fetchSettings() {
        this.characterName = this.settingsService.get('account.characterName');
        this.sessionId = this.settingsService.get('account.sessionId');
        this.accountName = this.settingsService.get('account.accountName');
        this.filePath = this.settingsService.get('account.filePath');
        this.netWorthHistory = this.settingsService.get('networth');

        // Filter snapshots to only include last hour
        if (this.netWorthHistory && this.netWorthHistory.history) {
            this.netWorthHistory.history = this.netWorthHistory.history
                .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > this.twelveHoursAgo);
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
    }

    getCharacterList(accountName?: string) {
        this.isFetching = true;
        this.externalService.getCharacterList(accountName !== undefined ? accountName : this.accFormGroup.controls.accountName.value)
            .subscribe((res: Character[]) => {
                this.accountService.characterList.next(res);
                this.fetched = true;
                this.stepper.selectedIndex = 1;
                // res.forEach(char => {
                //     if ('lastActive' in char && char.lastActive === true) {
                //         // Set character here
                //     }
                // });
                // set delay to avoid flickering when animating
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
            sessionId: this.sessFormGroup.controls.sessionId.value,
            filePath: this.pathFormGroup.controls.filePath.value
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

    completeLogin() {
        this.player.account = this.form.accountName;
        this.player.netWorthSnapshots = this.netWorthHistory.history;
        this.accountService.player.next(this.player);
        this.accountService.accountInfo.next(this.form);
        this.settingsService.set('account', this.form);
        this.analyticsService.startTracking(this.form.accountName);
        this.sessionService.initSession(this.form.sessionId);
        this.isLoading = false;
        this.router.navigate(['/authorized/dashboard']);
    }
}
