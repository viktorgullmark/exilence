import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatSelect, MatTabGroup } from '@angular/material';
import { ExportToCsv } from 'export-to-csv';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { Party } from '../../../shared/interfaces/party.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { AccountService } from '../../../shared/providers/account.service';
import { AlertService } from '../../../shared/providers/alert.service';
import { ElectronService } from '../../../shared/providers/electron.service';
import { IncomeService } from '../../../shared/providers/income.service';
import { MessageValueService } from '../../../shared/providers/message-value.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SettingsService } from '../../../shared/providers/settings.service';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { NetworthTableComponent } from '../../components/networth-table/networth-table.component';
import { RemoveSnapshotDialogComponent } from './remove-snapshot-dialog/remove-snapshot.component';

@Component({
  selector: 'app-party-summary',
  templateUrl: './party-summary.component.html',
  styleUrls: ['./party-summary.component.scss']
})
export class PartySummaryComponent implements OnInit, OnDestroy {
  @ViewChild('table') table: NetworthTableComponent;
  @ViewChild('overTimeTable') overTimeTable: NetworthTableComponent;
  @ViewChild('networthTabs') networthTabs: MatTabGroup;
  @ViewChild('playerDd') playerDd: MatSelect;

  public gainHours: number;
  public selectedIndex = 0;
  public graphDimensions = [950, 300];
  public totalDifference = 0;
  public party: Party;
  public partyGain = 0;
  public form: FormGroup;
  public isGraphHidden = false;

