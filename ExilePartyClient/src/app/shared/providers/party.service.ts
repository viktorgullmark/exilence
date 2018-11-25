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

import { LogMessage } from '../interfaces/log-message.interface';
import { LogService } from './log.service';
import { ElectronService } from './electron.service';
import { NetWorthSnapshot } from '../interfaces/income.interface';
import { MessageValueService } from './message-value.service';
import { ExtendedAreaInfo } from '../interfaces/area.interface';
import { HistoryHelper } from '../helpers/history.helper';
import { LeagueWithPlayers } from '../interfaces/league.interface';

@Injectable()
export class PartyService {
  public _hubConnection: HubConnection | undefined;
  public async: any;
  public party: Party;
  public isEntering = false;
  public recentParties: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(undefined);
  public currentPlayer: Player;
  public accountInfo: AccountInfo;
  public selectedPlayer: BehaviorSubject<Player> = new BehaviorSubject<Player>(undefined);
  public selectedPlayerObj: Player;
  public partyUpdated: BehaviorSubject<Party> = new BehaviorSubject<Party>(undefined);
  public partyUpdatedObj: Party;
  public selectedGenericPlayer: BehaviorSubject<Player> = new BehaviorSubject<Player>(undefined);
  public selectedGenericPlayerObj: Player;
  public genericPartyPlayers: Player[] = [];
  public genericPartyPlayersPromise: any;
  public genericPartyName: string;
  public recentPlayers: RecentPlayer[] = [];
  public recentPrivatePlayers: string[] = [];
  public playerLeagues: BehaviorSubject<LeagueWithPlayers[]> = new BehaviorSubject<LeagueWithPlayers[]>([]);
  public genericPlayers: BehaviorSubject<Player[]> = new BehaviorSubject<Player[]>([]);

