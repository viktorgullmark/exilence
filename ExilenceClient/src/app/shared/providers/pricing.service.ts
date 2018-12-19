import { Injectable } from '@angular/core';
import { NinjaService } from './ninja.service';
import { NinjaTypes } from '../interfaces/poe-ninja.interface';
import { Item } from '../interfaces/item.interface';

@Injectable()

export class PricingService {

  constructor(private ninjaService: NinjaService
  ) { }

  priceItem(item: Item) {
    
  }
}
