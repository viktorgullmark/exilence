import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NinjaResponse, NinjaTypes } from '../interfaces/poe-ninja.interface';

@Injectable({
  providedIn: 'root'
})

export class NinjaService {

  private currencyUrl = 'http://poe.ninja/api/data/itemoverview';
  private itemUrl = 'http://poe.ninja/api/data/currencyoverview';

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getFromNinja(league: string, type: NinjaTypes): Observable<NinjaResponse> {
    const baseUrl = (type === NinjaTypes.CURRENCY || type === NinjaTypes.FRAGMENT) ? this.itemUrl : this.currencyUrl;
    const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const parameters = `?league=${league}&type=${type}&date=${date}`;
    const url = baseUrl + parameters;
    return this.http.get<NinjaResponse>(url);
  }

}
