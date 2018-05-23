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
  equipmentSlots: any[] = [{
    id: 'Weapon',
    w: 2,
    h: 4
  }, {
    id: 'Offhand',
    w: 2,
    h: 4
  }, {
    id: 'Weapon2',
    w: 2,
    h: 3
  }, {
    id: 'Offhand2',
    w: 2,
    h: 3
  }, {
    id: 'Helm',
    w: 2,
    h: 2
  }, {
    id: 'BodyArmour',
    w: 2,
    h: 3
  }, {
    id: 'Boots',
    w: 2,
    h: 2
  }, {
    id: 'Gloves',
    w: 2,
    h: 2
  }, {
    id: 'Ring',
    w: 1,
    h: 1
  }, {
    id: 'Ring',
    w: 1,
    h: 1
  }, {
    id: 'Ring2',
    w: 1,
    h: 1
  }, {
    id: 'Amulet',
    w: 1,
    h: 1
  }, {
    id: 'Belt',
    w: 2,
    h: 1
  }];

  flaskSlots: any[] = [{
    id: 'flask-slot-1',
    w: 1,
    h: 2
  }, {
    id: 'flask-slot-2',
    w: 1,
    h: 2
  }, {
    id: 'flask-slot-3',
    w: 1,
    h: 2
  }, {
    id: 'flask-slot-4',
    w: 1,
    h: 2
  },
  {
    id: 'flask-slot-5',
    w: 1,
    h: 2
  }];


  // todo: missing flask array

  constructor() {

  }

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
