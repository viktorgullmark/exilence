import { Component, OnInit, Inject, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MapTableComponent } from '../../map-table/map-table.component';
import { Player } from '../../../../shared/interfaces/player.interface';
import { PartyService } from '../../../../shared/providers/party.service';
import { ExtendedAreaInfo } from '../../../../shared/interfaces/area.interface';

@Component({
  selector: 'app-char-maps',
  templateUrl: './char-maps.component.html',
  styleUrls: ['./char-maps.component.scss']
})
export class CharMapsComponent implements OnInit {
  form: FormGroup;
  @Input() player: Player;

  averageTimeSpent = '';
  filteredArr = [];

  private oneHourAgo = (Date.now() - (1 * 60 * 60 * 1000));

  @ViewChild('table') table: MapTableComponent;

  constructor(@Inject(FormBuilder) fb: FormBuilder, private partyService: PartyService) {
    this.form = fb.group({
      searchText: ['']
    });
    this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
    });
  }

  ngOnInit() {
  }

  updateSummary(filteredArr) {
    this.filteredArr = [];
    if (this.player.pastAreas !== null) {
      this.filteredArr = this.player.pastAreas.filter(res => {
        return filteredArr.some(x => x.timestamp === res.timestamp);
      });
    }
    this.updateAvgTimeSpent(this.filteredArr);
  }

  updateAvgTimeSpent(pastAreas) {
    console.log('updating avg',pastAreas);
    if (pastAreas !== null) {
      const pastHourAreas = pastAreas
        .filter((area: ExtendedAreaInfo) => area.timestamp > this.oneHourAgo);

      if (pastHourAreas[0] !== undefined) {
        let total = 0;
        pastHourAreas.forEach(area => {
          total = total + area.duration;
        });

        const average = total / pastHourAreas.length;

        const minute = Math.floor(average / 60);
        let seconds = average % 60;
        seconds = Math.floor(seconds);
        this.averageTimeSpent = ((minute < 10) ? '0' + minute.toString() : seconds.toString())
        + ':' + ((seconds < 10) ? '0' + seconds.toString() : seconds.toString());
      } else {
        this.averageTimeSpent = '';
      }
    } else {
      this.averageTimeSpent = '';
    }
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }

}
