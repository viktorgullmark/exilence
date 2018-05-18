import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {
  constructor() {
  }
  getSession(){
    return localStorage.getItem('sessionId');
  }
  initSession(sessionId: string) {
    localStorage.setItem('sessionId', sessionId);
  }
  cancelSession() {
    localStorage.removeItem('sessionId');
  }
}
