import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NetWorthItem } from '../../../../shared/interfaces/income.interface';
import { GainTooltipContentComponent } from './gain-tooltip-content/gain-tooltip-content.component';

@Component({
  selector: 'app-gain-tooltip',
  templateUrl: './gain-tooltip.component.html',
  styleUrls: ['./gain-tooltip.component.scss']
})
export class GainTooltipComponent implements OnInit {

  top = 0;
  left = 100;
  repositioned = false;
  @Input() width: number;
  @ViewChild('content') content: GainTooltipContentComponent;
  constructor(private el: ElementRef) {
  }

  ngOnInit() {
  }

  reposition(host: any) {
    this.repositioned = false;
    setTimeout(() => {
      this.left = 50;
      this.top = 275;
      this.repositioned = true;
    }, 1);
  }

  renderItems(items: NetWorthItem[]) {
    this.content.renderItems(items);
  }
}
