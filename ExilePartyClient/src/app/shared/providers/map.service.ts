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
  private lastInstanceServer: string;
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

    this.logMonitorService.instanceServerEvent.subscribe(e => {
      this.lastInstanceServer = e.address;
    });

    this.logMonitorService.areaEvent.subscribe((e: EventArea) => {

      clearInterval(this.durationInterval);

      const extendedInfo: ExtendedAreaInfo = {
        eventArea: e,
        type: AreaEventType.Join,
        timestamp: Date.now(),
        duration: 0,
        instanceServer: this.lastInstanceServer,
      };

      // If we enter a map
      // And got atleast three zones in out history (map --> hideout --> map)
      // And our last zone was a Hideout
      // And the map zone before that has the same map name as this one
      // And is located on the same instance server as this one
      // It's probably the same map
      if (e.type === 'map' &&
        this.pastAreaList.length > 0 &&
        this.currentArea.eventArea.name.indexOf('Hideout') > -1 &&
        this.pastAreaList[0].eventArea.name.indexOf(e.name) > -1 &&
        this.lastInstanceServer === this.pastAreaList[0].instanceServer
      ) {
        this.currentArea = this.pastAreaList.shift();
        this.durationSeconds = this.currentArea.duration;

      } else {

        if (e.type === 'map' && e.info.length > 0) {
          e.name += ` map (T${e.info[0].tier})`;
        }

        if (this.currentArea !== undefined) {
          this.currentArea.duration = this.durationSeconds;
          this.pastAreaList.unshift(this.currentArea);
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

        if (this.pastAreaList.length > 50) {
          this.pastAreaList.pop();
        }

        this.localPlayer.pastAreas = this.pastAreaList;
        this.localPlayer.areaInfo = this.currentArea;
        this.localPlayer.area = this.currentArea.eventArea.name;

        this.partyService.updatePlayer(this.localPlayer);
      }

      this.durationInterval = setInterval(() => {
        this.durationSeconds++;
      }, 1000);

      // Skip all hideout areas TODO: Add eternal lab.
      // if (e.name.indexOf('Hideout') > -1) {
      //   return;
      // }


    });

  }
}
