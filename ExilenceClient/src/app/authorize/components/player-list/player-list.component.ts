import { Component, Input, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Subscription } from 'rxjs/internal/Subscription';

import { LeagueWithPlayers } from '../../../shared/interfaces/league.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { AccountService } from '../../../shared/providers/account.service';
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
  private currentPlayerSub: Subscription;

  constructor(public partyService: PartyService, private accountService: AccountService, private ref: ChangeDetectorRef) { }

  playerLeagues: LeagueWithPlayers[];
  currentPlayer: Player;
  genericPlayers: Player[];

  ngOnInit() {
    this.currentPlayerSub = this.accountService.player.subscribe(res => {
      this.currentPlayer = res;
    });
    if (!this.localList) {
      this.playerLeaguesSub = this.partyService.playerLeagues.subscribe(res => {
        this.playerLeagues = res;
        this.ref.detectChanges();
      });
    } else {
      this.genericPlayersSub = this.partyService.genericPlayers.subscribe(res => {
        if (res !== undefined) {
          this.genericPlayers = res;
          this.ref.detectChanges();

          if (this.partyService.selectedGenericPlayerObj === undefined && this.genericPlayers.length > 0) {
            this.partyService.selectedGenericPlayer.next(this.genericPlayers[0]);
          }
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.currentPlayerSub !== undefined) {
      this.currentPlayerSub.unsubscribe();
    }
    if (this.playerLeaguesSub !== undefined) {
      this.playerLeaguesSub.unsubscribe();
    }
    if (this.genericPlayersSub !== undefined) {
      this.genericPlayersSub.unsubscribe();
    }
  }

  assignLeader(characterName: string) {
    this.partyService.assignLeader(characterName);
  }

  kickFromGroup(characterName: string) {
    this.partyService.kickFromParty(characterName);
  }

  showMessage(message: any) {
    console.log(message);
  }

}
