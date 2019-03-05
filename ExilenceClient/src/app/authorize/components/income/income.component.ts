import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { colorSets as ngxChartsColorsets } from '@swimlane/ngx-charts/release/utils/color-sets';
import * as d3 from 'd3';
import * as moment from 'moment';
import { ContextMenuComponent } from 'ngx-contextmenu';
import { Subscription } from 'rxjs/internal/Subscription';

import { ChartSeries, ChartSeriesEntry } from '../../../shared/interfaces/chart.interface';
import { Party } from '../../../shared/interfaces/party.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { AccountService } from '../../../shared/providers/account.service';
import { ElectronService } from '../../../shared/providers/electron.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SettingsService } from '../../../shared/providers/settings.service';
import { ServerMessageDialogComponent } from '../server-message-dialog/server-message-dialog.component';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})


export class IncomeComponent implements OnInit, OnDestroy {
  dateData: ChartSeries[] = [];
  @Input() player: Player;
  @Input() view = [1000, 400];
  @Input() title = 'Net worth graph';
  @Output() hidden: EventEmitter<any> = new EventEmitter;
  @Output() loadPrevious: EventEmitter<any> = new EventEmitter;
  @Output() removeSnapshot: EventEmitter<any> = new EventEmitter;

  @ViewChild(ContextMenuComponent) public badgeMenu: ContextMenuComponent;

  public isHidden = false;
  public visible = true;
  public isSummary = false;
  public foundPlayer: Player;

  public removalEnabled = false;

  public selectedSnapshot = {};

  private currentPlayer: Player;
  private partySubscription: Subscription;
  private currentPlayerSub: Subscription;
  private selectedFilterValueSub: Subscription;
  private party: Party;
  private interval;
  public timeline = false;

  // line interpolation
  curveType = 'Linear';
  curve = d3.curveLinear;

  colorScheme = {
    domain: ['#e91e63', '#f2f2f2', '#FFEE93', '#8789C0', '#45F0DF']
  };

  schemeType = 'ordinal';
  selectedColorScheme: string;

  constructor(
    public electronService: ElectronService,
    private partyService: PartyService,
    private settingService: SettingsService,
    private accountService: AccountService,
    private router: Router,
    private settingsService: SettingsService,
    private dialog: MatDialog
  ) {
    const timelineSetting = this.settingsService.get('timeline');
    if (timelineSetting !== undefined) {
      this.timeline = timelineSetting;
    } else {
      this.settingsService.set('timeline', false);
    }
  }

  anyPlayerSnapshots() {
    return this.party.players.find(x =>
      x.netWorthSnapshots !== undefined
      && x.netWorthSnapshots.length > 0
      && x.netWorthSnapshots[0].timestamp > 0
    ) !== undefined;
  }

