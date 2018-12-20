import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import { ItemHelper } from '../helpers/item.helper';
import { ItemPricing, SimpleItemPricing } from '../interfaces/item-pricing.interface';
import { Item } from '../interfaces/item.interface';
import { NinjaPriceInfo } from '../interfaces/poe-ninja.interface';
import { CombinedItemPriceInfo } from '../interfaces/poe-watch/combined-item-price-info.interface';
import { NinjaService } from './ninja.service';
import { SettingsService } from './settings.service';
import { WatchService } from './watch.service';

@Injectable()

export class PricingService {

  constructor(
    private ninjaService: NinjaService,
    private watchService: WatchService,
    private settingsService: SettingsService
  ) { }

  initPricingObject(): ItemPricing {
    return {
      name: '',
      quality: 0,
      gemlevel: 0,
      sockets: 0,
      links: 0,
      variation: '',
      chaosequiv: 0,
      chaosequiv_min: 0,
      chaosequiv_max: 0,
      chaosequiv_mode: 0,
      chaosequiv_median: 0,
      chaosequiv_average: 0,
      posted_daily: 0
    } as ItemPricing;
  }

  specialGemCheck(name: string) {
    return name.indexOf('Enhance') > -1 || name.indexOf('Enlighten') > -1 || name.indexOf('Empower') > -1;
  }

  retrieveExternalPrices(): Observable<any> {
    const league = this.settingsService.get('account.tradeLeagueName');
    return forkJoin(
      this.ninjaService.getValuesFromNinja(league),
      this.watchService.UpdateItemsAndPrices(league)
    );
  }

  priceItem(item: Item): ItemPricing {

    const itemPricingObj = this.initPricingObject();

    // format itemname
    itemPricingObj.name = ItemHelper.getItemName(item.typeLine, item.name);

    // calculate links & sockets for item
    let links = 0;
    if (item.sockets) { links = ItemHelper.getLinks(item.sockets.map(t => t.group)); }
    if (links < 5) { links = 0; }
    itemPricingObj.links = links;
    itemPricingObj.sockets = item.sockets !== undefined && item.sockets !== null ? item.sockets.length : 0;

    // assign if elder or shaper
    let elderOrShaper = null;
    if (item.elder) { elderOrShaper = 'elder'; }
    if (item.shaper) { elderOrShaper = 'shaper'; }



    // parse item-quality
    if (item.properties !== null && item.properties !== undefined) {
      const quality =
        item.properties.find(t => t.name === 'Quality') ?
          item.properties.find(t => t.name === 'Quality').values[0][0] : '0';
      itemPricingObj.quality = parseInt(quality, 10);
    }

    // price items based on type
    let price = {
      chaosequiv: 0,
      chaosequiv_min: 0,
      chaosequiv_max: 0,
      chaosequiv_mode: 0,
      chaosequiv_median: 0,
      chaosequiv_average: 0
    };

    let abyssalsockets;
    if (item.sockets !== undefined && item.sockets !== null) {
      abyssalsockets = item.sockets.filter(x => x.sColour === 'A' || x.sColour === 'a').length;
    }

    switch (item.frameType) {
      case 0: // Normal
        if (item.ilvl > 0) {
          price = this.pricecheckBase(item.typeLine, item.ilvl, elderOrShaper);
        } else { // fragment or scarab
          price = this.pricecheckByName(itemPricingObj.name);
        }
        break;
      case 1: // Magic
      case 2: // Rare
        price = this.pricecheckRare(item);
        break;
      case 3: // Unique
        price = this.pricecheckUnique(itemPricingObj.name, links, item.name, abyssalsockets);
        break;
      case 4: // Gem
        const levelStr = item.properties.find(t => t.name === 'Level').values[0][0];
        let level = parseInt(levelStr, 10);

        // check if enlighten/enhance/empower, and re-format level + qual
        const specialGem = this.specialGemCheck(itemPricingObj.name);
        if (level < 20 && level > 0 && !specialGem) { level = 1; }
        itemPricingObj.gemlevel = level;
        if (itemPricingObj.quality < 20 && itemPricingObj.quality > 0) { itemPricingObj.quality = 0; }

        price = this.pricecheckGem(itemPricingObj.name, itemPricingObj.gemlevel, itemPricingObj.quality);
        break;
      case 5: // Currency
        price = this.pricecheckByName(itemPricingObj.name);
        break;
      case 6: // Divination Card
        price = this.pricecheckByName(itemPricingObj.name);
        break;
      case 8: // Prophecy
        price = this.pricecheckByName(itemPricingObj.name);
        break;
      case 9: // Relic
        break;
      default:
        price = this.pricecheckByName(itemPricingObj.name);
    }

    itemPricingObj.chaosequiv = price.chaosequiv;
    itemPricingObj.chaosequiv_min = price.chaosequiv_min;
    itemPricingObj.chaosequiv_max = price.chaosequiv_max;
    itemPricingObj.chaosequiv_mode = price.chaosequiv_mode;
    itemPricingObj.chaosequiv_median = price.chaosequiv_median;
    itemPricingObj.chaosequiv_average = price.chaosequiv_average;

    return itemPricingObj;
  }

