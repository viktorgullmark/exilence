import 'rxjs/add/operator/map';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AccountService } from './account.service';
import { Player } from '../interfaces/player.interface';
import { PartyService } from './party.service';

@Injectable()
export class LadderService {
  public url = 'http://poe-racing.com/api/ladder/';
  localPlayer: Player;
  isPolling = false;
  cooldown = false;
  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private partyService: PartyService
  ) {
    this.accountService.player.subscribe(res => {
      if (res !== undefined) {
        this.localPlayer = res;
      }
    });
  }

  startPollingLadder() {
    if (!this.isPolling) {
      this.isPolling = true;
      setInterval(x => {
        if (!this.cooldown) {
          this.getLadderInfoForCharacter(this.localPlayer.character.league, this.localPlayer.character.name)
            .subscribe(data => {
              const player = this.localPlayer;
              player.ladderInfo = data.list;
              this.partyService.updatePlayer(player);
            });
        }
      },
        1000 * 60 * 5); // fetch ladder every 5 minutes.
    }
  }

  getLadderInfoForCharacter(league: string, characterName: string): Observable<any> {
    this.cooldown = true;
    setTimeout(x => {
      this.cooldown = false;
    }, 1000 * 60 * 5);
    const parameters = `?name=${characterName}&ladder=${league}`;
    return this.http.get(this.url + 'follow' + parameters)
      .catch(e => {
        return Observable.of(e);
      });
  }
}
