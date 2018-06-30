import { Component, OnInit, Input, Inject } from '@angular/core';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-map-table',
  templateUrl: './map-table.component.html',
  styleUrls: ['./map-table.component.scss']
})
export class MapTableComponent implements OnInit {
  @Input() player: Player;
  displayedColumns: string[] = ['name', 'tier', 'time'];
  dataSource = [];

  constructor(private partyService: PartyService) {
  }

  ngOnInit() {
    this.updateTable(this.player);
    this.partyService.selectedPlayer.subscribe(res => {
      this.dataSource = [];
      // if (res.areas !== null) {
      //   this.updateTable(res);
      // }
    });
  }

  doSearch(text: string) {
    console.log(text);
  }

  updateTable(player: Player) {
    // player.areas.forEach(area => {
    //   this.dataSource.push({
    //     name: area.name,
    //     tier: area.tier,
    //     time: area.time
    //   });
    // });
  }

}

