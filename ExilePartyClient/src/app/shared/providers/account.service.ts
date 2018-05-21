import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Player } from '../interfaces/player.interface';
import { Character } from '../interfaces/character.interface';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AccountService {
  public player: Subject<Player> = new Subject<Player>();
  public characterList: Subject<Character[]> = new Subject<Character[]>();
  constructor() {
  }
}
