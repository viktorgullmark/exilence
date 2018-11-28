import { Injectable } from '@angular/core';
import { Item } from '../../../../shared/interfaces/item.interface';

@Injectable()
export class ItemService {
  public selectedGem: Item;
  constructor() {
  }

  selectGem(gem: Item) {
    this.selectedGem = gem;
  }
  deselectGem() {
    this.selectedGem = undefined;
  }
}
