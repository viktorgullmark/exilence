import { Injectable } from '@angular/core';
import { NinjaService } from './ninja.service';
import { NinjaTypes } from '../interfaces/poe-ninja.interface';
import { Item } from '../interfaces/item.interface';
import { ItemPricing } from '../interfaces/item-pricing.interface';

@Injectable()

export class PricingService {

  constructor(private ninjaService: NinjaService
  ) { }

  priceItem(item: Item, league: string): ItemPricing {
    const itemPricingObj: ItemPricing = {
      name: '',
      quality: -1,
      sockets: -1,
      links: -1,
      chaosequiv: -1,
    };

    // format itemname
    let itemName = item.name;
    if (item.typeLine) {
      itemName += ' ' + item.typeLine;
    }
    itemName = itemName.replace('<<set:MS>><<set:M>><<set:S>>', '').trim();
    itemPricingObj.name = itemName;

    // todo: format remaining properties

    // todo: fetch values from appropriate service and price the item

    return itemPricingObj;
  }
}
