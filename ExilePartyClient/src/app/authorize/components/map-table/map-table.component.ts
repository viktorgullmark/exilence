import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import * as moment from 'moment';

import { ExtendedAreaInfo } from '../../../shared/interfaces/area.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';

@Component({
  selector: 'app-map-table',
  templateUrl: './map-table.component.html',
  styleUrls: ['./map-table.component.scss']
})
export class MapTableComponent implements OnInit {
  @Input() player: Player;
  @Output() filtered: EventEmitter<any> = new EventEmitter;
  displayedColumns: string[] = ['timestamp', 'name', 'tier', 'time'];
  dataSource = [];
  searchText = '';
  filteredArr = [];
  source: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private partyService: PartyService) {
  }

  ngOnInit() {
    this.updateTable(this.player);
    this.partyService.selectedPlayer.subscribe(res => {
      if (res !== undefined) {
        this.player = res;
        this.dataSource = [];
        if (res.pastAreas !== null) {
          this.updateTable(res);
        }
        this.filter();
      }
    });
  }

  doSearch(text: string) {
    this.searchText = text;

    this.filter();
  }

  filter() {
    setTimeout(res => {
      this.filteredArr = [...this.dataSource];
      this.filteredArr = this.filteredArr.filter(item =>
        Object.keys(item).some(k => item[k] != null && item[k] !== '' &&
          item[k].toString().toLowerCase()
            .includes(this.searchText.toLowerCase()))
      );

      this.source = new MatTableDataSource(this.filteredArr);
      this.source.paginator = this.paginator;
      this.source.sort = this.sort;
      this.filtered.emit(this.filteredArr);
    }, 0);

  }

  formatDate(timestamp) {
    return moment(timestamp).format('ddd, LT');
  }

  updateTable(player: Player) {
    if (player.pastAreas !== null && player.pastAreas !== undefined) {
      player.pastAreas.forEach((area: ExtendedAreaInfo) => {
        const minute = Math.floor(area.duration / 60);
        const seconds = area.duration % 60;
        const newAreaObj = {
          name: area.eventArea.name,
          tier: area.eventArea.info[0].level,
          time: ((minute < 10) ? '0' + minute.toString() : seconds.toString())
            + ':' + ((seconds < 10) ? '0' + seconds.toString() : seconds.toString()),
          timestamp: area.timestamp
        };

        this.dataSource.push(newAreaObj);
      });
    }
  }

}

