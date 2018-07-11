import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Keys } from '../../shared/interfaces/key.interface';
import { Keybind } from '../../shared/interfaces/keybind.interface';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { KeybindService } from '../../shared/providers/keybind.service';
import { SettingsService } from '../../shared/providers/settings.service';
import { StashtabListComponent } from '../components/stashtab-list/stashtab-list.component';

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
    { name: 'Shift', code: Keys.Shift },
    { name: 'Ctrl', code: Keys.Ctrl },
    { name: 'Alt', code: Keys.Alt }
  ];
  triggerKeys = [
    { name: 'A', code: Keys.A },
    { name: 'S', code: Keys.S },
    { name: 'D', code: Keys.D }
  ];
  keybinds: Keybind[] = [];

  @ViewChild('table') table: StashtabListComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private electronService: ElectronService,
    private settingsService: SettingsService,
    private keybindService: KeybindService
  ) {
    this.form = fb.group({
      searchText: ['']
    });

    this.keybindService.keybinds.subscribe((binds: Keybind[]) => {
      this.keybinds = binds;
    });

  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/settings');

    const onTopSetting = this.settingsService.get('alwaysOnTop');

    if (onTopSetting !== undefined) {
      this.alwaysOnTop = onTopSetting;
    }
  }
  compareKeyCodes(c1: any, c2: any): boolean {
    return +c1 === +c2;
  }

  resetKeybinds() {
    this.keybindService.resetKeybinds();
    this.settingsService.set('keybinds', undefined);
  }

  saveKeybinds() {

    const numberBinds = this.keybinds.slice();
    for (let i = 0; i < numberBinds.length; i++) {
      const bind = numberBinds[i];
      bind.modifierKeyCode = +bind.modifierKeyCode;
      bind.triggerKeyCode = +bind.triggerKeyCode;
    }

    this.keybindService.updateKeybinds(numberBinds);
    this.settingsService.set('keybinds', numberBinds);
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
