import { Injectable } from '@angular/core';

import { BehaviorSubject } from '../../../../node_modules/rxjs/internal/BehaviorSubject';
import { Keys } from '../interfaces/key.interface';
import { ElectronService } from './electron.service';
import { LogService } from './log.service';

@Injectable()
export class RobotService {

  private user32: any;
  private keyboard: any;
  private clipboard: any;
  private window: any;
  private timer: any;

  private activeWindowTitle: string;
  private activeWindow: any;
  private clipboardValue: string;

  private cooldown = false;

  public activeWindowTitleSub: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public pressedKeysList: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);

  INPUT_KEYBOARD = 1;
  KEYEVENTF_EXTENDEDKEY = 0x0001;
  KEYEVENTF_KEYUP = 0x0002;
  KEYEVENTF_UNICODE = 0x0004;
  KEYEVENTF_SCANCODE = 0x0008;
  MAPVK_VK_TO_VSC = 0;
  intPtr: any;
  input: any;

  constructor(
    private electronService: ElectronService,
    private logService: LogService
  ) {
    this.keyboard = this.electronService.robot.Keyboard;
    this.clipboard = this.electronService.robot.Clipboard;
    this.window = this.electronService.robot.Window;
    this.timer = this.electronService.robot.Timer;

    this.activeWindowTitleSub.subscribe(res => {
      this.activeWindowTitle = res;
    });

    if (this.clipboard.hasText()) {
      this.clipboardValue = this.clipboard.getText();
    }
    this.InitializeWin32();
    setInterval(() => this.robotHearbeat(), 100);
  }

  private InitializeWin32() {
    this.intPtr = this.electronService.ref.refType('int');
    this.input = this.electronService.structType({
      'type': 'int',
      // For some reason, the wScan value is only recognized as the wScan value when we add this filler slot.
      // It might be because it's expecting the values after this to be inside a 'wrapper' substructure, as seen here:
      //     https://msdn.microsoft.com/en-us/library/windows/desktop/ms646270(v=vs.85).aspx
      '???': 'int',
      'wVK': 'short',
      'wScan': 'short',
      'dwFlags': 'int',
      'time': 'int',
      'dwExtraInfo': 'int64'
    });

    this.user32 = new this.electronService.ffi.Library('user32', {
      'SendInput': ['int', ['int', this.input, 'int']],
      // 'MapVirtualKeyEx': ['uint', ['uint', 'uint', this.intPtr]],
      'FindWindowA': ['long', ['string', 'string']],
      'SetForegroundWindow': ['bool', ['long']],
    });
  }

  private ConvertKeyCodeToScanCode(keyCode: number) {
    const keys = '**1234567890-=**qwertyuiop[]**asdfghjkl;\'`*\\zxcvbnm,./'.split('');
    return keys.indexOf(String.fromCharCode(keyCode).toLowerCase());
  }

  private KeyToggle(keyCode: number, type = 'down' as 'down' | 'up', asScanCode = true) {
    const entry = new this.input();
    entry.type = this.INPUT_KEYBOARD;
    entry.time = 0;
    entry.dwExtraInfo = 0;

    // (virtual) key-code approach
    if (!asScanCode) {
      entry.dwFlags = type === 'down' ? 0 : this.KEYEVENTF_KEYUP;
      entry.wVK = keyCode;
      entry.wScan = 0;
    } else {// scan-code approach
      // this should work, but it had a Win32 error (code 127) for me
      // const scanCode = this.user32.MapVirtualKeyEx(keyCode, this.MAPVK_VK_TO_VSC);
      const scanCode = this.ConvertKeyCodeToScanCode(keyCode);

      // tslint:disable-next-line:no-bitwise
      entry.dwFlags = type === 'down' ? this.KEYEVENTF_SCANCODE : this.KEYEVENTF_SCANCODE | this.KEYEVENTF_KEYUP;
      entry.wVK = 0;
      entry.wScan = scanCode;
    }

    return !!this.user32.SendInput(1, entry, this.electronService.arch === 'x64' ? 40 : 28);
  }

  private KeyTap(keyCode: number, asScanCode = true) {
    const down = this.KeyToggle(keyCode, 'down', asScanCode);
    const up = this.KeyToggle(keyCode, 'up', asScanCode);
    return down && up;
  }

  private SendInputText(text: string): Promise<any> {

    return this.electronService.keysender.startBatch()
      .batchTypeKey('enter')
      .batchTypeCombination(['control', 'v'])
      .batchTypeKey('enter')
      .sendBatch();
  }

  private robotHearbeat() {
    // Clipboard
    const currentText = this.clipboard.getText();
    if (currentText !== undefined && currentText !== null) {
      const clip = currentText;
      if (clip !== this.clipboardValue) {
        this.clipboardValue = currentText;
      }
    }

    // Window
    this.activeWindow = this.window.getActive();
    this.activeWindowTitleSub.next(this.activeWindow.getTitle());
  }

  private sendAndFocusWindow(windowTitle: string, message: string): boolean {
    const winToSetOnTop = this.user32.FindWindowA(null, windowTitle);
    const keytap = this.KeyTap(Keys.Ctrl);
    const foreground = this.user32.SetForegroundWindow(winToSetOnTop);
    return foreground;
  }

  public sendTextToPathWindow(text: string, fromApp: boolean): boolean {

    if (!this.cooldown) {
      this.cooldown = true;

      const windowTitle = 'Path of Exile';
      const shouldSendToWindow = this.activeWindowTitle === 'Path of Exile' || this.activeWindowTitle === 'ExileParty' || fromApp;

      if (shouldSendToWindow) {

        while (this.keyboard.getState(Keys.Ctrl) || this.keyboard.getState(Keys.Alt) || this.keyboard.getState(Keys.Shift)) {
          this.timer.sleep(50);
        }
        let clipboardValue = null;
        const currentText = this.clipboard.getText();

        if (currentText !== undefined && currentText !== null) {
          clipboardValue = this.clipboardValue;
          this.clipboard.setText(text);
        }

        const isWindowActive = this.sendAndFocusWindow(windowTitle, text);

        if (isWindowActive) {
          this.SendInputText(text).then(() => {
            this.logService.log('Successfully send text to window');
            if (clipboardValue) {
              this.clipboard.setText(clipboardValue);
            }
            return true;
          }
          );

        } else {
          this.logService.log('Could not send text to window', windowTitle, true);
          return false;
        }

      }
      setTimeout(x => {
        this.cooldown = false;
      }, 1500);
    }
  }

  public setTextToClipboard(text: string) {
    this.clipboard.setText(text);
  }

}
