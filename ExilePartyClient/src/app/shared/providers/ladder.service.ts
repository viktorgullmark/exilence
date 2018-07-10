import 'rxjs/add/operator/map';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LadderService {
  public url = 'http://poe-racing.com/api/ladder/';

  constructor(
    private http: HttpClient
  ) { }

  getLadderInfoForCharacter(league: string, characterName: string): Observable<any> {
    const parameters = `?name=${characterName}&ladder=${league}`;
    return this.http.get(this.url + 'follow' + parameters)
    .catch(e => {
      return Observable.of(null);
    });
  }
}
