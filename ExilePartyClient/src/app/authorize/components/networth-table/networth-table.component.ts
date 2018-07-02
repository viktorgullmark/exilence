import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-networth-table',
  templateUrl: './networth-table.component.html',
  styleUrls: ['./networth-table.component.scss']
})
export class NetworthTableComponent implements OnInit {
  @Input() player: Player;
  displayedColumns: string[] = ['position', 'name', 'stacksize', 'valuePerUnit', 'value'];
  dataSource = [];
  searchText = '';
  filteredArr = [];
  source: any;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private partyService: PartyService) { }

  ngOnInit() {
    this.updateTable(this.player);
    this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
      this.dataSource = [];
      if (res.netWorthSnapshots !== null) {
        this.updateTable(res);
      }
      this.filter();
    });
  }

  doSearch(text: string) {
    this.searchText = text;

    this.filter();
  }

  filter() {
    this.filteredArr = [...this.dataSource];
    this.filteredArr = this.filteredArr.filter(item =>
      Object.keys(item).some(k => item[k] != null && item[k] !== '' &&
        item[k].toString().toLowerCase()
          .includes(this.searchText.toLowerCase()))
    );

    this.source = new MatTableDataSource(this.filteredArr);
    this.source.sort = this.sort;
  }

  updateTable(player: Player) {
    player.netWorthSnapshots[0].items.forEach(snapshot => {
      this.dataSource.push({
        position: player.netWorthSnapshots[0].items.indexOf(snapshot) + 1,
        name: snapshot.name,
        stacksize: snapshot.stacksize,
        value: snapshot.value,
        valuePerUnit: snapshot.valuePerUnit,
        icon: snapshot.icon
      });
    });

  }

}

