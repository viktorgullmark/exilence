import { Component, OnInit, Input, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { Item } from '../../../../shared/interfaces/item.interface';
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
  @Input() extendHeightWith = 0;
  @ViewChild('tooltip') tooltip: ItemTooltipComponent;
  parsingItem = true;
  constructor(public el: ElementRef) { }

  ngOnInit() {
    setTimeout(() => {
      this.parsingItem = false;
    }, 1000);
  }

  update() {
    if (!this.weaponSwap) {
      this.tooltip.reposition(this.el);
    }
  }
}
