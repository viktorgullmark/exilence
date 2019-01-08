import { Component, OnInit, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as pkg from '../../../../package.json';
import { Player } from '../../shared/interfaces/player.interface';
import { AccountService } from '../../shared/providers/account.service';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { PartyService } from '../../shared/providers/party.service';
import { InfoDialogComponent } from '../components/info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material';
import { SettingsService } from '../../shared/providers/settings.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { IncomeService } from '../../shared/providers/income.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  public appVersion;
  isLoading = true;
  recentParties: string[];
  player: Player;
  private count = 0;
  private playerSub: Subscription;
  private recentPartySub: Subscription;
  constructor(
    private electronService: ElectronService,
    private partyService: PartyService,
    private accountService: AccountService,
    private analyticsService: AnalyticsService,
    private settingsService: SettingsService,
    private router: Router,
    private dialog: MatDialog,
    private incomeService: IncomeService
  ) {

    this.recentPartySub = this.partyService.recentParties.subscribe(parties => {
      this.recentParties = parties;
    });
  }

  ngOnInit() {
    this.appVersion = pkg['version'];
    this.analyticsService.sendScreenview('/authorized/dashboard');
    // give the profile time to render
    this.playerSub = this.accountService.player.subscribe(res => {
      this.player = res;
    });
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  checkMask(partyName: string, index: number) {

    if (index === 0 && this.partyService.maskedName) {
      return '< MASKED >';
    } else if ((index > 0 && !this.partyService.maskedName) || !this.partyService.maskedName) {
      return partyName;
    } else {
      return partyName;
    }
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
        this.incomeService.Snapshot();
        this.partyService.addPartyToRecent(partyName);
        this.router.navigateByUrl('/404', { skipLocationChange: true }).then(() =>
          this.router.navigate(['/authorized/party']));
      }, 750);
    }
  }

  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
    if (this.recentPartySub !== undefined) {
      this.recentPartySub.unsubscribe();
    }
  }
}


