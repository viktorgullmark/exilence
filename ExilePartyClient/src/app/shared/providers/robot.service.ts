import { Injectable } from '@angular/core';

import { Keys } from '../interfaces/key.interface';
import { ElectronService } from './electron.service';

@Injectable()
export class RobotService {

  keyboard: any;
  clipboard: any;
  window: any;
  process: any;

  robotInterval: any;

  pathOfExileWindowRef: any;
  activeWindowTitle: string;
  lastKeypressValues: number[];
  clipboardValue: string;

  constructor(
    private electronService: ElectronService
  ) {
    this.keyboard = this.electronService.robot.Keyboard;
    this.clipboard = this.electronService.robot.Clipboard;
    this.window = this.electronService.robot.Window;
    this.process = this.electronService.robot.Process;

    this.Initialize();
    this.robotInterval = setInterval(() => this.robotHearbeat(), 100);

    setInterval(() => {
      this.setPathOfExileWindowToActive();
    }, 15 * 1000);
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

    // Window
    const activeWindow = this.window.getActive();
    this.activeWindowTitle = activeWindow.getTitle();
    if (this.activeWindowTitle === 'Path of Exile') {
      this.pathOfExileWindowRef = activeWindow;
    }
  }

  setPathOfExileWindowToActive() {
    if (this.pathOfExileWindowRef) {
      this.window.setActive(this.pathOfExileWindowRef);
      const range = this.electronService.robot.Range(5, 10);
      this.keyboard().autoDelay.min = 10;
      this.keyboard().autoDelay.max = 30;
      this.keyboard().click(Keys.Enter);
      this.keyboard().click('Short message');
      this.keyboard().click(Keys.Enter);
    }
  }

}
