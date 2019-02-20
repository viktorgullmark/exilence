import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, NgZone } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import * as moment from 'moment';
import { Subscription } from 'rxjs/internal/Subscription';

import { ExtendedAreaInfo } from '../../../shared/interfaces/area.interface';
import { NetWorthItem } from '../../../shared/interfaces/income.interface';
import { Party } from '../../../shared/interfaces/party.interface';
import { MapService } from '../../../shared/providers/map.service';
import { PartyService } from '../../../shared/providers/party.service';
import { GainTooltipComponent } from './gain-tooltip/gain-tooltip.component';

@Component({
  selector: 'app-map-table',
  templateUrl: './map-table.component.html',
  styleUrls: ['./map-table.component.scss']
})
export class MapTableComponent implements OnInit, OnDestroy {

  @Output() filtered: EventEmitter<any> = new EventEmitter;
  displayedColumns: string[] = ['timestamp', 'name', 'tier', 'time', 'gain'];
  dataSource = [];
  searchText = '';
  filteredArr = [];
  rowWidth = 0;
  source: any;
  party: Party;
  gain: NetWorthItem[];
  selected = {
    name: '',
    tier: 0,
    time: 0,
    timestamp: 0
  };
  private selectedFilterValueSub: Subscription;
  private partySub: Subscription;
  public selectedPlayerValue: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(GainTooltipComponent) tooltip: GainTooltipComponent;

  constructor(private partyService: PartyService, private mapService: MapService, public el: ElementRef, private ngZone: NgZone) {
  }

  ngOnInit() {
    this.partySub = this.partyService.partyUpdated.subscribe(party => {
      if (party !== undefined) {
        this.party = party;

        let foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.selectedPlayerValue);

        // temporary check
        if (this.partyService.selectedFilterValue === 'All players') {
          this.selectedPlayerValue = this.getPlayers()[0].character.name;
        } else if (foundPlayer !== undefined) {
          this.selectedPlayerValue = this.partyService.selectedFilterValue;
        } else {
          this.selectedPlayerValue = this.getPlayers()[0].character.name;
        }

        this.partyService.selectedFilterValueSub.next(this.selectedPlayerValue);

        foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.selectedPlayerValue);

        this.dataSource = [];
        if (foundPlayer !== undefined) {
          if (foundPlayer.pastAreas !== null && foundPlayer.pastAreas !== undefined) {
            if (foundPlayer.account === this.partyService.currentPlayer.account) {
              this.updateTable(foundPlayer.pastAreas);
            } else {
              this.updateTable(foundPlayer.pastAreas);
            }
          }
          this.filter();
        }
      }
    });
    this.selectedFilterValueSub = this.partyService.selectedFilterValueSub.subscribe(res => {
      if (res !== undefined) {
        const foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.selectedPlayerValue);
        if (this.partyService.selectedFilterValue === 'All players') {
          this.selectedPlayerValue = this.getPlayers()[0].character.name;
        } else if (foundPlayer !== undefined) {
          this.selectedPlayerValue = this.partyService.selectedFilterValue;
        } else {
          this.selectedPlayerValue = this.getPlayers()[0].character.name;
        }
        this.dataSource = [];
        if (foundPlayer !== undefined) {
          if (foundPlayer.pastAreas !== null && foundPlayer.pastAreas !== undefined) {
            if (foundPlayer.account === this.partyService.currentPlayer.account) {
              this.updateTable(foundPlayer.pastAreas);
            } else {
              this.updateTable(foundPlayer.pastAreas);
            }
          }
          this.filter();
        }
      }
    });
  }

  updateTooltip(element, el, table) {
    if (element === undefined) {
      element = {
        name: '',
        tier: 0,
        time: 0,
        timestamp: 0
      };
    }

    this.selected = element;

    if (this.selected.timestamp > 0) {

      this.gain = element.items;

      this.rowWidth = table._elementRef.nativeElement.clientWidth;
      this.tooltip.top = el.top;
      this.tooltip.left = el.left;
      this.tooltip.reposition(el);
      this.tooltip.renderItems(this.gain);
    }
  }

  getPlayers() {
    return this.party.players.filter(x => x.character !== null);
  }

  ngOnDestroy() {
    if (this.selectedFilterValueSub !== undefined) {
      this.selectedFilterValueSub.unsubscribe();
    }
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
  }

  doSearch(text: string) {
    this.searchText = text;

    this.filter();
  }

  filter() {
    setTimeout(res => {
      this.filteredArr = [...this.dataSource];
      this.filteredArr = this.filteredArr.filter(item =>
        Object.keys(item).some(k => item[k] != null && item[k] !== '' &&
          item[k].toString().toLowerCase()
            .includes(this.searchText.toLowerCase()))
      );

      this.ngZone.run(() => {
        this.source = new MatTableDataSource(this.filteredArr);
        this.source.paginator = this.paginator;
        this.source.sort = this.sort;
        this.filtered.emit({ filteredArr: this.filteredArr, dataSource: this.dataSource });
      });
    }, 0);
  }

  formatDate(timestamp) {
    return moment(timestamp).format('llll');
  }

  updateTable(pastAreas: ExtendedAreaInfo[]) {
    if (pastAreas !== null && pastAreas !== undefined) {
      pastAreas.forEach((area: ExtendedAreaInfo) => {
        if (area.duration < 1800) {
          this.dataSource.push(this.formatTableObject(area));
          area.subAreas.forEach(subArea => {
            this.dataSource.push(this.formatTableObject(subArea));
          });
        }
      });
    }
  }

  formatTableObject(area: ExtendedAreaInfo) {
    area.difference = area.difference === undefined ? [] : area.difference;
    const minute = Math.floor(area.duration / 60);
    const seconds = area.duration % 60;
    const newAreaObj = {
      items: area.difference,
      gain: area.difference.map(i => i.value).reduce((a, b) => a + b, 0),
      name: area.eventArea.name,
      tier: area.eventArea.info[0].level,
      time: ((minute < 10) ? '0' + minute.toString() : minute.toString())
        + ':' + ((seconds < 10) ? '0' + seconds.toString() : seconds.toString()),
      timestamp: area.timestamp
    };
    return newAreaObj;
  }

}

