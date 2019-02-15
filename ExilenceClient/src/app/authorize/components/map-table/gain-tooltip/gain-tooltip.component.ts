import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NetWorthItem } from '../../../../shared/interfaces/income.interface';

@Component({
  selector: 'app-gain-tooltip',
  templateUrl: './gain-tooltip.component.html',
  styleUrls: ['./gain-tooltip.component.scss']
})
export class GainTooltipComponent implements OnInit {

  top = 0;
  left = 100;
  repositioned = false;
  @Input() gain: NetWorthItem[];
  constructor(private el: ElementRef) {
  }

  ngOnInit() {
  }

  reposition(host: any) {
    this.repositioned = false;
    setTimeout(() => {
      const element = host;
      const margin = 25;

      const rect = this.el.nativeElement.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      const overflowTop = rect.top - (54 + margin);
      const overflowLeft = rect.left - (265 + margin);
      const overflowRight = window.innerWidth - rect.right;
      const overflowBottom = window.innerHeight - rect.bottom;

      // todo: set dynamically (see item-tooltip)
      this.left = elementRect.left - 850;
      this.top = elementRect.top;

      this.repositioned = true;

      // if (overflowTop < 0) {
      //   this.top = this.el.nativeElement.offsetTop - overflowTop;
      // }
      // if (overflowLeft < 0) {
      //   this.left = this.el.nativeElement.offsetLeft - overflowLeft;
      // }
      // if (overflowBottom < 0) {
      //   this.top = this.el.nativeElement.offsetTop + overflowBottom - margin;
      // }
      // if (overflowRight < 0) {
      //   this.left = this.el.nativeElement.offsetLeft + overflowRight - margin;
      // }
    }, 1);

  }
}
