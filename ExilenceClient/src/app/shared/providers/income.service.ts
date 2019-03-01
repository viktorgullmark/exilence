import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';

import { Injectable, OnDestroy } from '@angular/core';
import { of, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { HistoryHelper } from '../helpers/history.helper';
import { NetWorthHistory, NetWorthItem, NetWorthSnapshot } from '../interfaces/income.interface';
import { ItemPricing } from '../interfaces/item-pricing.interface';
import { Item } from '../interfaces/item.interface';
import { Player } from '../interfaces/player.interface';
import { Stash } from '../interfaces/stash.interface';
import { AccountService } from './account.service';
import { ExternalService } from './external.service';
import { LogService } from './log.service';
import { NinjaService } from './ninja.service';
import { PartyService } from './party.service';
import { PricingService } from './pricing.service';
import { SettingsService } from './settings.service';
import { StashStore } from '../interfaces/settings-store.interface';
import { TableHelper } from '../helpers/table.helper';
import { Store } from '@ngrx/store';
import * as depStatusReducer from './../../store/dependency-status/dependency-status.reducer';
import { DependencyStatusState } from '../../app.states';
import { DependencyStatus } from '../interfaces/dependency-status.interface';
import * as depStatusActions from '../../store/dependency-status/dependency-status.actions';
import { ErrorType, RequestError } from '../interfaces/error.interface';
import { ItemHelper } from '../helpers/item.helper';

@Injectable()
export class IncomeService implements OnDestroy {

  private lastNinjaHit = 0;
  private ninjaPrices: any[] = [];
  private playerStashTabs: Stash[] = [];
  private playerStashMaps: Stash[] = [];
  private convertedItems: Item[] = [];
  private netWorthHistory: NetWorthHistory;
  private sessionId: string;
  public isSnapshotting = false;
  private inventoryPricing = true;

  private playerInventory: Item[];

  public networthSnapshots: NetWorthSnapshot[] = [];
  public localPlayer: Player;

  private totalNetWorthItems: NetWorthItem[] = [];
  public totalNetWorth = 0;
  private twoMinutes = 2 * 60 * 1000;
  private sessionIdValid = false;

  private characterPricing = false;
  private itemValueTreshold = 1;

  private playerSub: Subscription;
  private depStatusStoreSub: Subscription;
  private poeOnline = true;
  private mapPricing = true;

  constructor(
    private ninjaService: NinjaService,
    private accountService: AccountService,
    private partyService: PartyService,
    private externalService: ExternalService,
    private settingsService: SettingsService,
    private logService: LogService,
    private pricingService: PricingService,
    private depStatusStore: Store<DependencyStatusState>
  ) {
    this.depStatusStoreSub = this.depStatusStore.select(depStatusReducer.selectAllDepStatuses).subscribe(statuses => {
      const status = statuses.find(s => s.name === 'pathofexile');
      if (status !== undefined) {
        this.poeOnline = status.online;
      }
    });
  }

  InitializeSnapshotting(sessionId: string) {

    this.sessionId = sessionId;

    this.loadSnapshotsFromSettings();

    this.playerSub = this.accountService.player.subscribe(res => {
      if (res !== undefined) {
        this.localPlayer = res;
        this.localPlayer.netWorthSnapshots = this.netWorthHistory.history;
      }
    });
  }

  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
    if (this.depStatusStoreSub !== undefined) {
      this.depStatusStoreSub.unsubscribe();
    }
  }

  loadSnapshotsFromSettings() {
    const character = this.settingsService.getCurrentCharacter();
    if (character !== undefined) {
      this.netWorthHistory = character.networth;
    }
  }

  Snapshot() {

    this.externalService.snapshottingFailed = false;

    const oneDayAgo = (Date.now() - (24 * 60 * 60 * 1000));
    const twoWeeksAgo = (Date.now() - (1 * 60 * 60 * 24 * 14 * 1000));

    this.loadSnapshotsFromSettings();

    const league = this.settingsService.getCurrentLeague();
    const selectedStashtabs = league.stashtabs;

    this.sessionIdValid = this.settingsService.get('profile.sessionIdValid');
    if (
      this.poeOnline &&
      this.netWorthHistory.lastSnapshot < (Date.now() - this.twoMinutes) &&
      this.localPlayer !== undefined &&
      (this.sessionId !== undefined && this.sessionId !== '' && this.sessionIdValid) &&
      !this.isSnapshotting && !this.accountService.loggingIn && !this.settingsService.isChangingStash &&
      (selectedStashtabs === undefined || selectedStashtabs.length > 0)
    ) {
      this.isSnapshotting = true;

      const startTime = Date.now();
      this.logService.log('Started snapshotting player net worth');
      this.SnapshotPlayerNetWorth().subscribe(() => {

        if (!this.externalService.snapshottingFailed) {
          this.netWorthHistory.history = this.netWorthHistory.history
            .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > twoWeeksAgo);

          this.netWorthHistory.lastSnapshot = startTime;

          // We are a new player that have not parsed income before
          // Remove the placeholder element
          if (
            this.netWorthHistory.history.length === 1 &&
            this.netWorthHistory.history[0].value === 0
          ) {
            this.netWorthHistory.history.pop();
          }

          const snapShot: NetWorthSnapshot = {
            timestamp: Date.now(),
            value: this.totalNetWorth,
            items: this.totalNetWorthItems,
          };

          this.netWorthHistory.history.unshift(snapShot);

          const historyToSend = HistoryHelper.filterNetworth(this.netWorthHistory.history, oneDayAgo);

          this.accountService.player.next(this.localPlayer);

          const character = this.settingsService.getCurrentCharacter();
          if (character !== undefined) {
            character.networth = this.netWorthHistory;
            this.settingsService.updateCharacter(character);
          }

          const objToSend = Object.assign({}, this.localPlayer);
          objToSend.netWorthSnapshots = historyToSend;
          this.partyService.updatePlayer(objToSend);

          const endTime = Date.now();
          const timePassed = Math.round((endTime - startTime) / 1000);

          this.logService.log(`Finished Snapshotting player net worth in ${timePassed} seconds`);
        } else {
          this.logService.log(`Website could not be reached, cancelling snapshot`);
        }
        this.isSnapshotting = false;
      });
    }
  }

  PriceItems(items: Item[], mapTabSelected: boolean = false, mapLayout: any) {
    // todo: base prices on this league
    for (const item of items) {
      if (ItemHelper.isSixSocket(item)) {
        this.convertedItems.push(ItemHelper.generateJewellersOrb());
      }

      const itemPriceInfoObj: ItemPricing = this.pricingService.priceItem(item);
      let stacksize = 1;
      let totalValueForItem = itemPriceInfoObj.chaosequiv;
      if (item.stackSize) {
        stacksize = item.stackSize;
        totalValueForItem = (itemPriceInfoObj.chaosequiv * stacksize);
      } else {
        if (item.properties !== null && item.properties !== undefined) {
          const prop = item.properties.find(p => p.name === 'Stack Size');
          if (prop !== undefined) {
            stacksize = +item.properties.find(p => p.name === 'Stack Size').values[0][0].split('/', 1);
          }
        }
      }


      // Add new item

      let icon = item.icon.indexOf('?') >= 0
        ? item.icon.substring(0, item.icon.indexOf('?')) + '?scale=1&scaleIndex=3&w=1&h=1'
        : item.icon + '?scale=1&scaleIndex=3&w=1&h=1';

      const isMap = item.typeLine.indexOf(' Map') > -1;

      if (isMap) {
        icon = item.icon;

        if (itemPriceInfoObj.frameType !== 3) {
          itemPriceInfoObj.frameType = 0;
        }

        if (!this.mapPricing) {
          break;
        }
      }

      const netWorthItem: NetWorthItem = {
        name: itemPriceInfoObj.name,
        value: totalValueForItem,
        value_min: itemPriceInfoObj.chaosequiv_min,
        value_max: itemPriceInfoObj.chaosequiv_max,
        value_mode: itemPriceInfoObj.chaosequiv_mode,
        value_median: itemPriceInfoObj.chaosequiv_median,
        value_average: itemPriceInfoObj.chaosequiv_average,
        quantity: itemPriceInfoObj.quantity,
        valuePerUnit: itemPriceInfoObj.chaosequiv,
        icon: icon,
        stacksize,
        links: itemPriceInfoObj.links,
        gemLevel: itemPriceInfoObj.gemlevel,
        quality: itemPriceInfoObj.quality,
        variation: itemPriceInfoObj.variation,
        frameType: itemPriceInfoObj.frameType,
        corrupted: itemPriceInfoObj.corrupted,
        totalStacksize: itemPriceInfoObj.totalStacksize
      };

      if (netWorthItem.name.indexOf(' Map') === -1 || mapLayout || !mapTabSelected) {
        this.totalNetWorthItems.push(netWorthItem);
      }
    }
  }

  filterItems(items: NetWorthItem[]) {
    return items.filter(x => x.value >= this.itemValueTreshold && x.value !== 0);
  }

  SnapshotPlayerNetWorth() {

    const accountName = this.localPlayer.account;
    const localLeague = this.localPlayer.character.league;
    const tradeLeague = this.settingsService.get('profile.tradeLeagueName');

    this.playerStashTabs = [];
    this.playerStashMaps = [];
    this.totalNetWorthItems = [];
    this.totalNetWorth = 0;


    const itemValueTresholdSetting = this.settingsService.get('itemValueTreshold');
    if (itemValueTresholdSetting !== undefined) {
      this.itemValueTreshold = itemValueTresholdSetting;
    } else {
      this.itemValueTreshold = 1;
      this.settingsService.set('itemValueTreshold', 1);
    }

    const characterPricing = this.settingsService.get('characterPricing');
    if (characterPricing !== undefined) {
      this.characterPricing = characterPricing;
    } else {
      this.characterPricing = false;
      this.settingsService.set('characterPricing', false);
    }

    const inventoryPricing = this.settingsService.get('inventoryPricing');
    if (inventoryPricing !== undefined) {
      this.inventoryPricing = inventoryPricing;
    } else {
      this.inventoryPricing = true;
      this.settingsService.set('inventoryPricing', true);
    }

    const league = this.settingsService.getCurrentLeague();
    let selectedStashTabs: StashStore[];
    if (league !== undefined) {
      selectedStashTabs = league.stashtabs;
    }
    let mapTab;
    if (selectedStashTabs !== undefined) {
      mapTab = selectedStashTabs.find(x => x.isMapTab);
    }

    const requests = Observable.forkJoin(
      this.getPlayerPublicMaps(accountName, tradeLeague, mapTab),
      this.getPlayerStashTabs(accountName, localLeague),
      this.pricingService.retrieveExternalPrices(),
      this.getPlayerInventory(accountName, this.localPlayer.character.name)
    ).do((res) => {
      // if any request failed during snapshotting, don't proceed
      if (!this.externalService.snapshottingFailed) {
        this.logService.log('Finished retrieving stashtabs');

        const mapPricingSetting = this.settingsService.get('mapPricing');
        if (mapPricingSetting !== undefined) {
          this.mapPricing = mapPricingSetting;
        } else {
          this.mapPricing = true;
          this.settingsService.set('mapPricing', this.mapPricing);
        }

        if (this.characterPricing) { // price equipment
          this.PriceItems(this.localPlayer.character.items.filter(x => x.inventoryId !== 'MainInventory'), mapTab, undefined);
        } // price inventory
        if (this.inventoryPricing) {
          this.PriceItems(res[3].items.filter(x => x.inventoryId === 'MainInventory'), mapTab, undefined);
        }
        // price stash
        this.playerStashTabs.forEach((tab: Stash) => {
          if (tab !== null) {
            this.PriceItems(tab.items, mapTab, tab.mapLayout);
          }
        });
        // price maps
        this.playerStashMaps.forEach((tab: Stash) => {
          if (tab !== null) {
            this.PriceItems(tab.items, mapTab, tab.mapLayout);
          }
        });
        // price converted items (e.g 6sockets -> jewellers)
        this.PriceItems(this.convertedItems, mapTab, undefined);

        this.totalNetWorthItems = ItemHelper.CombineNetworthItemStacks(this.totalNetWorthItems);

        this.totalNetWorthItems = this.filterItems(this.totalNetWorthItems);

        for (let i = 0, _len = this.totalNetWorthItems; i < this.totalNetWorthItems.length; i++) {
          this.totalNetWorth += this.totalNetWorthItems[i].value;
        }

        this.totalNetWorthItems.sort((a: any, b: any) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });
      }
    });

    return requests;
  }

  getPlayerPublicMaps(accountName: string, league: string, mapTab: any) {

    if (mapTab !== undefined && mapTab) {
      this.logService.log('Starting to fetch public maps');
      return this.externalService.SearchPublicMaps(accountName, league) // .toArray()
        .flatMap((ids: any) => {
          const subLines = this.splitIntoSubArray(ids.result, 10);
          return this.externalService.FetchPublicMaps(subLines, ids.id).map((pages: any) => {

            let items = [];

            pages.forEach((page: any) => {
              page.result = page.result.filter(x => x.listing !== undefined && x.listing.stash !== undefined
                && x.listing.stash.name === mapTab.name);
              const pageItems = page.result.map(x => x.item);
              items = items.concat(pageItems);
            });

            if (items.length > 0) {
              const tab = {
                items: items,
                mapLayout: {}
              } as Stash;

              this.playerStashMaps.push(tab);
            }
          })
            .delay(1000);
          // });
        });
    } else {
      return of(null);
    }
  }

  getPlayerStashTabs(accountName: string, localLeague: string) {

    this.logService.log('[INFO] Retriving stashtabs from official site api');

    const league = this.settingsService.getCurrentLeague();
    let selectedStashTabs: StashStore[];
    if (league !== undefined) {
      selectedStashTabs = league.stashtabs;
    }
    if (selectedStashTabs === undefined) {
      selectedStashTabs = [];
    }

    if (selectedStashTabs.length === 0) {
      return Observable.of(null);
    }

    return Observable.from(selectedStashTabs)
      .mergeMap((tab: any) => {
        return this.externalService.getStashTab(accountName, localLeague, tab.position)
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
          });
      }, 1)
      .catch(e => {
        if (e.status !== 403 && e.status !== 404) {
          this.externalService.snapshottingFailed = true;
          this.externalService.checkStatus();
          this.depStatusStore.dispatch(
            new depStatusActions.UpdateDepStatus({ status: { id: 'pathofexile', changes: { online: false } } })
          );
          return of({ errorType: ErrorType.Unreachable } as RequestError);
        }
        return Observable.of(null);
      })
      .do(stashTab => {
        if (stashTab.errorType === undefined) {
          this.playerStashTabs.push(stashTab);
        }
      });
  }

  getPlayerInventory(accountName: string, characterName: string) {
    return this.externalService.getCharacterInventory(accountName, characterName);
  }

  splitIntoSubArray(arr, count) {
    const newArray = [];
    while (arr.length > 0) {
      newArray.push(arr.splice(0, count));
    }
    return newArray;
  }

}
