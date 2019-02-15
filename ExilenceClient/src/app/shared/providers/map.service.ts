import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { HistoryHelper } from '../helpers/history.helper';
import { AreaEventType, AreaInfo, EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
import { Item } from '../interfaces/item.interface';
import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { IncomeService } from './income.service';
import { LogMonitorService } from './log-monitor.service';
import { PartyService } from './party.service';
import { PricingService } from './pricing.service';
import { SettingsService } from './settings.service';
import { StateService } from './state.service';
import { ItemPrice } from '../interfaces/poe-watch/item-price.interface';
import { ItemHelper } from '../helpers/item.helper';
import { NetWorthItem } from '../interfaces/income.interface';
import { TableHelper } from '../helpers/table.helper';

@Injectable()
export class MapService implements OnDestroy {

  private areaHistory: ExtendedAreaInfo[] = [];
  public currentArea: ExtendedAreaInfo;
  public currentHistoricalArea: ExtendedAreaInfo;
  public previousInstanceServer: string;
  public historicalInstanceServer: string;
  public previousDate: Date;
  private localPlayer: Player;
  private temporaryGain: NetWorthItem[] = [];

  private playerSub: Subscription;
  private areasSub: Subscription;
  private playerInventorySub: Subscription;

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
    private stateService: StateService,
    private pricingService: PricingService
  ) {

    this.loadAreasFromSettings();

    this.playerInventorySub = this.partyService.playerInventory.subscribe(state => {
      const inventory: Item[] = 'inventory'.split('.').reduce((o, i) => o[i], state);
      let networthItems: NetWorthItem[] = [...this.temporaryGain];
      this.temporaryGain = [];
      if (inventory !== undefined) {
        inventory.forEach((item: Item) => {
          const priceInformation = pricingService.priceItem(item);
          const networthItem = ItemHelper.toNetworthItem(item, priceInformation);
          networthItems.push(networthItem);
        });

        if (this.areaHistory[1] !== undefined) {
          networthItems = networthItems.filter(x =>
            TableHelper.findNetworthObj(this.areaHistory[1].items, x) === undefined
          );
        }
        this.areaHistory[0].items = networthItems;
        this.settingsService.set('areas', this.areaHistory);
        this.updateLocalPlayerAreas(this.areaHistory);
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

    this.logMonitorService.parsingStarted.subscribe((e: any) => {
      this.removeAreasFromSettings();
    });

    this.logMonitorService.parsingComplete.subscribe((e: any) => {
      this.settingsService.set('areas', this.areaHistory);
      this.updateLocalPlayerAreas(this.areaHistory);
      this.areasParsed.emit();
    });

    // updated versions
    this.logMonitorService.areaEvent.subscribe((e: EventArea) => {
      this.registerAreaEvent(e, true);
    });

    this.logMonitorService.historicalAreaEvent.subscribe((e: EventArea) => {
      this.registerAreaEvent(e, false);
    });
  }

  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
    if (this.areasSub !== undefined) {
      this.areasSub.unsubscribe();
    }
    if (this.playerInventorySub !== undefined) {
      this.playerInventorySub.unsubscribe();
    }
  }

  updateLocalPlayerAreas(areas: ExtendedAreaInfo[]) {
    const areasToSend = Object.assign([], areas);
    this.localPlayerAreaSubject.next(areasToSend);
  }

  registerAreaEvent(e: EventArea, live: boolean) {
    // zone entered
    const shouldUpdateAreaHistory = true;

    const nextNeutralZone =
      ((e.name.endsWith('Hideout') ||
        e.info[0].town) ||
        e.name === ('The Templar Laboratory'));

    const neutralZone = this.currentArea !== undefined &&
      ((this.currentArea.eventArea.name.endsWith('Hideout')
        || this.currentArea.eventArea.info[0].town)
        || this.currentArea.eventArea.name === ('The Templar Laboratory'));

    if ((!this.logMonitorService.parsingCompleted || live)) {
      let diffSeconds = 0;
      let duration = 0;

      if (live) {
        this.areaHistory = this.settingsService.get('areas');
      }

      const eventDate = new Date(e.timestamp);
      const eventTimestamp = eventDate.getTime();

      // final object to push
      let eventArea = {
        eventArea: this.validateAreaInfo(e),
        type: AreaEventType.Join,
        timestamp: eventTimestamp,
        duration: 0,
        instanceServer: this.previousInstanceServer,
        items: []
      } as ExtendedAreaInfo;

      if (eventArea.eventArea.type === 'map' && eventArea.eventArea.info.length > 0) {
        eventArea.eventArea.name += ` map (T${eventArea.eventArea.info[0].tier})`;
      }

      // If we enter a map
      // And got atleast three zones in out history (map --> hideout --> map)
      // And our last zone was a Hideout
      // And the map zone before that has the same map name as this one
      // And is located on the same instance server as this one
      // It's probably the same map
      const sameZoneAsBefore =
        (this.areaHistory.length > 1
          && this.currentArea !== undefined
          && neutralZone
          && this.areaHistory[1].eventArea.name.indexOf(e.name) > -1
          && this.previousInstanceServer === this.areaHistory[1].instanceServer);

      // player is in an area while entering this (includes history)
      if (this.currentArea !== undefined && this.areaHistory.length > 0) {

        // calculate difference using timestamps from log
        // validate that the dates have not been tampered with in the log
        if (this.currentArea.timestamp < eventTimestamp) {
          diffSeconds = (eventTimestamp - this.currentArea.timestamp) / 1000;
        }
        if (this.areaHistory[1] !== undefined) {
          this.temporaryGain = this.temporaryGain.concat(this.areaHistory[1].items);
        }
        // if we enter the same map, add duration to previous event
        if (sameZoneAsBefore && shouldUpdateAreaHistory) {
          duration = this.areaHistory[1].duration + diffSeconds;
          // remove hideout-event from current array
          this.areaHistory.shift();
          eventArea = this.areaHistory[0];
          eventArea.duration = duration;
          // todo: concat gain for zones
          this.areaHistory[0] = eventArea;
        } else {
          if (shouldUpdateAreaHistory) {
            this.areaHistory[0].duration = diffSeconds;
            // push the new object to our area-history
            this.updateAreaHistory(eventArea);
          }
        }
      } else {
        // This is the first zone
        if (shouldUpdateAreaHistory) {
          this.updateAreaHistory(eventArea);
        }
      }

      this.currentArea = eventArea;
    }
    // if live-parsing, update data now
    if (live) {
      this.incomeService.Snapshot();

      // update current player and send information to party
      this.localPlayer.area = this.currentArea.eventArea.name;
      this.localPlayer.areaInfo = this.currentArea;

      const oneDayAgo = (Date.now() - (24 * 60 * 60 * 1000));

      this.localPlayer.pastAreas = HistoryHelper.filterAreas(this.areaHistory, oneDayAgo);
      this.accountService.player.next(this.localPlayer);

      // save updated areas to settings
      if (shouldUpdateAreaHistory) {
        this.settingsService.set('areas', this.areaHistory);
        this.updateLocalPlayerAreas(this.areaHistory);
      }

      console.log('Neutral Zone: ', neutralZone);
      console.log('Next Neutral Zone: ', nextNeutralZone);

      const reason = !neutralZone && nextNeutralZone ? 'area-change' : null;
      this.partyService.updatePlayer(this.localPlayer, reason);
    }
  }

  updateAreaHistory(eventArea) {
    // todo: add gain
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

  validateAreaInfo(e: EventArea) {
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
