import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';

import { ChartSeries, ChartSeriesEntry } from '../../../shared/interfaces/chart.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { IncomeService } from '../../../shared/providers/income.service';
import { PartyService } from '../../../shared/providers/party.service';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})


export class IncomeComponent implements OnInit {
  dateData: ChartSeries[] = [];
  @Input() player: Player;
  @Input() view = [1000, 400];
  @Input() title = 'Net worth graph based on selected tabs';
  @Output() hidden: EventEmitter<any> = new EventEmitter;
  @Output() loadPrevious: EventEmitter<any> = new EventEmitter;

  public isHidden = false;
  public visible = true;
  private data = [];

  // line interpolation
  curveType = 'Linear';
  curve = d3.curveLinear;

  colorScheme = {
    domain: ['#e91e63', '#f2f2f2', '#FFEE93', '#8789C0', '#45F0DF']
  };

  schemeType = 'ordinal';
  selectedColorScheme: string;


  constructor(
    private incomeService: IncomeService,
    private partyService: PartyService,
  ) {
  }

  ngOnInit() {
    if (this.player !== undefined) {
      this.updateGraph(this.player);
      this.partyService.selectedPlayer.subscribe(res => {
        this.dateData = [];
        this.data = [];
        if (res.netWorthSnapshots !== null) {
          this.updateGraph(res);
        }
      });
    } else {
      // party logic

      this.partyService.party.players.forEach(p => {
        if (p.netWorthSnapshots !== null) {
          this.updateGraph(p);
        }
      });
      this.partyService.partyUpdated.subscribe(party => {
        if (party !== undefined) {
          this.dateData = [];
          this.data = [];
          party.players.forEach(p => {
            if (p.netWorthSnapshots !== null) {
              this.updateGraph(p);
            }
          });
        }
      });
    }
  }

  hideGraph() {
    this.isHidden = true;
    this.hidden.emit(this.isHidden);
  }

  showGraph() {
    this.isHidden = false;
    this.hidden.emit(this.isHidden);
  }

  updateGraph(player: Player) {
    const entry: ChartSeries = {
      name: player.character.name,
      series: player.netWorthSnapshots.map(snapshot => {
        const seriesEntry: ChartSeriesEntry = {
          name: new Date(snapshot.timestamp),
          value: snapshot.value,
          items: snapshot.items
        };
        return seriesEntry;
      })
    };
    if (player.netWorthSnapshots[0].timestamp === 0) {
      if (this.player !== undefined) {
        this.dateData.push(entry);
      }
    } else {
      this.dateData.push(entry);
    }
    const data = [... this.dateData];
    this.dateData = data;
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
    const snapshot = this.dateData[0].series.filter(t => {
      if (t.name === data.name) {
        return true;
      }
      return false;
    })[0];
    console.log('[INFO] Clicked snapshot: ', snapshot);
    this.loadPreviousSnapshot(snapshot);
  }

  loadPreviousSnapshot(snapshot) {
    this.loadPrevious.emit(snapshot);
  }

  onLegendLabelClick(entry) {
    console.log('[INFO] Legend clicked', entry);
  }

}
