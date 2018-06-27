import { Component, OnInit, Input } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';

import { ChartSeries, ChartSeriesEntry } from '../../../shared/interfaces/chart.interface';
import { IncomeService } from '../../../shared/providers/income.service';
import { PartyService } from '../../../shared/providers/party.service';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})


export class IncomeComponent implements OnInit {
  dateData: ChartSeries[] = [];

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

    this.incomeService.netWorthSnapshotList.subscribe(snapshots => {
      const entry: ChartSeries = {
        name: this.partyService.accountInfo.accountName,
        series: snapshots.slice(0, 20).map(snapshot => {
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
    });

    // this.dateData = [
    //   {
    //     name: 'Umaycry',
    //     series: [
    //       { name: new Date('2014-04-03'), value: 500 },
    //       { name: new Date('2014-04-04'), value: 510 },
    //       { name: new Date('2014-04-05'), value: 520 },
    //       { name: new Date('2014-04-06'), value: 530 },
    //       { name: new Date('2014-04-07'), value: 540 },
    //       { name: new Date('2014-04-08'), value: 550 },
    //       { name: new Date('2014-04-09'), value: 530 },
    //       { name: new Date('2014-04-10'), value: 520 },
    //       { name: new Date('2014-04-11'), value: 550 },
    //       { name: new Date('2014-04-12'), value: 510 },
    //     ]
    //   }
    // ];

    // setInterval(() => {
    //   const data = [...this.dateData];
    //   data[0].series.unshift({ name: '2018-06-27 15:20', value: Math.floor((Math.random() * 500) + 1) });
    //   data[0].series.pop();
    //   this.dateData = data;
    // }, 1000);

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
