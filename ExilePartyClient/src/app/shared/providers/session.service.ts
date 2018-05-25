import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { PartyService } from './party.service';
import { Player } from '../interfaces/player.interface';

@Injectable()
export class SessionService {
  player: Player;
  constructor(private accountService: AccountService, private partyService: PartyService) {
    this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }
  getSession() {
    return localStorage.getItem('sessionId');
  }
  initSession(sessionId: string) {
    localStorage.setItem('sessionId', sessionId);
  }
  cancelSession() {
    this.accountService.clearCharacterList();
    this.partyService.leaveParty(this.partyService.party.name, this.player);
    localStorage.removeItem('sessionId');
  }
}
