import { Component, Inject, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { AlertService } from '../../../../shared/providers/alert.service';
import { InfoDialogComponent } from '../../info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material';
import { ExportToCsv } from 'export-to-csv';

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
  dataSource = [];
  @ViewChild('table') table: MapTableComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private partyService: PartyService,
    private settingsService: SettingsService,
    private mapService: MapService,
    private accountService: AccountService,
    private alertService: AlertService,
    private dialog: MatDialog
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
  }

  export() {
    const options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Area-export',
      useBom: true,
      useKeysAsHeaders: true,
      filename: 'Areas_' + moment(Date.now()).format('YYYY-MM-DD')
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };

    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(this.mapToExport(this.dataSource));
  }

  mapToExport(array) {
    return array.map(x => {
      const tier = x.name.substring(
        x.name.lastIndexOf('(T') + 1,
        x.name.lastIndexOf(')')
      );
      let name;
      if (x.name.indexOf('(') !== -1) {
        name = x.name.substring(
          0,
          x.name.indexOf('(') - 1
        );
      } else { name = x.name; }
      return {
        NAME: name,
        TIER: tier,
        LEVEL: x.tier,
        DURATION: x.time,
        DATE: moment(x.timestamp).format('YYYY-MM-DD HH:MM:SS')
      };
    });
  }

  openMapDialog(): void {
    setTimeout(() => {
      if (!this.settingsService.get('diaShown_maps') && !this.settingsService.get('hideTooltips')) {
        const dialogRef = this.dialog.open(InfoDialogComponent, {
          width: '650px',
          data: {
            icon: 'map',
            title: 'Map tab',
            // tslint:disable-next-line:max-line-length
            content: 'This tab updates every time the selected player changes area in game.<br/><br/>' +
              'You will only see data from the past hour for the rest of your group.'
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.settingsService.set('diaShown_maps', true);
        });
      }
    });
  }

  updateSummary(event) {
    const filteredArr = event.filteredArr;
    this.dataSource = event.dataSource;
    this.filteredArr = [];
    if (this.player.account === this.partyService.currentPlayer.account) {
      if (this.mapService.localPlayerAreas !== null) {
        this.filteredArr = this.mapService.localPlayerAreas.filter(res => {
          return filteredArr.some(x => x.timestamp === res.timestamp);
        });
      }
      this.updateAvgTimeSpent(this.filteredArr);
    } else {
      if (this.player.pastAreas !== null) {
        this.filteredArr = this.player.pastAreas.filter(res => {
          return filteredArr.some(x => x.timestamp === res.timestamp);
        });
      }
      this.updateAvgTimeSpent(this.filteredArr);
    }
  }

  resetAreaHistory() {
    if (this.player.account === this.partyService.currentPlayer.account) {
      const emptyHistory = this.settingsService.deleteAreas();
      this.mapService.updateLocalPlayerAreas(emptyHistory);
      this.player.pastAreas = emptyHistory;
      this.mapService.loadAreasFromSettings();
      this.accountService.player.next(this.player);
      this.partyService.selectedPlayer.next(this.player);
      this.partyService.updatePlayer(this.player);
      this.alertService.showAlert({ message: 'Area history was cleared', action: 'OK' });
    }
  }

  updateAvgTimeSpent(pastAreas) {
    if (pastAreas !== null) {
      if (pastAreas[0] !== undefined) {
        pastAreas = pastAreas.filter(x => x.duration > 0);
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
