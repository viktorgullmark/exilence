import { Component, OnInit } from '@angular/core';

import { LogMessage, LogMessageChat } from '../../../shared/interfaces/log-message.interface';
import { LogMonitorService } from '../../../shared/providers/log-monitor.service';
import { PartyService } from '../../../shared/providers/party.service';

interface RecentPlayer {
  name: string;
  invited: boolean;
}

@Component({
  selector: 'app-recent-players',
  templateUrl: './recent-players.component.html',
  styleUrls: ['./recent-players.component.scss']
})



export class RecentPlayersComponent implements OnInit {



  recentPlayers: RecentPlayer[] = [];

  constructor(
    private partyService: PartyService,
    private logMonitorService: LogMonitorService
  ) {

    this.logMonitorService.areaJoin.subscribe((msg: LogMessage) => {
      this.handleAreaEvent(msg);
    });

    this.logMonitorService.areaLeft.subscribe((msg: LogMessage) => {
      this.handleAreaEvent(msg);
    });

  }

  handleAreaEvent(event) {
    this.partyService.getAccountForCharacter(event.player.name).then((account: string) => {
      if (account !== null) {
        const newPlayer: RecentPlayer = {
          name: event.player.name,
          invited: false
        };

        this.recentPlayers.unshift(newPlayer);
        if (this.recentPlayers.length > 6) {
          this.recentPlayers.splice(-1, 1);
        }
      }
    });

  }

  playerExists(name) {
    let found = false;
    for (let i = 0; i < this.recentPlayers.length; i++) {
      if (this.recentPlayers[i].name === name) {
        found = true;
        break;
      }
    }
  }

  ngOnInit() {
  }

  inviteToParty(player: RecentPlayer) {
    player.invited = true;
    // this.partyService.invitePlayerToLocalParty(player.name);
    this.partyService.getAccountForCharacter(player.name);
  }

}
