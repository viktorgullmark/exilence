import { Injectable } from '@angular/core';

import { Keys } from '../interfaces/key.interface';
import { ElectronService } from './electron.service';
import { LogService } from './log.service';

@Injectable()
export class RobotService {

  private keyboard: any;
  private clipboard: any;
  private window: any;
  private process: any;

  private robotInterval: any;

  private pathOfExileWindowRef: any;
  private activeWindowTitle: string;
  private lastKeypressValues: number[];
  private clipboardValue: string;

  constructor(
    private electronService: ElectronService,
    private logService: LogService
  ) {
    this.keyboard = this.electronService.robot.Keyboard;
    this.clipboard = this.electronService.robot.Clipboard;
    this.window = this.electronService.robot.Window;
    this.process = this.electronService.robot.Process;

    this.Initialize();
    this.robotInterval = setInterval(() => this.robotHearbeat(), 100);
  }

  private Initialize() {
    if (this.clipboard.hasText()) {
      this.clipboardValue = this.clipboard.getText();
    }
  }

  private robotHearbeat() {

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
    // if (pressedKeys.length > 0) {
    //   console.log(pressedKeys);
    // }

    // Window
    const activeWindow = this.window.getActive();
    this.activeWindowTitle = activeWindow.getTitle();
    // if (this.activeWindowTitle === 'Path of Exile') {
    if (this.activeWindowTitle.indexOf('Path of Exile') !== -1) {
      this.pathOfExileWindowRef = activeWindow;
    }
  }

  private setPathOfExileWindowToActive(): boolean {
    if (this.pathOfExileWindowRef) {
      this.window.setActive(this.pathOfExileWindowRef);
      return true;
    }
    this.logService.log('Could not set path window to active.', null, true);
    return false;
  }

  sendTextToPathWindow(text: string): boolean {

    const isWindowActive = this.setPathOfExileWindowToActive();
    if (isWindowActive) {
      const keyboard = this.keyboard();

      keyboard.autoDelay.min = 0;
      keyboard.autoDelay.max = 0;
      keyboard.click(Keys.Enter);
      keyboard.click(this.prepareStringForRobot(text));
      keyboard.click(Keys.Enter);
      return true;
    }
    this.logService.log('Could not send text to path window: ', text, true);
    return false;
  }

  prepareStringForRobot(string: string) {
    string = string.split('_').join('+-');
    string = string.split('@').join('%^2');
    string = string.split('!').join('+1');
    string = string.split('(').join('+8');
    string = string.split(')').join('+9');
    string = string.split('"').join('+2');
    string = string.split(';').join('+{COMMA}');
    string = string.split(',').join('{COMMA}');
    string = string.split(':').join('+{PERIOD}');
    string = string.split('.').join('{PERIOD}');
    string = string.split('~').join('-');
    string = string.split('/').join('+7');
    return string;
  }

}
