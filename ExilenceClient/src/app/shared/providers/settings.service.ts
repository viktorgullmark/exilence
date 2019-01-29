import { Injectable } from '@angular/core';

import { ElectronService } from './electron.service';
import { LogService } from './log.service';
const _ = window.require('lodash');


@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  settings = null;
  isChangingStash = false;
  constructor(private electronService: ElectronService, private logService: LogService) {
  }

  set(key: string, object: any) {
    try {
      this.electronService.settings.set(key, object);
      _.set(this.settings, key, object);
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  get(key: string) {
    try {
      this.cacheSettings();
      return _.get(this.settings, key);
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  getAll() {
    try {
      this.cacheSettings();
      return this.settings;
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  deleteAll() {
    try {
      this.electronService.settings.deleteAll();
      this.settings = null;
    } catch (e) {
      this.logService.log(e, null, true);
    }
  }
  deleteNetWorth() {
    const netWorthHistory = {
      lastSnapshot: 0,
      history: [{
        timestamp: 0,
        value: 0,
        items: []
      }]
    };
    try {
      this.electronService.settings.set('networth', netWorthHistory);
      _.set(this.settings, 'networth', netWorthHistory);
    } catch (e) {
      this.logService.log(e, null, true);
    }
    return netWorthHistory;
  }
  deleteAreas() {
    const areas = [];
    try {
      this.electronService.settings.set('areas', areas);
      _.set(this.settings, 'areas', areas);
    } catch (e) {
      this.logService.log(e, null, true);
    }
    return areas;
  }
  private cacheSettings() {
    if (!this.settings) {
      this.settings = this.electronService.settings.getAll();
    }
  }
}
