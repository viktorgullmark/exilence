import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Subscription } from 'rxjs/internal/Subscription';

import { LeagueWithPlayers } from '../../../shared/interfaces/league.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit, OnDestroy {

  @Input() localList = false;
  @ViewChild(ContextMenuComponent) public badgeMenu: ContextMenuComponent;

  private playerLeaguesSub: Subscription;
  private genericPlayersSub: Subscription;

  constructor(public partyService: PartyService) { }

  playerLeagues: LeagueWithPlayers[];

  genericPlayers: Player[];

  ngOnInit() {
    if (!this.localList) {
      this.playerLeaguesSub = this.partyService.playerLeagues.subscribe(res => {
        this.playerLeagues = res;
      });
    } else {
      this.genericPlayersSub = this.partyService.genericPlayers.subscribe(res => {
        if (res !== undefined) {
          this.genericPlayers = res;
          if (this.partyService.selectedGenericPlayerObj === undefined && this.genericPlayers.length > 0) {
            this.partyService.selectedGenericPlayer.next(this.genericPlayers[0]);
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.playerLeaguesSub !== undefined) {
      this.playerLeaguesSub.unsubscribe();
    }
    if (this.genericPlayersSub !== undefined) {
      this.genericPlayersSub.unsubscribe();
    }
  }

  showMessage(message: any) {
    console.log(message);
  }

}
