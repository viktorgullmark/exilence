import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EquipmentResponse } from '../shared/interfaces/equipment-response.interface';
import { ExternalService } from '../shared/providers/external.service';
import { AccountService } from '../shared/providers/account.service';
import { SessionService } from '../shared/providers/session.service';
import { Character } from '../shared/interfaces/character.interface';
import { Player } from '../shared/interfaces/player.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  characterList: Character[] = [];
  constructor(@Inject(FormBuilder) fb: FormBuilder,
    private router: Router,
    private externalService: ExternalService,
    private accountService: AccountService,
    private sessionService: SessionService) {
    this.form = fb.group({
      accountName: ['', Validators.required],
      sessionId: ['', Validators.required],
      characterName: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.accountService.characterList.subscribe(res => {
      this.characterList = res;
    });
  }

  getCharacterList() {
    this.externalService.getCharacterList(this.form.controls.accountName.value).subscribe((res: Character[]) => {
      this.accountService.characterList.next(res);
    });
  }

  login() {
    this.externalService.getCharacter(
      this.form.controls.accountName.value,
      this.form.controls.characterName.value,
      this.form.controls.sessionId.value)
      .subscribe((data: EquipmentResponse) => {
        const playerObj = {} as Player;
        playerObj.character = data.character;
        playerObj.character.items = data.items;
        this.accountService.player.next(playerObj);
        this.sessionService.initSession(this.form.controls.sessionId.value);
        this.router.navigate(['/authorized/profile']);
      });
  }
}
