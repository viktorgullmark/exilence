import { Injectable } from '@angular/core';

import { ElectronService } from './electron.service';

@Injectable()
export class SettingsService {
  constructor(private electronService: ElectronService) {

  }

  set(key: string, object: any) {
    this.electronService.settings.set(key, object);
  }
  get(key: string) {
    return this.electronService.settings.get(key);
  }
  deleteAll() {
    this.electronService.settings.deleteAll();
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
    this.electronService.settings.set('networth', netWorthHistory);
    return netWorthHistory;
  }
}
