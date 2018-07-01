import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote, shell } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import ua from 'universal-analytics';

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  shell: typeof shell;
  fs: typeof fs;
  settings: any;
  constructor() {
    // Conditional imports
    if (this.isElectron()) {

      const visitor = ua('UA-121704803-1');

      visitor.pageview('/').send();

      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.shell = window.require('electron').shell;
      this.settings = window.require('electron-settings');
    }
  }

  isElectron = () => {
    console.log(window);
    return window && window.process && window.process.type;
  }

}
