import { Component, OnInit, Input } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';

import { ChartSeries, ChartSeriesEntry } from '../../../shared/interfaces/chart.interface';
import { IncomeService } from '../../../shared/providers/income.service';
import { PartyService } from '../../../shared/providers/party.service';
import { Player } from '../../../shared/interfaces/player.interface';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})


export class IncomeComponent implements OnInit {
  dateData: ChartSeries[] = [];
  @Input() player: Player;
  @Input() view = [1000, 500];

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
    this.setColorScheme('fire');
  }

  ngOnInit() {
    this.partyService.selectedPlayer.subscribe(res => {
      this.dateData = [];
      if (res.netWorthSnapshots !== null) {
        const entry: ChartSeries = {
          name: res.character.name,
          series: res.netWorthSnapshots.slice(0, 20).map(snapshot => {
            const seriesEntry: ChartSeriesEntry = {
              name: new Date(snapshot.timestamp),
              value: snapshot.value
            };
            return seriesEntry;
          })
        };
        const data = [... this.dateData];
        data[0] = entry;
        this.dateData = data;
      }
    });

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
