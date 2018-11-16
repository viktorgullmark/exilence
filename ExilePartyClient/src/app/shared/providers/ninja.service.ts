import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NinjaResponse, NinjaTypes } from '../interfaces/poe-ninja.interface';
import { AnalyticsService } from './analytics.service';

@Injectable()

export class NinjaService {

  private itemUrl = 'http://poe.ninja/api/data/itemoverview';
  private currencyUrl = 'http://poe.ninja/api/data/currencyoverview';

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private analyticsService: AnalyticsService
  ) { }

  getFromNinja(league: string, type: NinjaTypes): Observable<NinjaResponse> {
    this.analyticsService.sendEvent('income', `GET Ninja: ${type}`);
    const baseUrl = (type === NinjaTypes.CURRENCY || type === NinjaTypes.FRAGMENT) ? this.currencyUrl : this.itemUrl;
    const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const parameters = `?league=${league}&type=${type}&date=${date}`;
    const url = baseUrl + parameters;
    return this.http.get<NinjaResponse>(url);
  }

}
