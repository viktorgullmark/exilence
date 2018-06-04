import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { AppConfig } from '../../../environments/environment';
import { AccountInfo } from '../interfaces/account-info.interface';
import { EquipmentResponse } from '../interfaces/equipment-response.interface';
import { Party } from '../interfaces/party.interface';
import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { ExternalService } from './external.service';
import { LogMonitorService } from './log-monitor.service';
import { SettingsService } from './settings.service';

@Injectable()
export class PartyService {
  private _hubConnection: HubConnection | undefined;
  public async: any;
  public party: Party;
  public isEntering = false;
  public recentParties: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(undefined);
  public player: Player;
  public accountInfo: AccountInfo;
  public selectedPlayer: BehaviorSubject<Player> = new BehaviorSubject<Player>(undefined);
  public selectedPlayerObj: Player;
  constructor(
    private router: Router,
    private accountService: AccountService,
    private logMonitorService: LogMonitorService,
    private externalService: ExternalService,
    private settingService: SettingsService,
  ) {
    this.recentParties.next(this.settingService.get('recentParties') || []);

    this.accountService.player.subscribe(res => {
      this.player = res;
    });
    this.selectedPlayer.subscribe(res => {
      this.selectedPlayerObj = res;
    });
    this.accountService.accountInfo.subscribe(res => {
      this.accountInfo = res;
    });
    this.initParty();
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(AppConfig.url + 'hubs/party')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this._hubConnection.start().catch(err => console.error(err.toString()));

    this._hubConnection.on('EnteredParty', (party: Party, player: Player) => {
      this.party = party;
      this.accountService.player.next(player);
      this.selectedPlayer.next(player);
      this.isEntering = false;
      console.log('entered party:', party);
    });

    this._hubConnection.on('PlayerUpdated', (player: Player) => {
      const index = this.party.players.indexOf(this.party.players.find(x => x.connectionID === player.connectionID));
      this.party.players[index] = player;

      if (this.selectedPlayerObj.connectionID === player.connectionID) {
        this.selectedPlayer.next(player);
      }
      console.log('player updated:', player);
    });

    this._hubConnection.on('PlayerJoined', (player: Player) => {
      if (this.party.players.find(x => x.character.name === player.character.name) === undefined) {
        this.party.players.push(player);
      }
      console.log('player joined:', player);
    });

    this._hubConnection.on('PlayerLeft', (player: Player) => {
      this.party.players = this.party.players.filter(x => x.connectionID !== player.connectionID);
      if (this.selectedPlayerObj.connectionID === player.connectionID) {
        this.selectedPlayer.next(this.player);
      }
      console.log('player left:', player);
    });

    // subscribe to log-events
    this.logMonitorService.areaEvent.subscribe(res => {
      this.player.area = res.name;
      this.updatePlayer(this.player);
    });
  }

  public updatePlayer(player: Player) {
    this.externalService.getCharacter(this.accountInfo)
      .subscribe((data: EquipmentResponse) => {
        player = this.externalService.setCharacter(data, player);
        if (this._hubConnection) {
          this._hubConnection.invoke('UpdatePlayer', player, this.party.name);
        }
      });
  }

  public joinParty(partyName: string, player: Player) {
    this.isEntering = true;
    this.initParty();
    this.party.players.push(player);
    this.party.name = partyName;
    if (this._hubConnection) {
      this._hubConnection.invoke('JoinParty', partyName, player);
    }
  }

  public leaveParty(partyName: string, player: Player) {
    this.initParty();
    if (partyName !== '') {
      if (this._hubConnection) {
        this._hubConnection.invoke('LeaveParty', partyName, player);
      }
    }
  }

  public initParty() {
    this.party = { name: '', players: [] };
  }

  public addPartyToRecent(partyName: string) {
    const recent: string[] = this.settingService.get('recentParties') || [];
    recent.unshift(partyName);
    if (recent.length > 6) {
      recent.splice(-1, 1);
    }
    this.settingService.set('recentParties', recent);
    this.recentParties.next(recent);
  }
}
