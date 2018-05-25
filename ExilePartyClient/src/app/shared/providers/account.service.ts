import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Character } from '../interfaces/character.interface';
import { Player } from '../interfaces/player.interface';

@Injectable()
export class AccountService {
  public player: BehaviorSubject<Player> = new BehaviorSubject<Player>(undefined);
  public characterList: BehaviorSubject<Character[]> = new BehaviorSubject<Character[]>(undefined);
  constructor() {
  }
  clearCharacterList() {
    this.characterList.next(undefined);
  }
}
