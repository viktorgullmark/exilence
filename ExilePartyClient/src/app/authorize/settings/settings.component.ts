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
    { name: 'B', code: Keys.B },
    { name: 'C', code: Keys.C },
    { name: 'D', code: Keys.D },
    { name: 'E', code: Keys.E },
    { name: 'F', code: Keys.F },
    { name: 'G', code: Keys.G },
    { name: 'H', code: Keys.H },
    { name: 'I', code: Keys.I },
    { name: 'J', code: Keys.J },
    { name: 'K', code: Keys.K },
    { name: 'L', code: Keys.L },
    { name: 'M', code: Keys.M },
    { name: 'N', code: Keys.N },
    { name: 'O', code: Keys.O },
    { name: 'P', code: Keys.P },
    { name: 'Q', code: Keys.Q },
    { name: 'R', code: Keys.R },
    { name: 'S', code: Keys.S },
    { name: 'T', code: Keys.T },
    { name: 'U', code: Keys.U },
    { name: 'V', code: Keys.V },
    { name: 'W', code: Keys.W },
    { name: 'X', code: Keys.X },
    { name: 'Y', code: Keys.Y },
    { name: 'Z', code: Keys.Z },
  ];
  keybinds: any[];

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

    this.keybindService.keybinds.subscribe((binds: any[]) => {
      this.keybinds = binds.map(bind => ({
        triggerKeyCode: bind.keys.split('+')[1],
        modifierKeyCode: bind.keys.split('+')[0],
        event: bind.event,
        title: bind.title
      }));
      console.log('binds',this.keybinds);
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
    this.keybindService.resetKeybinds();
    this.settingsService.set('keybinds', undefined);
  }

  saveKeybinds() {
    this.keybindService.updateKeybinds(this.mapBindings(this.keybinds));
    this.settingsService.set('keybinds', this.mapBindings(this.keybinds));
  }

  // map bindings back to proper format
  mapBindings(binds: any[]) {
    return this.keybinds.map(bind => ({
      keys: bind.modifierKeyCode + '+' + bind.triggerKeyCode,
      event: bind.event,
      title: bind.title
    }));
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
