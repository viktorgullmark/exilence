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
        private partyService: PartyService) {
        this.form = fb.group({
            accountName: ['', Validators.required],
            sessionId: ['', Validators.required],
            characterName: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.accountService.characterList.subscribe(res => {
            if (res !== undefined) {
                this.characterList = res;
            }
        });
    }

    getCharacterList() {
        this.externalService.getCharacterList(this.form.controls.accountName.value).subscribe((res: Character[]) => {
            this.accountService.characterList.next(res);
        });
    }

    login() {
        this.externalService.getCharacter(this.form.value)
            .subscribe((data: EquipmentResponse) => {
                this.setCharacter(data);
                this.accountService.player.next(this.player);
                this.sessionService.initSession(this.form.controls.sessionId.value);
                this.router.navigate(['/authorized/dashboard']);
            });
    }

    setCharacter(data: EquipmentResponse) {
        this.player.character = data.character;
        this.player.character.items = this.mapItems(data.items);
    }

    mapItems(items: Item[]): Item[] {
        return items.map((item: Item) => {
            if (item.requirements !== undefined) {
                item.requirements = item.requirements.map((req: Requirement) => {
                    if (req.values !== undefined) {
                        req.values = req.values.map((val: any) => {
                            val = val.map(String);
                            return val;
                        });
                    }
                    return req;
                });
            }
            if (item.properties !== undefined) {
                item.properties = item.properties.map((req: Property) => {
                    if (req.values !== undefined) {
                        req.values = req.values.map((val: any) => {
                            val = val.map(String);
                            return val;
                        });
                    }
                    return req;
                });
            }
            if (item.socketedItems !== undefined) {
                item.socketedItems = item.socketedItems.map((socketed: any) => {
                    if (socketed.requirements !== undefined) {
                        socketed.requirements = socketed.requirements.map(req => {
                            if (req.values !== undefined) {
                                req.values = req.values.map((val: any) => {
                                    val = val.map(String);
                                    return val;
                                });
                            }
                            return req;
                        });
                    }
                    if (socketed.properties !== undefined) {
                        socketed.properties = socketed.properties.map((req: Property) => {
                            if (req.values !== undefined) {
                                req.values = req.values.map((val: any) => {
                                    val = val.map(String);
                                    return val;
                                });
                            }
                            return req;
                        });
                    }
                    return socketed;
                });
            }
            return item;
        });
    }
}
