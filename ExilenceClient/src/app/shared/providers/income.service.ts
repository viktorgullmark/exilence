import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';

import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { HistoryHelper } from '../helpers/history.helper';
import { NetWorthHistory, NetWorthItem, NetWorthSnapshot } from '../interfaces/income.interface';
import { Item } from '../interfaces/item.interface';
import { Player } from '../interfaces/player.interface';
import { NinjaLine, NinjaTypes } from '../interfaces/poe-ninja.interface';
import { Stash } from '../interfaces/stash.interface';
import { AccountService } from './account.service';
import { ExternalService } from './external.service';
import { LogService } from './log.service';
import { NinjaService } from './ninja.service';
import { PartyService } from './party.service';
import { SettingsService } from './settings.service';

@Injectable()
export class IncomeService implements OnDestroy {

  private lastNinjaHit = 0;
  private ninjaPrices: any[] = [];
  private playerStashTabs: any[] = [];
  private netWorthHistory: NetWorthHistory;
  private sessionId: string;
  private isSnapshotting = false;

  public networthSnapshots: NetWorthSnapshot[] = [];
  public localPlayer: Player;

  private totalNetWorthItems: NetWorthItem[] = [];
  public totalNetWorth = 0;
  private fiveMinutes = 5 * 60 * 1000;
  private sessionIdValid = false;

  private lowConfidencePricing = false;
  private characterPricing = false;
  private itemValueTreshold = 1;

  private playerSub: Subscription;

