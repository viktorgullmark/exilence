import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper, MatStep } from '@angular/material';
import { Router } from '@angular/router';

import { AccountInfo } from '../shared/interfaces/account-info.interface';
import { Character } from '../shared/interfaces/character.interface';
import { EquipmentResponse } from '../shared/interfaces/equipment-response.interface';
import { Player } from '../shared/interfaces/player.interface';
import { AccountService } from '../shared/providers/account.service';
import { ElectronService } from '../shared/providers/electron.service';
import { ExternalService } from '../shared/providers/external.service';
import { PartyService } from '../shared/providers/party.service';
import { SessionService } from '../shared/providers/session.service';
import { SettingsService } from '../shared/providers/settings.service';

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

    characterList: Character[] = [];
    player = {} as Player;
    charName = this.settingsService.get('account.characterName');
    sessId = this.settingsService.get('account.sessionId');
    accName = this.settingsService.get('account.accountName');
    filePath = this.settingsService.get('account.filePath');
    @ViewChild('stepper') stepper: MatStepper;
    @ViewChild('lastStep') lastStep: MatStep;

    constructor(@Inject(FormBuilder) fb: FormBuilder,
        private router: Router,
        private externalService: ExternalService,
        private electronService: ElectronService,
        private accountService: AccountService,
        private sessionService: SessionService,
        private settingsService: SettingsService,
        private partyService: PartyService) {
        this.accFormGroup = fb.group({
            accountName: [this.accName !== undefined ? this.accName : '', Validators.required]
        });
        this.sessFormGroup = fb.group({
            sessionId: [this.sessId !== undefined ? this.sessId : '']
        });
        this.charFormGroup = fb.group({
            characterName: [this.charName !== undefined ? this.charName : '', Validators.required]
        });
        this.pathFormGroup = fb.group({
            filePath: [this.filePath !== undefined ? this.filePath :
                'C:/Program Files (x86)/Steam/steamapps/common/Path of Exile/logs/Client.txt', Validators.required]
        });
        if (this.charName !== undefined) {
            this.getCharacterList(this.accName);
        }
    }

    alreadySignedIn() {
        // todo: exception for sessid optional
        if (this.charName && this.accName && this.filePath) {
            this.stepper.selectedIndex = 4;
            console.log(this.stepper);
        }
    }

    checkPath() {
        this.pathValid = this.electronService.fs.existsSync(this.pathFormGroup.controls.filePath.value);
    }


    ngOnInit() {
        this.settingsService.deleteAll();
        this.accountService.characterList.subscribe(res => {
            if (res !== undefined) {
                this.characterList = res;
            }
        });
        this.checkPath();
        this.alreadySignedIn();
    }

    getCharacterList(accountName?: string) {
        this.externalService.getCharacterList(accountName !== undefined ? accountName : this.accFormGroup.controls.accountName.value)
            .subscribe((res: Character[]) => {
                this.accountService.characterList.next(res);
            });
    }

    getFormObj() {
        return {
            accountName: this.accFormGroup.controls.accountName.value,
            characterName: this.charFormGroup.controls.characterName.value,
            sessionId: this.sessFormGroup.controls.sessionId.value,
            filePath: this.pathFormGroup.controls.filePath.value
        } as AccountInfo;
    }

    login() {
        const form = this.getFormObj();
        this.externalService.getCharacter(form)
            .subscribe((data: EquipmentResponse) => {
                this.player = this.externalService.setCharacter(data, this.player);
                this.accountService.player.next(this.player);
                this.accountService.accountInfo.next(form);
                this.settingsService.set('account', form);
                this.sessionService.initSession(form.sessionId);
                this.router.navigate(['/authorized/dashboard']);
            });
    }
}
