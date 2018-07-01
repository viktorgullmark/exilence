import { Injectable } from '@angular/core';

import { AreaEventType, AreaInfo, EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { LogMonitorService } from './log-monitor.service';
import { PartyService } from './party.service';


@Injectable()
export class MapService {

  private pastAreaList: ExtendedAreaInfo[] = [];
  private currentArea: ExtendedAreaInfo;
  private durationSeconds = 0;
  private durationInterval: any;
  private localPlayer: Player;

  constructor(
    private logMonitorService: LogMonitorService,
    private accountService: AccountService,
    private partyService: PartyService
  ) {

    this.accountService.player.subscribe(player => {
      if (player !== undefined) {
        this.localPlayer = player;
      }
    });

    this.logMonitorService.areaEvent.subscribe((e: EventArea) => {


      clearInterval(this.durationInterval);

      const extendedInfo: ExtendedAreaInfo = {
        eventArea: e,
        type: AreaEventType.Join,
        timestamp: Date.now(),
        duration: 0
      };

      if (this.currentArea !== undefined) {
        this.currentArea.duration = this.durationSeconds;
        this.pastAreaList.unshift(this.currentArea);
      }

      if (this.pastAreaList.length > 50) {
        this.pastAreaList.pop();
      }

      this.durationSeconds = 0;
      this.durationInterval = setInterval(() => {
        this.durationSeconds++;
      }, 1000);

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

      this.localPlayer.pastAreas = this.pastAreaList;
      this.localPlayer.areaInfo = this.currentArea;

      this.partyService.updatePlayer(this.localPlayer);


    });

  }
}
