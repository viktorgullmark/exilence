import { Component, Input, OnInit } from '@angular/core';

import { Item } from '../../../../shared/interfaces/item.interface';
import * as data from './equipment-slots';

@Component({
  selector: 'app-char-equipment',
  templateUrl: './char-equipment.component.html',
  styleUrls: ['./char-equipment.component.scss']
})
export class CharEquipmentComponent implements OnInit {
  @Input() items: Item[];
  equipment = data.equipmentSlots;
  flasks = data.flaskSlots;
  constructor() {
  }

  ngOnInit() {
  }

  getItemByType(type: string) {
    return this.items.find(x => x.inventoryId === type);
  }
  getFlaskByIndex(index: number) {
    return this.items.find(x => x.inventoryId === 'Flask' && x.x === index);
  }
}
