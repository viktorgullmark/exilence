import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { NetWorthItem } from '../../../../../shared/interfaces/income.interface';

@Component({
  selector: 'app-gain-tooltip-content',
  templateUrl: './gain-tooltip-content.component.html',
  styleUrls: ['./gain-tooltip-content.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GainTooltipContentComponent implements OnInit {
  @Input() gain: NetWorthItem[];
  constructor() { }

  ngOnInit() {
  }
}
