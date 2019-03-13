import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toArray';
import 'rxjs/operators/mergeMap';

import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription, of } from 'rxjs';
import RateLimiter from 'rxjs-ratelimiter';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { DependencyStatusState } from '../../app.states';
import * as depStatusActions from '../../store/dependency-status/dependency-status.actions';
import { EquipmentResponse } from '../interfaces/equipment-response.interface';
import { Item } from '../interfaces/item.interface';
import { League } from '../interfaces/league.interface';
import { Player } from '../interfaces/player.interface';
import { Property } from '../interfaces/property.interface';
import { Requirement } from '../interfaces/requirement.interface';
import { Stash } from '../interfaces/stash.interface';
import * as depStatusReducer from './../../store/dependency-status/dependency-status.reducer';
import { ElectronService } from './electron.service';
import { LogService } from './log.service';
import { RequestError, ErrorType } from '../interfaces/error.interface';

@Injectable()
export class ExternalService implements OnDestroy {
  public url: 'https://www.pathofexile.com/character-window/get-items';

  public leagues: BehaviorSubject<League[]> = new BehaviorSubject<League[]>([]);
  public tradeLeagueChanged = false;

  private TradeSearchRequestLimit = new RateLimiter(1, 1200);
  private TradeFetchRequestLimit = new RateLimiter(1, 1500);

  // combined ratelimiter for stash- and character-requests (singleton)
  private RequestRateLimit = new RateLimiter(7, 10000);
  private statusCheckInterval: any;
  private depStatusStoreSub: Subscription;
  private poeOnline = true;

