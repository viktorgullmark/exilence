import { Injectable, EventEmitter, OnDestroy } from '@angular/core';

import { AreaEventType, AreaInfo, EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { IncomeService } from './income.service';
import { LogMonitorService } from './log-monitor.service';
import { PartyService } from './party.service';
import { NetWorthSnapshot } from '../interfaces/income.interface';
import { SettingsService } from './settings.service';
import { HistoryHelper } from '../helpers/history.helper';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subscription } from 'rxjs';

@Injectable()
export class MapService implements OnDestroy {

  private areaHistory: ExtendedAreaInfo[] = [];
  public currentArea: ExtendedAreaInfo;
  public currentHistoricalArea: ExtendedAreaInfo;
  public previousInstanceServer: string;
  public historicalInstanceServer: string;
  public previousDate: Date;
  private durationSeconds = 0;
  private durationInterval: any;
  private localPlayer: Player;

  private playerSub: Subscription;
  private areasSub: Subscription;

  areasParsed: EventEmitter<any> = new EventEmitter();

  // areas specific to the local player (including the log if imported)
  public localPlayerAreaSubject: BehaviorSubject<ExtendedAreaInfo[]> = new BehaviorSubject<ExtendedAreaInfo[]>([]);
  public localPlayerAreas: ExtendedAreaInfo[];

  constructor(
    private logMonitorService: LogMonitorService,
    private accountService: AccountService,
    private partyService: PartyService,
    private incomeService: IncomeService,
    private settingsService: SettingsService
  ) {

    this.loadAreasFromSettings();

    this.playerSub = this.accountService.player.subscribe(player => {
      if (player !== undefined) {
        this.localPlayer = player;
        // this.localPlayer.pastAreas = this.areaHistory;
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

      const currentDate = '[' + new Date().toUTCString() + '] ';
      console.log(currentDate, 'parsing started...');
    });

    this.logMonitorService.parsingComplete.subscribe((e: any) => {
      const currentDate = '[' + new Date().toUTCString() + '] ';
      console.log(currentDate, 'parsing completed!');

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
    console.log('mapservice destroyed');
  }

  updateLocalPlayerAreas(areas: ExtendedAreaInfo[]) {
    const areasToSend = Object.assign([], areas);
    this.localPlayerAreaSubject.next(areasToSend);
  }

  registerAreaEvent(e: EventArea, live: boolean) {
    // zone entered
    const shouldUpdateAreaHistory = (e.type === 'map' || e.name.endsWith('Hideout') || !this.logMonitorService.trackMapsOnly);

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
        instanceServer: this.previousInstanceServer
      } as ExtendedAreaInfo;

      // If we enter a map
      // And got atleast three zones in out history (map --> hideout --> map)
      // And our last zone was a Hideout
      // And the map zone before that has the same map name as this one
      // And is located on the same instance server as this one
      // It's probably the same map
      const sameMapAsBefore =
        (e.type === 'map'
          && this.areaHistory.length > 1
          && this.currentArea !== undefined
          && this.currentArea.eventArea.name.endsWith('Hideout')
          && this.areaHistory[1].eventArea.name.indexOf(e.name) > -1
          && this.previousInstanceServer === this.areaHistory[1].instanceServer);

      // player is in an area while entering this (includes history)
      if (this.currentArea !== undefined && this.areaHistory.length > 0) {

        // calculate difference using timestamps from log
        // validate that the dates have not been tampered with in the log
        if (this.currentArea.timestamp < eventTimestamp) {
          diffSeconds = (eventTimestamp - this.currentArea.timestamp) / 1000;
        }

        // if we enter the same map, add duration to previous event
        if (sameMapAsBefore && shouldUpdateAreaHistory) {
          duration = this.areaHistory[1].duration + diffSeconds;
          // remove hideout-event from current array
          this.areaHistory.shift();
          eventArea = this.areaHistory[0];
          eventArea.duration = duration;
          this.areaHistory[0] = eventArea;
        } else {
          if (eventArea.eventArea.type === 'map' && eventArea.eventArea.info.length > 0) {
            eventArea.eventArea.name += ` map (T${eventArea.eventArea.info[0].tier})`;
          }
          if (shouldUpdateAreaHistory) {
            this.areaHistory[0].duration = diffSeconds;
            // push the new object to our area-history
            this.areaHistory.unshift(eventArea);
          }
        }
      } else {
        if (shouldUpdateAreaHistory) {
          this.areaHistory.unshift(eventArea);
        }
      }

      this.currentArea = eventArea;
    }
    // if live-parsing, update data now
    if (live) {
      // delay snapshot by 25 seconds, to make room for stashing/vendoring
      setTimeout(x => {
        this.incomeService.Snapshot();
      }, 1000 * 25);
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
      this.partyService.updatePlayer(this.localPlayer);
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
