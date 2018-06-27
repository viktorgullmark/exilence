import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../shared/providers/party.service';
import { RecentPlayer, Player } from '../../shared/interfaces/player.interface';
import { LogMonitorService } from '../../shared/providers/log-monitor.service';
import { ExternalService } from '../../shared/providers/external.service';
import { LogMessage } from '../../shared/interfaces/log-message.interface';
import { AccountInfo } from '../../shared/interfaces/account-info.interface';
import { EquipmentResponse } from '../../shared/interfaces/equipment-response.interface';

@Component({
  selector: 'app-inspect-players',
  templateUrl: './inspect-players.component.html',
  styleUrls: ['./inspect-players.component.scss']
})
export class InspectPlayersComponent implements OnInit {
  genericPlayers: Player[] = [];
  constructor(
    public partyService: PartyService,
    private logMonitorService: LogMonitorService,
    private externalService: ExternalService
  ) {
    this.logMonitorService.areaJoin.subscribe((msg: LogMessage) => {
      this.handleAreaEvent(msg);
    });
    this.logMonitorService.areaLeft.subscribe((msg: LogMessage) => {
      this.handleAreaEvent(msg);
    });

  }
  ngOnInit() {
    this.partyService.genericPlayers.subscribe(res => {
      this.genericPlayers = res;
    });
    this.partyService.selectedGenericPlayer.next(this.partyService.genericPartyPlayers[0]);
  }

  handleAreaEvent(event) {
    this.partyService.getAccountForCharacter(event.player.name).then((account: string) => {
      if (account !== null) {

        const newPlayer: RecentPlayer = {
          name: event.player.name,
          invited: false,
          private: false
        };

        let index = -1;

        for (let i = 0; i < this.partyService.recentPlayers.length; i++) {
          const player = this.partyService.recentPlayers[i];
          if (player.name === event.player.name) {
            index = i;
            break;
          }
        }

        if (index !== -1) {
          this.partyService.recentPlayers.splice(index, 1);
        }

        this.partyService.recentPlayers.forEach((p, i) => {
          if (p.name === event.player.name) {
            this.partyService.recentPlayers.splice(1, i);
          }
        });

        this.partyService.recentPlayers.unshift(newPlayer);
        if (this.partyService.recentPlayers.length > 5) {
          this.partyService.recentPlayers.splice(-1, 1);
        }

        this.addRecentPlayer(newPlayer);
      }
    });
  }

  addRecentPlayer(player: RecentPlayer) {
    player.invited = true;
    this.partyService.getAccountForCharacter(player.name).then((account) => {
      if (account !== null) {
        const info: AccountInfo = {
          accountName: account,
          characterName: player.name,
          sessionId: '',
          filePath: ''
        };
        return this.externalService.getCharacter(info).subscribe((response: EquipmentResponse) => {
          let newPlayer = {} as Player;
          newPlayer.account = account,
            newPlayer.generic = true;
          newPlayer.genericHost = this.partyService.player.character.name;
          newPlayer = this.externalService.setCharacter(response, newPlayer);
          this.partyService.addGenericPlayer(newPlayer);
        },
          (error) => {
            this.partyService.recentPlayers.forEach(p => {
              if (p.name === player.name) {
                p.private = true;
              }
            });
          }
        );
      }
    });
  }

}
