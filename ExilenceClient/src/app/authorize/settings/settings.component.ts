import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Keys } from '../../shared/interfaces/key.interface';
import { AlertService } from '../../shared/providers/alert.service';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { KeybindService } from '../../shared/providers/keybind.service';
import { LogService } from '../../shared/providers/log.service';
import { SessionService } from '../../shared/providers/session.service';
import { SettingsService } from '../../shared/providers/settings.service';
import { StashtabListComponent } from '../components/stashtab-list/stashtab-list.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  selectedIndex = 0;
  alwaysOnTop = false;
  isResizable = false;
  hideTooltips = false;
  lowConfidencePricing = false;
  characterPricing = false;
  sessionId: string;
  sessionIdValid: boolean;
  uploaded = false;
  itemValueTreshold = 1;
  gainHours = 3;

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
    { name: 'F1', code: Keys.F1 },
    { name: 'F2', code: Keys.F2 },
    { name: 'F3', code: Keys.F3 },
    { name: 'F4', code: Keys.F4 },
    { name: 'F5', code: Keys.F5 },
    { name: 'F6', code: Keys.F6 },
    { name: 'F7', code: Keys.F7 },
    { name: 'F8', code: Keys.F8 },
    { name: 'F9', code: Keys.F9 },
    { name: 'F10', code: Keys.F10 },
    { name: 'F11', code: Keys.F11 },
    { name: 'F12', code: Keys.F12 },
  ];
  keybinds: any[];

  @ViewChild('table') table: StashtabListComponent;

  private keybindSub: Subscription;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private electronService: ElectronService,
    private settingsService: SettingsService,
    private keybindService: KeybindService,
    private sessionService: SessionService,
    private alertService: AlertService,
    private logService: LogService
  ) {
    this.form = fb.group({
      searchText: ['']
    });

    this.keybindSub = this.keybindService.keybinds.subscribe((binds: any[]) => {
      this.keybinds = binds.map(bind => ({
        triggerKeyCode: bind.keys.split('+')[1],
        modifierKeyCode: bind.keys.split('+')[0],
        event: bind.event,
        title: bind.title,
        enabled: bind.enabled
      }));
    });

    this.sessionId = this.sessionService.getSession();
    this.sessionIdValid = this.settingsService.get('account.sessionIdValid');
    this.itemValueTreshold =
      this.settingsService.get('itemValueTreshold') !== undefined ? this.settingsService.get('itemValueTreshold') : 1;
    this.gainHours =
      this.settingsService.get('gainHours') !== undefined ? this.settingsService.get('gainHours') : 3;
    if (!this.sessionIdValid || this.sessionId === '') {
      this.selectedIndex = 1;
    }
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/settings');

    const onTopSetting = this.settingsService.get('alwaysOnTop');

    if (onTopSetting !== undefined) {
      this.alwaysOnTop = onTopSetting;
    }

    const isResizableSetting = this.settingsService.get('isResizable');

    if (isResizableSetting !== undefined) {
      this.isResizable = isResizableSetting;
    }

    const hideTooltipsSetting = this.settingsService.get('hideTooltips');
    if (hideTooltipsSetting !== undefined) {
      this.hideTooltips = hideTooltipsSetting;
    }

    const lowConfidencePricingSetting = this.settingsService.get('lowConfidencePricing');
    if (lowConfidencePricingSetting !== undefined) {
      this.lowConfidencePricing = lowConfidencePricingSetting;
    }

    const characterePricingSetting = this.settingsService.get('characterPricing');
    if (characterePricingSetting !== undefined) {
      this.characterPricing = characterePricingSetting;
    }
  }

  ngOnDestroy() {
    if (this.keybindSub !== undefined) {
      this.keybindSub.unsubscribe();
    }
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
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
      keys: bind.modifierKeyode !== 'None' ? bind.modifierKeyCode + '+' + bind.triggerKeyCode : bind.triggerKeyCode,
      event: bind.event,
      title: bind.title,
      enabled: bind.enabled
    }));
  }

  search() {
    this.table.doSearch(this.form.controls.searchText.value);
  }

  toggleItemValueTreshold(event) {
    this.settingsService.set('itemValueTreshold', event.value);
  }

  toggleGainHours(event) {
    this.settingsService.set('gainHours', +event.value);
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

  toggleResizable() {
    if (this.isResizable) {
      this.electronService.remote.getCurrentWindow().setResizable(true);
      this.electronService.remote.getCurrentWindow().setMinimumSize(1344, 768);
      this.settingsService.set('isResizable', true);
    } else {
      this.electronService.remote.getCurrentWindow().setResizable(false);
      this.electronService.remote.getCurrentWindow().setMinimumSize(1344, 768);
      this.settingsService.set('isResizable', false);
    }

  }

  toggleHideTooltips() {
    if (this.hideTooltips) {
      this.settingsService.set('hideTooltips', true);
    } else {
      this.settingsService.set('hideTooltips', false);
    }
  }

  toggleLowConfidencePricing() {
    if (this.lowConfidencePricing) {
      this.settingsService.set('lowConfidencePricing', true);
    } else {
      this.settingsService.set('lowConfidencePricing', false);
    }
  }

  toggleCharacterPricing() {
    if (this.characterPricing) {
      this.settingsService.set('characterPricing', true);
    } else {
      this.settingsService.set('characterPricing', false);
    }
  }

  resetDialogs() {
    this.settingsService.set('diaShown_wealth', false);
    this.settingsService.set('diaShown_dashboard', false);
    this.settingsService.set('diaShown_equipment', false);
    this.settingsService.set('diaShown_maps', false);
    this.settingsService.set('diaShown_loginfo', false);
    this.settingsService.set('diaShown_partySummary', false);
  }

  upload() {
    this.electronService.sendLog();
    setTimeout(() => {
      this.uploaded = true;
      if (this.logService.lastError === false) {
        this.alertService.showAlert({ message: 'Information sent to Exilence server.', action: 'OK' });
      } else {
        this.alertService.showAlert({ message: 'Could not send information to Exilence server.', action: 'OK' });
      }
    }, 1000);
  }

  clearSettings() {
    this.settingsService.deleteAll();
    this.electronService.ipcRenderer.send('relaunch');
  }
}
