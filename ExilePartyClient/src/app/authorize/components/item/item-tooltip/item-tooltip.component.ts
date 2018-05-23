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
  top: number;
  left: number;
  constructor(private el: ElementRef) {
    this.nativeElement = el.nativeElement;
  }

  ngOnInit() {
  }

  reposition(event, host: ElementRef) {
    const mousePosX = event.clientX;
    const mousePosY = event.clientY;
    const element = host.nativeElement;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const margin = 25;

    const overflowTop = rect.top - (54 + margin);
    const overflowLeft = rect.left - (265 + margin);
    const overflowRight = window.innerWidth - rect.right;
    const overflowBottom = window.innerHeight - rect.bottom;

    if (overflowTop < 0) {
      this.top = this.el.nativeElement.offsetTop - overflowTop;
    }
    if (overflowLeft < 0) {
      this.left = this.el.nativeElement.offsetLeft - overflowLeft;
    }
    if (overflowBottom < 0) {
      this.top = this.el.nativeElement.offsetTop + overflowBottom - margin;
    }
    if (overflowRight < 0) {
      this.left = this.el.nativeElement.offsetLeft + overflowRight - margin;
    }
  }
}
