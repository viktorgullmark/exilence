import { Injectable } from '@angular/core';

import { AreaEventType, EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
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

      const extendedJoinInfo: ExtendedAreaInfo = {
        eventArea: e,
        type: AreaEventType.Join,
        timestamp: Date.now(),
        duration: 0
      };

      const extendedLeaveInfo: ExtendedAreaInfo = {
        eventArea: e,
        type: AreaEventType.Leave,
        timestamp: Date.now(),
        duration: this.durationSeconds
      };

      this.currentArea = extendedJoinInfo;
      this.pastAreaList.unshift(extendedLeaveInfo);

      if (this.pastAreaList.length > 50) {
        this.pastAreaList.pop();
      }

      this.durationSeconds = 0;
      this.durationInterval = setInterval(() => {
        this.durationSeconds++;
      }, 1000);

      this.localPlayer.pastAreas = this.pastAreaList;
      this.localPlayer.areaInfo = this.currentArea;

      const tempPlayer: Player = this.localPlayer;
      tempPlayer.netWorthSnapshots = [];

      this.partyService.updatePlayer(this.localPlayer);

    });

  }
}
