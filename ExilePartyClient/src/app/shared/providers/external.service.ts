import 'rxjs/add/operator/map';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Router } from '@angular/router';
import { AccountInfo } from '../interfaces/account-info.interface';
import { EquipmentResponse } from '../interfaces/equipment-response.interface';
import { Item } from '../interfaces/item.interface';
import { Player } from '../interfaces/player.interface';
import { Property } from '../interfaces/property.interface';
import { Requirement } from '../interfaces/requirement.interface';
import { Stash } from '../interfaces/stash.interface';
import { AnalyticsService } from './analytics.service';
import { ElectronService } from './electron.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { League } from '../interfaces/league.interface';

@Injectable()
export class ExternalService {
  public url: 'https://www.pathofexile.com/character-window/get-items';

  public leagues: BehaviorSubject<League[]> = new BehaviorSubject<League[]>([]);

  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) { }

  getLatestRelease(): Observable<any> {
    return this.http.get('https://api.github.com/repos/viktorgullmark/exile-party/releases/latest');
  }

  getCharacter(data: AccountInfo): Observable<any> {
    this.setCookie(data.sessionId);

    const parameters = `?accountName=${data.accountName}&character=${data.characterName}`;

    return this.http.get('https://www.pathofexile.com/character-window/get-items' + parameters, { withCredentials: true }).catch(e => {
      if (e.status !== 403 && e.status !== 404) {
        this.router.navigate(['/disconnected']);
      }
      return Observable.of(null);
    });
  }

  getLeagues(): Observable<any> {
    const leagueType = 'main';
    const parameters = `?type=${leagueType}`;
    return this.http.get('http://api.pathofexile.com/leagues' + parameters).catch(e => {
      if (e.status !== 403 && e.status !== 404) {
        this.router.navigate(['/disconnected']);
      }
      return Observable.of(null);
    });
  }

  getCharacterList(account: string) {
    const parameters = `?accountName=${account}`;
    return this.http.get('https://www.pathofexile.com/character-window/get-characters' + parameters)
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.router.navigate(['/disconnected']);
        }
        return Observable.of(null);
      });
  }

  getStashTabs(sessionId: string, account: string, league: string) {
    this.setCookie(sessionId);
    const parameters = `?league=${league}&accountName=${account}&tabs=1`;
    return this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.router.navigate(['/disconnected']);
        }
        return Observable.of(null);
      });
  }

  getStashTab(sessionId: string, account: string, league: string, index: number): Observable<Stash> {
    this.analyticsService.sendEvent('income', `GET Stashtab`);
    this.setCookie(sessionId);
    const parameters = `?league=${league}&accountName=${account}&tabIndex=${index}&tabs=1`;
    return this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.router.navigate(['/disconnected']);
        }
        return Observable.of(null);
      });
  }

  validateSessionId(sessionId: string, account: string, league: string, index: number){
    this.setCookie(sessionId);
    const parameters = `?league=${league}&accountName=${account}&tabIndex=${index}&tabs=1`;
    return this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
      .catch(e => {
        if (e.status !== 200) {
          return Observable.of(false);
        }
        return Observable.of(null);
      });
  }

  getAccountForCharacter(character: string) {
    const parameters = `?character=${encodeURIComponent(character)}`;
    return this.http.get('https://www.pathofexile.com/character-window/get-account-name-by-character' + parameters);
  }

  setCookie(sessionId: string) {
    const cookie = {
      url: 'http://www.pathofexile.com',
      name: 'POESESSID',
      value: sessionId,
      domain: '.pathofexile.com',
      path: '/',
      secure: false,
      httpOnly: false,
      expirationDate: undefined
    };

    this.electronService.remote.session.defaultSession.cookies.set(cookie, (error) => {
      if (error) { console.error(error); }
    });
  }

  setCharacter(data: EquipmentResponse, player: Player): Player {
    player.character = data.character;
    player.character.items = this.mapItems(data.items);
    return player;
  }

  mapItems(items: Item[]): Item[] {
    return items.map((item: Item) => {
      if (item.requirements !== undefined) {
        item.requirements = item.requirements.map((req: Requirement) => {
          if (req.values !== undefined) {
            req.values = req.values.map((val: any) => {
              val = val.map(String);
              return val;
            });
          }
          return req;
        });
      }
      if (item.properties !== undefined) {
        item.properties = item.properties.map((req: Property) => {
          if (req.values !== undefined) {
            req.values = req.values.map((val: any) => {
              val = val.map(String);
              return val;
            });
          }
          return req;
        });
      }
      if (item.socketedItems !== undefined) {
        item.socketedItems = item.socketedItems.map((socketed: any) => {
          if (socketed.requirements !== undefined) {
            socketed.requirements = socketed.requirements.map(req => {
              if (req.values !== undefined) {
                req.values = req.values.map((val: any) => {
                  val = val.map(String);
                  return val;
                });
              }
              return req;
            });
          }
          if (socketed.properties !== undefined) {
            socketed.properties = socketed.properties.map((req: Property) => {
              if (req.values !== undefined) {
                req.values = req.values.map((val: any) => {
                  val = val.map(String);
                  return val;
                });
              }
              return req;
            });
          }
          return socketed;
        });
      }
      return item;
    });
  }
}
