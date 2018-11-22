import { EventEmitter, Injectable } from '@angular/core';

import { AccountService } from './account.service';
import { LogService } from './log.service';

@Injectable()
export class LogMonitorService {
  private PathOfExileLog = window.require('poe-log-monitor');

  logTail: any;
  entireLog: any;
  filePath: string;

  parsingCompleted = false;
  trackMapsOnly = true;

  instanceServerEvent: EventEmitter<any> = new EventEmitter();
  areaEvent: EventEmitter<any> = new EventEmitter();
  areaJoin: EventEmitter<any> = new EventEmitter();
  areaLeft: EventEmitter<any> = new EventEmitter();
  messageEvent: EventEmitter<any> = new EventEmitter();

  // when reading the entire log
  historicalAreaEvent: EventEmitter<any> = new EventEmitter();
  historicalInstanceServerEvent: EventEmitter<any> = new EventEmitter();

  parsingStarted: EventEmitter<any> = new EventEmitter();
  parsingComplete: EventEmitter<any> = new EventEmitter();

  constructor(private accountService: AccountService, private logService: LogService) {
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

  removeLogParser() {
    this.entireLog.removeAllListeners();
  }

  instantiateLogParser(path) {
    this.filePath = path;
    // instantiate monitor that parses the entire log
    this.entireLog = new this.PathOfExileLog({
      logfile: this.filePath,
      includedEvents: ['area', 'instanceServer'],
      chunkSize: 10240 // todo: read ram-size/cpu-speed and calc based on these?
    });

    this.entireLog.on('parsingStarted', (data) => {
      this.parsingStarted.emit(data);
    });
    this.entireLog.on('parsingComplete', (data) => {
      this.parsingComplete.emit(data);
    });
    this.entireLog.on('area', (data) => {
      this.historicalAreaEvent.emit(data);
    });
    this.entireLog.on('instanceServer', (data) => {
      this.historicalInstanceServerEvent.emit(data);
    });
    this.entireLog.on('error', (data) => {
      this.logService.log('poe-log-reader', data, true);
    });
  }
}
