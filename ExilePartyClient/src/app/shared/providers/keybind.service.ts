import { Injectable } from '@angular/core';

import { BehaviorSubject } from '../../../../node_modules/rxjs/internal/BehaviorSubject';
import { Keybind } from '../interfaces/keybind.interface';
import { LogService } from './log.service';
import { RobotService } from './robot.service';
import { SettingsService } from './settings.service';
import { ElectronService } from './electron.service';


@Injectable()
export class KeybindService {

  public keybindEvent: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public keybinds: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private userKeybinds: Keybind[] = [];
  private registeredBinds: Keybind[] = [];
  public activeBinds: Keybind[] = [];

  constructor(
    private settingsService: SettingsService,
    private electronService: ElectronService,
    private robotService: RobotService
  ) {

    this.electronService.ipcRenderer.on('keybind', (event, bind) => {
      this.keybindEvent.next(bind.event);
    });

    this.robotService.activeWindowTitleSub.subscribe(res => {
      if (res === 'Path of Exile' || res === 'ExileParty') {
        this.electronService.ipcRenderer.send('keybinds-update', this.activeBinds);
      } else {
        this.electronService.ipcRenderer.send('keybinds-unregister');
      }
    });

    // this.updateKeybinds([{ keys: '7', event: 'party-personal-networth', title: 'Report personal net worth to party' }]);

    const binds = this.settingsService.get('keybinds');
    if (binds !== undefined) {
      this.userKeybinds = binds;
      this.updateUserOverrides();
    }
  }

  public registerKeybind(keys: string, event: string, title: string) {
    const bind = { keys, event, title, enabled: true };
    this.registeredBinds.unshift(bind);
    this.updateUserOverrides();
  }

  public resetKeybinds() {
    this.userKeybinds = [];
    this.activeBinds = this.deepClone(this.registeredBinds);
    this.updateUserOverrides();
  }

  public updateKeybinds(keybinds: Keybind[]) {
    this.userKeybinds = keybinds;
    this.updateUserOverrides();
  }

  private updateUserOverrides() {

    this.activeBinds = this.deepClone(this.registeredBinds);

    for (let i = 0; i < this.activeBinds.length; i++) {
      const bind = this.activeBinds[i];
      for (let j = 0; j < this.userKeybinds.length; j++) {
        const savedBind = this.userKeybinds[j];
        if (bind.event === savedBind.event) {
          bind.keys = savedBind.keys;
          bind.enabled = savedBind.enabled;
          break;
        }
      }
    }

    this.keybinds.next(this.activeBinds.slice());
    this.electronService.ipcRenderer.send('keybinds-update', this.activeBinds);
  }

  private deepClone(array: Keybind[]): Keybind[] {
    return JSON.parse(JSON.stringify(array));
  }

}

