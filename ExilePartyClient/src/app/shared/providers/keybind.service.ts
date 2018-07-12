import { Injectable } from '@angular/core';
import { interval } from 'rxjs/observable/interval';
import { throttle } from 'rxjs/operators';

import { BehaviorSubject } from '../../../../node_modules/rxjs/internal/BehaviorSubject';
import { Keys } from '../interfaces/key.interface';
import { Keybind } from '../interfaces/keybind.interface';
import { LogService } from './log.service';
import { RobotService } from './robot.service';
import { SettingsService } from './settings.service';


@Injectable()
export class KeybindService {

  public keybindEvent: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public keybinds: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private userKeybinds: Keybind[] = [];
  private registeredBinds: Keybind[] = [];
  private activeBinds: Keybind[] = [];

  constructor(
    private robotService: RobotService,
    private settingsService: SettingsService,
    private logService: LogService
  ) {

    const binds = this.settingsService.get('keybinds');
    if (binds !== undefined) {
      this.userKeybinds = binds;
      this.updateUserOverrides();
    }

    // Robot service emits event every 0.1 secounds if matches, throttle here so we don't spam
    // We should filter the list here instead of in the robot service since we only care about 2+ keys
    // But other keybinds could care about only one (logout macro)
    this.robotService.pressedKeysList
      .pipe(throttle(val => interval(1000)))
      .subscribe(t => this.checkKeybinds(t));
  }

  public registerKeybind(modifierKeyCode: number, triggerKeyCode: number, event: string, title: string) {

    const bind = { modifierKeyCode, triggerKeyCode, event, title };

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
          bind.modifierKeyCode = savedBind.modifierKeyCode;
          bind.triggerKeyCode = savedBind.triggerKeyCode;
          break;
        }
      }
    }

    this.keybinds.next(this.activeBinds.slice());
  }

  private checkKeybinds(pressedKeys: number[]) {
    this.activeBinds.forEach(bind => {
      const match = (pressedKeys.indexOf(bind.modifierKeyCode) !== -1) && (pressedKeys.indexOf(bind.triggerKeyCode) !== -1);
      if (match) {
        this.keybindEvent.next(bind.event);
        this.logService.log('Keybind triggered', bind.event, false);
      }
    });
  }

  private deepClone(array: Keybind[]): Keybind[] {
    return JSON.parse(JSON.stringify(array));
  }

}

