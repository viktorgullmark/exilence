import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import { CombinedItemPriceInfo } from '../interfaces/poe-watch/combined-item-price-info.interface';
import { ItemInfo } from '../interfaces/poe-watch/Item-info.interface';
import { ItemPrice } from '../interfaces/poe-watch/item-price.interface';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class WatchService {

  private poeWatchBaseUrl = 'https://api.poe.watch';
  private cooldown = false;

  private itemData: ItemInfo[] = [];
  private itemPrices: ItemPrice[] = [];
  private ItemsWithPrice: CombinedItemPriceInfo[] = [];

  constructor(
    private http: HttpClient,
    private logService: LogService
  ) { }

  UpdateItemsAndPrices(league: string): Observable<any> {
    this.logService.log('Starting to fetch items and prices from poe.watch');
    return forkJoin([this.fetchPrices(league), this.fetchItems()]).map(res => {
      this.itemPrices = res[0];
      this.itemData = res[1];
      this.ItemsWithPrice = this.itemData.map(x => Object.assign(x, this.itemPrices.find(y => y.id === x.id)));
      this.logService.log('Finished fetching items and prices from poe.watch');
    });
  }

  //#region External Calls
  fetchPrices(league: string): Observable<ItemPrice[]> {
    if (!this.cooldown || this.itemPrices.length === 0) {
      this.cooldown = true;
      setTimeout(x => {
        this.cooldown = false;
      }, 1000 * 60 * 10);
      // this.analyticsService.sendEvent('PriceService', `Items`);
      const url = `${this.poeWatchBaseUrl}/compact?league=${league}`;
      return this.http.get<ItemPrice[]>(url);
    } else {
      return Observable.of(this.itemPrices);
    }
  }

  fetchItems(): Observable<ItemInfo[]> {
    if (this.itemData.length !== 0) {
      return Observable.of(this.itemData);
    }
    // this.analyticsService.sendEvent('PriceService', `Prices`);
    const url = `${this.poeWatchBaseUrl}/itemdata`;
    return this.http.get<ItemInfo[]>(url);
  }
  //#endregion


}
