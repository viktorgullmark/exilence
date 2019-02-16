import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { HistoryHelper } from '../helpers/history.helper';
import { ItemHelper } from '../helpers/item.helper';
import { TableHelper } from '../helpers/table.helper';
import { AreaEventType, AreaInfo, EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
import { NetWorthItem } from '../interfaces/income.interface';
import { Item } from '../interfaces/item.interface';
import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { IncomeService } from './income.service';
import { LogMonitorService } from './log-monitor.service';
import { PartyService } from './party.service';
import { PricingService } from './pricing.service';
import { SettingsService } from './settings.service';
import { StateService } from './state.service';

@Injectable()
export class MapService implements OnDestroy {

  private areaHistory: ExtendedAreaInfo[] = [];
  public area: ExtendedAreaInfo;
  public currentHistoricalArea: ExtendedAreaInfo;
  public previousInstanceServer: string;
  public historicalInstanceServer: string;
  public previousDate: Date;
  private localPlayer: Player;
  public temporaryGain: NetWorthItem[] = [];
  public excludeGain: NetWorthItem[] = [];

  private playerSub: Subscription;
  private areasSub: Subscription;
  private enteredNeutralAreaSub: Subscription;
  private enteredHostileAreaSub: Subscription;

  areasParsed: EventEmitter<any> = new EventEmitter();

  // areas specific to the local player (including the log if imported)
  public localPlayerAreaSubject: BehaviorSubject<ExtendedAreaInfo[]> = new BehaviorSubject<ExtendedAreaInfo[]>([]);
  public localPlayerAreas: ExtendedAreaInfo[];

  constructor(
    private logMonitorService: LogMonitorService,
    private accountService: AccountService,
    private partyService: PartyService,
    private incomeService: IncomeService,
    private settingsService: SettingsService,
    private pricingService: PricingService
  ) {

    this.loadAreasFromSettings();

    this.enteredNeutralAreaSub = this.partyService.enteredNeutralArea.subscribe(inventory => {
      if (inventory !== undefined) {
        let currentInventory = this.priceAndCombineInventory(inventory);

        if (this.areaHistory[1] !== undefined) {
          currentInventory = ItemHelper.DiffNetworthItems(currentInventory, this.areaHistory[1].items);
          console.log('difference: ', currentInventory);
        }

        if (this.excludeGain.length > 0) {
          currentInventory = ItemHelper.DiffNetworthItems(currentInventory, this.excludeGain);
          this.excludeGain = [];
          console.log('after excluding: ', currentInventory);
        }

        this.areaHistory[0].items = currentInventory;
      }
    });

    this.enteredHostileAreaSub = this.partyService.enteredHostileArea.subscribe(inventory => {
      if (inventory !== undefined) {
        if (this.excludeGain.length === 0) {
          this.excludeGain = this.priceAndCombineInventory(inventory);
        }
        console.log('this.excludeGain', this.excludeGain);
      }
    });

    this.playerSub = this.accountService.player.subscribe(player => {
      if (player !== undefined) {
        this.localPlayer = player;
      }
    });

    this.areasSub = this.localPlayerAreaSubject.subscribe(res => {
      this.localPlayerAreas = res;
    });

    this.logMonitorService.instanceServerEvent.subscribe(e => {
      this.previousInstanceServer = e.address;
    });

    this.logMonitorService.historicalInstanceServerEvent.subscribe(e => {
      if (!this.logMonitorService.parsingCompleted) {
        this.previousInstanceServer = e.address;
      }
    });

    this.logMonitorService.areaEvent.subscribe((e: EventArea) => {
      this.registerAreaEvent(e);
    });

    this.logMonitorService.historicalAreaEvent.subscribe((e: EventArea) => {
      this.registerAreaEvent(e);
    });
  }

  priceAndCombineInventory(items: Item[]): NetWorthItem[] {
    const networthItems: NetWorthItem[] = [];
    items.forEach((item: Item) => {
      const pricedItem = ItemHelper.toNetworthItem(item, this.pricingService.priceItem(item));
      networthItems.push(pricedItem);
    });

    return ItemHelper.CombineNetworthItemStacks(networthItems);
  }

  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
    if (this.areasSub !== undefined) {
      this.areasSub.unsubscribe();
    }
    if (this.enteredHostileAreaSub !== undefined) {
      this.enteredHostileAreaSub.unsubscribe();
    }
    if (this.enteredNeutralAreaSub !== undefined) {
      this.enteredNeutralAreaSub.unsubscribe();
    }
  }

  updateLocalPlayerAreas(areas: ExtendedAreaInfo[]) {
    const areasToSend = Object.assign([], areas);
    this.localPlayerAreaSubject.next(areasToSend);
  }

  registerAreaEvent(e: EventArea) {
    this.areaHistory = this.settingsService.get('areas');

    const areaEntered = {
      eventArea: this.formatAreaInfo(e),
      type: AreaEventType.Join,
      timestamp: new Date(e.timestamp).getTime(),
      duration: 0,
      instanceServer: this.previousInstanceServer,
      items: []
    } as ExtendedAreaInfo;

    if (this.areaHistory.length > 0) {
      const diffSeconds = (areaEntered.timestamp - this.areaHistory[0].timestamp) / 1000;
      this.areaHistory[0].duration = diffSeconds;
    }

    const neutralZone =
      ((areaEntered.eventArea.name.endsWith('Hideout')
        || areaEntered.eventArea.info[0].town)
        || areaEntered.eventArea.name === ('The Templar Laboratory'));

    // update areas and emit to group
    this.updateAreaHistory(areaEntered);
    this.incomeService.Snapshot();
    this.settingsService.set('areas', this.areaHistory);
    this.localPlayer.area = this.areaHistory[0].eventArea.name;
    this.localPlayer.areaInfo = this.areaHistory[0];
    this.localPlayer.pastAreas = HistoryHelper.filterAreas(this.areaHistory, (Date.now() - (24 * 60 * 60 * 1000)));
    this.accountService.player.next(this.localPlayer);
    this.updateLocalPlayerAreas(this.areaHistory);
    this.partyService.updatePlayer(this.localPlayer, neutralZone ? 'area-change-to-neutral' : 'area-change-to-hostile');
  }

  updateAreaHistory(eventArea) {
    this.areaHistory.unshift(eventArea);
    if (this.areaHistory.length > 1000) {
      this.areaHistory.pop();
    }
  }

  loadAreasFromSettings() {
    this.areaHistory = this.settingsService.get('areas');
  }
  removeAreasFromSettings() {
    this.settingsService.set('areas', []);
    this.areaHistory = this.settingsService.get('areas');
  }

  formatAreaInfo(e: EventArea) {
    if (e.info.length === undefined) {
      e.info = [];
    }

    if (e.info.length < 1) {
      e.info.push({
        act: 0,
        bosses: [],
        town: false,
        waypoint: false
      } as AreaInfo);
    }
    return e;
  }
}
