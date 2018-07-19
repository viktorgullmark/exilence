import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material';

import { NetWorthSnapshot } from '../../shared/interfaces/income.interface';
import { Player } from '../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { MessageValueService } from '../../shared/providers/message-value.service';
import { PartyService } from '../../shared/providers/party.service';

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
    private analyticsService: AnalyticsService,
    private messageValueService: MessageValueService,
    private electronService: ElectronService
  ) {
    this.partyService.selectedPlayer.subscribe(res => {
      if (res !== undefined) {
        this.player = res;
        this.messageValueService.playerValue = this.player.netWorthSnapshots[0].value;
        this.updatePlayerGain(res);
        this.electronService.ipcRenderer.send('popout-networth-update', {
          networth: this.messageValueService.playerValue,
          gain: this.messageValueService.playerGain
        });
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

  updatePlayerGain(player: Player) {
    const oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
    const pastHoursSnapshots = player.netWorthSnapshots
      .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > oneHourAgo);

    if (pastHoursSnapshots.length > 1) {
      const lastSnapshot = pastHoursSnapshots[0];
      const firstSnapshot = pastHoursSnapshots[pastHoursSnapshots.length - 1];
      const gainHour = ((1000 * 60 * 60)) / (lastSnapshot.timestamp - firstSnapshot.timestamp) * (lastSnapshot.value - firstSnapshot.value);
      this.messageValueService.playerGain = gainHour;
    } else {
      this.messageValueService.playerGain = 0;
    }

  }


}
