import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { PartyService } from '../shared/providers/party.service';
import { AccountService } from '../shared/providers/account.service';
import { Player } from '../shared/interfaces/player.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit {
  form: FormGroup;
  player: Player;
  constructor(@Inject(FormBuilder) fb: FormBuilder, private partyService: PartyService, private accountService: AccountService,
    private router: Router) {
    this.form = fb.group({
      partyCode: ['my-party-name', Validators.required]
    });
  }

  ngOnInit() {
    this.accountService.player.subscribe(res => {
      this.player = res;
      console.log(this.player);
    });
  }

  enterParty() {
    this.partyService.leaveParty(this.partyService.party.name, this.player);
    this.partyService.joinParty(this.form.controls.partyCode.value, this.player);
    this.router.navigate(['/authorized/party']);
  }
}
