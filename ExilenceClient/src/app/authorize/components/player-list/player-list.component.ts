import { Component, OnInit, Input } from '@angular/core';
import { PartyService } from '../../../shared/providers/party.service';
import { Player } from '../../../shared/interfaces/player.interface';
import { Observable } from 'rxjs/Observable';
import { LeagueWithPlayers } from '../../../shared/interfaces/league.interface';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {

  @Input() localList = false;

  constructor(public partyService: PartyService) { }

  playerLeagues: LeagueWithPlayers[];

  genericPlayers: Player[];

  ngOnInit() {
    if (!this.localList) {
      this.partyService.playerLeagues.subscribe(res => {
        this.playerLeagues = res;
      });
    } else {
      this.partyService.genericPlayers.subscribe(res => {
        if (res !== undefined) {
          this.genericPlayers = res;
          if (this.partyService.selectedGenericPlayerObj === undefined && this.genericPlayers.length > 0) {
            this.partyService.selectedGenericPlayer.next(this.genericPlayers[0]);
          }
        }
      });
    }
  }
}
