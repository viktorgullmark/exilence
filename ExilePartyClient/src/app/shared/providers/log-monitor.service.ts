import { Injectable, EventEmitter } from '@angular/core';
import { AccountService } from './account.service';

@Injectable()
export class LogMonitorService {
  private PathOfExileLog = window.require('poe-log-monitor');

  poeLog: any;

  areaEvent: EventEmitter<any> = new EventEmitter();

  constructor(private accountService: AccountService) {
    this.accountService.accountInfo.subscribe(res => {
      if (res !== undefined) {
        this.poeLog = new this.PathOfExileLog({
          logfile: res.filePath
        });
        this.poeLog.on('area', (data) => {
          this.areaEvent.emit(data);
        });
      }
    });
  }
}
