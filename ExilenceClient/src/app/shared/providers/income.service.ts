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

@Injectable()
export class IncomeService implements OnDestroy {

  private lastNinjaHit = 0;
  private ninjaPrices: any[] = [];
  private playerStashTabs: Stash[] = [];
  private netWorthHistory: NetWorthHistory;
  private sessionId: string;
  private isSnapshotting = false;

  public networthSnapshots: NetWorthSnapshot[] = [];
  public localPlayer: Player;

  private totalNetWorthItems: NetWorthItem[] = [];
  public totalNetWorth = 0;
  private threeMinutes = 3 * 60 * 1000;
  private sessionIdValid = false;

  private characterPricing = false;
  private itemValueTreshold = 1;

  private playerSub: Subscription;

  constructor(
    private ninjaService: NinjaService,
    private accountService: AccountService,
    private partyService: PartyService,
    private externalService: ExternalService,
    private settingsService: SettingsService,
    private logService: LogService,
    private pricingService: PricingService
  ) {
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
  }

  loadSnapshotsFromSettings() {
    this.netWorthHistory = this.settingsService.get('networth');
  }

  Snapshot() {
    const oneDayAgo = (Date.now() - (24 * 60 * 60 * 1000));

    const twoWeeksAgo = (Date.now() - (1 * 60 * 60 * 24 * 14 * 1000));

    this.netWorthHistory = this.settingsService.get('networth');
    const selectedStashtabs = this.settingsService.get('selectedStashTabs');

    this.sessionIdValid = this.settingsService.get('account.sessionIdValid');
    if (
      this.netWorthHistory.lastSnapshot < (Date.now() - this.threeMinutes) &&
      this.localPlayer !== undefined &&
      (this.sessionId !== undefined && this.sessionId !== '' && this.sessionIdValid) &&
      !this.isSnapshotting && !this.accountService.loggingIn && !this.settingsService.isChangingStash &&
      (selectedStashtabs === undefined || selectedStashtabs.length > 0)
    ) {
      this.isSnapshotting = true;
      this.netWorthHistory.lastSnapshot = Date.now();

      const startTime = Date.now();
      this.logService.log('Started snapshotting player net worth');
      this.SnapshotPlayerNetWorth().subscribe(() => {

        this.netWorthHistory.history = this.netWorthHistory.history
          .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > twoWeeksAgo);

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

        this.settingsService.set('networth', this.netWorthHistory);
        const objToSend = Object.assign({}, this.localPlayer);
        objToSend.netWorthSnapshots = historyToSend;
        this.partyService.updatePlayer(objToSend);

        const endTime = Date.now();
        const timePassed = Math.round((endTime - startTime) / 1000);

        this.logService.log(`Finished Snapshotting player net worth in ${timePassed} seconds`);

        this.isSnapshotting = false;
      });
    }
  }

  PriceItems(items: Item[], mapTabSelected: boolean = false, mapLayout: any) {

    // todo: base prices on this league
    items.forEach((item: Item) => {
      const itemPriceInfoObj: ItemPricing = this.pricingService.priceItem(item);
      let stacksize = 1;
      let totalValueForItem = itemPriceInfoObj.chaosequiv;
      if (item.stackSize) {
        stacksize = item.stackSize;
        totalValueForItem = (itemPriceInfoObj.chaosequiv * stacksize);
      }

      // If item already exists in array, update existing
      const existingItem = this.totalNetWorthItems.find(x =>
        x.name === itemPriceInfoObj.name
        && x.quality === itemPriceInfoObj.quality
        && x.links === itemPriceInfoObj.links
        && x.gemLevel === itemPriceInfoObj.gemlevel
        && x.variation === itemPriceInfoObj.variation
        && x.frameType === itemPriceInfoObj.frameType
      );
      if (existingItem !== undefined) {
        const indexOfItem = this.totalNetWorthItems.indexOf(existingItem);
        // update existing item with new data
        existingItem.stacksize = existingItem.stacksize + stacksize;
        existingItem.value = existingItem.value + totalValueForItem;
        this.totalNetWorthItems[indexOfItem] = existingItem;
      } else {
        // Add new item

        let icon = item.icon.indexOf('?') >= 0
          ? item.icon.substring(0, item.icon.indexOf('?')) + '?scale=1&scaleIndex=3&w=1&h=1'
          : item.icon + '?scale=1&scaleIndex=3&w=1&h=1';

        if (item.typeLine.indexOf(' Map') > -1) {
          icon = item.icon;
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
          totalStacksize: itemPriceInfoObj.totalStacksize
        };

        if (netWorthItem.name.indexOf(' Map') === -1 || mapLayout || !mapTabSelected) {
          this.totalNetWorthItems.push(netWorthItem);
        }
      }
    });
  }

  filterItems(items: NetWorthItem[]) {
    return items.filter(x => x.value >= this.itemValueTreshold && x.value !== 0);
  }

  SnapshotPlayerNetWorth() {

    const accountName = this.localPlayer.account;
    const league = this.localPlayer.character.league;

    this.playerStashTabs = [];
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

    const selectedStashTabs: any[] = this.settingsService.get('selectedStashTabs');

    let mapTab;
    if (selectedStashTabs !== undefined) {
      mapTab = selectedStashTabs.find(x => x.isMapTab);
    }

    return Observable.forkJoin(
      this.getPlayerPublicMaps(accountName, league, mapTab),
      this.getPlayerStashTabs(accountName, league),
      this.pricingService.retrieveExternalPrices()
    ).do(() => {
      this.logService.log('Finished retriving stashhtabs');
      if (this.characterPricing) {
        this.PriceItems(this.localPlayer.character.items, mapTab, undefined);
      }
      this.playerStashTabs.forEach((tab: Stash, tabIndex: number) => {
        if (tab !== null) {
          this.PriceItems(tab.items, mapTab, tab.mapLayout);
        }
      });

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
    });
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
              page.result = page.result.filter(x => x.listing.stash.name === mapTab.name);
              const pageItems = page.result.map(x => x.item);
              items = items.concat(pageItems);
            });

            if (items.length > 0) {
              const tab = {
                items: items,
                mapLayout: {}
              } as Stash;

              this.playerStashTabs.push(tab);
            }
          })
            .delay(1000);
          // });
        });
    } else {
      return of(null);
    }
  }

  getPlayerStashTabs(accountName: string, league: string) {

    this.logService.log('[INFO] Retriving stashtabs from official site api');

    let selectedStashTabs: any[] = this.settingsService.get('selectedStashTabs');

    if (selectedStashTabs === undefined) {
      selectedStashTabs = [];
<<<<<<< refs/remotes/valseria/master
    }

    if (selectedStashTabs.length > 21) {
      selectedStashTabs = selectedStashTabs.slice(0, 20);
=======
>>>>>>> #66 Removed default selecton of stashtabs
    }

    if (selectedStashTabs.length === 0) {
      return Observable.of(null);
    }

    return Observable.from(selectedStashTabs)
      .mergeMap((tab: any) => {
        return this.externalService.getStashTab(accountName, league, tab.position);
      }, 1)
      .do(stashTab => {
        this.playerStashTabs.push(stashTab);
      });
  }

  splitIntoSubArray(arr, count) {
    const newArray = [];
    while (arr.length > 0) {
      newArray.push(arr.splice(0, count));
    }
    return newArray;
  }

}
