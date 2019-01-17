import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

import { Player } from '../../../../shared/interfaces/player.interface';
import { PartyService } from '../../../../shared/providers/party.service';
import { RobotService } from '../../../../shared/providers/robot.service';

@Component({
  selector: 'app-player-badge',
  templateUrl: './player-badge.component.html',
  styleUrls: ['./player-badge.component.scss']
})
export class PlayerBadgeComponent implements OnInit, OnDestroy {
  @Input() player: Player;
  @Input() localPlayer = false;
  selectedPlayer: Player;
  selectedGenericPlayer: Player;
  private selectedPlayerSub: Subscription;
  private selectedGenPlayerSub: Subscription;

  constructor(private partyService: PartyService, private robotService: RobotService) { }

  ngOnInit() {
    if (!this.localPlayer) {
      this.selectedPlayerSub = this.partyService.selectedPlayer.subscribe(res => {
        this.selectedPlayer = res;
      });
    } else {
      this.selectedGenPlayerSub = this.partyService.selectedGenericPlayer.subscribe(res => {
        this.selectedGenericPlayer = res;
      });
    }
  }

  ngOnDestroy() {
    if (this.selectedPlayerSub !== undefined) {
      this.selectedPlayerSub.unsubscribe();
    }
    if (this.selectedGenPlayerSub !== undefined) {
      this.selectedGenPlayerSub.unsubscribe();
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

  getRanking() {
    if (
      this.player.ladderInfo !== null &&
      !this.localPlayer &&
      this.player.ladderInfo.find(t => t.name === this.player.character.name) // Since we fetch top 10 if player is not on ladder.
    ) {
      return this.player.ladderInfo.find(x => x.name === this.player.character.name).rank.overall;

    } else {
      return '';
    }
  }

}