  pricecheckByName(name: string): SimpleItemPricing {
    if (name === 'Chaos Orb') {
      return { chaosequiv: 1, chaosequiv_min: 1, chaosequiv_max: 1, chaosequiv_mode: 1, chaosequiv_median: 1, chaosequiv_average: 1 };
    }
    const ninjaPriceInfoItem = this.ninjaService.ninjaPrices.find(x => x.name === name);
    const watchPriceInfoItem = this.watchService.watchPrices.find(x => x.fullname === name);
    return this.combinePricesToSimpleObject(ninjaPriceInfoItem, watchPriceInfoItem);
  }
  pricecheckUnique(name: string, links: number, uniquename: string, abyssalsockets: number = 0): SimpleItemPricing {
    if (uniquename === '' || uniquename === undefined || uniquename === null) { // ignore unidentified uniques
      return { chaosequiv: 0, chaosequiv_min: 0, chaosequiv_max: 0, chaosequiv_mode: 0, chaosequiv_median: 0, chaosequiv_average: 0 };
    }
    const ninjaPriceInfoItem = this.ninjaService.ninjaPrices.find(x => x.name === name
      && x.links === links
      && ((x.variation === undefined || x.variation === null || x.variation.indexOf('jewel') === -1)
        || +x.variation.substring(0, 1) === abyssalsockets)
    );
    const watchPriceInfoItem = this.watchService.watchPrices.find(x => x.fullname === name && x.links === links);
    return this.combinePricesToSimpleObject(ninjaPriceInfoItem, watchPriceInfoItem);
  }
  pricecheckRare(item: Item) {
    // todo: pricecheck towards new service for poeprices.info
    return { chaosequiv: 0, chaosequiv_min: 0, chaosequiv_max: 0, chaosequiv_mode: 0, chaosequiv_median: 0, chaosequiv_average: 0 };
  }
  pricecheckGem(name: string, level: number, quality: number): SimpleItemPricing {
    const ninjaPriceInfoItem = this.ninjaService.ninjaPrices.find(x => x.name === name && x.gemLevel === level && x.gemQuality === quality);
    const watchPriceInfoItem = this.watchService.watchPrices.find(x => x.fullname === name && x.lvl === level && x.quality === quality);
    return this.combinePricesToSimpleObject(ninjaPriceInfoItem, watchPriceInfoItem);
  }
  pricecheckBase(baseType: string, ilvl: number = 0, variation: string = null): SimpleItemPricing {
    if (ilvl < 82 && ilvl > 0) {
      return { chaosequiv: 0, chaosequiv_min: 0, chaosequiv_max: 0, chaosequiv_mode: 0, chaosequiv_median: 0, chaosequiv_average: 0 };
    }
    if (ilvl > 86) {
      ilvl = 86;
    }
    // tslint:disable-next-line:max-line-length
    const ninjaPriceInfoItem = this.ninjaService.ninjaPrices.find(x => x.baseType === baseType && x.itemlevel === ilvl && x.variation === variation);
    const watchPriceInfoItem = this.watchService.watchPrices.find(x => x.type === baseType && x.ilvl === ilvl && x.variation === variation);
    return this.combinePricesToSimpleObject(ninjaPriceInfoItem, watchPriceInfoItem);
  }

  combinePricesToSimpleObject(ninjaPrice: NinjaPriceInfo, watchPrice: CombinedItemPriceInfo): SimpleItemPricing {
    const pricing: SimpleItemPricing = {
      chaosequiv: ninjaPrice !== undefined ? ninjaPrice.value : 0,
      chaosequiv_min: watchPrice !== undefined ? watchPrice.min : 0,
      chaosequiv_max: watchPrice !== undefined ? watchPrice.max : 0,
      chaosequiv_mode: watchPrice !== undefined ? watchPrice.mode : 0,
      chaosequiv_average: watchPrice !== undefined ? watchPrice.mean : 0,
      chaosequiv_median: watchPrice !== undefined ? watchPrice.median : 0,
    };
    return pricing;
  }

}
