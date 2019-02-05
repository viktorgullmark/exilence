import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material';
import { Subscription } from 'rxjs';

import { Player } from '../../shared/interfaces/player.interface';
import { AccountService } from '../../shared/providers/account.service';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { MessageValueService } from '../../shared/providers/message-value.service';
import { PartyService } from '../../shared/providers/party.service';
import { SettingsService } from '../../shared/providers/settings.service';
import { StateService } from '../../shared/providers/state.service';
import { PartySummaryComponent } from './party-summary/party-summary.component';
import { LadderSummaryComponent } from './ladder-summary/ladder-summary.component';
import { AreaSummaryComponent } from './area-summary/area-summary.component';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit, OnDestroy {
  selectedIndex = 0;
  player: Player;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('tabSummary') tabSummary: PartySummaryComponent;
  @ViewChild('tabLadder') tabLadder: LadderSummaryComponent;
  @ViewChild('tabArea') tabArea: AreaSummaryComponent;

  private selectedPlayerSub: Subscription;
  private playerSub: Subscription;
  private partySub: Subscription;
  private currentPlayerValueSub: Subscription;
  private currentPlayerGainSub: Subscription;
  private tabSubscription: any;
  private spectatorCountSub: any;
  private gainHours = 1;

  public spectatorCount = 0;

  constructor(
    public partyService: PartyService,
    private accountService: AccountService,
    private analyticsService: AnalyticsService,
    private messageValueService: MessageValueService,
    private electronService: ElectronService,
    private settingsService: SettingsService,
    private stateService: StateService
  ) {
    this.selectedPlayerSub = this.partyService.selectedPlayer.subscribe(res => {
      if (res !== undefined) {
        this.player = res;
        this.messageValueService.playerValue = this.player.netWorthSnapshots[0].value;
        const isCurrentPlayer = this.partyService.currentPlayer !== undefined && res.account === this.partyService.currentPlayer.account;
        this.partyService.updatePlayerGain(res, isCurrentPlayer);
      }
    });
    this.stateService.state$.subscribe(state => {
      this.spectatorCount = 'spectatorCount'.split('.').reduce((o, i) => o[i], state);
    });

    this.playerSub = this.accountService.player.subscribe(res => {
      if (res !== undefined) {

        this.currentPlayerValueSub = this.messageValueService.currentPlayerValueSubject.subscribe(value => {
          this.updatePopout();
        });
        this.currentPlayerGainSub = this.messageValueService.currentPlayerGainSubject.subscribe(gain => {
          this.updatePopout();
        });
        // update msg-values based on current player
        this.messageValueService.currentPlayerValueSubject.next(res.netWorthSnapshots[0].value);
        const isCurrentPlayer = res.account === this.partyService.currentPlayer.account;
        this.partyService.updatePlayerGain(res, isCurrentPlayer);
      }
    });
    this.partySub = this.partyService.partyUpdated.subscribe(res => {
      if (res !== undefined) {
        let networth = 0;
        this.messageValueService.partyGainSubject.next(0);
        this.partyService.updatePartyGain(this.partyService.party.players);
        res.players.forEach(p => {
          if (p.netWorthSnapshots[0] !== undefined) {
            networth = networth + p.netWorthSnapshots[0].value;
          }
        });
        this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
        this.messageValueService.partyValueSubject.next(networth);
      }
    });
    const gainHourSetting = this.settingsService.get('gainHours');
    if (gainHourSetting !== undefined) {
      this.gainHours = gainHourSetting;
    } else {
      this.gainHours = 1;
      this.settingsService.set('gainHours', 1);
    }

  }

  updatePopout() {
    if (this.electronService.isElectron()) {
      this.electronService.ipcRenderer.send('popout-window-update', {
        event: 'networth',
        data: {
          networth: this.messageValueService.currentPlayerValue,
          gain: this.messageValueService.currentPlayerGain
        }
      });
    }
  }

  ngOnInit() {
    this.partyService.selectedPlayer.next(this.partyService.party.players[0]);
    this.tabSubscription = this.tabGroup.selectedIndexChange.subscribe(res => {
      if (res === 0) {
        this.analyticsService.sendLastPartyPlayerScreen();
      }
      this.selectedIndex = res;
    });
  }

  ngOnDestroy() {
    if (this.selectedPlayerSub !== undefined) {
      this.selectedPlayerSub.unsubscribe();
    }
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
    if (this.spectatorCountSub !== undefined) {
      this.spectatorCountSub.unsubscribe();
    }
    if (this.currentPlayerValueSub !== undefined) {
      this.currentPlayerValueSub.unsubscribe();
    }
    if (this.currentPlayerGainSub !== undefined) {
      this.currentPlayerGainSub.unsubscribe();
    }
    if (this.tabSubscription !== undefined) {
      this.tabSubscription.unsubscribe();
    }
  }

  openDialog() {
    switch (this.selectedIndex) {
      // character
      case 0: {
        break;
      }
      // summary
      case 1: {
        this.analyticsService.sendScreenview('/authorized/party/summary');
        this.tabSummary.openSummaryDialog();
        break;
      }
    }

  }
}
