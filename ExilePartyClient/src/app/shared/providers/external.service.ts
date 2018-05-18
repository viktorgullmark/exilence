import 'rxjs/add/operator/map';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ElectronService } from './electron.service';
import { PlayerService } from './player.service';

@Injectable()
export class ExternalService {

  public url: 'https://www.pathofexile.com/character-window/get-items';
  public cookie: any;

  constructor(private http: HttpClient, private electronService: ElectronService, private playerService: PlayerService) {
  }

  getCharacter(account: string, character: string, sessionId?: string): Observable<any> {
    this.cookie = {
      url: 'http://www.pathofexile.com',
      name: 'POESESSID',
      value: sessionId,
      domain: '.pathofexile.com',
      path: '/',
      secure: false,
      httpOnly: false,
      expirationDate: undefined
    };

    this.electronService.remote.session.defaultSession.cookies.set(this.cookie, (error) => {
      if (error) { console.error(error); }
    });

    this.getCookiesByUrl('https://www.pathofexile.com');

    this.playerService.currentPlayerObj.account = account;

    const parameters = `?accountName=${account}&character=${character}`;

    return this.http.get('https://www.pathofexile.com/character-window/get-items' + parameters);
  }

  getCharacterList(account: string) {
    const parameters = `?accountName=${account}`;
    return this.http.get('https://www.pathofexile.com/character-window/get-characters' + parameters);
  }

  getCookiesByUrl(url: string) {
    return this.electronService.remote.session.defaultSession.cookies.get({ url: url },
      (error, cookies) => {
        let cookieStr = '';
        for (var i = 0; i < cookies.length; i++) {
          let info = cookies[i];
          cookieStr += `${info.name}=${info.value};`;
          console.log(info.value, info.name);
        }
        console.log(cookieStr);
      });
  }
}
