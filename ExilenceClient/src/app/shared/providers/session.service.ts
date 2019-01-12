import { Injectable, OnDestroy } from '@angular/core';

import { Player } from '../interfaces/player.interface';
import { AccountService } from './account.service';
import { IncomeService } from './income.service';
import { PartyService } from './party.service';
import { ExternalService } from './external.service';
import { Subscription } from 'rxjs';

@Injectable()
export class SessionService implements OnDestroy {
  player: Player;
  private playerSub: Subscription;
  public completedLogin = false;
  constructor(
    private accountService: AccountService,
    private partyService: PartyService,
    private incomeService: IncomeService,
    private externalService: ExternalService
  ) {
    this.playerSub = this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }
  getSession() {
    return localStorage.getItem('sessionId');
  }
  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
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
