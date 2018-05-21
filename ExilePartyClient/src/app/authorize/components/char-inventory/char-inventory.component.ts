import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-char-inventory',
  templateUrl: './char-inventory.component.html',
  styleUrls: ['./char-inventory.component.scss']
})
export class CharInventoryComponent implements OnInit {
  @Input() items: Item[];
  constructor() { }

  ngOnInit() {
    console.log('char-inventory:', this.items);
  }

}
