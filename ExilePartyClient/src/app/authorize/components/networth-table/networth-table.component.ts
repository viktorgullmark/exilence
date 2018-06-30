import { Component, OnInit, Input } from '@angular/core';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';

@Component({
  selector: 'app-networth-table',
  templateUrl: './networth-table.component.html',
  styleUrls: ['./networth-table.component.scss']
})
export class NetworthTableComponent implements OnInit {
  @Input() player: Player;
  displayedColumns: string[] = ['position', 'name', 'stacksize', 'value'];
  dataSource = [];
  searchText = '';
  filteredArr = [];

  constructor(private partyService: PartyService) { }

  ngOnInit() {
    this.updateTable(this.player);
    this.partyService.selectedPlayer.subscribe(res => {
      this.dataSource = [];
      if (res.netWorthSnapshots !== null) {
        this.updateTable(res);
      }
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
  }

  updateTable(player: Player) {
    player.netWorthSnapshots[0].items.forEach(snapshot => {

      this.dataSource.push({
        position: player.netWorthSnapshots[0].items.indexOf(snapshot) + 1,
        name: snapshot.name,
        stacksize: snapshot.stacksize,
        value: snapshot.value,
        icon: snapshot.icon
      });
    });

    this.filter();

  }

}

