import { Component, Inject, Input, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Player } from '../../../../shared/interfaces/player.interface';
import { AccountService } from '../../../../shared/providers/account.service';
import { AnalyticsService } from '../../../../shared/providers/analytics.service';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { IncomeService } from '../../../../shared/providers/income.service';
import { MessageValueService } from '../../../../shared/providers/message-value.service';
import { PartyService } from '../../../../shared/providers/party.service';
import { RobotService } from '../../../../shared/providers/robot.service';
import { SettingsService } from '../../../../shared/providers/settings.service';
import { NetworthTableComponent } from '../../networth-table/networth-table.component';
import { SessionService } from '../../../../shared/providers/session.service';
import { KeybindService } from '../../../../shared/providers/keybind.service';
import { AlertService } from '../../../../shared/providers/alert.service';
import { InfoDialogComponent } from '../../info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit, OnDestroy {
  form: FormGroup;

  @Input() player: Player;
  @ViewChild('table') table: NetworthTableComponent;

  isGraphHidden = false;

  public graphDimensions = [640, 200];
  public selfSelected = false;
  public previousSnapshot = false;

  public sessionId: string;
  public sessionIdValid: boolean;

  public reportKeybind: any;
  private selectedPlayerSub: Subscription;

  private currentPlayerGainSub: Subscription;
  public playerGain;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private router: Router,
    private electronService: ElectronService,
    private partyService: PartyService,
    private settingService: SettingsService,
    private robotService: RobotService,
    private incomeService: IncomeService,
    private accountService: AccountService,
    public messageValueService: MessageValueService,
    private settingsService: SettingsService,
    private sessionService: SessionService,
    private keybindService: KeybindService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
    this.form = fb.group({
      searchText: ['']
    });
    this.selectedPlayerSub = this.partyService.selectedPlayer.subscribe(res => {
      if (res.account === this.partyService.currentPlayer.account) {
        res.netWorthSnapshots = this.partyService.currentPlayer.netWorthSnapshots;
        this.selfSelected = true;
        this.playerGain = this.partyService.currentPlayerGain;
      } else {
        this.selfSelected = false;
        this.playerGain = this.messageValueService.playerGain;
      }
      this.player = res;
      this.previousSnapshot = false;
    });
    this.sessionId = this.sessionService.getSession();
    this.sessionIdValid = this.settingsService.get('account.sessionIdValid');

    this.reportKeybind = this.keybindService.activeBinds.find(x => x.event === 'party-personal-networth');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.selectedPlayerSub !== undefined) {
      this.selectedPlayerSub.unsubscribe();
    }
    if(this.currentPlayerGainSub !== undefined){
      this.currentPlayerGainSub.unsubscribe();
    }
  }

  goToSettings() {
    this.router.navigate(['/authorized/settings']);
  }

  formatSnapshot(timestamp) {
    return moment(timestamp).fromNow();
  }

  toggleGraph(event: boolean) {
    this.isGraphHidden = true;
  }

  resetNetWorth() {
    const player = this.player;
    if (player.account === this.partyService.currentPlayer.account) {
      const emptyHistory = this.settingService.deleteNetWorth();
      player.netWorthSnapshots = emptyHistory.history;
      this.incomeService.loadSnapshotsFromSettings();
      this.accountService.player.next(player);
      this.partyService.selectedPlayer.next(player);
      this.partyService.updatePlayer(player);
      this.alertService.showAlert({ message: 'Net worth history was cleared', action: 'OK' });
    }
  }

  openCurrencyDialog(): void {
    setTimeout(() => {
      if (!this.settingsService.get('diaShown_wealth') && !this.settingsService.get('hideTooltips')) {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          width: '650px',
          data: {
            icon: 'attach_money',
            title: 'Currency tab',
            // tslint:disable-next-line:max-line-length
            content: 'Make sure to select the stashtabs you want to track by going to settings.<br/><br/>This tab updates when the selected player changes area in game, at most once every 5 minutes.<br/><br/>' +
              'We store all your net worth data one week back in time. This will be extended in the future.'
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.settingsService.set('diaShown_wealth', true);
        });
      }
    });
  }

  popout() {
    const data = {
      event: 'networth',
    };
    this.electronService.ipcRenderer.send('popout-window', data);
    setTimeout(res => {
      this.electronService.ipcRenderer.send('popout-window-update', {
        event: 'networth',
        data: {
          networth: this.messageValueService.currentPlayerValue,
          gain: this.messageValueService.currentPlayerGain
        }
      });
    }, 1000);
  }

  hideGraph() {
    this.isGraphHidden = true;
  }

  showGraph() {
    this.isGraphHidden = false;
  }

  report(toGame: boolean) {
    this.messageValueService.updateCurrentPlayerMsg();
    if (toGame) {
      this.robotService.sendTextToPathWindow(this.messageValueService.playerNetworthMsg, true);
    } else {
      this.robotService.setTextToClipboard(this.messageValueService.playerNetworthMsg);
    }
  }

  loadPreviousSnapshot(event) {
    if (this.player.netWorthSnapshots[0] !== undefined) {
      this.table.loadPreviousSnapshot(event);

      this.messageValueService.playerValue = event.value;

      const lastSnapshotTimestamp = this.player.netWorthSnapshots[0].timestamp;
      const loadedSnapshotTimestamp = event.name.getTime();

      this.previousSnapshot = loadedSnapshotTimestamp !== lastSnapshotTimestamp;
    }
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
}
