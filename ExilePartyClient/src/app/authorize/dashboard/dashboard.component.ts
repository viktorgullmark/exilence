import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../../shared/providers/electron.service';
import { SettingsService } from '../../shared/providers/settings.service';
import { Player } from '../../shared/interfaces/player.interface';
import { PartyService } from '../../shared/providers/party.service';
import { AccountService } from '../../shared/providers/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  isLoading = true;
  recentParties: string[];
  player: Player;

  constructor(
    private electronService: ElectronService,
    private partyService: PartyService,
    private accountService: AccountService,
    private router: Router

  ) {
    this.partyService.recentParties.subscribe(parties => {
      this.recentParties = parties;
    });
  }

  ngOnInit() {
    // give the profile time to render
    this.accountService.player.subscribe(res => {
      this.player = res;
    });
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

  joinParty(partyName: string) {
    this.partyService.leaveParty(this.partyService.party.name, this.player);
    this.partyService.joinParty(partyName, this.player);
    this.partyService.addPartyToRecent(partyName);
    this.router.navigateByUrl('/404', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/authorized/party']));
  }
}


