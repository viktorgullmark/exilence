import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class LogMonitorService {
  private PathOfExileLog = window.require('poe-log-monitor');

  filePath = 'C:/Program Files (x86)/Steam/steamapps/common/Path of Exile/logs/Client.txt';
  private poeLog = new this.PathOfExileLog({
    logfile: this.filePath
  });

  areaEvent: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.poeLog.on('area', (data) => {
      this.areaEvent.emit(data);
    });
  }
}