  private reconnectAttempts: number;
  private forceClosed: boolean;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private logMonitorService: LogMonitorService,
    private externalService: ExternalService,
    private settingService: SettingsService,
    private logService: LogService,
    private electronService: ElectronService,
    private messageValueService: MessageValueService
  ) {

    this.reconnectAttempts = 0;
    this.forceClosed = false;

    this.recentParties.next(this.settingService.get('recentParties') || []);

    this.accountService.player.subscribe(res => {
      this.currentPlayer = res;
    });
    this.selectedPlayer.subscribe(res => {
      this.selectedPlayerObj = res;
    });
    this.selectedGenericPlayer.subscribe(res => {
      this.selectedGenericPlayerObj = res;
    });
    this.accountService.accountInfo.subscribe(res => {
      this.accountInfo = res;
    });
    this.initParty();
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(AppConfig.url + 'hubs/party')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.initHubConnection();

    this._hubConnection.onclose(() => {
      this.logService.log('Signalr connection closed', null, true);
      this.reconnect();
    });

    this._hubConnection.on('EnteredParty', (partyData: string, playerData: string) => {
      this.decompress(partyData, (party: Party) => {
        this.decompress(playerData, (player: Player) => {
          // if player is self, set history based on local data
          const playerObj = Object.assign({}, player);
          if (playerObj.account === this.currentPlayer.account) {
            playerObj.netWorthSnapshots = Object.assign([], this.currentPlayer.netWorthSnapshots);
            playerObj.pastAreas = Object.assign([], this.currentPlayer.pastAreas);
          }
          this.party = party;
          this.updatePlayerLists(this.party);
          this.accountService.player.next(playerObj);
          this.selectedPlayer.next(playerObj);
          this.isEntering = false;
          this.logService.log('Entered party:', party);

          // set initial values for party net worth
          let networth = 0;
          this.messageValueService.partyGain = 0;
          this.party.players.forEach(p => {
            this.updatePartyGain(p);
            networth = networth + p.netWorthSnapshots[0].value;
          });
          this.messageValueService.partyValue = networth;

        });
      });
    });

    this._hubConnection.on('PlayerUpdated', (data: string) => {
      this.decompress(data, (player: Player) => {
        const index = this.party.players.indexOf(this.party.players.find(x => x.account === player.account));

        this.party.players[index] = player;
        this.updatePlayerLists(this.party);
        this.partyUpdated.next(this.party);

        // if player is self, set history based on local data
        const playerObj = Object.assign({}, player);
        if (playerObj.account === this.currentPlayer.account) {
          playerObj.netWorthSnapshots = Object.assign([], this.currentPlayer.netWorthSnapshots);
          playerObj.pastAreas = Object.assign([], this.currentPlayer.pastAreas);
        }
        if (this.selectedPlayerObj.account === playerObj.account) {
          this.selectedPlayer.next(playerObj);
        }
        this.logService.log('Player updated:', playerObj);
      });
    });

    this._hubConnection.on('GenericPlayerUpdated', (player: Player) => {
      const index = this.genericPartyPlayers.indexOf(this.genericPartyPlayers.find(x => x.character.name === player.character.name));
      this.genericPartyPlayers[index] = player;
      this.updateGenericPlayerList(this.genericPartyPlayers);
      if (this.selectedGenericPlayerObj.character.name === player.character.name) {
        this.selectedGenericPlayer.next(player);
      }
    });

    this._hubConnection.on('PlayerJoined', (data: string) => {
      this.decompress(data, (player: Player) => {
        this.party.players = this.party.players.filter(x => x.character.name !== player.character.name);
        this.party.players.push(player);
        this.partyUpdated.next(this.party);
        this.updatePlayerLists(this.party);
        this.logService.log('player joined:', player);
      });
    });

    this._hubConnection.on('PlayerLeft', (data: string) => {
      this.decompress(data, (player: Player) => {
        this.party.players = this.party.players.filter(x => x.account !== player.account);
        this.partyUpdated.next(this.party);
        this.updatePlayerLists(this.party);
        if (this.selectedPlayerObj.account === player.account) {
          this.selectedPlayer.next(this.currentPlayer);
        }
        this.logService.log('player left:', player);
      });
    });

    this._hubConnection.on('ForceDisconnect', () => {
      this.disconnect('Recived force disconnect command from server.');
    });

    this.logMonitorService.areaJoin.subscribe((msg: LogMessage) => {
      this.logService.log('Player joined area: ', msg.player.name);
      this.handleAreaEvent(msg);
    });
    this.logMonitorService.areaLeft.subscribe((msg: LogMessage) => {
      this.logService.log('Player left area: ', msg.player.name);
      this.handleAreaEvent(msg);
    });

  }

  updatePartyGain(player: Player) {
    const oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
    const pastHoursSnapshots = player.netWorthSnapshots
      .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > oneHourAgo);

    if (pastHoursSnapshots.length > 1) {
      const lastSnapshot = pastHoursSnapshots[0];
      const firstSnapshot = pastHoursSnapshots[pastHoursSnapshots.length - 1];
      const gainHour = ((1000 * 60 * 60)) / (lastSnapshot.timestamp - firstSnapshot.timestamp) * (lastSnapshot.value - firstSnapshot.value);
      this.messageValueService.partyGain = this.messageValueService.partyGain + gainHour;
    }
  }

  initHubConnection() {
    this.logService.log('Starting signalr connection');
    this._hubConnection.start().then(() => {
      console.log('Successfully established signalr connection!');
      this.reconnectAttempts = 0;
    }).catch((err) => {
      console.error(err.toString());
      this.logService.log('Could not connect to signalr');
      this.reconnect();
    });
  }

  reconnect() {
    if (this.reconnectAttempts > 5 && !this.forceClosed) {
      this.disconnect('Could not connect after 5 attempts.');
    } else {
      this.logService.log('Trying to reconnect to signalr in 5 seconds.', null, true);
      setTimeout(() => {
        this.initHubConnection();
      }, (5000));
    }
    this.reconnectAttempts++;
  }

  disconnect(reason: string) {
    this.forceClosed = true;
    this.logService.log(reason, null, true);
    this.accountService.clearCharacterList();
    localStorage.removeItem('sessionId');
    this.router.navigate(['/disconnected']);
  }

  updatePlayerLists(party: Party) {

    // construct initial object based on players in party
    const leagues: LeagueWithPlayers[] = [];
    party.players.forEach(player => {
      const league = leagues.find(l => l.id === player.character.league);
      if (league === undefined) {
        leagues.push({ id: player.character.league, players: [player] } as LeagueWithPlayers);
      } else {
        const indexOfLeague = leagues.indexOf(league);
        leagues[indexOfLeague].players.push(player);
      }
    });

    this.playerLeagues.next(leagues);
  }

  public updatePlayer(player: Player) {
    const oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
    const objToSend = Object.assign({}, player);
    objToSend.pastAreas = HistoryHelper.filterAreas(objToSend.pastAreas, oneHourAgo);
    objToSend.netWorthSnapshots = HistoryHelper.filterNetworth(objToSend.netWorthSnapshots, oneHourAgo);
    this.externalService.getCharacter(this.accountInfo)
      .subscribe((equipment: EquipmentResponse) => {
        player = this.externalService.setCharacter(equipment, player);
        if (this._hubConnection) {
          this.compress(player, (data) => this._hubConnection.invoke('UpdatePlayer', this.party.name, data).catch((e) => {
          }));
        }
      });
  }

  public getAccountForCharacter(character: string): Promise<any> {
    return this._hubConnection.invoke('GetAccountForCharacter', character).then((response) => {
      return response;
    });
  }

  public joinParty(partyName: string, player: Player) {
    const playerToSend = Object.assign({}, player);
    this.isEntering = true;
    this.initParty();
    this.party.players.push(player);
    this.party.name = partyName;
    if (this._hubConnection) {
      const oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));
      const historyToSend = HistoryHelper.filterNetworth(playerToSend.netWorthSnapshots, oneHourAgo);
      const areasToSend = HistoryHelper.filterAreas(playerToSend.pastAreas, oneHourAgo);
      playerToSend.netWorthSnapshots = historyToSend;
      playerToSend.pastAreas = areasToSend;
      this.compress(playerToSend, (data) => this._hubConnection.invoke('JoinParty', partyName, data));
    }
  }

  public leaveParty(partyName: string, player: Player) {
    this.initParty();
    if (partyName !== '') {
      if (this._hubConnection) {
        this.compress(player, (data) => this._hubConnection.invoke('LeaveParty', partyName, data));
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

  public removePartyFromRecent(partyName: string) {
    const recent: string[] = this.settingService.get('recentParties') || [];

    const index = recent.indexOf(partyName);
    if (index !== -1) {
      recent.splice(index, 1);
    }

    this.settingService.set('recentParties', recent);
    this.recentParties.next(recent);
  }

  //#region genericPlayers

  public addGenericPlayer(player: Player) {
    const exists = this.genericPartyPlayers.filter(p => p.account === player.account).length > 0
      || this.party.players.find(x => x.account === player.account) !== undefined;
    if (!exists) {
      this.genericPartyPlayers.unshift(player);
      this.updateGenericPlayerList(this.genericPartyPlayers);
    }
  }

  updateGenericPlayerList(list: Player[]) {
    this.genericPlayers.next(list);
  }

  handleAreaEvent(event: LogMessage) {
    this.externalService.getAccountForCharacter(event.player.name).subscribe((res: any) => {
      const account = res.accountName;
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

        this.addRecentPlayer(newPlayer, account);
      } else {
        this.logService.log('Account lookup failed for: ', event.player.name);
      }
    });
  }

  addRecentPlayer(player: RecentPlayer, accountName: string) {
    // We don't want to spam the API with requests for players we know have private profiles.
    if (this.recentPrivatePlayers.indexOf(player.name) !== -1) {
      return;
    }
    const account = accountName;
    if (account !== null) {
      const info: AccountInfo = {
        accountName: account,
        characterName: player.name,
        leagueName: '',
        sessionId: '',
        filePath: '',
        sessionIdValid: false
      };
      return this.externalService.getCharacter(info).subscribe((response: EquipmentResponse) => {
        if (response !== null) {
          let newPlayer = {} as Player;
          newPlayer.account = account,
            newPlayer.generic = true;
          newPlayer.genericHost = this.currentPlayer.character.name;
          newPlayer = this.externalService.setCharacter(response, newPlayer);
          this.addGenericPlayer(newPlayer);
        }
      },
        () => {
          this.logService.log(`getCharacter failed for player: ${player.name}, account: ${account} (profile probaly private)`);
          this.recentPrivatePlayers.unshift(player.name);
        }
      );
    }
  }

  //#endregion

  compress(object: any, callback: any) {
    const jsonString = JSON.stringify(object);
    this.electronService.zlib.gzip(jsonString, (err, buffer) => {
      if (!err) {
        const string = buffer.toString('base64');
        callback(string);
      } else {
        this.logService.log(err, null, true);
      }
    });
  }

  decompress(base64string: string, callback: any) {
    const buffer = Buffer.from(base64string, 'base64');
    this.electronService.zlib.gunzip(buffer, (err, jsonString) => {
      if (!err) {
        const obj = JSON.parse(jsonString);
        callback(obj);
      } else {
        this.logService.log(err, null, true);
      }
    });
  }

}
