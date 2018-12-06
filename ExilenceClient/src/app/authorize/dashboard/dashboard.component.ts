import { Component, OnInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { Player } from '../../shared/interfaces/player.interface';
import { AccountService } from '../../shared/providers/account.service';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { PartyService } from '../../shared/providers/party.service';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material';
import { SettingsService } from '../../shared/providers/settings.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit, AfterViewInit {

  isLoading = true;
  recentParties: string[];
  player: Player;
  private count = 0;

  constructor(
    private electronService: ElectronService,
    private partyService: PartyService,
    private accountService: AccountService,
    private analyticsService: AnalyticsService,
    private settingsService: SettingsService,
    private router: Router,
    private dialog: MatDialog
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

  ngAfterViewInit() {
    this.openDashboardDialog();
  }

  openDashboardDialog(): void {
    setTimeout(() => {
      if (!this.settingsService.get('diaShown_dashboard') && !this.settingsService.get('hideTooltips')) {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          width: '650px',
          data: {
            icon: 'info',
            title: 'Welcome to Exilence!',
            // tslint:disable-next-line:max-line-length
            content: 'To begin, enter a group-name in the top-left and tell your friends enter the same.'
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.settingsService.set('diaShown_dashboard', true);
        });
      }
    });
  }

  removePartyFromRecent(party: string) {
    this.partyService.removePartyFromRecent(party);
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

  joinParty(partyName: string) {
    if (partyName !== this.partyService.party.name) {
      this.partyService.leaveParty(this.partyService.party.name, this.player);
      setTimeout(() => {
        this.partyService.joinParty(partyName, this.player);
        this.partyService.addPartyToRecent(partyName);
        this.router.navigateByUrl('/404', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/authorized/party']));
      }, 750);
    }
  }
}


