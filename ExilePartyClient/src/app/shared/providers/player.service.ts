import 'rxjs/add/operator/map';

import { EventEmitter, Injectable } from '@angular/core';

import { Player } from '../interfaces/player.interface';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PlayerService {
  public currentPlayerObj: Player = {
    connectionID: '',
    channel: '',
    account: '',
    character: undefined,
    area: '',
    guild: '',
    sessionId: '',
    inArea: []
  };
  public currentPlayer: Subject<Player> = new Subject<Player>();
  public leagueData: any;
  public openPlayer: Player;
  OpenedPlayer: EventEmitter<Player> = new EventEmitter();
  constructor() {
    this.currentPlayer.subscribe(res => {
      this.currentPlayerObj = res;
    });
  }
}
