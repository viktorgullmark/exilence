import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { PartyService } from './party.service';
import { Player } from '../interfaces/player.interface';
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
}
