import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-char-inventory',
  templateUrl: './char-inventory.component.html',
  styleUrls: ['./char-inventory.component.scss']
})
export class CharInventoryComponent implements OnInit {
  @Input() items: Item[];
  // default to main-inventory
  @Input() inventoryId = 'MainInventory';
  @Input() width = 12;
  @Input() height = 5;
  @Input() topMargin = 0;
  grid = [];
  constructor() {
    this.grid = Array(this.width * this.height).fill(0);
  }

  ngOnInit() {
  }

}
