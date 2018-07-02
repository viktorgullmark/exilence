import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { NetWorthHistory, NetWorthItem, NetWorthSnapshot } from '../interfaces/income.interface';
import { Item } from '../interfaces/item.interface';
import { Player } from '../interfaces/player.interface';
import { NinjaLine, NinjaTypes } from '../interfaces/poe-ninja.interface';
import { Stash } from '../interfaces/stash.interface';
import { AccountService } from './account.service';
import { ExternalService } from './external.service';
import { NinjaService } from './ninja.service';
import { PartyService } from './party.service';
import { SettingsService } from './settings.service';



@Injectable()
export class IncomeService {

  private ninjaPrices: any[] = [];
  private playerStashTabs: any[] = [];
  private snapshotInterval: any;
  private netWorthHistory: NetWorthHistory;

  public networthSnapshots: NetWorthSnapshot[] = [];

  public localPlayer: Player;

  private totalNetWorthItems: NetWorthItem[] = [];
  public totalNetWorth = 0;
  private fiveMinutes = 5 * 60 * 1000;
  private twelveHoursAgo = (Date.now() - (12 * 60 * 60 * 1000));

  constructor(
    private ninjaService: NinjaService,
    private accountService: AccountService,
    private partyService: PartyService,
    private externalService: ExternalService,
    private settingsService: SettingsService
  ) {


  }

  StopSnapshotting() {
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }
  }

  StartSnapshotting(sessionId: string) {

    this.netWorthHistory = this.settingsService.get('networth');

    this.accountService.player.subscribe(res => {
      if (res !== undefined) {
        this.localPlayer = res;
        this.localPlayer.netWorthSnapshots = this.netWorthHistory.history;
      }
    });

    this.snapshotInterval = setInterval(() => {

      if (this.netWorthHistory.lastSnapshot < (Date.now() - this.fiveMinutes) && this.localPlayer !== undefined) {
        this.netWorthHistory.lastSnapshot = Date.now();
        console.log('[INFO] Snapshotting player net worth');
        this.SnapshotPlayerNetWorth(sessionId).subscribe(() => {

          this.netWorthHistory.history = this.netWorthHistory.history
            .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > this.twelveHoursAgo);

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

          this.settingsService.set('networth', this.netWorthHistory);
          this.localPlayer.netWorthSnapshots = this.netWorthHistory.history;
          this.partyService.updatePlayer(this.localPlayer);
          console.log('[INFO] Finished Snapshotting player net worth');
        });
      }
    }, 30 * 1000);

  }


  SnapshotPlayerNetWorth(sessionId: string) {

    const accountName = this.partyService.accountInfo.accountName;
    const league = this.partyService.currentPlayer.character.league;

    this.ninjaPrices = [];
    this.playerStashTabs = [];
    this.totalNetWorthItems = [];
    this.totalNetWorth = 0;

    return Observable.forkJoin(
      this.getPlayerStashTabs(sessionId, accountName, league),
      this.getValuesFromNinja(league)
    ).do(() => {
      console.log('[INFO]: Finished retriving stashtabs and value information.');
      this.playerStashTabs.forEach((tab: Stash, tabIndex: number) => {
        tab.items.forEach((item: Item) => {

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

            // Hide items with a total value under 1 chaos
            if (totalValueForItem >= 1) {
              // If item already exists in array, update existing
              const existingItem = this.totalNetWorthItems.find(x => x.name === itemName);
              if (existingItem !== undefined) {
                const indexOfItem = this.totalNetWorthItems.indexOf(existingItem);
                // update existing item with new data
                existingItem.stacksize = existingItem.stacksize + stacksize;
                existingItem.value = existingItem.value + Math.floor(valueForItem);
                this.totalNetWorthItems[indexOfItem] = existingItem;
              } else {
                // Add new item
                const netWorthItem: NetWorthItem = {
                  name: itemName,
                  value: Math.floor(totalValueForItem),
                  valuePerUnit: Math.floor(valueForItem),
                  icon: item.icon.indexOf('?') >= 0
                    ? item.icon.substring(0, item.icon.indexOf('?')) + '?scale=1&scaleIndex=3&w=1&h=1'
                    : item.icon + '?scale=1&scaleIndex=3&w=1&h=1',
                  stacksize
                };
                this.totalNetWorthItems.push(netWorthItem);
              }
            }
          }
        });
      });

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


  getPriceForItem(name: string) {
    return this.ninjaPrices[name];
  }

  getValuesFromNinja(league: string) {
    const enumTypes = Object.values(NinjaTypes);
    return Observable
      .from(enumTypes)
      .concatMap(type => this.ninjaService.getFromNinja(league, type)
        .delay(750))
      .do(typeResponse => {
        typeResponse.lines.forEach((line: NinjaLine) => {

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

            if (line.name.indexOf('Remnant') > -1) {
              const debug = -1;
            }

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
      });
  }

  getPlayerStashTabs(sessionId: string, accountName: string, league: string) {

    let selectedStashTabs: any[] = this.settingsService.get('selectedStashTabs');

    if (selectedStashTabs === undefined || selectedStashTabs.length === 0) {
      selectedStashTabs = [];
      for (let i = 0; i < 6; i++) {
        selectedStashTabs.push({ name: '', position: i });
      }
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
