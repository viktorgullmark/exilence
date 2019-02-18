import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { HistoryHelper } from '../helpers/history.helper';
import { ItemHelper } from '../helpers/item.helper';
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
import { AreaHelper } from '../helpers/area.helper';

@Injectable()
export class MapService implements OnDestroy {

  private areaHistory: ExtendedAreaInfo[] = [];
  public area: ExtendedAreaInfo;
  public previousInstanceServer: string;
  public previousDate: Date;
  private localPlayer: Player;
  public excludeGain: NetWorthItem[] = undefined;

  private playerSub: Subscription;
  private areasSub: Subscription;
  private enteredNeutralAreaSub: Subscription;
  private enteredHostileAreaSub: Subscription;

  areasParsed: EventEmitter<any> = new EventEmitter();

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

    this.enteredNeutralAreaSub = this.partyService.enteredNeutralArea.subscribe((inventory: Item[]) => {
      if (inventory !== undefined) {
        this.EnteredArea(inventory);
      }
    });

    this.enteredHostileAreaSub = this.partyService.enteredHostileArea.subscribe((inventory: Item[]) => {
      if (inventory !== undefined) {
        this.EnteredArea(inventory);
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

    this.logMonitorService.areaEvent.subscribe((e: EventArea) => {
      this.registerAreaEvent(e);
    });
  }

  EnteredArea(inventory: Item[]) {
    const currentInventory = this.priceAndCombineInventory(inventory);
    this.areaHistory[0].inventory = currentInventory;
    if (this.areaHistory[1] !== undefined) {
      const gainedItems: NetWorthItem[] = ItemHelper.GetNetowrthItemDifference(currentInventory, this.areaHistory[1].inventory);
      this.areaHistory[1].difference = [...gainedItems];
    }
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

    e.name = AreaHelper.formatName(e);

    const character = this.settingsService.getCurrentCharacter();
    if (character !== undefined) {
      this.areaHistory = character.areas;
    }

    const areaEntered = {
      eventArea: this.formatAreaInfo(e),
      type: AreaEventType.Join,
      timestamp: new Date(e.timestamp).getTime(),
      duration: 0,
      instanceServer: this.previousInstanceServer,
      difference: [],
      inventory: []
    } as ExtendedAreaInfo;

    const diffSeconds = (areaEntered.timestamp - this.areaHistory[0].timestamp) / 1000;

    if (this.areaHistory.length > 0) {
      this.areaHistory[0].duration = diffSeconds;
    }

    const neutralZone = AreaHelper.isNeutralZone(areaEntered);

    // update areas and emit to group
    this.updateAreaHistory(areaEntered);

    const sameInstance = AreaHelper.isSameInstance(this.areaHistory, this.previousInstanceServer);

    if (sameInstance) {
      this.areaHistory.shift();
      this.areaHistory[0].duration = this.areaHistory[1].duration + diffSeconds;
      // todo: concat gain
    }

    this.updateLocalPlayerAreas(this.areaHistory);

    character.areas = this.areaHistory;
    this.settingsService.updateCharacter(character);

    this.incomeService.Snapshot();

    this.localPlayer.area = this.areaHistory[0].eventArea.name;
    this.localPlayer.areaInfo = this.areaHistory[0];
    this.localPlayer.pastAreas = HistoryHelper.filterAreas(this.areaHistory, (Date.now() - (24 * 60 * 60 * 1000)));
    this.accountService.player.next(this.localPlayer);
    this.partyService.updatePlayer(this.localPlayer, neutralZone ? 'area-change-to-neutral' : 'area-change-to-hostile');
  }

  updateAreaHistory(eventArea) {
    this.areaHistory.unshift(eventArea);
    if (this.areaHistory.length > 1000) {
      this.areaHistory.pop();
    }
  }

  loadAreasFromSettings() {
    const character = this.settingsService.getCurrentCharacter();
    if (character !== undefined) {
      this.areaHistory = character.areas;
    }
  }
  removeAreasFromSettings() {
    const character = this.settingsService.getCurrentCharacter();
    if (character !== undefined) {
      character.areas = [];
      this.settingsService.updateCharacter(character);
      this.areaHistory = character.areas;
    }
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
