import { Injectable } from '@angular/core';
import { AccountService } from './account.service';

@Injectable()
export class SessionService {
  constructor(private accountService: AccountService) {
  }
  getSession() {
    return localStorage.getItem('sessionId');
  }
  initSession(sessionId: string) {
    localStorage.setItem('sessionId', sessionId);
  }
  cancelSession() {
    this.accountService.clearCharacterList();
    localStorage.removeItem('sessionId');
  }
}
