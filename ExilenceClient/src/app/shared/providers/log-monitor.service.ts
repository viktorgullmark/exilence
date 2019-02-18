import { EventEmitter, Injectable } from '@angular/core';

import { AccountService } from './account.service';
import { LogService } from './log.service';

@Injectable()
export class LogMonitorService {
  private PathOfExileLog: any;

  logTail: any;
  filePath: string;

  trackMapsOnly = true;

  instanceServerEvent: EventEmitter<any> = new EventEmitter();
  areaEvent: EventEmitter<any> = new EventEmitter();
  areaJoin: EventEmitter<any> = new EventEmitter();
  areaLeft: EventEmitter<any> = new EventEmitter();
  messageEvent: EventEmitter<any> = new EventEmitter();

  constructor(private accountService: AccountService, private logService: LogService) {
    if (this.isElectron()) {
      this.PathOfExileLog = window.require('poe-log-monitor');
      this.accountService.accountInfo.subscribe(res => {
        if (res !== undefined && this.logTail === undefined) {
          this.filePath = res.filePath;
          this.logTail = new this.PathOfExileLog({
            logfile: this.filePath,
            interval: 500
          });
          this.logTail.on('area', (data) => {
            this.areaEvent.emit(data);
          });
          this.logTail.on('areaJoin', (data) => {
            this.areaJoin.emit(data);
          });
          this.logTail.on('areaLeave', (data) => {
            this.areaLeft.emit(data);
          });
          this.logTail.on('message', (data) => {
            this.messageEvent.emit(data);
          });
          this.logTail.on('instanceServer', (data) => {
            this.instanceServerEvent.emit(data);
          });
          this.logTail.on('error', (data) => {
            this.logService.log('poe-log-reader', data, true);
          });
        }
      });
    }
  }

  isElectron() {
    return window && window.process && window.process.type;
  }
}
