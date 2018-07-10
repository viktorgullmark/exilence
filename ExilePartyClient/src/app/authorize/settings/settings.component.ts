import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AnalyticsService } from '../../shared/providers/analytics.service';
import { StashtabListComponent } from '../components/stashtab-list/stashtab-list.component';
import { ElectronService } from '../../shared/providers/electron.service';
import { SettingsService } from '../../shared/providers/settings.service';
import { Keys } from '../../shared/interfaces/key.interface';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  selectedIndex = 0;
  alwaysOnTop = false;

  // temporary arrays
  modifierKeys = [
    { id: 1, name: 'Shift', code: Keys.Shift },
    { id: 2, name: 'Ctrl', code: Keys.Ctrl }
  ];
  triggerKeys = [
    { id: 1, name: 'F1', code: Keys.F1 },
    { id: 2, name: 'F2', code: Keys.F2 }
  ];
  keybinds = [
    { name: 'Send net worth summary to party', triggerKeyId: 1, modifierKeyId: 1 },
    { name: 'Test 2', triggerKeyId: 1, modifierKeyId: 2 },
    { name: 'Test 3', triggerKeyId: 2, modifierKeyId: 1 },
    { name: 'Test 4', triggerKeyId: 2, modifierKeyId: 2 }
  ];

  @ViewChild('table') table: StashtabListComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private electronService: ElectronService,
    private settingsService: SettingsService
  ) {
    this.form = fb.group({
      searchText: ['']
    });
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/settings');

    const onTopSetting = this.settingsService.get('alwaysOnTop');

    if (onTopSetting !== undefined) {
      this.alwaysOnTop = onTopSetting;
    }
  }

  resetKeybinds() {
    // todo: reset keybinds
  }

  saveKeybinds() {
    // todo: save keybinds
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }

  toggleAlwaysOnTop() {
    if (this.alwaysOnTop) {
      // set window on top
      this.electronService.remote.getCurrentWindow().setAlwaysOnTop(true);
      this.electronService.remote.getCurrentWindow().setVisibleOnAllWorkspaces(true);
      this.settingsService.set('alwaysOnTop', true);
    } else {
      // set normal
      this.electronService.remote.getCurrentWindow().setAlwaysOnTop(false);
      this.electronService.remote.getCurrentWindow().setVisibleOnAllWorkspaces(false);
      this.settingsService.set('alwaysOnTop', false);
    }
  }
}
