import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
import { ipcRenderer, remote, shell, webFrame } from 'electron';
import * as fs from 'fs';

import { AppConfig } from '../../../environments/environment';
import { AnalyticsService } from './analytics.service';
import { LogService } from './log.service';

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
  zlib: any;
  keysender: any;

  ffi: any;
  ref: any;
  arch: any;
  structType: any;

  constructor(
    private analyticsService: AnalyticsService, // Not used but instanciated here
    private logService: LogService,
    private http: HttpClient
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
      this.zlib = window.require('zlib');
      this.keysender = window.require('node-key-sender');

      this.ffi = window.require('ffi');
      this.ref = window.require('ref');
      this.arch = window.require('os').arch();
      this.structType = window.require('ref-struct');

      this.robot = window.require('robot-js');
    }
  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }


  sendLog() {
    // temporarily disabled
    // const path = this.remote.app.getPath('appData');
    // const logPath = path + '\\exilence\\log.log';

    // this.fs.readFile(logPath, 'utf8', (err, logData) => {
    //   this.compress(logData, (compressedData) => {
    //     this.sendLogToServer(compressedData).subscribe(res => {
    //       this.logService.log('Log successfully sent log to server.');
    //     }, (error) => {
    //       this.logService.log('Could not send log to server.', error, true);
    //     });
    //   });
    // });
  }

  private sendLogToServer(log: string) {

    const accountName = this.settings.get('account').accountName;
    const settings = this.settings.getAll();
    const stringSettings = JSON.stringify(settings);

    return this.http.post(AppConfig.url + 'api/log/', {
      account: accountName,
      settings: stringSettings,
      data: log
    });
  }


  compress(object: any, callback: any) {
    const jsonString = JSON.stringify(object);
    this.zlib.gzip(jsonString, (err, buffer) => {
      if (!err) {
        const string = buffer.toString('base64');
        callback(string);
      } else {
        this.logService.log(err, null, true);
      }
    });
  }

  decompress(base64string: string, callback: any) {
    const buffer = Buffer.from(base64string, 'base64');
    this.zlib.gunzip(buffer, (err, jsonString) => {
      if (!err) {
        const obj = JSON.parse(jsonString);
        callback(obj);
      } else {
        this.logService.log(err, null, true);
      }
    });
  }

}
