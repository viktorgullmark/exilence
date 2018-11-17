import 'rxjs/add/operator/map';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AppConfig } from '../../../environments/environment';
import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { AnalyticsService } from './analytics.service';
import { LogService } from './log.service';
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
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    private logService: LogService
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
              if (data !== null) {
                const player = this.localPlayer;
                player.ladderInfo = data.list;
                this.partyService.updatePlayer(player);
              }
            });
        }
      },
        1000 * 60 * 1); // fetch ladder every 5 minutes.
    }
  }

  getLadderInfoForCharacter(league: string, characterName: string): Observable<any> {
    this.cooldown = true;
    setTimeout(x => {
      this.cooldown = false;
    }, 1000 * 60 * 1);
    // tslint:disable-next-line:max-line-length
    this.logService.log(`Retriving ladder for league: ${league} and character: ${characterName}`);
    const parameters = `?character=${characterName}&league=${league}`;
    this.analyticsService.sendEvent('ladder', `GET LadderInfo`);
    return this.http.get(AppConfig.url + 'api/stats/ladder' + parameters)
      .catch(e => {
        return Observable.of(null);
      });
  }
}
