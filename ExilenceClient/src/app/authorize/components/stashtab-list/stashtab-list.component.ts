import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import { Stash, Tab } from '../../../shared/interfaces/stash.interface';
import { AlertService } from '../../../shared/providers/alert.service';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SettingsService } from '../../../shared/providers/settings.service';

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
  private stashTabSub: Subscription;
  constructor(
    private settingsService: SettingsService,
    private externalService: ExternalService,
    private partyService: PartyService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    // temporarily until implemented
    this.init();

    this.settingsService.isChangingStash = true;
  }

  init() {
    const sessionId = this.settingsService.get('account.sessionId');
    const accountName = this.settingsService.get('account.accountName');
    const league = this.partyService.currentPlayer.character.league;
    let selectedStashTabs: any[] = this.settingsService.get('selectedStashTabs');

    if (selectedStashTabs === undefined) {
      selectedStashTabs = [];
      for (let i = 0; i < 4; i++) {
        selectedStashTabs.push({ name: '', position: i });
      }
    }

    this.stashTabSub = this.externalService.getStashTabs(sessionId, accountName, league)
      .subscribe((res: Stash) => {
        if (res !== null) {
          this.dataSource = res.tabs.map((tab: Tab) => {
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

    this.source = new MatTableDataSource(this.filteredArr);
    this.source.sort = this.sort;
  }

  checkSelectionLength(row) {
    if (this.selection.selected.length > 20 && !this.selection.isSelected(row)) {
      this.showAlert();
    }
  }

  showAlert() {
    this.alertService.showAlert({ message: 'You can select at most 20 stash tabs', action: 'OK' });
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
    this.isAllSelected() || this.selection.selected.length >= 20 ?
      this.selection.clear() :
      this.source.data.forEach(row => {
        if (this.selection.selected.length < 21) {
          this.selection.select(row);
        } else { this.showAlert(); }
      });

    this.settingsService.set('selectedStashTabs', this.selection.selected);
  }

  ngOnDestroy() {
    if (this.stashTabSub !== undefined) {
      this.stashTabSub.unsubscribe();
    }
    this.settingsService.isChangingStash = false;
  }

}
