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
import { areAllEquivalent } from '@angular/compiler/src/output/output_ast';

@Injectable()
export class PartyService {
  private _hubConnection: HubConnection | undefined;
  public async: any;
  public party: Party;
  public recentParties: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(undefined);
  public player: Player;
  public accountInfo: AccountInfo;
  public selectedPlayer: BehaviorSubject<Player> = new BehaviorSubject<Player>(undefined);
  public selectedPlayerObj: Player;

  private localPartyPlayers: Player[] = [];
  private localPartyPlayersPromise: any;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private logMonitorService: LogMonitorService,
    private externalService: ExternalService,
    private settingService: SettingsService,
  ) {
    this.recentParties.next(this.settingService.get('recentParties') || []);
    this.startLocalPartyPlayerPolling();

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
      this.party.players.push(player);
      console.log('player joined:', player);
    });

    this._hubConnection.on('PlayerLeft', (player: Player) => {
      this.party.players = this.party.players.filter(x => x.connectionID !== player.connectionID);
      console.log('player left:', player);
    });

    // subscribe to log-events
    this.logMonitorService.areaEvent.subscribe(res => {
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

  public genericUpdatePlayer(player: Player) {
    this.externalService.getCharacter(this.accountInfo)
      .subscribe((data: EquipmentResponse) => {
        player = this.externalService.setCharacter(data, player);
        if (this._hubConnection) {
          // this._hubConnection.invoke('GenericUpdatePlayer', player, this.party.name);
        }
      });
  }


  public joinParty(partyName: string, player: Player) {
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
    while (recent.length > 6) {
      recent.splice(-1, 1);
    }
    this.settingService.set('recentParties', recent);
    this.recentParties.next(recent);
  }

  public invitePlayerToLocalParty(playerName: string) {

    const exists = this.localPartyPlayers.filter(player => player.character.name === playerName).length !== -1;

    if (!exists) {

      const genericPlayer: Player = {
        connectionID: null,
        channel: this.player.channel,
        account: null,
        character: {
          name: playerName,
          league: this.player.character.league,
          classId: null,
          ascendancyClass: null,
          class: null,
          level: null,
          items: []
        },
        area: null,
        guild: null,
        sessionId: null,
        inArea: [],
        generic: true
      };
      this.localPartyPlayers.unshift(genericPlayer);
    }
  }

  // public removePlayerFromLocalParty(playerName: string) {
  //   this.localPartyPlayers = this.localPartyPlayers.filter((player) => {
  //     return playerName !== player;
  //   });
  // }

  public startLocalPartyPlayerPolling() {
    this.localPartyPlayersPromise = setInterval(() => {
      this.localPartyPlayers.forEach((playerName) => {
        console.log('Updating player: ', playerName);
      });
    }, (1000 * 10));
  }

}
