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

  }

}

