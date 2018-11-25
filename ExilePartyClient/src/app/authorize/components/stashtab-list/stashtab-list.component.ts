import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

import { Stash, Tab } from '../../../shared/interfaces/stash.interface';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SettingsService } from '../../../shared/providers/settings.service';
import { Subscription } from 'rxjs';
import { StashService } from '../../../shared/providers/stash.service';
import { AlertService } from '../../../shared/providers/alert.service';

@Component({
  selector: 'app-stashtab-list',
  templateUrl: './stashtab-list.component.html',
  styleUrls: ['./stashtab-list.component.scss']
})
export class StashtabListComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['select', 'position', 'name'];
  searchText = '';
  filteredArr = [];
  source: any;
  dataSource: any;
  @ViewChild(MatSort) sort: MatSort;
  @Input() validated: boolean;

  selection = new SelectionModel<any>(true, []);
  private stash: Stash;
  constructor(
    private settingsService: SettingsService,
    private externalService: ExternalService,
    private partyService: PartyService,
    private stashService: StashService,
    private alertService: AlertService
  ) {
    this.stashService.stash.subscribe(res => {
      this.stash = res;
      this.init();
    });
  }

  ngOnInit() {
    // temporarily until implemented
    this.init();

    this.settingsService.isChangingStash = true;
  }

  init() {
    let selectedStashTabs: any[] = this.settingsService.get('selectedStashTabs');

    if (selectedStashTabs === undefined) {
      selectedStashTabs = [];
      for (let i = 0; i < 6; i++) {
        selectedStashTabs.push({ name: this.stash.tabs[i].n, position: this.stash.tabs[i].i });
      }
    }

    this.dataSource = this.stash.tabs.map((tab: Tab) => {
      return { position: tab.i, name: tab.n };
    });

    this.dataSource.forEach(r => {
      selectedStashTabs.forEach(t => {
        if (r.position === t.position) {
          this.toggle(this.selection, r);
        }
      });
    });

    this.filter();
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

    this.source = new MatTableDataSource(this.filteredArr);
    this.source.sort = this.sort;
  }

  checkSelectionLength(row) {
    if (this.selection.selected.length > 20 && !this.selection.isSelected(row)) {
      this.alertService.showAlert({ message: 'You can select at most 20 stash tabs', action: 'OK' });
    }
  }

  toggle(selection, row) {

    this.selection.toggle(row);
    this.settingsService.set('selectedStashTabs', selection.selected);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.source.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.source.data.forEach(row => this.selection.select(row));

    this.settingsService.set('selectedStashTabs', this.selection.selected);
  }

  ngOnDestroy() {
    this.settingsService.isChangingStash = false;
  }

}
