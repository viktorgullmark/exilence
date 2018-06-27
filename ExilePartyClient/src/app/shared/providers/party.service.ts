import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { AppConfig } from '../../../environments/environment';
import { AccountInfo } from '../interfaces/account-info.interface';
import { EquipmentResponse } from '../interfaces/equipment-response.interface';
import { Party } from '../interfaces/party.interface';
import { Player, RecentPlayer } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { ExternalService } from './external.service';
import { LogMonitorService } from './log-monitor.service';
import { SettingsService } from './settings.service';
import { areAllEquivalent } from '@angular/compiler/src/output/output_ast';
import { interval } from 'rxjs/observable/interval';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogMessage } from '../interfaces/log-message.interface';

@Injectable()
export class PartyService {
  public _hubConnection: HubConnection | undefined;
  public async: any;
  public party: Party;
  public isEntering = false;
  public recentParties: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(undefined);
  public player: Player;
  public accountInfo: AccountInfo;
  public selectedPlayer: BehaviorSubject<Player> = new BehaviorSubject<Player>(undefined);
  public selectedPlayerObj: Player;
  public selectedGenericPlayer: BehaviorSubject<Player> = new BehaviorSubject<Player>(undefined);
  public selectedGenericPlayerObj: Player;
  public genericPartyPlayers: Player[] = [];
  public genericPartyPlayersPromise: any;
  public genericPartyName: string;
  public recentPlayers: RecentPlayer[] = [
  ];

  // player-lists
  public incursionStd: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public incursionSsfStd: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public incursionHc: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public incursionSsfHc: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public std: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);
  public hc: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

  public genericPlayers: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

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
      this.updatePlayerLists(this.party);
      this.accountService.player.next(player);
      this.selectedPlayer.next(player);
      this.isEntering = false;
      console.log('[INFO] entered party:', party);
    });

    this._hubConnection.on('PlayerUpdated', (player: Player) => {
      const index = this.party.players.indexOf(this.party.players.find(x => x.connectionID === player.connectionID));
      this.party.players[index] = player;
      this.updatePlayerLists(this.party);
      if (this.selectedPlayerObj.connectionID === player.connectionID) {
        this.selectedPlayer.next(player);
      }
      console.log('[INFO] player updated:', player);
    });

    this._hubConnection.on('GenericPlayerUpdated', (player: Player) => {
      const index = this.genericPartyPlayers.indexOf(this.genericPartyPlayers.find(x => x.character.name === player.character.name));
      this.genericPartyPlayers[index] = player;
      this.updateGenericPlayerList(this.genericPartyPlayers);
      if (this.selectedGenericPlayerObj.character.name === player.character.name) {
        this.selectedGenericPlayer.next(player);
      }
      console.log('[INFO] generic player updated:', player);
    });

    this._hubConnection.on('PlayerJoined', (player: Player) => {
      this.party.players = this.party.players.filter(x => x.character.name !== player.character.name);
      this.party.players.push(player);
      this.updatePlayerLists(this.party);
      console.log('[INFO] player joined:', player);
    });

    this._hubConnection.on('PlayerLeft', (player: Player) => {
      this.party.players = this.party.players.filter(x => x.connectionID !== player.connectionID);
      this.updatePlayerLists(this.party);
      if (this.selectedPlayerObj.connectionID === player.connectionID) {
        this.selectedPlayer.next(this.player);
      }

      console.log('[INFO] player left:', player);
    });

    // subscribe to log-events
    this.logMonitorService.areaEvent.subscribe(res => {
      this.player.area = res.name;
      this.updatePlayer(this.player);
    });

    this.logMonitorService.areaJoin.subscribe((msg: LogMessage) => {
      console.log('[INFO] Player joined area: ', msg.player.name);
      this.handleAreaEvent(msg);
    });
    this.logMonitorService.areaLeft.subscribe((msg: LogMessage) => {
      console.log('[INFO] Player left area: ', msg.player.name);
      this.handleAreaEvent(msg);
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

    // Remove party from list if we already have it. Add new one on top
    const index = recent.indexOf(partyName);
    if (index !== -1) {
      recent.splice(index, 1);
    }

    recent.unshift(partyName);
    if (recent.length > 5) {
      recent.splice(-1, 1);
    }
    this.settingService.set('recentParties', recent);
    this.recentParties.next(recent);
  }

  //#region genericPlayers

  public addGenericPlayer(player: Player) {
    const exists = this.genericPartyPlayers.filter(p => p.account === player.account).length > 0;
    if (!exists) {
      this.genericPartyPlayers.unshift(player);
      this.updateGenericPlayerList(this.genericPartyPlayers);
    }
  }

  updateGenericPlayerList(list: Player[]) {
    this.genericPlayers.next(list);
  }

  handleAreaEvent(event: LogMessage) {
    this.getAccountForCharacter(event.player.name).then((account: string) => {
      if (account !== null) {

        const newPlayer: RecentPlayer = {
          name: event.player.name
        };

        // Find and remove player if already in list.
        let index = -1;
        for (let i = 0; i < this.recentPlayers.length; i++) {
          const player = this.recentPlayers[i];
          if (player.name === event.player.name) {
            index = i;
            break;
          }
        }
        if (index !== -1) {
          this.recentPlayers.splice(index, 1);
        }

        // Add new player to top of list
        this.recentPlayers.unshift(newPlayer);
        // Prune list if we got over 9 entries
        if (this.recentPlayers.length > 9) {
          this.recentPlayers.splice(-1, 1);
        }

        this.addRecentPlayer(newPlayer);
      } else {
        console.log('[WARN] Account lookup failed for: ', event.player.name);
      }
    });
  }

  addRecentPlayer(player: RecentPlayer) {
    this.getAccountForCharacter(player.name).then((account) => {
      if (account !== null) {
        const info: AccountInfo = {
          accountName: account,
          characterName: player.name,
          sessionId: '',
          filePath: ''
        };
        return this.externalService.getCharacter(info).subscribe((response: EquipmentResponse) => {
          let newPlayer = {} as Player;
          newPlayer.account = account,
            newPlayer.generic = true;
          newPlayer.genericHost = this.player.character.name;
          newPlayer = this.externalService.setCharacter(response, newPlayer);
          this.addGenericPlayer(newPlayer);
        },
          (error) => {
            console.log(`[WARN] getCharacter failed for player: ${player.name}, account: ${account} (profile probaly private)`);
          }
        );
      }
    });
  }

  //#endregion

}
