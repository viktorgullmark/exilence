import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/range';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/timeInterval';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { Item } from '../interfaces/item.interface';
import { NinjaLine, NinjaTypes } from '../interfaces/poe-ninja.interface';
import { Stash } from '../interfaces/stash.interface';
import { ExternalService } from './external.service';
import { NinjaService } from './ninja.service';
import { PartyService } from './party.service';
import { SessionService } from './session.service';
import { SettingsService } from './settings.service';

interface NetWorthSnapshot {
  timestamp: number;
  value: number;
}

interface NetWorthHistory {
  lastSnapshot: number;
  history: NetWorthSnapshot[];
}

@Injectable()
export class IncomeService {

  private ninjaPrices: any[] = [];
  private playerStashTabs: any[] = [];
  private snapshotInterval: any;
  private netWorthHistory: NetWorthHistory;

  public totalNetWorthItems: any[] = [];
  public totalNetWorth = 0;
  private fiveMinutes = 5 * 60 * 1000;

  public netWorthSnapshotList: BehaviorSubject<NetWorthSnapshot[]> = new BehaviorSubject<NetWorthSnapshot[]>([]);

  constructor(
    private ninjaService: NinjaService,
    private partyService: PartyService,
    private externalService: ExternalService,
    private sessionService: SessionService,
    private settingsService: SettingsService
  ) {

    // this.netWorthHistory = this.settingsService.get('networth');

    // Set up history if we don't have any
    if (this.netWorthHistory === undefined) {
      this.netWorthHistory = {
        lastSnapshot: (Date.now() - this.fiveMinutes),
        history: [{
          timestamp: Date.now() - this.fiveMinutes,
          value: 0
        }]
      };
    }

    this.netWorthSnapshotList.next(this.netWorthHistory.history);

    this.StartSnapshotting();

  }

  StartSnapshotting() {
    this.snapshotInterval = setInterval(() => {

      if (this.netWorthHistory.lastSnapshot < (Date.now() - this.fiveMinutes)) {
        this.netWorthHistory.lastSnapshot = Date.now();
        console.log('[INFO] Snapshotting player net worth');
        this.SnapshotPlayerNetWorth().subscribe(() => {

          const snapShot: NetWorthSnapshot = {
            timestamp: Date.now(),
            value: this.totalNetWorth
          };

          this.netWorthHistory.history.unshift(snapShot);
          this.settingsService.set('networth', this.netWorthHistory);
          this.netWorthSnapshotList.next(this.netWorthHistory.history);

          console.log('[INFO] Finished Snapshotting player net worth');
        });
      }
    }, 30 * 1000);
  }


  SnapshotPlayerNetWorth() {

    const sessionId = this.sessionService.getSession();
    const accountName = this.partyService.accountInfo.accountName;
    const league = this.partyService.player.character.league;

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
          let itemName = item.name + ' ' + item.typeLine;
          if (itemName.indexOf('<<') !== -1) {
            itemName = itemName.substring(28);
          } else {
            itemName = itemName.trim();
          }
          if (typeof this.ninjaPrices[itemName] !== 'undefined') {

            let valueForItem = this.ninjaPrices[itemName];
            if (item.stackSize) {
              valueForItem = 0;
              for (let i = 0; i < item.stackSize; i++) {
                valueForItem += this.ninjaPrices[itemName];
              }
            }

            this.totalNetWorthItems.push({
              name: itemName,
              value: valueForItem,
              icon: item.icon,
              // tab: tab.tabs[tabIndex].n
            });

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

      console.log('[INFO] Total player valuables worth: ', this.totalNetWorth);
      // console.log('[INFO] Player valuables ', this.totalNetWorthItems);

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
            name = line.name + ' ' + line.baseType;
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
    return this.externalService.getStashTabs(sessionId, accountName, league)
      .concatMap((response) => {
        return Observable.from(response.tabs)
          .concatMap((tab) => {
            if (tab.i < 20) {
              return this.externalService.getStashTab(sessionId, accountName, league, tab.i)
                .delay(750);
            } else {
              return Observable.empty();
            }
          })
          .do(stashTab => {
            this.playerStashTabs.push(stashTab);
          });
      });
  }

}
