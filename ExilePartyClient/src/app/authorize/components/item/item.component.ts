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
  @ViewChild('tooltip') tooltip: ElementRef;
  top: number;
  left: number;
  constructor(private el: ElementRef) { }

  ngOnInit() {
    console.log('item:', this.item);
  }

  positionTooltip() {
    const element = this.el.nativeElement;

    const rect = this.tooltip.nativeElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const overflowTop = rect.top - 65;
    const overflowLeft = rect.left - 280;

    if (overflowTop < 0) {
      this.top = this.tooltip.nativeElement.offsetTop - overflowTop;
    }
    if (overflowLeft < 0) {
      this.left = this.tooltip.nativeElement.offsetLeft - overflowLeft;
    }
  }

}
