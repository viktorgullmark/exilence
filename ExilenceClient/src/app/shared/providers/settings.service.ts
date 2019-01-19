import { Injectable } from '@angular/core';

import { ElectronService } from './electron.service';
import { LogService } from './log.service';
const get = window.require('lodash/get');
const isequal = window.require('lodash.isequal');


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
    } catch (e) {
      this.logService.log(e);
    }
  }
  get(key: string) {
    try {
      if (!this.settings) {
        this.getAll();
      }
      const a = this.electronService.settings.get(key);
      const b = get(this.settings, key);
      if (!isequal(a, b)) {
        console.log(a);
        console.log(b);
        console.log('error');
      }
      return get(this.settings, key);
    } catch (e) {
      this.logService.log(e);
    }
  }
  getAll() {
    try {
      this.settings = this.electronService.settings.getAll();
      return this.settings;
    } catch (e) {
      this.logService.log(e);
    }
  }
  deleteAll() {
    try {
      this.electronService.settings.deleteAll();
    } catch (e) {
      this.logService.log(e);
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
    } catch (e) {
      this.logService.log(e);
    }
    return netWorthHistory;
  }
  deleteAreas() {
    const areas = [];
    try {
      this.electronService.settings.set('areas', areas);
    } catch (e) {
      this.logService.log(e);
    }
    return areas;
  }
}
