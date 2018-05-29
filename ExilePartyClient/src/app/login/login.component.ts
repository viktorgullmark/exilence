import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EquipmentResponse } from '../shared/interfaces/equipment-response.interface';
import { ExternalService } from '../shared/providers/external.service';
import { AccountService } from '../shared/providers/account.service';
import { SessionService } from '../shared/providers/session.service';
import { Character } from '../shared/interfaces/character.interface';
import { Player } from '../shared/interfaces/player.interface';
import { PartyService } from '../shared/providers/party.service';
import { Item } from '../shared/interfaces/item.interface';
import { Requirement } from '../shared/interfaces/requirement.interface';
import { Property } from '../shared/interfaces/property.interface';
import { SettingsService } from '../shared/providers/settings.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    form: FormGroup;
    characterList: Character[] = [];
    player = {} as Player;
    constructor(@Inject(FormBuilder) fb: FormBuilder,
        private router: Router,
        private externalService: ExternalService,
        private accountService: AccountService,
        private sessionService: SessionService,
        private settingsService: SettingsService,
        private partyService: PartyService) {
        const accName = this.settingsService.get('account.accountName');
        const sessId = this.settingsService.get('account.sessionId');
        const charName = this.settingsService.get('account.characterName');
        this.form = fb.group({
            accountName: [accName !== undefined ? accName : '', Validators.required],
            sessionId: [sessId !== undefined ? sessId : '', Validators.required],
            characterName: [charName !== undefined ? charName : '', Validators.required]
        });
        if (charName !== undefined) {
            this.getCharacterList(accName);
        }
    }

    ngOnInit() {
        this.accountService.characterList.subscribe(res => {
            if (res !== undefined) {
                this.characterList = res;
            }
        });
    }

    getCharacterList(accountName?: string) {
        this.externalService.getCharacterList(accountName !== undefined ? accountName : this.form.controls.accountName.value)
            .subscribe((res: Character[]) => {
                this.accountService.characterList.next(res);
            });
    }

    login() {
        this.externalService.getCharacter(this.form.value)
            .subscribe((data: EquipmentResponse) => {
                this.player = this.externalService.setCharacter(data, this.player);
                this.accountService.player.next(this.player);
                this.accountService.accountInfo.next(this.form.value);
                this.settingsService.set('account', this.form.value);
                this.sessionService.initSession(this.form.controls.sessionId.value);
                this.router.navigate(['/authorized/dashboard']);
            });
    }
}
