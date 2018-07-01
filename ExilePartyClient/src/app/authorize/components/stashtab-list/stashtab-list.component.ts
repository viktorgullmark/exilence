import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

import { Stash, Tab } from '../../../shared/interfaces/stash.interface';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SettingsService } from '../../../shared/providers/settings.service';

@Component({
  selector: 'app-stashtab-list',
  templateUrl: './stashtab-list.component.html',
  styleUrls: ['./stashtab-list.component.scss']
})
export class StashtabListComponent implements OnInit {

  displayedColumns: string[] = ['select', 'position', 'name'];
  searchText = '';
  filteredArr = [];
  source: any;
  @ViewChild(MatSort) sort: MatSort;

  selection = new SelectionModel<any>(true, []);

  constructor(
    private settingsService: SettingsService,
    private externalService: ExternalService,
    private partyService: PartyService
  ) { }

  ngOnInit() {
    // temporarily until implemented
    this.init();
  }

  init() {
    const sessionId = this.settingsService.get('account.sessionId');
    const accountName = this.settingsService.get('account.accountName');
    const league = this.partyService.currentPlayer.character.league;
    const selectedStashTabs = this.settingsService.get('account.selectedStashTabs');

    this.externalService.getStashTabs(sessionId, accountName, league)
      .subscribe((res: Stash) => {
        this.source = res.tabs.map((tab: Tab) => {
          return { position: tab.i, name: tab.n };
        });
        this.filter();
      });
  }

  doSearch(text: string) {
    this.searchText = text;
    this.filter();
  }

  filter() {
    this.filteredArr = [...this.source];
    this.filteredArr = this.filteredArr.filter(item =>
      Object.keys(item).some(k => item[k] != null && item[k] !== '' &&
        item[k].toString().toLowerCase()
          .includes(this.searchText.toLowerCase()))
    );

    this.source = new MatTableDataSource(this.filteredArr);
    this.source.sort = this.sort;
  }

  toggle(selection, row) {
    this.selection.toggle(row);

    this.settingsService.set('account.selectedStashTabs', selection.selected);
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
  }

}
