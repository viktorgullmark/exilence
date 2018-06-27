import { Component, OnInit } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';

import { ChartSeries } from '../../../shared/interfaces/chart.interface';
import { IncomeService } from '../../../shared/providers/income.service';
import { PartyService } from '../../../shared/providers/party.service';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})


export class IncomeComponent implements OnInit {

  dateData: ChartSeries[] = [];

  view = [1000, 500];

  public visible = true;

  // line interpolation
  curveType = 'Linear';
  curve = d3.curveLinear;

  colorScheme: any;
  schemeType = 'ordinal';
  selectedColorScheme: string;


  constructor(
    private incomeService: IncomeService,
    private partyService: PartyService
  ) {

    this.setColorScheme('cool');

  }

  ngOnInit() {
  }

  axisFormat(val) {
    const stringDate: string = val.toTimeString().split(' ')[0];
    return stringDate.substr(0, stringDate.length - 3);
  }

  setColorScheme(name) {
    this.selectedColorScheme = name;
    this.colorScheme = ngxChartsColorsets.find(s => s.name === name);
  }

  select(data): void {
    console.log('Item clicked', data);
  }

  onLegendLabelClick(entry) {
    console.log('Legend clicked', entry);
  }

}
