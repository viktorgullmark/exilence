import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { PartyService } from '../shared/providers/party.service';
import { AccountService } from '../shared/providers/account.service';
import { Player } from '../shared/interfaces/player.interface';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {
  form: FormGroup;
  player: Player;
  constructor(@Inject(FormBuilder) fb: FormBuilder, private partyService: PartyService, private accountService: AccountService) {
    this.form = fb.group({
      partyCode: ['my-party-name', Validators.required]
    });
  }

  ngOnInit() {
    this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }

  enterParty() {
    this.partyService.code = this.form.controls.partyCode.value;
    this.partyService.joinParty(this.partyService.code, this.player);
  }
}
