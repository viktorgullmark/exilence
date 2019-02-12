import { Injectable, OnDestroy, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

import { AppConfig } from '../../../environments/environment';
import { AccountInfo } from '../interfaces/account-info.interface';
import { EquipmentResponse } from '../interfaces/equipment-response.interface';
import { Party } from '../interfaces/party.interface';
import { Player, RecentPlayer, LadderPlayer, PlayerLadder } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { ExternalService } from './external.service';
import { LogMonitorService } from './log-monitor.service';
import { SettingsService } from './settings.service';

import { LogMessage } from '../interfaces/log-message.interface';
import { LogService } from './log.service';
import { ElectronService } from './electron.service';
import { NetWorthSnapshot } from '../interfaces/income.interface';
import { MessageValueService } from './message-value.service';
import { HistoryHelper } from '../helpers/history.helper';
import { LeagueWithPlayers } from '../interfaces/league.interface';
import { Subscription } from 'rxjs';
import { ServerMessage } from '../interfaces/server-message.interface';
import { StateService } from './state.service';

@Injectable()
export class PartyService implements OnDestroy {
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
  public selectedFilterValueSub: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
  public selectedFilterValue = 'All players';
  public connectionInitiated: EventEmitter<boolean> = new EventEmitter();

  public serverMessageReceived: BehaviorSubject<ServerMessage> = new BehaviorSubject<ServerMessage>(undefined);

  private reconnectAttempts: number;
  private forceClosed: boolean;

  public updateInProgress = false;
  public joinInProgress = false;
  public maskedName = false;
  public maskedSpectatorCode = false;
  public currentPlayerGain;
  public playerGain;
  public partyGain = 0;
  private playerSub: Subscription;
  private selectedPlayerSub: Subscription;
  private selectedGenPlayerSub: Subscription;
  private accountInfoSub: Subscription;
  private stateSub: Subscription;
  public isConnecting = false;
  private playerLadders: Array<PlayerLadder> = [];

  constructor(
    private router: Router,
    private accountService: AccountService,
    private logMonitorService: LogMonitorService,
    private externalService: ExternalService,
    private settingService: SettingsService,
    private logService: LogService,
    private electronService: ElectronService,
    private messageValueService: MessageValueService,
    private settingsService: SettingsService,
    private stateService: StateService
  ) {
    this.reconnectAttempts = 0;
    this.forceClosed = false;

    const recentParties = this.settingService.get('recentParties') || [];
    const regex = new RegExp('^[A-Z0-9]+$');
    const matchRecenParties = recentParties.filter(party => party.match(regex));
    this.settingService.set('recentParties', matchRecenParties);
    this.recentParties.next(matchRecenParties);

    this.maskedName = this.settingsService.get('maskedGroupname') === true ? true : false;
    this.maskedSpectatorCode = this.settingsService.get('maskedSpectatorCode') === true ? true : false;

    this.playerSub = this.accountService.player.subscribe(res => {
      this.currentPlayer = res;
    });

    this.selectedPlayerSub = this.selectedPlayer.subscribe(res => {
      this.selectedPlayerObj = res;
    });
    this.selectedGenPlayerSub = this.selectedGenericPlayer.subscribe(res => {
      this.selectedGenericPlayerObj = res;
    });
    this.accountInfoSub = this.accountService.accountInfo.subscribe(res => {
      this.accountInfo = res;
    });
    this.stateSub = this.stateService.state$.subscribe(state => {
      this.playerLadders = 'playerLadders'.split('.').reduce((o, i) => o[i], state);
    });
    this.initParty();
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(AppConfig.url + 'hubs/party')
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.initHubConnection();

    this._hubConnection.onclose(() => {
      this.logService.log('Signalr connection closed');
      this.reconnect();
    });

    this._hubConnection.on('EnteredParty', (partyData: string, playerData: string) => {
      this.electronService.decompress(partyData, (party: Party) => {
        this.electronService.decompress(playerData, (player: Player) => {
          // if player is self, set history based on local data
          const playerObj = Object.assign({}, player);
          if (this.currentPlayer !== undefined && playerObj.account === this.currentPlayer.account) {
            playerObj.netWorthSnapshots = Object.assign([], this.currentPlayer.netWorthSnapshots);
          }
          // if we are a player, there should be a partyname that we can use, since we wont expose it from the server
          if (this.party.name !== undefined) {
            party.name = this.party.name;
          }
          this.party = party;
          this.updatePlayerLists(this.party);
          this.accountService.player.next(playerObj);
          const playerToSelect = this.party.players.find(x => !x.isSpectator);
          if (playerToSelect !== undefined) {
            this.selectedPlayer.next(playerToSelect);
          }
          this.isEntering = false;
          this.logService.log('Entered party:', party);
          // set initial values for party net worth
          let networth = 0;
          this.messageValueService.partyGainSubject.next(0);
          this.updatePartyGain(this.party.players);
          this.party.players.forEach(p => {
            networth = networth + p.netWorthSnapshots[0].value;
          });
          this.messageValueService.partyValueSubject.next(networth);
          this.messageValueService.partyGainSubject.next(this.partyGain);

          const spectators = this.updateSpectatorCount(this.party.players);
          this.stateService.dispatch({ key: 'spectatorCount', value: spectators });

          if (player.character !== null && this.playerLadders.find(x => x.name === player.character.league) === undefined) {
            this.getLadderForLeague(player.character.league);
          } else {
            const firstPlayer = this.party.players.find(x => x.character !== null && !x.isSpectator);
            this.getLadderForLeague(firstPlayer.character.league);
          }

          this.partyUpdated.next(this.party);
        });
      });
    });

    this._hubConnection.on('PlayerUpdated', (data: string) => {
      this.electronService.decompress(data, (player: Player) => {
        const index = this.party.players.indexOf(this.party.players.find(x => x.account === player.account));

        this.party.players[index] = player;
        this.updatePlayerLists(this.party);
        this.partyUpdated.next(this.party);

        // if player is self, set history based on local data
        const playerObj = Object.assign({}, player);
        if (playerObj.account === this.currentPlayer.account) {
          playerObj.netWorthSnapshots = Object.assign([], this.currentPlayer.netWorthSnapshots);
          // playerObj.pastAreas = Object.assign([], this.currentPlayer.pastAreas);
        }
        if (this.selectedPlayerObj.account === playerObj.account) {
          this.selectedPlayer.next(playerObj);
        }
        this.logService.log('Player updated:', playerObj);
        this.updateInProgress = false;
      });
    });

    this._hubConnection.on('GenericPlayerUpdated', (player: Player) => {
      const index = this.genericPartyPlayers.indexOf(this.genericPartyPlayers.find(x => x.character !== null &&
        x.character.name === player.character.name));
      this.genericPartyPlayers[index] = player;
      this.updateGenericPlayerList(this.genericPartyPlayers);
      if (this.selectedGenericPlayerObj.character.name === player.character.name) {
        this.selectedGenericPlayer.next(player);
      }
    });

    this._hubConnection.on('PlayerJoined', (data: string) => {
      this.electronService.decompress(data, (player: Player) => {
        this.party.players = this.party.players.filter(x => x.connectionID !== player.connectionID);
        this.party.players.push(player);
        this.partyUpdated.next(this.party);
        this.updatePlayerLists(this.party);

        const spectators = this.updateSpectatorCount(this.party.players);
        this.stateService.dispatch({ key: 'spectatorCount', value: spectators });

        if (player.character !== null && this.playerLadders.find(x => x.name === player.character.league) === undefined) {
          this.getLadderForLeague(player.character.league);
        } else {
          const firstPlayer = this.party.players.find(x => x.character !== null && !x.isSpectator);
          this.getLadderForLeague(firstPlayer.character.league);
        }

        this.logService.log('player joined:', player);
      });
    });

    this._hubConnection.on('PlayerLeft', (data: string) => {
      this.electronService.decompress(data, (player: Player) => {
        this.PlayerLeft(player);
      });
    });

    this._hubConnection.on('KickedFromParty', () => {
      this.initParty();
      this.partyUpdated.next(this.party);
      this.selectedPlayer.next(this.currentPlayer);
      this.router.navigate(['/authorized/dashboard']);
      const data = {
        title: 'Information',
        body: 'You were kicked from the group by the leader.'
      } as ServerMessage;
      this.serverMessageReceived.next(data);
      this.logService.log('kicked from party');
    });

    this._hubConnection.on('LeaderChanged', (data: string) => {
      this.electronService.decompress(data, (leaderData) => {
        const oldLeader = this.party.players.find(x => x.character !== null && leaderData.oldLeader.character !== null
          && x.character.name === leaderData.oldLeader.character.name);
        const newLeader = this.party.players.find(x => x.character !== null && leaderData.newLeader.character !== null
          && x.character.name === leaderData.newLeader.character.name);

        // if previous leader is still in the party, update the value
        if (oldLeader !== undefined) {
          const indexOfOldLeader = this.party.players.indexOf(oldLeader);
          oldLeader.isLeader = false;
          this.party.players[indexOfOldLeader] = oldLeader;
        }

        if (newLeader !== undefined) {
          const indexOfNewLeader = this.party.players.indexOf(newLeader);
          newLeader.isLeader = true;
          this.party.players[indexOfNewLeader] = newLeader;
        }

        // update permissions if you become the leader
        if (this.currentPlayer.account === newLeader.account) {
          this.accountService.player.next(newLeader);
        } else if (this.currentPlayer.account === oldLeader.account) {
          this.accountService.player.next(oldLeader);
        }

        this.partyUpdated.next(this.party);
        this.updatePlayerLists(this.party);

        this.logService.log('leader changed to:', newLeader);
      });
    });

    this._hubConnection.on('ServerMessageReceived', (data: ServerMessage) => {

      this.serverMessageReceived.next(data);

      this.logService.log('server message received:', data.body);
    });

    this._hubConnection.on('ForceDisconnect', () => {
      this.disconnect('Recived force disconnect command from server.', false);
    });

    this._hubConnection.on('GroupNotFoundOrEmpty', () => {
      const errorMsg = {
        title: 'Information',
        body: 'The group you tried to join does not exist'
      } as ServerMessage;
      this.serverMessageReceived.next(errorMsg);
      this.isEntering = false;
      this.router.navigate(['/']);
    });

    this._hubConnection.on('GroupNotFoundOrEmpty', () => {
      const errorMsg = {
        title: 'Information',
        body: 'The group you tried to join does not exist'
      } as ServerMessage;
      this.serverMessageReceived.next(errorMsg);
      this.isEntering = false;
      this.router.navigate(['/']);
    });

    this.logMonitorService.areaJoin.subscribe((msg: LogMessage) => {
      this.logService.log('Player joined area: ', msg.player.name);
      this.handleAreaEvent(msg);
    });
    this.logMonitorService.areaLeft.subscribe((msg: LogMessage) => {
      this.logService.log('Player left area: ', msg.player.name);
      this.handleAreaEvent(msg);
    });

    setInterval(() => {
      this.refreshLaddersForParty();
    }, 60 * 1000);
  }

  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    } if (this.selectedPlayerSub !== undefined) {
      this.selectedPlayerSub.unsubscribe();
    } if (this.selectedGenPlayerSub !== undefined) {
      this.selectedGenPlayerSub.unsubscribe();
    } if (this.accountInfoSub !== undefined) {
      this.accountInfoSub.unsubscribe();
    } if (this.stateSub !== undefined) {
      this.stateSub.unsubscribe();
    }
  }

  PlayerLeft(player: Player) {
    this.party.players = this.party.players.filter(x => x.connectionID !== player.connectionID);

    // if last player leaves, kick self to login screen
    if (this.party.players.find(x => !x.isSpectator) === undefined) {
      this.leaveParty(this.party.name, this.party.spectatorCode, this.currentPlayer);
      const errorMsg = {
        title: 'Information',
        body: 'Spectator mode ended, all players left the group.'
      } as ServerMessage;
      this.serverMessageReceived.next(errorMsg);
      this.router.navigate(['/']);
    }

    this.partyUpdated.next(this.party);
    this.updatePlayerLists(this.party);

    if (this.selectedPlayerObj.account === player.account) {

      // select self if is player, otherwhise select the first player in the group
      if (this.currentPlayer.character !== null) {
        this.selectedPlayer.next(this.currentPlayer);
      } else {
        const firstPlayer = this.party.players.find(x => x.character !== null && !x.isSpectator);
        if (firstPlayer !== undefined) {
          this.selectedPlayer.next(this.party.players.find(x => x.character !== null && !x.isSpectator));
        }
      }
    }

    // update spectator count
    const spectators = this.updateSpectatorCount(this.party.players);
    this.stateService.dispatch({ key: 'spectatorCount', value: spectators });

    this.logService.log('player left:', player);
  }

  updateSpectatorCount(players: Player[]): number {
    let count = 0;
    const spectators = players.filter(x => x.isSpectator);
    if (spectators !== undefined) {
      count = spectators.length;
    }
    return count;
  }

  updatePartyGain(players: Player[]) {
    this.partyGain = 0;
    players.forEach(x => {
      this.updatePartyGainForPlayer(x);
    });
  }

  updatePartyGainForPlayer(player: Player) {
    const gainHours = this.settingsService.get('gainHours');
    const xHoursAgo = (Date.now() - (gainHours * 60 * 60 * 1000));
    const pastHoursSnapshots = player.netWorthSnapshots
      .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > xHoursAgo);

    if (pastHoursSnapshots.length > 1) {
      const lastSnapshot = pastHoursSnapshots[0];
      const firstSnapshot = pastHoursSnapshots[pastHoursSnapshots.length - 1];
      const gainHour = (lastSnapshot.value - firstSnapshot.value) / gainHours;
      this.partyGain = this.partyGain + gainHour;
    }
  }

  initHubConnection() {
    // only initiate connection, when there is no connection running
    if (this._hubConnection.state === 0) {
      this.isConnecting = true;
      this.logService.log('Starting signalr connection');
      this._hubConnection.start().then(() => {
        this.connectionInitiated.emit(true);

        this.isConnecting = false;
        console.log('Successfully established signalr connection!');
        if (this.party !== undefined && this.currentPlayer !== undefined && (this.party.name !== '' || this.party.spectatorCode !== '')) {
          this.joinParty(this.party.name, this.party.spectatorCode, this.currentPlayer);
        }
        this.reconnectAttempts = 0;
      }).catch(() => {
        this.logService.log('Could not connect to signalr');
        this.reconnect();
      });
    }
  }

  reconnect() {
    if (this.reconnectAttempts > 5 && !this.forceClosed) {
      this.disconnect('Could not connect after 5 attempts.', true);
    } else {
      this.logService.log('Trying to reconnect to signalr in 5 seconds.');
      setTimeout(() => {
        this.initHubConnection();
      }, (5000));
    }
    this.reconnectAttempts++;
  }

  disconnect(reason: string, error: boolean) {
    this.forceClosed = true;
    this.logService.log(reason, null, error);
    this.accountService.clearCharacterList();
    localStorage.removeItem('sessionId');
    this.router.navigate(['/disconnected', false]);
  }

  updatePlayerLists(party: Party) {

    // construct initial object based on players in party
    const leagues: LeagueWithPlayers[] = [];
    party.players.forEach(player => {
      if (player.character !== null && player.character !== undefined) {
        const league = leagues.find(l => player.character !== null && l.id === player.character.league);
        if (league === undefined) {
          leagues.push({ id: player.character.league, players: [player] } as LeagueWithPlayers);
        } else {
          const indexOfLeague = leagues.indexOf(league);
          leagues[indexOfLeague].players.push(player);
        }
      }
    });

    this.playerLeagues.next(leagues);
  }

  public updatePlayer(player: Player) {
    const oneDayAgo = (Date.now() - (24 * 60 * 60 * 1000));
    this.updateInProgress = true;
    this.externalService.getCharacter(this.accountInfo)
      .subscribe((equipment: EquipmentResponse) => {
        player = this.externalService.setCharacter(equipment, player);
        const objToSend = Object.assign({}, player);
        objToSend.pastAreas = HistoryHelper.filterAreas(objToSend.pastAreas, oneDayAgo);
        objToSend.netWorthSnapshots = HistoryHelper.filterNetworth(objToSend.netWorthSnapshots, oneDayAgo);
        if (this._hubConnection) {
          this.electronService.compress(objToSend, (data) => this._hubConnection.invoke('UpdatePlayer', this.party.name, data)
            .catch((e) => {
              this.logService.log(e, null, true);
            }));
        }
      });
  }

  public assignLeader(characterName: string) {
    if (this._hubConnection) {
      this._hubConnection.invoke('AssignLeader', this.party.name, characterName)
        .catch((e) => {
          this.logService.log(e, null, true);
        });
    }
  }

  public kickFromParty(characterName: string) {
    if (this._hubConnection) {
      this._hubConnection.invoke('KickFromParty', this.party.name, characterName)
        .catch((e) => {
          this.logService.log(e, null, true);
        });
    }
  }

  public checkIfPartyExists(spectatorCode: string) {
    return this._hubConnection.invoke('PartyExists', spectatorCode).then((response) => {
      return response;
    });
  }

  public getLadderForLeague(league: string) {
    return this._hubConnection.invoke('GetLadderForLeague', league).then((response) => {
      this.electronService.decompress(response, (ladder: LadderPlayer[]) => {

        // update ladder in state (fugly)
        const foundLadder = this.playerLadders.find(x => x.name === league);
        if (foundLadder !== undefined && foundLadder !== null) {
          const ladderIndex = this.playerLadders.indexOf(foundLadder);
          this.playerLadders[ladderIndex] = { name: league, players: ladder } as PlayerLadder;
        } else {
          this.playerLadders.push({ name: league, players: ladder } as PlayerLadder);
        }

        this.stateService.dispatch({ key: 'playerLadders', value: this.playerLadders });

        if (ladder !== null) {
          // update player ranks based on fetched ladder
          const foundInParty = this.party.players.find(x => x.character !== null &&
            x.character.league === league &&
            this.currentPlayer.character != null &&
            this.currentPlayer.character.name === x.character.name);
          if (foundInParty !== undefined) {
            const foundInLadder = ladder.find(x => x.name === foundInParty.character.name);
            if (foundInLadder !== undefined) {
              foundInParty.overallRank = foundInLadder.rank.overall;
              this.updatePlayer(foundInParty);
              this.accountService.player.next(foundInParty);
            }
          }
        }
      });
    });
  }

  public refreshLaddersForParty() {
    // filter out leagues that are not in the party (in case players left)
    const activePlayers = this.party.players.filter(x => x.character !== null);
    const leaguesToUpdate = activePlayers.map(x => x.character.league);
    this.playerLadders.filter(x => leaguesToUpdate.find(y => y === x.name) !== undefined);
    this.playerLadders.forEach(x => {
      // separate requests so we dont lag the client
      setTimeout(() => {
        this.getLadderForLeague(x.name);
      }, 10000);
    });
  }

  public joinParty(partyName: string, spectatorCode: string, player: Player) {
    const playerToSend = Object.assign({}, player);
    this.isEntering = true;
    this.initParty();
    this.party.players.push(player);
    this.party.name = partyName;
    if (this._hubConnection) {
      const oneDayAgo = (Date.now() - (24 * 60 * 60 * 1000));
      const historyToSend = HistoryHelper.filterNetworth(playerToSend.netWorthSnapshots, oneDayAgo);
      const areasToSend = HistoryHelper.filterAreas(playerToSend.pastAreas, oneDayAgo);
      playerToSend.netWorthSnapshots = historyToSend;
      playerToSend.pastAreas = areasToSend;
      this.electronService.compress(playerToSend, (data) => this._hubConnection.invoke('JoinParty', partyName, spectatorCode, data));
    }
  }

  public leaveParty(partyName: string, spectatorCode: string, player: Player) {
    this.initParty();
    if (partyName !== '') {
      if (this._hubConnection) {
        this.electronService.compress(player, (data) => this._hubConnection.invoke('LeaveParty', partyName, spectatorCode, data));
      }
    }
  }

  public initParty() {
    this.party = { name: '', spectatorCode: '', players: [] };
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
    }, (error: any) => { });
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
}
