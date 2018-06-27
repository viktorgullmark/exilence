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

  // {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  // {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  // {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  // {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  // {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  // {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  // {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  // {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  // {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  // {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},

  constructor(private partyService: PartyService) { }

  ngOnInit() {
    this.updateTable(this.player);
    this.partyService.selectedPlayer.subscribe(res => {
      this.updateTable(res);
    });
  }

  updateTable(player: Player) {
    this.dataSource = [];
    player.netWorthSnapshots[player.netWorthSnapshots.length - 1].items.forEach(snapshot => {
      this.dataSource.push({
        position: player.netWorthSnapshots[player.netWorthSnapshots.length - 1].items.indexOf(snapshot) + 1,
        name: snapshot.name,
        stacksize: snapshot.stacksize,
        value: snapshot.value
      });
    });
  }

}

