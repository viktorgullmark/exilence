import { Component, Input, OnDestroy, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';

import { NetWorthItem, NetWorthSnapshot } from '../../../shared/interfaces/income.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';
import { SettingsService } from '../../../shared/providers/settings.service';
import { Party } from '../../../shared/interfaces/party.interface';
import { TableHelper } from '../../../shared/helpers/table.helper';

@Component({
  selector: 'app-networth-table',
  templateUrl: './networth-table.component.html',
  styleUrls: ['./networth-table.component.scss']
})
export class NetworthTableComponent implements OnInit, OnDestroy {
  @Input() multiple = false;
  @Input() showOverTime = false;
  @Output() differenceChanged: EventEmitter<any> = new EventEmitter;
  @Output() filtered: EventEmitter<any> = new EventEmitter;
  // tslint:disable-next-line:max-line-length
  displayedColumns: string[] = ['position', 'name', 'links', 'quality', 'gemLevel', 'corrupted', 'stacksize', 'valuePerUnit', 'value'];
  dataSource = [];
  searchText = '';
  filteredArr = [];
  party: Party;
  public totalDifference = 0;
  private selectedFilterValueSub: Subscription;
  source: any;
  @ViewChild(MatSort) sort: MatSort;

  private partySub: Subscription;

  constructor(private partyService: PartyService, private settingsService: SettingsService) { }

  ngOnInit() {
    if (!this.showOverTime) {
      this.displayedColumns.push('holdingPlayers');
    }
    if (this.multiple) {
      // party logic
      this.filter();

      this.partySub = this.partyService.partyUpdated.subscribe(party => {
        if (party !== undefined ||
          // if a player left the party, skip this step and rely on other subcription to update
          ((this.party !== undefined && this.party.players.length > party.players.length)
            || this.party === undefined)) {
          this.party = party;
          this.dataSource = [];
          const foundPlayer = party.players.find(x => x.character.name === this.partyService.selectedFilterValue);
          // update values for entire party, or a specific player, depending on selection
          if (this.partyService.selectedFilterValue !== 'All players' && foundPlayer !== undefined) {
            this.loadPlayerData(foundPlayer);
          } else {
            party.players.forEach(p => {
              if (p.netWorthSnapshots !== null) {
                this.loadPlayerData(p);
              }
            });
          }
          this.filter();
        }
      });

      this.selectedFilterValueSub = this.partyService.selectedFilterValueSub.subscribe(res => {
        if (res !== undefined) {
          this.partyService.selectedFilterValue = res;
          this.dataSource = [];
          const foundPlayer = this.party.players.find(x => x.character.name === this.partyService.selectedFilterValue);
          // update values for entire party, or a specific player, depending on selection
          if (this.partyService.selectedFilterValue !== 'All players' && foundPlayer !== undefined) {
            this.loadPlayerData(foundPlayer);
          } else {
            this.party.players.forEach(p => {
              if (p.netWorthSnapshots !== null) {
                this.loadPlayerData(p);
              }
            });
          }
          this.filter();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
    if (this.selectedFilterValueSub !== undefined) {
      this.selectedFilterValueSub.unsubscribe();
    }
  }

  getIconLink(snapshot: any) {
    // render higher resolution icons for all maps
    if (snapshot.name.indexOf(' Map') > -1) {
      snapshot.icon = snapshot.icon.replace('w=1&h=1', 'w=2&h=2');
    }
    return snapshot.icon;
  }

  generateTooltip(item: NetWorthItem) {
    const min = item.value_min !== undefined ? item.value_min.toFixed(2) : 0;
    const max = item.value_max !== undefined ? item.value_max.toFixed(2) : 0;
    const mode = item.value_mode !== undefined ? item.value_mode.toFixed(2) : 0;
    const median = item.value_median !== undefined ? item.value_median.toFixed(2) : 0;
    const average = item.value_average !== undefined ? item.value_average.toFixed(2) : 0;
    const quantity = item.quantity !== undefined ? item.quantity.toFixed(2) : 0; // TODO: Check why quantity is 0

    // tslint:disable-next-line:max-line-length
    return `Min: ${min}\nMax: ${max}\nMode: ${mode}\nMedian: ${median}\nAverage: ${average}\n`;
  }

  doSearch(text: string) {
    this.searchText = text;

    this.filter();
  }

  updateGainHours(hours: number) {
    this.dataSource = [];
    this.partyService.party.players.forEach(p => {
      if (p.netWorthSnapshots !== null) {
        this.loadPlayerData(p);
      }
    });
    this.filter();
  }

  filter() {
    this.filteredArr = [...this.dataSource];
    this.filteredArr = this.filteredArr.filter(item =>
      Object.keys(item).some(k => item[k] != null && item[k] !== '' &&
        item[k].toString().toLowerCase()
          .includes(this.searchText.toLowerCase()))
    );

    this.source = new MatTableDataSource(this.filteredArr);
    this.source.sort = this.sort;

    // emit event to parentcomponent, for export etc
    this.filtered.emit(this.filteredArr);
  }

  loadPlayerData(player: Player) {
    if (this.showOverTime) {

      const gainHours = this.settingsService.get('gainHours');
      const xHoursAgo = (Date.now() - (gainHours * 60 * 60 * 1000));
      const pastHoursSnapshots = player.netWorthSnapshots
        .filter((snaphot: NetWorthSnapshot) => snaphot.timestamp > xHoursAgo);

      if (pastHoursSnapshots.length > 1) {
        const firstSnapshot = pastHoursSnapshots[pastHoursSnapshots.length - 1];
        const lastSnapshot = pastHoursSnapshots[0];
        const difference = [];

        const removedItems = firstSnapshot.items.filter(x =>
          TableHelper.findNetworthObj(lastSnapshot.items, x) === undefined
        );
        const changedItems = lastSnapshot.items.filter(x =>
          TableHelper.findNetworthObj(firstSnapshot.items, x) !== undefined
        );
        const addedItems = lastSnapshot.items.filter(x =>
          TableHelper.findNetworthObj(firstSnapshot.items, x) === undefined
        );

        const changedOrAdded = changedItems.concat(addedItems);
        changedOrAdded.forEach(item => {
          // if item exists in first snapshot
          const existingItem = TableHelper.findNetworthObj(firstSnapshot.items, item);

          if (existingItem !== undefined) {
            const recentItem = Object.assign({}, item);
            recentItem.stacksize = recentItem.stacksize - existingItem.stacksize;
            existingItem.value = recentItem.valuePerUnit * existingItem.stacksize;
            recentItem.value = recentItem.value - existingItem.value;
            if (recentItem.value !== 0 && recentItem.stacksize !== 0) {
              difference.push(recentItem);
            }
          } else {
            if (item.value !== 0 && item.stacksize !== 0) {
              difference.push(item);
            }
          }
        });

        removedItems.forEach(item => {
          const existingItem = TableHelper.findNetworthObj(lastSnapshot.items, item);
          const recentItem = Object.assign({}, item);
          if (recentItem.value !== 0 && recentItem.stacksize !== 0) {
            if (existingItem !== undefined) {
              recentItem.stacksize = existingItem.stacksize - recentItem.stacksize;
              existingItem.value = recentItem.valuePerUnit * existingItem.stacksize;
              recentItem.value = existingItem.value - recentItem.value;
            } else {
              recentItem.value = -Math.abs(recentItem.value);
              recentItem.stacksize = -Math.abs(recentItem.stacksize);
            }
            difference.push(recentItem);
          }
        });
        this.updateOverTime(difference, player.character.name);
      }
    } else {
      this.updateTable(player.netWorthSnapshots[0].items, player.character.name);
    }
  }

  loadPreviousSnapshot(snapshot: NetWorthSnapshot) {
    this.dataSource = [];
    const foundPlayer = this.party.players.find(x => x.character.name === this.partyService.selectedFilterValue);
    // only do this if a specific player is selected
    if (foundPlayer !== undefined) {
      this.updateTable(snapshot.items, foundPlayer.character.name);
    }
    this.filter();
  }

  isDivinationCard(icon: string) {
    return icon.indexOf('/Divination/') > -1;
  }

  updateOverTime(items: NetWorthItem[], playerName: string) {
    items.forEach(snapshot => {
      const existingItem = TableHelper.findNetworthObj(this.dataSource, snapshot);
      if (existingItem !== undefined) {
        const indexOfItem = this.dataSource.indexOf(existingItem);
        // update existing item with new data
        if (snapshot.stacksize + existingItem.stacksize !== 0) {
          existingItem.stacksize = snapshot.stacksize + existingItem.stacksize;
          existingItem.value = snapshot.value + existingItem.value;
          // fix for existing items not containing these props
          existingItem.quality = snapshot.quality;
          existingItem.links = snapshot.links;
          existingItem.frameType = snapshot.frameType;
          this.dataSource[indexOfItem] = existingItem;
        }
      } else {
        const index = items.indexOf(snapshot) + 1;
        const newObj = TableHelper.formatNetworthObj(snapshot, index, this.getIconLink(snapshot), playerName);
        if (snapshot.value !== 0 && snapshot.stacksize !== 0) {
          this.dataSource.push(newObj);
        }
      }
    });
  }

  updateTable(items: NetWorthItem[], playerName: string) {
    items.forEach(snapshot => {
      const existingItem = TableHelper.findNetworthObj(this.dataSource, snapshot);
      if (existingItem !== undefined) {
        const indexOfItem = this.dataSource.indexOf(existingItem);
        // update existing item with new data
        existingItem.stacksize = existingItem.stacksize + snapshot.stacksize;
        existingItem.value = existingItem.value + snapshot.value;
        existingItem.holdingPlayers.push(playerName);
        // fix for existing items not containing these props
        existingItem.quality = snapshot.quality;
        existingItem.links = snapshot.links;
        this.dataSource[indexOfItem] = existingItem;
      } else {
        const index = items.indexOf(snapshot) + 1;
        const newObj = TableHelper.formatNetworthObj(snapshot, index, this.getIconLink(snapshot), playerName);
        if (snapshot.value !== 0 && snapshot.stacksize !== 0) {
          this.dataSource.push(newObj);
        }
      }
    });
  }
}



