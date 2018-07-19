import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Player } from '../../shared/interfaces/player.interface';
import { AccountService } from '../../shared/providers/account.service';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { PartyService } from '../../shared/providers/party.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  isLoading = true;
  recentParties: string[];
  player: Player;
  private count = 0;

  constructor(
    private electronService: ElectronService,
    private partyService: PartyService,
    private accountService: AccountService,
    private analyticsService: AnalyticsService,
    private router: Router,
  ) {

    this.partyService.recentParties.subscribe(parties => {
      this.recentParties = parties;
    });
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/dashboard');
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
    if (partyName !== this.partyService.party.name) {
      this.partyService.leaveParty(this.partyService.party.name, this.player);
      this.partyService.joinParty(partyName, this.player);
      this.partyService.addPartyToRecent(partyName);
    }
    this.router.navigateByUrl('/404', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/authorized/party']));
  }
}


