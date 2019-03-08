import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, Predicate } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { NinjaLine, NinjaPriceInfo, NinjaResponse, NinjaTypes } from '../interfaces/poe-ninja.interface';
import { ExternalService } from './external.service';
import { LogService } from './log.service';
import { SettingsService } from './settings.service';
import { Expression } from '@angular/compiler/src/output/output_ast';
import { AppConfig } from '../../../environments/environment';
import { PriceFluctuation } from '../interfaces/price-fluctuation.interface';

@Injectable()

export class NinjaService {

  private itemUrl = 'https://poe.ninja/api/data/itemoverview';
  private currencyUrl = 'https://poe.ninja/api/data/currencyoverview';
  private lastNinjaHit: number;
  public previousNinjaPrices: NinjaPriceInfo[] = [];
  public ninjaPrices: NinjaPriceInfo[] = [];
  private lowConfidencePricing = false;

  private priceFluctuations: PriceFluctuation[] = [];

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
    private logService: LogService,
    private settingsService: SettingsService,
    private externalService: ExternalService
  ) { }

  getFromNinja(league: string, type: NinjaTypes): Observable<NinjaResponse> {
    const baseUrl = (type === NinjaTypes.CURRENCY || type === NinjaTypes.FRAGMENT) ? this.currencyUrl : this.itemUrl;
    const date = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    const parameters = `?league=${league}&type=${type}`; // &date=${date}
    const url = baseUrl + parameters;
    return this.http.get<NinjaResponse>(url);
  }

  getPrice(expression: Predicate<NinjaPriceInfo>) {
    if (this.ninjaPrices.length > 0) {
      const price = this.ninjaPrices.find(expression);

      if (price !== undefined &&
        this.previousNinjaPrices.length > 0 &&
        price.sparkLine !== undefined &&
        price.value > 0) {
        // if diff by 500%, assume price received was faulty
        if (price.sparkLine.totalChange > 500 || price.sparkLine.totalChange < -500) {
          const previousPrice = this.previousNinjaPrices.find(expression);
          this.logService.log(
            `Retrieved faulty price for ${price.name}:` +
            `${price.value}. Using previous price: ${previousPrice.value}`
          );

          this.priceFluctuations.unshift({
            itemName: price.name,
            chaosEquiv: price.value,
            totalChange: price.sparkLine.totalChange,
            timestamp: moment().utc().unix()
          } as PriceFluctuation);

          return previousPrice;
        }
      }
      return price;
    }
  }

  sendPriceFluctuationsToServer() {
    if (this.priceFluctuations.length > 0) {
      this.http.post(AppConfig.url + 'log/PriceFluctuations', this.priceFluctuations)
        .subscribe(res => {
          this.logService.log('Price fluctuations successfully sent to server');
        }, (error) => {
          this.logService.log('Could not send price fluctuations to server.', error, true);
        });
    }
  }

  getValuesFromNinja(league: string) {
    let automaticPricing = this.settingsService.get('automaticPricing');
    if (automaticPricing === undefined) {
      automaticPricing = true;
      this.settingsService.set('automaticPricing', automaticPricing);
    }
    if (!automaticPricing) {
      return Observable.of(null);
    }

    this.priceFluctuations = [];
    const tenMinutesAgo = (Date.now() - (1 * 60 * 10 * 1000));
    const length = this.ninjaPrices.length;
    if (length > 0 && (this.lastNinjaHit > tenMinutesAgo && !this.externalService.tradeLeagueChanged)) {
      return Observable.of(null);
    } else {
      this.logService.log('Retrieving prices from poe.ninja');
      this.lastNinjaHit = Date.now();

      this.previousNinjaPrices = [...this.ninjaPrices];
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
          .delay(250))
        .do(typeResponse => {
          if (typeResponse !== null) {
            typeResponse.lines.forEach((line: NinjaLine) => {

              if (line.icon !== undefined && line.icon !== null && line.icon.indexOf('relic=1') > -1) {
                return;
              }

              if (!this.lowConfidencePricing) {
                const receive = line.receive;
                if (receive !== undefined && receive !== null) {
                  if (receive.count < 10) {
                    return;
                  }
                } else if (line.count !== undefined && line.count !== null) {
                  if (line.count < 10) {
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

              // assign proper sparkline to price
              let sparkLine;
              if (this.lowConfidencePricing) {
                if (line.lowConfidenceReceiveSparkLine !== undefined) {
                  sparkLine = line.lowConfidenceReceiveSparkLine;
                } else {
                  sparkLine = line.lowConfidenceSparkLine;
                }
              } else {
                if (line.receiveSparkLine !== undefined) {
                  sparkLine = line.receiveSparkLine;
                } else {
                  sparkLine = line.sparkLine;
                }
              }

              if (name !== '') {
                const ninjaPriceInfoObj = {
                  value: value,
                  name: name,
                  links: links,
                  gemQuality: line.gemQuality,
                  gemLevel: line.gemLevel,
                  variation: line.variant,
                  baseType: line.baseType,
                  corrupted: line.corrupted,
                  icon: line.icon,
                  mapTier: line.mapTier,
                  frameType: line.itemClass,
                  totalStacksize: line.stackSize,
                  sparkLine: sparkLine
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
