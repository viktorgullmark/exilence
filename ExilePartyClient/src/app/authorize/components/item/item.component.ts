import { Component, OnInit, Input } from '@angular/core';
import { Item } from '../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Item;
  constructor() { }

  ngOnInit() {
    console.log('item:', this.item);
  }

}