  private partySub: Subscription;
  private playerSub: Subscription;
  private selectedFilterValueSub: Subscription;
  private partyGainSub: Subscription;
  private player: Player;
  private tableData = [];
  private overtimeData = [];
  public selectedFilterValue: string;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    public messageValueService: MessageValueService,
    private dialog: MatDialog,
    public partyService: PartyService,
    public incomeService: IncomeService,
    private accountService: AccountService,
    private alertService: AlertService,
    private settingsService: SettingsService,
    public electronService: ElectronService
  ) {
    this.form = fb.group({
      searchText: [''],
      searchTextOverTime: ['']
    });

    this.gainHours = 1;
    if (this.electronService.isElectron()) {
      this.gainHours = this.settingsService.get('gainHours');
    }

    this.partyGainSub = this.messageValueService.partyGainSubject.subscribe(res => {
      this.partyGain = res;
    });

    this.playerSub = this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }
  ngOnInit() {
    this.partySub = this.partyService.partyUpdated.subscribe(res => {
      if (res !== undefined) {
        this.party = res;

        let valueToSelect = this.partyService.selectedFilterValue;
        // check if the current dropdown selection is a player in our party
        const foundPlayer = this.party.players.find(x =>
          x.character !== null && x.character.name === this.partyService.selectedFilterValue);

        // if player left or value is incorrect, update dropdown
        if (foundPlayer === undefined && this.partyService.selectedFilterValue !== 'All players') {
          // force-set the value here, since the subscription wont finish in time, should be reworked
          valueToSelect = 'All players';
          this.partyService.selectedFilter.next(valueToSelect);
          if (this.playerDd !== undefined) {
            this.playerDd.value = 'All players';
          }
        }
        let networth = 0;
        if (valueToSelect === 'All players' || valueToSelect === undefined) {
          this.messageValueService.partyGainSubject.next(0);
          this.partyService.updatePartyGain(this.partyService.party.players);
          res.players.forEach(p => {
            if (p.netWorthSnapshots[0] !== undefined) {
              networth = networth + p.netWorthSnapshots[0].value;
            }
          });
          // if a specific player is selected, update values for that
        } else if (foundPlayer !== undefined) {
          this.partyService.updatePartyGain([foundPlayer]);
          networth = foundPlayer.netWorthSnapshots[0].value;
        }

        // finally send values to msgvalueservice, to update the overlay
        this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
        this.messageValueService.partyValueSubject.next(networth);
      }
    });
    this.selectedFilterValueSub = this.partyService.selectedFilter.subscribe(res => {
      if (res !== undefined) {
        this.selectedFilterValue = res;
        // update the tables whenever the value changes
        this.updateFilterValue(res);
        if (this.playerDd !== undefined) {
          this.playerDd.value = res;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.partyGainSub !== undefined) {
      this.partyGainSub.unsubscribe();
    }
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
    if (this.selectedFilterValueSub !== undefined) {
      this.selectedFilterValueSub.unsubscribe();
    }
  }

  removeSnapshot() {
    this.openRemovalDialog();
  }

  updateTableData(event: any[]) {
    this.tableData = event;
  }
  updateOverTimeData(event: any[]) {
    this.overtimeData = event;
  }

  selectPlayer(filterValue: any) {
    this.partyService.selectedFilter.next(filterValue.value);

    if (this.party !== undefined) {
      const foundPlayer = this.party.players.find(x => x.character !== null && x.character.name === this.selectedFilterValue);
      let networth = 0;
      // update values for entire party, or a specific player, depending on selection
      if (this.selectedFilterValue === 'All players' || this.selectedFilterValue === undefined) {
        this.messageValueService.partyGainSubject.next(0);
        this.partyService.updatePartyGain(this.partyService.party.players);
        this.party.players.forEach(p => {
          if (p.netWorthSnapshots[0] !== undefined) {
            networth = networth + p.netWorthSnapshots[0].value;
          }
        });
      } else if (foundPlayer !== undefined) {
        this.partyService.updatePartyGain([foundPlayer]);
        networth = foundPlayer.netWorthSnapshots[0].value;
      }
      this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
      this.messageValueService.partyValueSubject.next(networth);
    }
  }

  popout() {
    const data = {
      event: 'networth',
    };
    if (this.electronService.isElectron()) {
      this.electronService.ipcRenderer.send('popout-window', data);
      setTimeout(res => {
        this.electronService.ipcRenderer.send('popout-window-update', {
          event: 'networth',
          data: {
            networth: this.messageValueService.partyValue,
            gain: this.messageValueService.partyGain
          }
        });
      }, 1000);
    }
  }

  export() {
    const options = {
      fieldSeparator: ';',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Net worth export ' + moment(Date.now()).format('YYYY-MM-DD HH:MM'),
      useBom: true,
      useKeysAsHeaders: true,
      filename: 'Networth_' + moment(Date.now()).format('YYYY-MM-DD')
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };

    const csvExporter = new ExportToCsv(options);

    let dataToExport = [];
    if (this.selectedIndex === 0) {
      dataToExport = this.tableData;
    } else if (this.selectedIndex === 1) {
      dataToExport = this.overtimeData;
    }

    if (dataToExport.length > 0) {
      csvExporter.generateCsv(this.mapToExport(dataToExport));
    }
  }

  // todo: move this to a helper-lib
  mapToExport(items: any[]) {
    return items.map(x => {
      return {
        NAME: x.name,
        QUANTITY: x.stacksize,
        VALUE: x.valuePerUnit,
        TOTAL: x.value
      };
    });
  }

  updateFilterValue(filterValue) {
    if (this.party !== undefined) {
      const foundPlayer = this.party.players.find(x => x.character !== null && x.character.name === filterValue);

      // update tables with new value

      if (this.table !== undefined) {
        this.table.dataSource = [];
      }
      if (this.overTimeTable !== undefined) {
        this.overTimeTable.dataSource = [];
      }

      if (foundPlayer !== undefined) {
        if (this.table !== undefined) {
          this.table.loadPlayerData(foundPlayer);
        }
        if (this.overTimeTable !== undefined) {
          this.overTimeTable.loadPlayerData(foundPlayer);
        }
      } else {
        this.party.players.forEach(p => {
          if (p.netWorthSnapshots !== null && p.character !== null) {
            if (this.table !== undefined) {
              this.table.loadPlayerData(p);
            } if (this.overTimeTable !== undefined) {
              this.overTimeTable.loadPlayerData(p);
            }
          }
        });
      }

      // finally render the data onto the tables
      if (this.table !== undefined) {
        this.table.filter();
      }
      if (this.overTimeTable !== undefined) {
        this.overTimeTable.filter();
      }
    }
  }

  updateDifference(event) {
    this.totalDifference = event;
  }

  resetNetWorth() {
    const player = this.player;
    if (player.account === this.partyService.currentPlayer.account) {
      const emptyHistory = this.settingsService.deleteNetWorth();
      player.netWorthSnapshots = emptyHistory.history;
      this.incomeService.loadSnapshotsFromSettings();
      this.accountService.player.next(player);
      this.partyService.selectedPlayer.next(player);
      this.partyService.updatePlayer(player);
      setTimeout(() => {
        this.alertService.showAlert({ message: 'Net worth history was cleared', action: 'OK' });
      }, 2000);
    }
  }

  toggleGainHours(event: any) {
    this.settingsService.set('gainHours', +event.value);
    if (this.overTimeTable !== undefined) {
      this.overTimeTable.updateGainHours(+event.value);
    }
    this.gainHours = +event.value;

    if (this.party !== undefined) {
      const foundPlayer = this.party.players.find(x => x.character !== null && x.character.name === this.partyService.selectedFilterValue);
      let networth = 0;
      if (this.partyService.selectedFilterValue === 'All players' || this.partyService.selectedFilterValue === undefined) {
        this.messageValueService.partyGainSubject.next(0);
        this.partyService.updatePartyGain(this.partyService.party.players);
        this.party.players.forEach(p => {
          if (p.netWorthSnapshots[0] !== undefined) {
            networth = networth + p.netWorthSnapshots[0].value;
          }
        });
      } else if (foundPlayer !== undefined) {
        this.partyService.updatePartyGain([foundPlayer]);
        networth = foundPlayer.netWorthSnapshots[0].value;
      }
      this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
      this.messageValueService.partyValueSubject.next(networth);
    }
  }

  openSummaryDialog(): void {
    if (!this.settingsService.get('diaShown_partySummary') &&
      !this.settingsService.get('hideTooltips') &&
      this.electronService.isElectron()) {
      const dialogRef = this.dialog.open(InfoDialogComponent, {
        width: '650px',
        data: {
          icon: 'attach_money',
          title: 'Currency',
          content: 'This tab updates when a partymember changes area in game, at most once every 2 minutes.<br/><br/>' +
            'We store all your parties net worth data two weeks back in time. This will be extended in the future.'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.settingsService.set('diaShown_partySummary', true);
      });
    }
  }

  openRemovalDialog(): void {
    if (this.electronService.isElectron()) {
      const dialogRef = this.dialog.open(RemoveSnapshotDialogComponent, {
        width: '425px'
      });
      dialogRef.afterClosed().subscribe(result => {
      });
    }
  }

  toggleGraph(event: boolean) {
    this.isGraphHidden = true;
  }

  hideGraph() {
    this.isGraphHidden = true;
  }

  showGraph() {
    this.isGraphHidden = false;
  }

  search() {
    if (this.table !== undefined) {
      this.table.doSearch(this.form.controls.searchText.value);
    }
  }

  searchOverTime() {
    if (this.overTimeTable !== undefined) {
      this.overTimeTable.doSearch(this.form.controls.searchTextOverTime.value);
    }
  }

  handleTabEvent() {
    // clear filter-fields when tab is changed
    this.form.controls.searchText.setValue('');
    this.form.controls.searchTextOverTime.setValue('');
  }
}
