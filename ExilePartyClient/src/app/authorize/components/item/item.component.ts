import { Component, OnInit, Input, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { Item } from '../../../shared/interfaces/item.interface';
import { ItemTooltipComponent } from './item-tooltip/item-tooltip.component';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Item;
  @Input() wide = false;
  @Input() weaponSwap = false;
  @ViewChild('tooltip') tooltip: ItemTooltipComponent;
  constructor(public el: ElementRef) { }

  ngOnInit() {
  }
}
