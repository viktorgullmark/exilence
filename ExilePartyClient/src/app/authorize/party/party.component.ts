import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material';

import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { MessageValueService } from '../../shared/providers/message-value.service';

import { PartyService } from '../../shared/providers/party.service';

import { Player } from '../../shared/interfaces/player.interface';
import { NetWorthSnapshot } from '../../shared/interfaces/income.interface';
import { AccountService } from '../../shared/providers/account.service';


@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit {
  selectedIndex = 0;
  player: Player;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  private oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
  constructor(
    public partyService: PartyService,
    private accountService: AccountService,
    private analyticsService: AnalyticsService,
    private messageValueService: MessageValueService,
    private electronService: ElectronService
  ) {
    this.partyService.selectedPlayer.subscribe(res => {
      if (res !== undefined) {
        this.player = res;
        this.messageValueService.playerValue = this.player.netWorthSnapshots[0].value;
        this.updatePlayerGain(res, false);
      }
    });
    this.accountService.player.subscribe(res => {
      if (res !== undefined) {
        // update msg-values based on current player
        this.messageValueService.currentPlayerValue = res.netWorthSnapshots[0].value;
        this.electronService.ipcRenderer.send('popout-window-update', {
          event: 'networth',
          data: {
            networth: this.messageValueService.currentPlayerValue,
            gain: this.messageValueService.currentPlayerGain
          }
        });
        this.updatePlayerGain(res, false);
      }
    });
    this.partyService.partyUpdated.subscribe(res => {
      if (res !== undefined) {
        this.oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
        let networth = 0;
        this.messageValueService.partyGain = 0;
        res.players.forEach(p => {
          this.partyService.updatePartyGain(p);
          if (p.netWorthSnapshots[0] !== undefined) {
            networth = networth + p.netWorthSnapshots[0].value;
          }
        });
        this.messageValueService.partyValue = networth;
      }
    });
  }

  ngOnInit() {
    this.partyService.selectedPlayer.next(this.partyService.party.players[0]);
    this.tabGroup.selectedIndexChange.subscribe(res => {
      if (res === 0) {
        this.analyticsService.sendLastPartyPlayerScreen();
      }
      this.selectedIndex = res;
    });
  }

  updatePlayerGain(player: Player, current: boolean) {
    const oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
    const pastHoursSnapshots = player.netWorthSnapshots
      .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > oneHourAgo);

    if (pastHoursSnapshots.length > 1) {
      const lastSnapshot = pastHoursSnapshots[0];
      const firstSnapshot = pastHoursSnapshots[pastHoursSnapshots.length - 1];
      const gainHour = ((1000 * 60 * 60)) / (lastSnapshot.timestamp - firstSnapshot.timestamp) * (lastSnapshot.value - firstSnapshot.value);
      if (current) {
        this.messageValueService.currentPlayerGain = gainHour;
      } else {
        this.messageValueService.playerGain = gainHour;
      }
    } else {
      if (current) {
        this.messageValueService.currentPlayerGain = 0;
      } else {
        this.messageValueService.playerGain = 0;
      }
    }

  }


}
