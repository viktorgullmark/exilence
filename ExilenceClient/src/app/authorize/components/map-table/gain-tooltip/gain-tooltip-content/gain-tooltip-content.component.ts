import { Component, Input, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';

import { NetWorthItem } from '../../../../../shared/interfaces/income.interface';
import { NetworthTableComponent } from '../../../networth-table/networth-table.component';

@Component({
  selector: 'app-gain-tooltip-content',
  templateUrl: './gain-tooltip-content.component.html',
  styleUrls: ['./gain-tooltip-content.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GainTooltipContentComponent implements OnInit {
  @ViewChild('table') table: NetworthTableComponent;
  constructor() { }

  ngOnInit() {
  }

  renderItems(items: NetWorthItem[]) {
    this.table.dataSource = [];
    this.table.updateTable(items, undefined);
    this.table.filter();
  }
}
