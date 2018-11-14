import { Injectable } from '@angular/core';

import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { IncomeService } from './income.service';
import { PartyService } from './party.service';
import { ExternalService } from './external.service';

@Injectable()
export class SessionService {
  player: Player;
  constructor(
    private accountService: AccountService,
    private partyService: PartyService,
    private incomeService: IncomeService,
    private externalService: ExternalService
  ) {
    this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }
  getSession() {
    return localStorage.getItem('sessionId');
  }
  initSession(sessionId: string) {
    localStorage.setItem('sessionId', sessionId);
    if (sessionId) {
      this.incomeService.InitializeSnapshotting(sessionId);
    }
  }
  cancelSession() {
    this.accountService.clearCharacterList();
    this.partyService.leaveParty(this.partyService.party.name, this.player);
    localStorage.removeItem('sessionId');
  }
}
