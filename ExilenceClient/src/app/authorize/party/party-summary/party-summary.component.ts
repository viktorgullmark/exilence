import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTabGroup } from '@angular/material';
import { Subscription } from 'rxjs';

import { MessageValueService } from '../../../shared/providers/message-value.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SettingsService } from '../../../shared/providers/settings.service';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { NetworthTableComponent } from '../../components/networth-table/networth-table.component';
import { AccountService } from '../../../shared/providers/account.service';
import { AlertService } from '../../../shared/providers/alert.service';
import { IncomeService } from '../../../shared/providers/income.service';
import { Player } from '../../../shared/interfaces/player.interface';
import { Party } from '../../../shared/interfaces/party.interface';

@Component({
  selector: 'app-party-summary',
  templateUrl: './party-summary.component.html',
  styleUrls: ['./party-summary.component.scss']
})
export class PartySummaryComponent implements OnInit, OnDestroy {
  form: FormGroup;

  isGraphHidden = false;
  @ViewChild('table') table: NetworthTableComponent;
  @ViewChild('overTimeTable') overTimeTable: NetworthTableComponent;
  @ViewChild('networthTabs') networthTabs: MatTabGroup;
  gainHours: number;
  selectedIndex = 0;
  public graphDimensions = [950, 300];
  private partyGainSub: Subscription;
  public selectedFilterValue;
  private player: Player;
  public party: Party;
  public partyGain = 0;
  private partySub: Subscription;
  private playerSub: Subscription;
  private selectedFilterValueSub: Subscription;
  public totalDifference = 0;
  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    public messageValueService: MessageValueService,
    private dialog: MatDialog,
    private partyService: PartyService,
    private incomeService: IncomeService,
    private accountService: AccountService,
    private alertService: AlertService,
    private settingsService: SettingsService
  ) {
    this.form = fb.group({
      searchText: [''],
      searchTextOverTime: ['']
    });
    this.gainHours = this.settingsService.get('gainHours');

    this.partyGainSub = this.messageValueService.partyGainSubject.subscribe(res => {
      this.partyGain = res;
    });

    this.playerSub = this.accountService.player.subscribe(res => {
      this.player = res;
    });

    this.selectedFilterValueSub = this.partyService.selectedFilterValue.subscribe(res => {
      this.selectedFilterValue = res;
      this.updateFilterValue(this.selectedFilterValue);
    });

    this.partySub = this.partyService.partyUpdated.subscribe(res => {
      if (res !== undefined) {
        this.party = res;
        let networth = 0;
        this.messageValueService.partyGainSubject.next(0);
        this.partyService.updatePartyGain(this.partyService.party.players);
        res.players.forEach(p => {
          if (p.netWorthSnapshots[0] !== undefined) {
            networth = networth + p.netWorthSnapshots[0].value;
          }
        });
        this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
        this.messageValueService.partyValueSubject.next(networth);
      }
    });
  }
  ngOnInit() {
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

  selectPlayer(filterValue) {
    this.partyService.selectedFilterValue.next(filterValue.value);
  }

  updateFilterValue(filterValue) {
    if (this.party !== undefined) {
      const foundPlayer = this.party.players.find(x => x.character.name === filterValue);

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
          if (p.netWorthSnapshots !== null) {
            if (this.table !== undefined) {
              this.table.loadPlayerData(p);
            } if (this.overTimeTable !== undefined) {
              this.overTimeTable.loadPlayerData(p);
            }
          }
        });
      }

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

  toggleGainHours(event) {
    this.settingsService.set('gainHours', +event.value);
    if (this.overTimeTable !== undefined) {
      this.overTimeTable.updateGainHours(+event.value);
    }
    this.gainHours = +event.value;

    this.messageValueService.partyGainSubject.next(0);
    this.partyService.updatePartyGain(this.partyService.party.players);
    this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
  }

  openSummaryDialog(): void {
    if (!this.settingsService.get('diaShown_partySummary') && !this.settingsService.get('hideTooltips')) {
      const dialogRef = this.dialog.open(InfoDialogComponent, {
        width: '650px',
        data: {
          icon: 'attach_money',
          title: 'Currency',
          // tslint:disable-next-line:max-line-length
          content: 'This tab updates when a partymember changes area in game, at most once every 3 minutes.<br/><br/>' +
            'We store all your parties net worth data two weeks back in time. This will be extended in the future.'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.settingsService.set('diaShown_partySummary', true);
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
