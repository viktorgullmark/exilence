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
  constructor(@Inject(FormBuilder) fb: FormBuilder, public partyService: PartyService, private accountService: AccountService,
    private router: Router) {
    this.form = fb.group({
      partyCode: [this.partyService.party.name !== '' ? this.partyService.party.name : this.generatePartyName(), Validators.required]
    });
  }

  ngOnInit() {
    this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }

  generatePartyName(): string {
    let partyName = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 5; i++) {
        partyName += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return partyName;
  }

  enterParty() {
    this.partyService.leaveParty(this.partyService.party.name, this.player);
    this.partyService.joinParty(this.form.controls.partyCode.value, this.player);

    this.router.navigateByUrl('/404', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/authorized/party']));
  }
}
