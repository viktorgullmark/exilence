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
    // if (this.activeWindowTitle === 'Path of Exile') {
    if (this.activeWindowTitle.indexOf('Path of Exile') !== -1) {
      this.pathOfExileWindowRef = activeWindow;
    }
  }

  setPathOfExileWindowToActive(): boolean {
    if (this.pathOfExileWindowRef) {
      this.window.setActive(this.pathOfExileWindowRef);
      return true;
    }
    return false;
  }

  sendTextToPathWindow(text: string): boolean {

    const isWindowActive = this.setPathOfExileWindowToActive();
    if (isWindowActive) {
      const keyboard = this.keyboard();

      keyboard.autoDelay.min = 0;
      keyboard.autoDelay.max = 0;
      keyboard.click(Keys.Enter);
      keyboard.click(text);
      keyboard.click(Keys.Enter);
      return true;
    }
    return false;
  }

}