  public snapshottingFailed = false;

  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
    private router: Router,
    private logService: LogService,
    private depStatusStore: Store<DependencyStatusState>
  ) {
    this.depStatusStoreSub = this.depStatusStore.select(depStatusReducer.selectAllDepStatuses).subscribe(statuses => {
      const status = statuses.find(s => s.name === 'pathofexile');
      if (status !== undefined) {
        this.poeOnline = status.online;
      }
    });
  }

  ngOnDestroy() {
    if (this.depStatusStoreSub !== undefined) {
      this.depStatusStoreSub.unsubscribe();
    }
  }

  getLatestRelease(): Observable<any> {
    return this.http.get('https://api.github.com/repos/viktorgullmark/exilence/releases/latest');
  }

  getCharacterInventory(accountName: string, characterName: string): Observable<any> {
    const parameters = `?accountName=${accountName}&character=${characterName}`;

    return this.RequestRateLimit.limit
      (this.http.get('https://www.pathofexile.com/character-window/get-items' + parameters, { withCredentials: true })
        .retryWhen(err => {
          let retries = 0;
          return err
            .delay(500)
            .map(error => {
              if (retries++ === 2) {
                throw error;
              }
              return error;
            });
        })
        .catch(e => {
          if (e.status !== 403 && e.status !== 404) {
            this.snapshottingFailed = true;
            this.checkStatus();
            this.depStatusStore.dispatch(new depStatusActions.UpdateDepStatus(
              { status: { id: 'pathofexile', changes: { online: false } } }));
            return of({ errorType: ErrorType.Unreachable } as RequestError);
          }
          return Observable.of(null);
        }));
  }

  checkStatus() {
    this.logService.log('Checking https://pathofexile.com status...');
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
    // check website status, and set status to online when successful
    this.statusCheckInterval = setInterval(() => {
      if (!this.poeOnline) {
        const parameters = `?type=main&compact=0`;
        this.RequestRateLimit.limit
          (this.http.get('https://api.pathofexile.com/leagues' + parameters)
            .catch(e => {
              return Observable.of(null);
            })).subscribe(res => {
              if (res !== null) {
                this.depStatusStore.dispatch(
                  new depStatusActions.UpdateDepStatus({ status: { id: 'pathofexile', changes: { online: true } } })
                );
                clearInterval(this.statusCheckInterval);
              }
            });
      }
    }, 15 * 1000);
  }

  getCharacterList(account: string, sessionId?: string) {
    const parameters = `?accountName=${account}`;
    return this.http.get('https://www.pathofexile.com/character-window/get-characters' + parameters)
      .retryWhen(err => {
        let retries = 0;
        return err
          .delay(500)
          .map(error => {
            if (retries++ === 2) {
              throw error;
            }
            return error;
          });
      })
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.checkStatus();
          this.depStatusStore.dispatch(new depStatusActions.UpdateDepStatus({ status: { id: 'pathofexile', changes: { online: false } } }));
          return of({ errorType: ErrorType.Unreachable } as RequestError);
        }
        if (e.status === 403) {
          return of({ errorType: ErrorType.Unauthorized } as RequestError);
        }
        return of(null);
      });
  }

  getLeagues(type: string, compact: number) {
    const parameters = `?type=${type}&compact=${compact}`;
    return this.http.get('https://api.pathofexile.com/leagues' + parameters)
      .retryWhen(err => {
        let retries = 0;
        return err
          .delay(500)
          .map(error => {
            if (retries++ === 2) {
              throw error;
            }
            return error;
          });
      })
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.checkStatus();
          this.depStatusStore.dispatch(new depStatusActions.UpdateDepStatus({ status: { id: 'pathofexile', changes: { online: false } } }));
          return of({ errorType: ErrorType.Unreachable } as RequestError);
        }
        return of(null);
      });
  }

  getStashTabs(account: string, league: string) {
    const parameters = `?league=${league}&accountName=${account}&tabs=1`;
    return this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
      .retryWhen(err => {
        let retries = 0;
        return err
          .delay(500)
          .map(error => {
            if (retries++ === 2) {
              throw error;
            }
            return error;
          });
      })
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.checkStatus();
          this.depStatusStore.dispatch(new depStatusActions.UpdateDepStatus({ status: { id: 'pathofexile', changes: { online: false } } }));
          return of({ errorType: ErrorType.Unreachable } as RequestError);
        }
        return Observable.of(null);
      });
  }

  getStashTab(account: string, league: string, index: number): Observable<Stash> {
    const parameters = `?league=${league}&accountName=${account}&tabIndex=${index}&tabs=1`;
    return this.RequestRateLimit.limit(
      this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters));
  }

  refreshCookie(sessionId: string) {
    this.removeCookie();
    this.setCookie(sessionId);
  }

  validateSessionId(sessionId: string, account: string, league: string, index: number) {
    this.removeCookie();
    this.setCookie(sessionId);

    const parameters = `?league=${league}&accountName=${account}&tabIndex=${index}&tabs=1`;
    return this.RequestRateLimit.limit(this.http.get<Stash>('https://www.pathofexile.com/character-window/get-stash-items' + parameters)
      .retryWhen(err => {
        let retries = 0;
        return err
          .delay(500)
          .map(error => {
            if (retries++ === 2) {
              throw error;
            }
            return error;
          });
      })
      .catch(e => {
        if (e.status === 500 || e.status === 502 || e.status === 503) {
          this.checkStatus();
          this.depStatusStore.dispatch(new depStatusActions.UpdateDepStatus({ status: { id: 'pathofexile', changes: { online: false } } }));
          return of({ errorType: ErrorType.Unreachable } as RequestError);
        }
        if (e.status !== 200) {
          return Observable.of(false);
        }
        return Observable.of(null);
      }));
  }

  getAccountForCharacter(character: string) {
    const parameters = `?character=${encodeURIComponent(character)}`;
    return this.RequestRateLimit.limit
      (this.http.get('https://www.pathofexile.com/character-window/get-account-name-by-character' + parameters)
        .retryWhen((error) => {
          return error.delay(500).take(2);
        }));
  }

  FetchPublicMaps(subLines: any[], query: string) {
    return Observable.from(subLines)
      .concatMap((lines: any) => {
        const url = `https://www.pathofexile.com/api/trade/fetch/${lines.join(',')}?query=${query}`;
        return this.TradeFetchRequestLimit.limit(
          this.http.get(url).retryWhen((err) => {
            return err.flatMap((error: any) => {
              if (error.status === 429) {
                return Observable.of(error.status).delay(1000 * 60); // 60 second retry
              }
              return Observable.of(null);
            }).take(2);
          })
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
        return this.TradeSearchRequestLimit.limit(this.http.post(requestUrl, requestJson)
          .retryWhen((err) => {
            return err.flatMap((error: any) => {
              if (error.status === 429) {
                return Observable.of(error.status).delay(1000 * 60); // One minute retry
              }
              return Observable.of(null);
            }).take(2);
          }));
      });
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
    } as Electron.Details;

    this.electronService.remote.session.defaultSession.cookies.set(cookie, (error) => {
      if (error) {
        this.logService.log('Could not set cookie', error, true);
      }
    });
  }

  removeCookie() {
    this.electronService.remote.session.defaultSession.cookies.remove('http://www.pathofexile.com', 'POESESSID', (error) => {
      if (error) {
        this.logService.log('Could not set cookie', error, true);
      }
    });
  }

  setCharacter(data: EquipmentResponse, player: Player): Player {
    player.character = data.character;
    if (data.items !== undefined) {
      player.character.items = this.mapItems(data.items);
    }
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
