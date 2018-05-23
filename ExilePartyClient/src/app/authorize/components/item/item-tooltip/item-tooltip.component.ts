import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Item } from '../../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-item-tooltip',
  templateUrl: './item-tooltip.component.html',
  styleUrls: ['./item-tooltip.component.scss']
})
export class ItemTooltipComponent implements OnInit {
  @Input() item: Item;
  nativeElement: HTMLElement;
  constructor(private el: ElementRef) {
    this.nativeElement = el.nativeElement;
  }

  ngOnInit() {
  }

}
