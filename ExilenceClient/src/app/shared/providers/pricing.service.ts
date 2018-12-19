import { Injectable } from '@angular/core';
import { NinjaService } from './ninja.service';
import { NinjaTypes } from '../interfaces/poe-ninja.interface';
import { Item } from '../interfaces/item.interface';
import { ItemPricing } from '../interfaces/item-pricing.interface';
import { ItemHelper } from '../helpers/item.helper';
import { Observable } from 'rxjs';

@Injectable()

export class PricingService {

  constructor(private ninjaService: NinjaService
  ) { }

  initPricingObject(): ItemPricing {
    return {
      name: '',
      quality: 0,
      sockets: 0,
      links: 0,
      chaosequiv: 0,
      chaosequiv_average: 0,
      chaosequiv_mean: 0
    } as ItemPricing;
  }

  specialGemCheck(name: string) {
    return name.indexOf('Enhance') > -1 || name.indexOf('Enlighten') > -1 || name.indexOf('Empower') > -1;
  }

  retrieveExternalPrices(): Observable<any> {
    return this.ninjaService.getValuesFromNinja();
  }

  priceItem(item: Item, league: string): ItemPricing {

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
    let price = 0;
    switch (item.frameType) {
      case 0: // Normal
        price = this.pricecheckBase(item.typeLine, item.ilvl, elderOrShaper);
        break;
      case 1: // Magic
      case 2: // Rare
        price = this.pricecheckRare(item);
        break;
      case 3: // Unique
        price = this.pricecheckUnique(itemPricingObj.name, links);
        break;
      case 4: // Gem
        const levelStr = item.properties.find(t => t.name === 'Level').values[0][0];
        let level = parseInt(levelStr, 10);

        // check if enlighten/enhance/empower, and re-format level + qual
        const specialGem = this.specialGemCheck(item.name);
        if (level < 20 && level > 0 && !specialGem) { level = 0; }
        if (itemPricingObj.quality < 20 && itemPricingObj.quality > 0) { itemPricingObj.quality = 0; }

        price = this.pricecheckGem(itemPricingObj.name, level, itemPricingObj.quality);
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
    itemPricingObj.chaosequiv = price;
    return itemPricingObj;
  }

  pricecheckByName(name: string) {
    const priceInfoItem = this.ninjaService.ninjaPrices.find(x =>
      x.name === name
    );
    return priceInfoItem !== undefined ? priceInfoItem.value : 0;
  }
  pricecheckUnique(name: string, links: number) {
    const priceInfoItem = this.ninjaService.ninjaPrices.find(x =>
      x.name === name
      && x.links === links
    );
    return priceInfoItem !== undefined ? priceInfoItem.value : 0;
  }
  pricecheckRare(item: Item) {
    // todo: pricecheck towards new service for poeprices.info
    return 0;
  }
  pricecheckGem(name: string, level: number, quality: number) {
    const priceInfoItem = this.ninjaService.ninjaPrices.find(x =>
      x.name === name
      && x.gemLevel === level
      && x.gemQuality === quality
    );
    return priceInfoItem !== undefined ? priceInfoItem.value : 0;
  }
  pricecheckBase(baseType: string, ilvl: number = 0, variation: string = null) {
    if (ilvl < 82) { return 0; }
    if (ilvl > 86) { ilvl = 86; }
    const priceInfoItem = this.ninjaService.ninjaPrices.find(x =>
      x.baseType === baseType
      && x.itemlevel === ilvl
      && x.variation === variation
    );
    return priceInfoItem !== undefined ? priceInfoItem.value : 0;
  }
}
