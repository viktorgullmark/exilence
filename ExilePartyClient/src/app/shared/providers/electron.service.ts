import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
import { ipcRenderer, remote, shell, webFrame } from 'electron';
import * as fs from 'fs';

import { AnalyticsService } from './analytics.service';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  shell: typeof shell;
  fs: typeof fs;
  settings: any;
  robot: any;
  constructor(
    private analyticsService: AnalyticsService
  ) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.shell = window.require('electron').shell;
      this.settings = window.require('electron-settings');

      this.robot = window.require('robot-js');

      const process = this.robot.Process.getCurrent();

      console.log('ROBOT Is 64 Bit: ', process.is64Bit());
      console.log('ROBOT PID: ', process.getPID());
      console.log('ROBOT GetName: ', process.getName());
      console.log('ROBOT GetPath: ', process.getPath());

    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
