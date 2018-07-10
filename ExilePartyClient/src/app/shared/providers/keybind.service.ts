import { Injectable } from '@angular/core';
import { interval } from 'rxjs/observable/interval';
import { throttle } from 'rxjs/operators';

import { BehaviorSubject } from '../../../../node_modules/rxjs/internal/BehaviorSubject';
import { Keys } from '../interfaces/key.interface';
import { RobotService } from './robot.service';
import { SettingsService } from './settings.service';





@Injectable({
  providedIn: 'root'
})
export class KeybindService {

  public keybindEvent: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public keybinds: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private savedBinds: any[] = [];
  private localKeybinds: any[] = [];

  constructor(
    private robotService: RobotService,
    private settingsService: SettingsService
  ) {

    this.registerKeybind([Keys.A, Keys.S], 'test');

    // this.savedBinds = this.settingsService.get('keybinds');
    this.updateUserOverrides();

    // Robot service emits event every 0.1 secounds if matches, throttle here so we don't spam
    // We should filter the list here instead of in the robot service since we only care about 2+ keys
    // But other keybinds could care about only one (logout macro)
    this.robotService.pressedKeysList
      .pipe(throttle(val => interval(1000)))
      .subscribe(t => this.checkKeybinds(t));

  }

  public registerKeybind(eventKeys: number[], eventName: string) {
    this.localKeybinds.unshift({
      keys: eventKeys,
      event
    });
    this.updateUserOverrides();
  }

  public updateKeybinds(keybinds: any[]) {
    this.savedBinds = keybinds;
    this.updateUserOverrides();
  }

  private updateUserOverrides() {
    for (let i = 0; i < this.localKeybinds.length; i++) {
      const bind = this.localKeybinds[i];
      for (let j = 0; j < this.savedBinds.length; j++) {
        const savedBind = this.savedBinds[j];
        if (bind.event === savedBind.event) {
          bind.keys = savedBind.keys;
          break;
        }
      }
    }
    this.keybinds.next(this.localKeybinds);
  }

  private checkKeybinds(pressedKeys: number[]) {
    this.localKeybinds.forEach(bind => {
      const match = bind.keys.every((val) => pressedKeys.includes(val));
      if (match) {
        this.keybindEvent.next(bind.event);
        console.log('keybind matched');
      }
    });
  }

}

