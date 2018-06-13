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
import { interval } from 'rxjs/observable/interval';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

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
  public localPartyPlayers: Player[] = [];
  public localPartyPlayersPromise: any;

  // player-lists
  public incursionStd: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public incursionSsfStd: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public incursionHc: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public incursionSsfHc: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public std: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public hc: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

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
      this.updatePlayerLists(this.party);
      this.accountService.player.next(player);
      this.selectedPlayer.next(player);
      this.isEntering = false;
      console.log('entered party:', party);
    });

    this._hubConnection.on('PlayerUpdated', (player: Player) => {
      const index = this.party.players.indexOf(this.party.players.find(x => x.connectionID === player.connectionID));
      this.party.players[index] = player;
      this.updatePlayerLists(this.party);
      if (this.selectedPlayerObj.connectionID === player.connectionID) {
        this.selectedPlayer.next(player);
      }
      console.log('player updated:', player);
    });

    this._hubConnection.on('PlayerJoined', (player: Player) => {
      this.party.players = this.party.players.filter(x => x.character.name !== player.character.name);
      this.party.players.push(player);
      this.updatePlayerLists(this.party);
      console.log('player joined:', player);
    });

    this._hubConnection.on('PlayerLeft', (player: Player) => {
      this.party.players = this.party.players.filter(x => x.connectionID !== player.connectionID);
      this.updatePlayerLists(this.party);
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

  updatePlayerLists(party: Party) {
    this.incursionStd.next(party.players.filter(x => x.character.league === 'Incursion'));
    this.incursionSsfStd.next(party.players.filter(x => x.character.league === 'SSF Incursion'));
    this.incursionHc.next(party.players.filter(x => x.character.league === 'Hardcore Incursion'));
    this.incursionSsfHc.next(party.players.filter(x => x.character.league === 'SSF Incursion HC'));
    this.std.next(party.players.filter(x => x.character.league === 'Standard'));
    this.hc.next(party.players.filter(x => x.character.league === 'Hardcore'));
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
          this._hubConnection.invoke('GenericUpdatePlayer', player, this.party.name);
        }
      });
  }

  public getAccountForCharacter(character: string): Promise<any> {
    return this._hubConnection.invoke('GetAccountForCharacter', character).then((response) => {
      return response;
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
    if (recent.length > 4) {
      recent.splice(-1, 1);
    }
    this.settingService.set('recentParties', recent);
    this.recentParties.next(recent);
  }

  public invitePlayerToLocalParty(player: Player) {
    const exists = this.localPartyPlayers.filter(p => p.character.name === p.character.name).length !== -1;
    if (!exists) {
      this.localPartyPlayers.unshift(player);
    }
  }

  // public removePlayerFromLocalParty(playerName: string) {
  //   this.localPartyPlayers = this.localPartyPlayers.filter((player) => {
  //     return playerName !== player;
  //   });
  // }

  public startLocalPartyPlayerPolling() {
    this.localPartyPlayersPromise = setInterval(() => {
      this.localPartyPlayers.forEach((player) => {
        this.genericUpdatePlayer(player);
      });
    }, (1000 * 10));
  }

}
