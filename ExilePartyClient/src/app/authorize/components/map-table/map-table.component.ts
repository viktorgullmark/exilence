import { Component, OnInit, Input, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ExtendedAreaInfo } from '../../../shared/interfaces/area.interface';
import { MatSort, MatTableDataSource } from '@angular/material';

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
      this.source.sort = this.sort;
      this.filtered.emit(this.filteredArr);
    }, 0);

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

