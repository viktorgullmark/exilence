import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AlertService } from '../../shared/providers/alert.service';
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
  neutralGain = false;
  isResizable = false;
  timeline = false;
  hideTooltips = false;
  lowConfidencePricing = false;
  inventoryPricing = false;
  characterPricing = false;
  mapPricing = true;
  sessionId: string;
  sessionIdValid: boolean;
  uploaded = false;
  itemValueTreshold = 1;
  gainHours = 1;
  netWorthHistoryDays = 14;
  automaticPricing = true;
  jewellerConversion = true;

  @ViewChild('table') table: StashtabListComponent;

  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private electronService: ElectronService,
    private settingsService: SettingsService,
    private sessionService: SessionService,
    private alertService: AlertService,
    private logService: LogService
  ) {
    this.form = fb.group({
      searchText: ['']
    });

    this.sessionId = this.sessionService.getSession();
    this.sessionIdValid = this.settingsService.get('profile.sessionIdValid');
    this.itemValueTreshold =
      this.settingsService.get('itemValueTreshold') !== undefined ? this.settingsService.get('itemValueTreshold') : 1;
    this.gainHours =
      this.settingsService.get('gainHours') !== undefined ? this.settingsService.get('gainHours') : 3;
    this.netWorthHistoryDays =
      this.settingsService.get('netWorthHistoryDays') !== undefined ? this.settingsService.get('netWorthHistoryDays') : 14;
    if (!this.sessionIdValid || this.sessionId === '') {
      this.selectedIndex = 1;
    }
  }

  ngOnInit() {

    const onTopSetting = this.settingsService.get('alwaysOnTop');

    if (onTopSetting !== undefined) {
      this.alwaysOnTop = onTopSetting;
    }

    const neutralGainSetting = this.settingsService.get('neutralGain');

    if (neutralGainSetting !== undefined) {
      this.neutralGain = neutralGainSetting;
    }

    const timelineSetting = this.settingsService.get('timeline');

    if (timelineSetting !== undefined) {
      this.timeline = timelineSetting;
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

    const jewellerConversionSetting = this.settingsService.get('jewellerConversion');
    if (jewellerConversionSetting !== undefined) {
      this.jewellerConversion = jewellerConversionSetting;
    }

    const automaticPricingSetting = this.settingsService.get('automaticPricing');
    if (automaticPricingSetting !== undefined) {
      this.automaticPricing = automaticPricingSetting;
    }

    const mapPricingSetting = this.settingsService.get('mapPricing');
    if (mapPricingSetting !== undefined) {
      this.mapPricing = mapPricingSetting;
    }

    const inventoryPricingSetting = this.settingsService.get('inventoryPricing');
    if (inventoryPricingSetting !== undefined) {
      this.inventoryPricing = inventoryPricingSetting;
    }

    const characterePricingSetting = this.settingsService.get('characterPricing');
    if (characterePricingSetting !== undefined) {
      this.characterPricing = characterePricingSetting;
    }
  }

  ngOnDestroy() {
  }

  openLink(link: string) {
    if (this.electronService.isElectron()) {
      this.electronService.shell.openExternal(link);
    } else {
      window.open(link, '_blank');
    }
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

  toggleNeutralGain() {
    if (this.neutralGain) {
      this.settingsService.set('neutralGain', true);
    } else {
      this.settingsService.set('neutralGain', false);
    }
  }

  toggleTimeline() {
    if (this.timeline) {
      this.settingsService.set('timeline', true);
    } else {
      this.settingsService.set('timeline', false);
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

  toggleJewellerConversion() {
    if (this.jewellerConversion) {
      this.settingsService.set('jewellerConversion', true);
    } else {
      this.settingsService.set('jewellerConversion', false);
    }
  }

  toggleAutomaticPricing() {
    if (this.automaticPricing) {
      this.settingsService.set('automaticPricing', true);
    } else {
      this.settingsService.set('automaticPricing', false);
    }
  }

  toggleMapPricing() {
    if (this.mapPricing) {
      this.settingsService.set('mapPricing', true);
    } else {
      this.settingsService.set('mapPricing', false);
    }
  }

  toggleInventoryPricing() {
    if (this.inventoryPricing) {
      this.settingsService.set('inventoryPricing', true);
    } else {
      this.settingsService.set('inventoryPricing', false);
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
    if (this.electronService.isElectron()) {
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
  }

  clearSettings() {
    if (this.electronService.isElectron()) {
      this.settingsService.deleteAll();
      this.electronService.ipcRenderer.send('relaunch');
    }
  }
}
