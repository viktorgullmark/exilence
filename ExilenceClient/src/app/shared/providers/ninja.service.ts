import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NinjaLine, NinjaPriceInfo, NinjaResponse, NinjaTypes } from '../interfaces/poe-ninja.interface';
import { AnalyticsService } from './analytics.service';
import { ExternalService } from './external.service';
import { LogService } from './log.service';
import { SettingsService } from './settings.service';

@Injectable()

export class NinjaService {

  private itemUrl = 'http://poe.ninja/api/data/itemoverview';
  private currencyUrl = 'http://poe.ninja/api/data/currencyoverview';
  private lastNinjaHit: number;
  public ninjaPrices: NinjaPriceInfo[] = [];
  private lowConfidencePricing = false;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private analyticsService: AnalyticsService,
    private logService: LogService,
    private settingsService: SettingsService,
    private externalService: ExternalService
  ) { }

  getFromNinja(league: string, type: NinjaTypes): Observable<NinjaResponse> {
    this.analyticsService.sendEvent('income', `GET Ninja: ${type}`);
    const baseUrl = (type === NinjaTypes.CURRENCY || type === NinjaTypes.FRAGMENT) ? this.currencyUrl : this.itemUrl;
    const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const parameters = `?league=${league}&type=${type}&date=${date}`;
    const url = baseUrl + parameters;
    return this.http.get<NinjaResponse>(url);
  }

  getValuesFromNinja(league: string) {
    // todo: make sure to test that proper league is fetched here
    const tenMinutesAgo = (Date.now() - (1 * 60 * 10 * 1000));
    const length = this.ninjaPrices.length;
    if (length > 0 && (this.lastNinjaHit > tenMinutesAgo && !this.externalService.tradeLeagueChanged)) {
      return Observable.of(null);
    } else {
      this.logService.log('[INFO] Retrieving prices from poe.ninja');
      this.lastNinjaHit = Date.now();
      this.ninjaPrices = [];

      const setting = this.settingsService.get('lowConfidencePricing');
      if (setting !== undefined) {
        this.lowConfidencePricing = setting;
      } else {
        this.lowConfidencePricing = false;
        this.settingsService.set('lowConfidencePricing', false);
      }

      const enumTypes = Object.values(NinjaTypes);
      return Observable
        .from(enumTypes)
        .concatMap(type => this.getFromNinja(league, type)
          .delay(750))
        .do(typeResponse => {
          if (typeResponse !== null) {
            typeResponse.lines.forEach((line: NinjaLine) => {
              // Exclude low-confidence prices
              if (!this.lowConfidencePricing) {
                const receive = line.receive;
                if (receive !== undefined && receive !== null) {
                  if (receive.count < 10) {
                    return;
                  }
                }
              }

              // Filter each line here, probably needs improvement
              // But the response differse for Currency & Fragments hence the if's
              let links = 0;
              let value = 0;
              let name = '';

              if ('chaosEquivalent' in line) {
                value = line.chaosEquivalent;
              }
              if ('chaosValue' in line) {
                value = line.chaosValue;
              }
              if ('currencyTypeName' in line) {
                name = line.currencyTypeName;
              }
              if ('name' in line) {
                name = line.name;
                if (line.baseType && (line.name.indexOf(line.baseType) === -1)) {
                  name += ' ' + line.baseType;
                }
                name.trim();
              }
              if ('links' in line) {
                links = line.links;
              }
              if (name !== '') {
                const ninjaPriceInfoObj = {
                  value: value,
                  name: name,
                  links: links,
                  gemQuality: line.gemQuality,
                  gemLevel: line.gemLevel,
                  variation: line.variation,
                  baseType: line.baseType
                } as NinjaPriceInfo;
                this.ninjaPrices.push(ninjaPriceInfoObj);
              }
            });
          } else {
            // todo: test so this actually works (previously we set issnapshotting = false here)
            return Observable.of(null);
          }
        });
    }
  }
}
