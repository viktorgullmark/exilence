import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-char-equipment',
  templateUrl: './char-equipment.component.html',
  styleUrls: ['./char-equipment.component.scss']
})
export class CharEquipmentComponent implements OnInit {
  @Input() items: Item[];
  equipment: Item[];
  flasks: Item[];
  constructor() { }

  ngOnInit() {
    this.equipment = this.items.filter(x => x.inventoryId !== 'MainInventory' && x.inventoryId !== 'Flask');
    this.flasks = this.items.filter(x => x.inventoryId === 'Flask');
  }

  getItemByType(type: string) {
    return this.items.find(x => x.inventoryId === type);
  }
  getFlaskByIndex(index: number) {
    return this.items.find(x => x.inventoryId === 'Flask' && x.x === index);
  }
}
