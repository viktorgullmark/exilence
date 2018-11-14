import { EventEmitter, Injectable } from '@angular/core';

import { AccountService } from './account.service';
import { LogService } from './log.service';

@Injectable()
export class LogMonitorService {
  private PathOfExileLog = window.require('poe-log-monitor');

  poeLog: any;

  instanceServerEvent: EventEmitter<any> = new EventEmitter();
  areaEvent: EventEmitter<any> = new EventEmitter();
  areaJoin: EventEmitter<any> = new EventEmitter();
  areaLeft: EventEmitter<any> = new EventEmitter();
  messageEvent: EventEmitter<any> = new EventEmitter();

  constructor(private accountService: AccountService, private logService: LogService) {
    this.accountService.accountInfo.subscribe(res => {
      if (res !== undefined && this.poeLog === undefined) {
        this.poeLog = new this.PathOfExileLog({
          logfile: res.filePath,
          interval: 500
        });
        this.poeLog.on('area', (data) => {
          this.areaEvent.emit(data);
        });
        this.poeLog.on('areaJoin', (data) => {
          this.areaJoin.emit(data);
        });
        this.poeLog.on('areaLeave', (data) => {
          this.areaLeft.emit(data);
        });
        this.poeLog.on('message', (data) => {
          this.messageEvent.emit(data);
        });
        this.poeLog.on('instanceServer', (data) => {
          this.instanceServerEvent.emit(data);
        });
        this.poeLog.on('error', (data) => {
          this.logService.log('poe-log-reader', data, true);
        });
      }
    });
  }
}
