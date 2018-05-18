import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Player } from '../interfaces/player.interface';
import { Character } from '../interfaces/character.interface';

@Injectable()
export class AccountService {
  public playerObj = {} as Player;
  public player: BehaviorSubject<Player> = new BehaviorSubject<Player>(this.playerObj);
  public characterList: BehaviorSubject<Character[]> = new BehaviorSubject<Character[]>([]);
  constructor() {
  }
  updatePlayer() {
    this.player.next(this.playerObj);
  }
}
