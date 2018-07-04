import { Injectable } from '@angular/core';

import { Keys } from '../interfaces/key.interface';
import { ElectronService } from './electron.service';

@Injectable()
export class RobotService {

  keyboard: any;
  clipboard: any;

  robotInterval: any;

  lastKeypressValues: number[];
  clipboardValue: string;

  constructor(
    private electronService: ElectronService
  ) {
    this.keyboard = this.electronService.robot.Keyboard;
    this.clipboard = this.electronService.robot.Clipboard;

    this.Initialize();
    this.robotInterval = setInterval(() => this.robotHearbeat(), 100);
  }

  Initialize() {
    if (this.clipboard.hasText()) {
      this.clipboardValue = this.clipboard.getText();
    }
  }

  robotHearbeat() {

    // Clipboard
    if (this.clipboard.hasText()) {
      const clip = this.clipboard.getText();
      if (clip !== this.clipboardValue) {
        this.clipboardValue = this.clipboard.getText();
        console.log(this.clipboardValue);
      }
    }

    // Keyboard
    const keyState = this.keyboard.getState();
    const pressedKeys = [];
    for (const key of Object.keys(Keys)) {
      const pressed = keyState[key];
      if (pressed) {
        pressedKeys.unshift(key);
      }
    }
    if (pressedKeys.length > 0) {
      console.log(pressedKeys);
    }




  }

}