  constructor(
    private ninjaService: NinjaService,
    private accountService: AccountService,
    private partyService: PartyService,
    private externalService: ExternalService,
    private settingsService: SettingsService,
    private logService: LogService
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
    console.log('incomeservice destroyed');
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
      this.netWorthHistory.lastSnapshot < (Date.now() - this.fiveMinutes) &&
      this.localPlayer !== undefined &&
      (this.sessionId !== undefined && this.sessionId !== '' && this.sessionIdValid) &&
      !this.isSnapshotting && !this.accountService.loggingIn && !this.settingsService.isChangingStash &&
      (selectedStashtabs === undefined || selectedStashtabs.length > 0)
    ) {
      this.isSnapshotting = true;
      this.netWorthHistory.lastSnapshot = Date.now();
      this.logService.log('Started snapshotting player net worth');
      this.SnapshotPlayerNetWorth(this.sessionId).subscribe(() => {

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
        this.logService.log('Finished Snapshotting player net worth');

        this.isSnapshotting = false;
      });
    }
  }

  PriceItems(items: Item[]) {
    items.forEach((item: Item) => {
      let itemName = item.name;

      if (item.typeLine) {
        itemName += ' ' + item.typeLine;
      }

      itemName = itemName.replace('<<set:MS>><<set:M>><<set:S>>', '').trim();

      if (typeof this.ninjaPrices[itemName] !== 'undefined' || itemName === 'Chaos Orb') {

        let valueForItem = this.ninjaPrices[itemName];
        if (itemName === 'Chaos Orb') {
          valueForItem = 1;
        }

        let stacksize = 1;
        let totalValueForItem = valueForItem;
        if (item.stackSize) {
          stacksize = item.stackSize;
          totalValueForItem = (valueForItem * stacksize);
        }

        // If item already exists in array, update existing
        const existingItem = this.totalNetWorthItems.find(x => x.name === itemName);
        if (existingItem !== undefined) {
          const indexOfItem = this.totalNetWorthItems.indexOf(existingItem);
          // update existing item with new data
          existingItem.stacksize = existingItem.stacksize + stacksize;
          existingItem.value = existingItem.value + totalValueForItem;
          this.totalNetWorthItems[indexOfItem] = existingItem;
        } else {
          // Add new item
          const netWorthItem: NetWorthItem = {
            name: itemName,
            value: totalValueForItem,
            valuePerUnit: valueForItem,
            icon: item.icon.indexOf('?') >= 0
              ? item.icon.substring(0, item.icon.indexOf('?')) + '?scale=1&scaleIndex=3&w=1&h=1'
              : item.icon + '?scale=1&scaleIndex=3&w=1&h=1',
            stacksize
          };
          this.totalNetWorthItems.push(netWorthItem);
        }
      }
    });
  }

  filterItems(items: NetWorthItem[]) {
    return items.filter(x => x.value > this.itemValueTreshold);
  }

  SnapshotPlayerNetWorth(sessionId: string) {

    const accountName = this.localPlayer.account;
    const league = this.localPlayer.character.league;

    const priceInfoLeague = this.settingsService.get('account.tradeLeagueName');

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

    return Observable.forkJoin(
      this.getPlayerStashTabs(sessionId, accountName, league),
      this.getValuesFromNinja(priceInfoLeague)
    ).do(() => {
      this.logService.log('Finished retriving stashhtabs and value information.');
      if (this.characterPricing) {
        this.PriceItems(this.localPlayer.character.items);
      }
      this.playerStashTabs.forEach((tab: Stash, tabIndex: number) => {
        if (tab !== null) {
          this.PriceItems(tab.items);
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

  getValuesFromNinja(league: string) {
    const tenMinutesAgo = (Date.now() - (1 * 60 * 10 * 1000));
    const length = Object.values(this.ninjaPrices).length;
    if (length > 0 && (this.lastNinjaHit > tenMinutesAgo && !this.externalService.tradeLeagueChanged)) {
      return Observable.of(null);
    } else {
      this.logService.log('[INFO] Retriving prices from poe.ninja');
      this.lastNinjaHit = Date.now();
      this.ninjaPrices = [];

      const setting = this.settingsService.get('lowConfidencePricing');
      if (setting !== undefined) {
        this.lowConfidencePricing = setting;
      } else {
        this.lowConfidencePricing = false;
        this.settingsService.set('lowConfidencePricing', false);
      }

      const enumTypes = Object.values(NinjaTypes);
      return Observable
        .from(enumTypes)
        .concatMap(type => this.ninjaService.getFromNinja(league, type)
          .delay(750))
        .do(typeResponse => {
          if (typeResponse !== null) {
            typeResponse.lines.forEach((line: NinjaLine) => {

              // Exclude low-confidence prices
              if (!this.lowConfidencePricing) {
                const receive = line.receive;
                if (receive !== undefined && receive !== null) {
                  if (receive.count < 10) {
                    return;
                  }
                }
              }

              // Filter each line here, probably needs improvement
              // But the response differse for Currency & Fragments hence the if's

              let links = 0;
              let value = 0;
              let name = '';

              if ('chaosEquivalent' in line) {
                value = line.chaosEquivalent;
              }
              if ('chaosValue' in line) {
                value = line.chaosValue;
              }
              if ('currencyTypeName' in line) {
                name = line.currencyTypeName;
              }
              if ('name' in line) {
                name = line.name;
                if (line.baseType && (line.name.indexOf(line.baseType) === -1)) {
                  name += ' ' + line.baseType;
                }
                name.trim();
              }
              if ('links' in line) {
                links = line.links;
              }
              if (links === 0 && name !== '') {
                this.ninjaPrices[name] = value;
              }
            });
          } else {
            this.isSnapshotting = false;
          }
        });
    }
  }

  getPlayerStashTabs(sessionId: string, accountName: string, league: string) {

    this.logService.log('[INFO] Retriving stashtabs from official site api');

    let selectedStashTabs: any[] = this.settingsService.get('selectedStashTabs');

    if (selectedStashTabs === undefined) {
      selectedStashTabs = [];
    }

    if (selectedStashTabs.length > 20) {
      selectedStashTabs = selectedStashTabs.slice(0, 19);
    }

    return Observable.from(selectedStashTabs)
      .concatMap((tab: any) => {
        return this.externalService.getStashTab(sessionId, accountName, league, tab.position)
          .delay(750);
      })
      .do(stashTab => {
        this.playerStashTabs.push(stashTab);
      });
  }

}
