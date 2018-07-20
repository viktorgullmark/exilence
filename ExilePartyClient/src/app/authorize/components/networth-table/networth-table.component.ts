import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';

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
    if (this.player !== undefined) {
      this.loadPlayerData(this.player);
      this.partyService.selectedPlayer.subscribe(res => {
        this.player = res;
        this.dataSource = [];
        if (res.netWorthSnapshots !== null) {
          this.loadPlayerData(res);
        }
        this.filter();
      });
    } else {
      // party logic
      this.partyService.party.players.forEach(p => {
        this.loadPlayerData(p);
      });
      this.filter();

      this.partyService.partyUpdated.subscribe(party => {
        if (party !== undefined) {
          this.dataSource = [];
          party.players.forEach(p => {
            if (p.netWorthSnapshots !== null) {
              this.loadPlayerData(p);
            }
          });
          this.filter();
        }
      });
    }
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

  loadPlayerData(player: Player) {
    this.updateTable(player.netWorthSnapshots[0].items);
  }

  loadPreviousSnapshot(snapshot: any) {
    this.dataSource = [];
    this.updateTable(snapshot.items);

    this.filter();
  }

  updateTable(items: any[]) {
    items.forEach(snapshot => {
      const existingItem = this.dataSource.find(x => x.name === snapshot.name);
      if (existingItem !== undefined) {
        const indexOfItem = this.dataSource.indexOf(existingItem);
        // update existing item with new data
        existingItem.stacksize = existingItem.stacksize + snapshot.stacksize;
        existingItem.value = existingItem.value + snapshot.value;
        this.dataSource[indexOfItem] = existingItem;
      } else {
        const newObj = {
          position: items.indexOf(snapshot) + 1,
          name: snapshot.name,
          stacksize: snapshot.stacksize,
          value: snapshot.value,
          valuePerUnit: snapshot.valuePerUnit,
          icon: snapshot.icon
        };
        this.dataSource.push(newObj);
      }
    });
  }
}



