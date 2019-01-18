import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AlertService } from '../../shared/providers/alert.service';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { LogService } from '../../shared/providers/log.service';
import { SessionService } from '../../shared/providers/session.service';
import { SettingsService } from '../../shared/providers/settings.service';
import { StashtabListComponent } from '../components/stashtab-list/stashtab-list.component';

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
  gainHours = 1;
  netWorthHistoryDays = 14;

  @ViewChild('table') table: StashtabListComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private electronService: ElectronService,
    private settingsService: SettingsService,
    private sessionService: SessionService,
    private alertService: AlertService,
    private logService: LogService
  ) {
    this.form = fb.group({
      searchText: ['']
    });

  }

  ngOnInit() {
    const settings = this.settingsService.getAll();

    this.sessionId = this.sessionService.getSession();

    this.sessionIdValid = settings.account.sessionIdValid;
    this.itemValueTreshold =
      settings.itemValueTreshold !== undefined ? settings.itemValueTreshold : 1;
    this.gainHours =
      settings.gainHours !== undefined ? settings.gainHours : 3;
    this.netWorthHistoryDays =
      settings.netWorthHistoryDays !== undefined ? settings.netWorthHistoryDays : 14;
    if (!this.sessionIdValid || this.sessionId === '') {
      this.selectedIndex = 1;
    }

    this.analyticsService.sendScreenview('/authorized/settings');

    const onTopSetting = settings.alwaysOnTop;

    if (onTopSetting !== undefined) {
      this.alwaysOnTop = onTopSetting;
    }

    const isResizableSetting = settings.isResizable;

    if (isResizableSetting !== undefined) {
      this.isResizable = isResizableSetting;
    }

    const hideTooltipsSetting = settings.hideTooltips;
    if (hideTooltipsSetting !== undefined) {
      this.hideTooltips = hideTooltipsSetting;
    }

    const lowConfidencePricingSetting = settings.lowConfidencePricing;
    if (lowConfidencePricingSetting !== undefined) {
      this.lowConfidencePricing = lowConfidencePricingSetting;
    }

    const characterePricingSetting = settings.characterPricing;
    if (characterePricingSetting !== undefined) {
      this.characterPricing = characterePricingSetting;
    }
  }

  ngOnDestroy() {
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
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

  toggleNetWorthHistoryDays(event) {
    this.settingsService.set('netWorthHistoryDays', +event.value);
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
