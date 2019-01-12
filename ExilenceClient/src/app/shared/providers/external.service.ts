import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';
import 'rxjs/operators/mergeMap';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { bindCallback } from 'rxjs';
import RateLimiter from 'rxjs-ratelimiter';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { AccountInfo } from '../interfaces/account-info.interface';
import { EquipmentResponse } from '../interfaces/equipment-response.interface';
import { Item } from '../interfaces/item.interface';
import { League } from '../interfaces/league.interface';
import { Player } from '../interfaces/player.interface';
import { Property } from '../interfaces/property.interface';
import { Requirement } from '../interfaces/requirement.interface';
import { Stash } from '../interfaces/stash.interface';
import { AnalyticsService } from './analytics.service';
import { ElectronService } from './electron.service';
import { LogService } from './log.service';

@Injectable()
export class ExternalService {
  public url: 'https://www.pathofexile.com/character-window/get-items';

  public leagues: BehaviorSubject<League[]> = new BehaviorSubject<League[]>([]);
  public tradeLeagueChanged = false;

  private TradeSearchRequestLimit = new RateLimiter(1, 1200);
  private TradeFetchRequestLimit = new RateLimiter(1, 600);

  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
    private analyticsService: AnalyticsService,
    private router: Router,
    private logService: LogService
  ) { }

  getLatestRelease(): Observable<any> {
    return this.http.get('https://api.github.com/repos/viktorgullmark/exilence/releases/latest');
  }

  getCharacter(data: AccountInfo): Observable<any> {
    const setCookieAsync = bindCallback(this.setCookie);
    return setCookieAsync(data.sessionId, this.electronService).mergeMap((error) => {

      const parameters = `?accountName=${data.accountName}&character=${data.characterName}`;

      return this.http.get('https://www.pathofexile.com/character-window/get-items' + parameters, { withCredentials: true }).catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.logService.log('Could not character items, disconnecting!', null, true);
          this.router.navigate(['/disconnected', true]);
        }
        return Observable.of(null);
      });
    });
  }

  getCharacterList(account: string, sessionId?: string) {
    const setCookieAsync = bindCallback(this.setCookie);
    return setCookieAsync(sessionId, this.electronService).mergeMap((error) => {

      const parameters = `?accountName=${account}`;
      return this.http.get('https://www.pathofexile.com/character-window/get-characters' + parameters)
        .catch(e => {
          if (e.status !== 403 && e.status !== 404) {
            this.logService.log('Could not fetch character list, disconnecting!', null, true);
            this.router.navigate(['/disconnected', true]);
          }
          return Observable.of(null);
        });
    });
  }

  getLeagues(type: string, compact: number) {
    const parameters = `?type=${type}&compact=${compact}`;
    return this.http.get('http://api.pathofexile.com/leagues' + parameters)
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.logService.log('Could not fetch leagues, disconnecting!', null, true);
          this.router.navigate(['/disconnected', true]);
        }
        return Observable.of(null);
      });
  }

  getStashTabs(sessionId: string, account: string, league: string) {
    const setCookieAsync = bindCallback(this.setCookie);
    return setCookieAsync(sessionId, this.electronService).mergeMap((error) => {
      const parameters = `?league=${league}&accountName=${account}&tabs=1`;
      return this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
        .catch(e => {
          if (e.status !== 403 && e.status !== 404) {
            this.logService.log('Could not fetch stashtab list, disconnecting!', null, true);
            this.router.navigate(['/disconnected', true]);
          }
          return Observable.of(null);
        });
    });
  }

  getStashTab(sessionId: string, account: string, league: string, index: number): Observable<Stash> {
    this.analyticsService.sendEvent('income', `GET Stashtab`);
    const setCookieAsync = bindCallback(this.setCookie);
    return setCookieAsync(sessionId, this.electronService).mergeMap((error) => {
      const parameters = `?league=${league}&accountName=${account}&tabIndex=${index}&tabs=1`;
      return this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
        .retryWhen(errors => errors.delay(50).take(5))
        .catch(e => {
          if (e.status !== 403 && e.status !== 404) {
            this.logService.log('Could not fetch stashtabs, disconnecting!', null, true);
            this.router.navigate(['/disconnected', true]);
          }
          return Observable.of(null);
        });
    });
  }

  validateSessionId(sessionId: string, account: string, league: string, index: number) {
    const setCookieAsync = bindCallback(this.setCookie);
    return setCookieAsync(sessionId, this.electronService).mergeMap((error) => {
      const parameters = `?league=${league}&accountName=${account}&tabIndex=${index}&tabs=1`;
      return this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
        .catch(e => {
          if (e.status === 500 || e.status === 502 || e.status === 503) {
            this.logService.log('Could not validate, disconnecting!', null, true);
            this.router.navigate(['/disconnected', true]);
          }
          if (e.status !== 200) {
            return Observable.of(false);
          }
          return Observable.of(null);
        });
    });
  }

  getAccountForCharacter(character: string) {
    const parameters = `?character=${encodeURIComponent(character)}`;
    return this.http.get('https://www.pathofexile.com/character-window/get-account-name-by-character' + parameters);
  }

  FetchPublicMaps(subLines: any[], query: string) {
    return Observable.from(subLines)
      .concatMap((lines: any) => {
        const url = `https://www.pathofexile.com/api/trade/fetch/${lines.join(',')}?query=${query}`;
        const removeCookieAsync = bindCallback(this.removeCookie);
        return removeCookieAsync(this.electronService).mergeMap((error) => {
          if (!error) {
            return this.TradeFetchRequestLimit.limit(this.http.get(url));
          }
          return Observable.of(null);
        }
        );
      }).toArray();
  }

  SearchPublicMaps(account: string, league: string) {

    const tierObservable = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    return Observable.from(tierObservable)
      .concatMap((tier: any) => {

        const requestUrl = 'https://www.pathofexile.com/api/trade/search/' + league;
        const requestJson = {
          'query': {
            'status': {
              'option': 'any'
            },
            'filters': {
              'trade_filters': {
                'disabled': false,
                'filters': {
                  'account': {
                    'input': account
                  }
                }
              },
              'map_filters': {
                'disabled': false,
                'filters': {
                  'map_tier': {
                    'min': tier,
                    'max': tier
                  }
                }
              }
            }
          },
          'sort': {
            'price': 'asc'
          }
        };
        const removeCookieAsync = bindCallback(this.removeCookie);
        return removeCookieAsync(this.electronService).mergeMap((error) => {
          if (error) { console.log(error); }
          return this.TradeSearchRequestLimit.limit(this.http.post(requestUrl, requestJson));
        }
        );
      });
  }

  setCookie(sessionId: string, electronService, callback) {

    if (sessionId === undefined) {
      callback();
    }

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

    electronService.remote.session.defaultSession.cookies.set(cookie, callback);
  }

  removeCookie(electronService, callback) {
    electronService.remote.session.defaultSession.cookies.remove('http://www.pathofexile.com', 'POESESSID', callback);
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