  ngOnInit() {
    // party logic
    this.isSummary = true;
    // update the graph every minute, to update labels
    this.interval = setInterval(() => {
      this.dateData = [];
      this.foundPlayer = this.party.players.find(x => x.character !== null && x.character.name === this.partyService.selectedFilterValue);
      if (this.partyService.selectedFilterValue !== '0' && this.foundPlayer !== undefined) {
        this.updateGraph(this.foundPlayer);
      } else {
        this.party.players.forEach(p => {
          if (p.character !== null) {
            if (p.netWorthSnapshots !== null) {
              this.updateGraph(p);
            }
          }
        });
      }
    }, 60 * 1000);
    this.partySubscription = this.partyService.partyUpdated.subscribe(party => {
      if (party !== undefined ||
        // if a player left the party, skip this step and rely on other subcription to update
        ((this.party !== undefined && this.party.players.length > party.players.length)
          || this.party === undefined)) {
        this.dateData = [];
        this.party = party;

        // update values for entire party, or a specific player, depending on selection
        this.foundPlayer = this.party.players.find(x => x.character !== null
          && x.character.name === this.partyService.selectedFilterValue);
        if (this.partyService.selectedFilterValue !== '0' && this.foundPlayer !== undefined) {
          this.updateGraph(this.foundPlayer);
        } else {
          this.party.players.forEach(p => {
            if (p.character !== null) {
              if (p.netWorthSnapshots !== null) {
                this.updateGraph(p);
              }
            }
          });
        }
      }
    });
    this.currentPlayerSub = this.accountService.player.subscribe(res => {
      if (res !== undefined) {
        this.currentPlayer = res;
      }
    });
    // subscribe to dropdown for playerselection
    this.selectedFilterValueSub = this.partyService.selectedFilter.subscribe(res => {
      if (res !== undefined) {
        this.dateData = [];

        // update values for entire party, or a specific player, depending on selection
        this.foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === res);
        if (res !== '0' && this.foundPlayer !== undefined) {
          this.updateGraph(this.foundPlayer);
        } else {
          this.party.players.forEach(p => {
            if (p.character !== null) {
              if (p.netWorthSnapshots !== null) {
                this.updateGraph(p);
              }
            }
          });
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.partySubscription !== undefined) {
      this.partySubscription.unsubscribe();
    }
    if (this.currentPlayerSub !== undefined) {
      this.currentPlayerSub.unsubscribe();
    }
    if (this.selectedFilterValueSub !== undefined) {
      this.selectedFilterValueSub.unsubscribe();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  goToSettings() {
    this.router.navigate(['/authorized/settings']);
  }

  hideGraph() {
    this.isHidden = true;
    this.hidden.emit(this.isHidden);
  }

  showGraph() {
    this.isHidden = false;
    this.hidden.emit(this.isHidden);
  }

  updateGraph(player: Player) {
    const playerObj = Object.assign({}, player);

    let netWorthHistoryDays = 14;
    if (this.electronService.isElectron()) {
      const networthDaysSetting = this.settingService.get('netWorthHistoryDays');
      if (networthDaysSetting === undefined) {
        this.settingService.set('netWorthHistoryDays', netWorthHistoryDays);
      } else {
        netWorthHistoryDays = networthDaysSetting;
      }
    } else {
      netWorthHistoryDays = 1;
    }

    const daysAgo = moment().utc().subtract(netWorthHistoryDays, 'days');
    playerObj.netWorthSnapshots = playerObj.netWorthSnapshots.filter(x => moment.unix(x.timestamp).utc().isAfter(daysAgo));
    if (playerObj.netWorthSnapshots.length === 0) {
      playerObj.netWorthSnapshots = [{
        timestamp: 0,
        value: 0,
        items: []
      }];
    }

    const entry: ChartSeries = {
      name: playerObj.character.name + ' (' + moment.unix(playerObj.netWorthSnapshots[0].timestamp).utc().fromNow() + ')',
      series: playerObj.netWorthSnapshots.map(snapshot => {
        const seriesEntry: ChartSeriesEntry = {
          name: moment.unix(snapshot.timestamp).toDate(),
          value: snapshot.value,
          items: snapshot.items
        };
        return seriesEntry;
      })
    };
    if (playerObj.netWorthSnapshots[0].timestamp === 0) {
      if (this.player !== undefined) {
        this.dateData.push(entry);
      }
    } else {
      this.dateData.push(entry);
    }
    const data = [... this.dateData];
    this.dateData = data;
  }

  axisFormat(val) {
    return moment(val).format('MM-DD, LT');
  }

  setColorScheme(name) {
    this.selectedColorScheme = name;
    this.colorScheme = ngxChartsColorsets.find(s => s.name === name);
  }

  select(data): void {
    const snapshot = this.dateData[0].series.filter(t => {
      if (t.name === data.name) {
        return true;
      }
      return false;
    })[0];
    this.selectedSnapshot = snapshot;

    if (this.removalEnabled) {
      this.deleteSnapshot(snapshot);
    }
  }

  markForRemoval() {
    this.removeSnapshot.emit();
    this.removalEnabled = true;
    // only allow removal of snapshots for 20 seconds, in case of missclick
    setTimeout(() => {
      this.removalEnabled = false;
    }, 60 * 1);
  }

  deleteSnapshot(snapshot) {
    if (!this.partyService.updateInProgress && snapshot !== undefined) {
      let netWorthHistory;
      const character = this.settingService.getCurrentCharacter();
      if (character !== undefined) {
        netWorthHistory = character.networth;
      }
      const player = Object.assign({}, this.currentPlayer);
      const foundSnapshot = player.netWorthSnapshots.find(x => x.timestamp === moment(snapshot.name).utc().unix() &&
        x.value === snapshot.value);

      if (foundSnapshot !== undefined) {
        const indexOfSnapshot = player.netWorthSnapshots.indexOf(foundSnapshot);

        if (indexOfSnapshot > -1) {
          player.netWorthSnapshots = player.netWorthSnapshots.splice(indexOfSnapshot, 1);
        }

        if (netWorthHistory !== undefined) {
          netWorthHistory.history = player.netWorthSnapshots;
        }

        character.networth = netWorthHistory;
        this.settingsService.updateCharacter(character);

        this.accountService.player.next(player);
        this.partyService.updatePlayer(player);
      } else {
        setTimeout(() => {
          const dialogRef = this.dialog.open(ServerMessageDialogComponent, {
            width: '425px',
            data: {
              icon: 'error',
              title: 'Information',
              content: 'You can only remove your own snapshots.'
            }
          });
          dialogRef.afterClosed().subscribe(result => {
          });
        }, 0);
      }
    }
  }


  loadPreviousSnapshot(snapshot) {
    this.loadPrevious.emit(snapshot);
  }

  onLegendLabelClick(entry) {
  }

}
