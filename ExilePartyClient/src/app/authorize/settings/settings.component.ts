import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AnalyticsService } from '../../shared/providers/analytics.service';
import { StashtabListComponent } from '../components/stashtab-list/stashtab-list.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;

  @ViewChild('table') table: StashtabListComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
  private analyticsService: AnalyticsService
  ) {
    this.form = fb.group({
      searchText: ['']
    });
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/settings');
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }
}
