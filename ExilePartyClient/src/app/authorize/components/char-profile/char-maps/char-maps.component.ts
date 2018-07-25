import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ExtendedAreaInfo } from '../../../../shared/interfaces/area.interface';
import { Player } from '../../../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../../../shared/providers/analytics.service';
import { PartyService } from '../../../../shared/providers/party.service';
import { MapTableComponent } from '../../map-table/map-table.component';
import * as moment from 'moment';
import { SettingsService } from '../../../../shared/providers/settings.service';
import { MapService } from '../../../../shared/providers/map.service';
import { AccountService } from '../../../../shared/providers/account.service';

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
  selfSelected = false;
  @ViewChild('table') table: MapTableComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    private settingsService: SettingsService,
    private mapService: MapService,
    private accountService: AccountService
  ) {
    this.form = fb.group({
      searchText: ['']
    });
    this.partyService.selectedPlayer.subscribe(res => {
      if (res.account === this.partyService.currentPlayer.account) {
        res.pastAreas = this.partyService.currentPlayer.pastAreas;
        this.selfSelected = true;
      } else {
        this.selfSelected = false;
      }
      this.player = res;
    });
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/party/player/maps');
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

  resetAreaHistory() {

    if (this.player.account === this.partyService.currentPlayer.account) {
      const emptyHistory = this.settingsService.deleteAreas();
      this.player.pastAreas = emptyHistory;
      this.mapService.loadAreasFromSettings();
      this.accountService.player.next(this.player);
      this.partyService.selectedPlayer.next(this.player);
    }
  }

  updateAvgTimeSpent(pastAreas) {
    if (pastAreas !== null) {
      if (pastAreas[0] !== undefined) {
        let total = 0;
        pastAreas.forEach(area => {
          total = total + area.duration;
        });

        const average = total / pastAreas.length;

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
