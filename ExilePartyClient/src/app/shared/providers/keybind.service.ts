import { Injectable } from '@angular/core';
import { interval } from 'rxjs/observable/interval';
import { throttle } from 'rxjs/operators';

import { BehaviorSubject } from '../../../../node_modules/rxjs/internal/BehaviorSubject';
import { Keys } from '../interfaces/key.interface';
import { Keybind } from '../interfaces/keybind.interface';
import { RobotService } from './robot.service';
import { SettingsService } from './settings.service';


@Injectable()
export class KeybindService {

  public keybindEvent: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public keybinds: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private savedBinds: Keybind[] = [];
  private localKeybinds: Keybind[] = [];

  constructor(
    private robotService: RobotService,
    private settingsService: SettingsService
  ) {

    this.registerKeybind(Keys.Ctrl, Keys.S, 'party-networth', 'Report Networth to party');

    const binds = this.settingsService.get('keybinds');
    if (binds !== undefined) {
      this.savedBinds = binds;
      this.updateUserOverrides();
    }

    // Robot service emits event every 0.1 secounds if matches, throttle here so we don't spam
    // We should filter the list here instead of in the robot service since we only care about 2+ keys
    // But other keybinds could care about only one (logout macro)
    this.robotService.pressedKeysList
      .pipe(throttle(val => interval(1000)))
      .subscribe(t => this.checkKeybinds(t));
  }

  public registerKeybind(modifierKeyCode: number, triggerKeyCode: number, event: string, description: string) {
    this.localKeybinds.unshift({
      modifierKeyCode,
      triggerKeyCode,
      event,
      description
    });
    this.updateUserOverrides();
  }

  public updateKeybinds(keybinds: Keybind[]) {
    this.savedBinds = keybinds;
    this.updateUserOverrides();
  }

  private updateUserOverrides() {
    for (let i = 0; i < this.localKeybinds.length; i++) {
      const bind = this.localKeybinds[i];
      for (let j = 0; j < this.savedBinds.length; j++) {
        const savedBind = this.savedBinds[j];
        if (bind.event === savedBind.event) {
          bind.modifierKeyCode = savedBind.modifierKeyCode;
          bind.triggerKeyCode = savedBind.triggerKeyCode;
          break;
        }
      }
    }
    this.keybinds.next(this.localKeybinds);
  }

  private checkKeybinds(pressedKeys: number[]) {
    this.localKeybinds.forEach(bind => {
      const match = (pressedKeys.indexOf(bind.modifierKeyCode) !== -1) && (pressedKeys.indexOf(bind.triggerKeyCode) !== -1);
      if (match) {
        this.keybindEvent.next(bind.event);
        console.log('keybind matched');
      }
    });
  }

}

