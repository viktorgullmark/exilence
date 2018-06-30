import { Component, OnInit, Input, Inject } from '@angular/core';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ExtendedAreaInfo } from '../../../shared/interfaces/area.interface';

@Component({
  selector: 'app-map-table',
  templateUrl: './map-table.component.html',
  styleUrls: ['./map-table.component.scss']
})
export class MapTableComponent implements OnInit {
  @Input() player: Player;
  displayedColumns: string[] = ['name', 'tier', 'time'];
  dataSource = [];
  searchText = '';
  filteredArr = [];

  constructor(private partyService: PartyService) {
  }

  ngOnInit() {
    this.updateTable(this.player);
    this.partyService.selectedPlayer.subscribe(res => {
      this.dataSource = [];
      if (res.pastAreas !== null) {
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
    if (player.pastAreas !== null) {
      player.pastAreas.forEach((area: ExtendedAreaInfo) => {
        const minute = Math.floor(area.duration / 60);
        const seconds = area.duration % 60;
        const newAreaObj = {
          name: area.eventArea.name,
          tier: area.eventArea.info[0].level,
          time: minute + ':' + seconds
        };

        this.dataSource.push(newAreaObj);
      });
    }
    this.filter();
  }

}

