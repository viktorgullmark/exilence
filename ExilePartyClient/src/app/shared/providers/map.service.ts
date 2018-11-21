import { Injectable, EventEmitter } from '@angular/core';

import { AreaEventType, AreaInfo, EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { IncomeService } from './income.service';
import { LogMonitorService } from './log-monitor.service';
import { PartyService } from './party.service';
import { NetWorthSnapshot } from '../interfaces/income.interface';
import { SettingsService } from './settings.service';
import { HistoryHelper } from '../helpers/history.helper';


@Injectable()
export class MapService {

  private areaHistory: ExtendedAreaInfo[] = [];
  public currentArea: ExtendedAreaInfo;
  public lastInstanceServer: string;
  public lastTimestamp: number;
  private durationSeconds = 0;
  private durationInterval: any;
  private localPlayer: Player;
  areasParsed: EventEmitter<any> = new EventEmitter();

  constructor(
    private logMonitorService: LogMonitorService,
    private accountService: AccountService,
    private partyService: PartyService,
    private incomeService: IncomeService,
    private settingsService: SettingsService
  ) {

    this.loadAreasFromSettings();

    this.accountService.player.subscribe(player => {
      if (player !== undefined) {
        this.localPlayer = player;
        this.localPlayer.pastAreas = this.areaHistory;
      }
    });

    this.logMonitorService.instanceServerEvent.subscribe(e => {
      this.lastInstanceServer = e.address;
    });

    this.logMonitorService.historicalInstanceServerEvent.subscribe(e => {
      this.lastInstanceServer = e.address;
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

      this.areasParsed.emit();
    });

    this.logMonitorService.historicalAreaEvent.subscribe((e: EventArea) => {
      let durationSeconds = 0;
      const timestamp = Date.parse(e.timestamp);

      if (this.lastTimestamp !== undefined && this.lastTimestamp < timestamp) {
        const difference = timestamp - this.lastTimestamp;

        const differenceMs = difference / 1000;
        durationSeconds = Math.floor(differenceMs % 60);
      }

      this.lastTimestamp = timestamp;

      const extendedInfo: ExtendedAreaInfo = {
        eventArea: e,
        type: AreaEventType.Join,
        timestamp: timestamp,
        duration: durationSeconds,
        instanceServer: this.lastInstanceServer,
      };

      // If we enter a map
      // And got atleast three zones in out history (map --> hideout --> map)
      // And our last zone was a Hideout
      // And the map zone before that has the same map name as this one
      // And is located on the same instance server as this one
      // It's probably the same map
      if (e.type === 'map' &&
        this.areaHistory.length > 0 &&
        this.currentArea.eventArea.name.indexOf('Hideout') > -1 &&
        this.areaHistory[0].eventArea.name.indexOf(e.name) > -1 &&
        this.lastInstanceServer === this.areaHistory[0].instanceServer
      ) {
        this.currentArea = this.areaHistory.shift();
      } else {

        if (e.type === 'map' && e.info.length > 0) {
          e.name += ` map (T${e.info[0].tier})`;
        }

        if (this.currentArea !== undefined) {
          this.currentArea.duration = durationSeconds;
          this.currentArea.timestamp = timestamp;
          this.areaHistory.unshift(this.currentArea);
        }

        if (extendedInfo.eventArea.info.length === undefined) {
          extendedInfo.eventArea.info = [];
        }

        if (extendedInfo.eventArea.info.length === 0) {
          extendedInfo.eventArea.info.push({
            act: 0,
            bosses: [],
            town: false,
            waypoint: false
          } as AreaInfo);
        }
        this.currentArea = extendedInfo;
      }
    });

    this.logMonitorService.areaEvent.subscribe((e: EventArea) => {
      this.areaHistory = this.settingsService.get('areas');
      const oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));

      // delay snapshot by 25 seconds, to make room for stashing/vendoring
      setTimeout(x => {
        this.incomeService.Snapshot();
      }, 1000 * 25);

      clearInterval(this.durationInterval);

      const extendedInfo: ExtendedAreaInfo = {
        eventArea: e,
        type: AreaEventType.Join,
        timestamp: Date.now(),
        duration: 0,
        instanceServer: this.lastInstanceServer,
      };
      let areasToSend;

      // If we enter a map
      // And got atleast three zones in out history (map --> hideout --> map)
      // And our last zone was a Hideout
      // And the map zone before that has the same map name as this one
      // And is located on the same instance server as this one
      // It's probably the same map
      if (e.type === 'map' &&
        this.areaHistory.length > 0 &&
        this.currentArea.eventArea.name.indexOf('Hideout') > -1 &&
        this.areaHistory[0].eventArea.name.indexOf(e.name) > -1 &&
        this.lastInstanceServer === this.areaHistory[0].instanceServer
      ) {
        this.currentArea = this.areaHistory.shift();
        this.durationSeconds = this.currentArea.duration;

      } else {

        if (e.type === 'map' && e.info.length > 0) {
          e.name += ` map (T${e.info[0].tier})`;
        }

        if (this.currentArea !== undefined) {
          this.currentArea.duration = this.durationSeconds;
          this.currentArea.timestamp = Date.now();
          this.areaHistory.unshift(this.currentArea);
        }

        this.durationSeconds = 0;


        if (extendedInfo.eventArea.info.length === undefined) {
          extendedInfo.eventArea.info = [];
        }

        if (extendedInfo.eventArea.info.length === 0) {
          extendedInfo.eventArea.info.push({
            act: 0,
            bosses: [],
            town: false,
            waypoint: false
          } as AreaInfo);
        }
        this.currentArea = extendedInfo;

        areasToSend = HistoryHelper.filterAreas(this.areaHistory, oneHourAgo);

        this.accountService.player.next(this.localPlayer);
      }

      this.settingsService.set('areas', this.areaHistory);

      this.localPlayer.area = this.currentArea.eventArea.name;
      this.localPlayer.areaInfo = this.currentArea;

      const historyToSend = HistoryHelper.filterNetworth(this.localPlayer.netWorthSnapshots, oneHourAgo);

      const objToSend = Object.assign({}, this.localPlayer);
      if (areasToSend !== undefined) {
        objToSend.pastAreas = areasToSend;
      }
      objToSend.netWorthSnapshots = historyToSend;
      this.partyService.updatePlayer(objToSend);

      this.durationInterval = setInterval(() => {
        this.durationSeconds++;
      }, 1000);

      // Skip all hideout areas TODO: Add eternal lab.
      // if (e.name.indexOf('Hideout') > -1) {
      //   return;
      // }


    });

  }
  loadAreasFromSettings() {
    this.areaHistory = this.settingsService.get('areas');
  }
  removeAreasFromSettings() {
    this.settingsService.set('areas', []);
    this.areaHistory = this.settingsService.get('areas');
  }
}
