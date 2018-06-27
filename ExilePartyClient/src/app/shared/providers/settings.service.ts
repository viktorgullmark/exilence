import { Injectable } from '@angular/core';

import { ElectronService } from './electron.service';

@Injectable()
export class SettingsService {
  constructor(private electronService: ElectronService) {

  }

  set(key: string, object: any) {
    this.electronService.settings.set(key, object);
    console.log('[INFO]: Settings saved: ', this.electronService.settings.getAll());
  }
  get(key: string) {
    return this.electronService.settings.get(key);
  }
  deleteAll() {
    this.electronService.settings.deleteAll();
  }
}
