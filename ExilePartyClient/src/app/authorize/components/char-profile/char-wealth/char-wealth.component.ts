import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-char-wealth',
  templateUrl: './char-wealth.component.html',
  styleUrls: ['./char-wealth.component.scss']
})
export class CharWealthComponent implements OnInit {
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

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private router: Router,
    private electronService: ElectronService,
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    private settingService: SettingsService,
    private robotService: RobotService,
    private incomeService: IncomeService,
    private accountService: AccountService,
    public messageValueService: MessageValueService,
    private settingsService: SettingsService,
    private sessionService: SessionService,
    private keybindService: KeybindService
  ) {
    this.form = fb.group({
      searchText: ['']
    });
    this.partyService.selectedPlayer.subscribe(res => {
      if (res.account === this.partyService.currentPlayer.account) {
        res.netWorthSnapshots = this.partyService.currentPlayer.netWorthSnapshots;
        this.selfSelected = true;
      } else {
        this.selfSelected = false;
      }
      this.player = res;
      this.previousSnapshot = false;
    });
    this.sessionId = this.sessionService.getSession();
    this.sessionIdValid = this.settingsService.get('account.sessionIdValid');

    this.reportKeybind = this.keybindService.activeBinds.find(x => x.event === 'party-personal-networth');
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/party/player/wealth');
  }

  goToSettings() {
    this.router.navigate(['/authorized/settings']);
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
    }
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
    this.messageValueService.updateMessages();
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
