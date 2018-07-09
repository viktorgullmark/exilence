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
  private timer: any;

  private robotInterval: any;

  private exilePartyWindowRef: any;
  private pathOfExileWindowRef: any;
  private activeWindowTitle: string;
  private lastKeypressValues: number[];
  private clipboardValue: string;
  private activeWindow: any;

  constructor(
    private electronService: ElectronService,
    private logService: LogService
  ) {
    this.keyboard = this.electronService.robot.Keyboard;
    this.clipboard = this.electronService.robot.Clipboard;
    this.window = this.electronService.robot.Window;
    this.process = this.electronService.robot.Process;
    this.timer = this.electronService.robot.Timer;

    this.Initialize();
    this.robotInterval = setInterval(() => this.robotHearbeat(), 100);
  }

  private Initialize() {
    if (this.clipboard.hasText()) {
      this.clipboardValue = this.clipboard.getText();
    }

    const poeWindow = this.findWindowByTitle('Path of Exile');
    if (poeWindow) {
      this.pathOfExileWindowRef = poeWindow;
    }
    const exilePartyWindow = this.findWindowByTitle('ExileParty');
    if (exilePartyWindow) {
      this.exilePartyWindowRef = exilePartyWindow;
    }

  }

  private findWindowByTitle(title: string) {
    const windowList = this.window.getList(title);
    if (windowList.length === 1) {
      return windowList[0];
    }
    return null;
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
    this.activeWindow = this.window.getActive();
    this.activeWindowTitle = this.activeWindow.getTitle();

  }

  public firstActivate() {
    this.window.setActive(this.pathOfExileWindowRef);
    this.window.setActive(this.exilePartyWindowRef);
  }

  private setPathOfExileWindowToActive(): boolean {
    if (this.pathOfExileWindowRef) {
      this.window.setActive(this.pathOfExileWindowRef);
      // It might take some time, but we will do everything we can to activate the window.
      for (let i = 0; i < 5; i++) {
        if (this.activeWindow !== this.pathOfExileWindowRef) {
          this.window.setActive(this.pathOfExileWindowRef);
        }
        this.timer.sleep(50, 50);
      }
      return true;
    }
    this.logService.log('Could not set Path of Exile window to active.', null, true);
    return false;
  }

  public sendTextToPathWindow(text: string): boolean {

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

  private prepareStringForRobot(string: string) {
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

  public setTextToClipboard(text: string) {
    this.clipboard.setText(text);
  }

}
