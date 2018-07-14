import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../../../shared/interfaces/player.interface';
import { PartyService } from '../../../../shared/providers/party.service';
import { RobotService } from '../../../../shared/providers/robot.service';

@Component({
  selector: 'app-player-badge',
  templateUrl: './player-badge.component.html',
  styleUrls: ['./player-badge.component.scss']
})
export class PlayerBadgeComponent implements OnInit {
  @Input() player: Player;
  @Input() localPlayer = false;
  selectedPlayer: Player;
  selectedGenericPlayer: Player;
  constructor(private partyService: PartyService, private robotService: RobotService) { }

  ngOnInit() {
    if (!this.localPlayer) {
      this.partyService.selectedPlayer.subscribe(res => {
        this.selectedPlayer = res;
      });
    } else {
      this.partyService.selectedGenericPlayer.subscribe(res => {
        this.selectedGenericPlayer = res;
      });
    }
  }

  invitePlayer(playerName: string) {
    const result = this.robotService.sendTextToPathWindow(`/invite ${playerName}`, true);
  }

  selectPlayer() {
    if (!this.localPlayer) {
      this.partyService.selectedPlayer.next(this.player);
    }
    if (this.localPlayer) {
      this.partyService.selectedGenericPlayer.next(this.player);
    }
  }

}
