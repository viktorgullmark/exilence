import { Injectable } from '@angular/core';

import { BehaviorSubject } from '../../../../node_modules/rxjs/internal/BehaviorSubject';
import { Keys } from '../interfaces/key.interface';
import { ElectronService } from './electron.service';
import { LogService } from './log.service';

@Injectable()
export class RobotService {

  private user32: any;

  private kernel32 = new this.electronService.ffi.Library('Kernel32.dll', {
    'GetCurrentThreadId': ['int', []]
  });

  private keyboard: any;
  private clipboard: any;
  private window: any;

  // private activeWindowTitle: string;
  // private activeWindow: any;
  private clipboardValue: string;

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
      'PostMessageA': ['bool', ['int32', 'uint32', 'int32', 'int32']],
      'SendMessageA': ['int64', ['int32', 'uint32', 'int32', 'int32']],
      'SendInput': ['int', ['int', this.input, 'int']],
      // 'MapVirtualKeyEx': ['uint', ['uint', 'uint', this.intPtr]],
      'GetTopWindow': ['long', ['long']],
      'FindWindowA': ['long', ['string', 'string']],
      'SetActiveWindow': ['long', ['long']],
      'SetForegroundWindow': ['bool', ['long']],
      'BringWindowToTop': ['bool', ['long']],
      'ShowWindow': ['bool', ['long', 'int']],
      'SwitchToThisWindow': ['void', ['long', 'bool']],
      'GetForegroundWindow': ['long', []],
      'AttachThreadInput': ['bool', ['int', 'long', 'bool']],
      'GetWindowThreadProcessId': ['int', ['long', 'int']],
      'SetWindowPos': ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
      'SetFocus': ['long', ['long']]
    });

    this.Initialize();
    setInterval(() => this.robotHearbeat(), 100);
  }

  private Initialize() {
    if (this.clipboard.hasText()) {
      this.clipboardValue = this.clipboard.getText();
    }

  }

  ConvertKeyCodeToScanCode(keyCode: number) {
    const keys = '**1234567890-=**qwertyuiop[]**asdfghjkl;\'`*\\zxcvbnm,./'.split('');
    return keys.indexOf(String.fromCharCode(keyCode).toLowerCase());
  }


  KeyToggle(hwnd: number, keyCode: number, type = 'down' as 'down' | 'up', asScanCode = true) {
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

    const result = this.user32.SendInput(1, entry, this.electronService.arch === 'x64' ? 40 : 28);
    console.log(`Number of key-events added: ${result}`);
  }

  KeyTap(hwnd: number, keyCode: number, asScanCode = false) {
    this.KeyToggle(hwnd, keyCode, 'down', asScanCode);
    this.KeyToggle(hwnd, keyCode, 'up', asScanCode);
  }

  robotHearbeat() {

    // Clipboard
    if (this.clipboard.hasText()) {
      const clip = this.clipboard.getText();
      if (clip !== this.clipboardValue) {
        this.clipboardValue = this.clipboard.getText();
      }
    }

    // Keyboard
    const keyState = this.keyboard.getState();
    const tempPressedKeys = [];
    for (const key of Object.keys(Keys)) {
      const pressed = keyState[key];
      if (pressed) {
        tempPressedKeys.unshift(+key);
      }
    }
    if (tempPressedKeys.length >= 2) {
      this.pressedKeysList.next(tempPressedKeys);
    }

    // // Window
    // this.activeWindow = this.window.getActive();
    // this.activeWindowTitle = this.activeWindow.getTitle();

  }

  private focusWindowForInput(windowTitle: String) {

    const winToSetOnTop = this.user32.FindWindowA(null, windowTitle);
    this.KeyTap(winToSetOnTop, Keys.T);
    this.KeyTap(winToSetOnTop, Keys.E);
    this.KeyTap(winToSetOnTop, Keys.S);
    this.KeyTap(winToSetOnTop, Keys.T);
    const foregroundHWnd = this.user32.GetForegroundWindow();
    const currentThreadId = this.kernel32.GetCurrentThreadId();
    const windowThreadProcessId = this.user32.GetWindowThreadProcessId(foregroundHWnd, null);
    const showWindow = this.user32.ShowWindow(winToSetOnTop, 9);
    const setWindowPos1 = this.user32.SetWindowPos(winToSetOnTop, -1, 0, 0, 0, 0, 3);
    const setWindowPos2 = this.user32.SetWindowPos(winToSetOnTop, -2, 0, 0, 0, 0, 3);
    const setForegroundWindow = this.user32.SetForegroundWindow(winToSetOnTop);
    const attachThreadInput = this.user32.AttachThreadInput(windowThreadProcessId, currentThreadId, 0);
    const setFocus = this.user32.SetFocus(winToSetOnTop);
    const setActiveWindow = this.user32.SetActiveWindow(winToSetOnTop);
    return setForegroundWindow;
  }

  private sendAndFocusWindow(windowTitle: string, message: string): boolean {
    const winToSetOnTop = this.user32.FindWindowA(null, windowTitle);
    this.KeyTap(winToSetOnTop, Keys.A);
    return this.user32.SetForegroundWindow(winToSetOnTop);
  }

  public sendTextToPathWindow(text: string): boolean {

    const isWindowActive = this.sendAndFocusWindow('Path of Exile.txt - Notepad', text);
    if (isWindowActive) {
      const keyboard = this.keyboard();
      keyboard.autoDelay.min = 0;
      keyboard.autoDelay.max = 0;
      keyboard.click(Keys.Enter);
      keyboard.click(this.prepareStringForRobot(text));
      keyboard.click(Keys.Enter);
      return true;
    }
    this.logService.log('Could not send text to path window: ');
    return false;
  }

  private ActivateAndSend(text: string): boolean {
    const isWindowActive = this.focusWindowForInput('Path of Exile.txt - Notepad');
    if (isWindowActive) {
      // const keyboard = this.keyboard();
      // keyboard.autoDelay.min = 0;
      // keyboard.autoDelay.max = 0;
      // keyboard.click(Keys.Enter);
      // keyboard.click(this.prepareStringForRobot(text));
      // keyboard.click(Keys.Enter);
      // return true;
    }
    this.logService.log('Could not send text to path window: ');
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
