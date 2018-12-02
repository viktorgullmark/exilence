import { Injectable } from '@angular/core';

@Injectable()
export class LogService {

  logger: any;
  public lastMessage: string;
  public lastError: boolean;

  constructor() {
    this.logger = window.require('electron-log');
    // Disables electron-log console logging
    this.logger.transports.console = function (msg) { };
  }

  log(message: any, data: any = '', error: boolean = false) {
    this.lastMessage = message;
    this.lastError = error;
    if (!error) {
      this.logger.info(message);
      console.log(`[INFO] ${message}`, data);
    } else {
      this.logger.error(message);
      console.log(`[WARNING] ${message}`, data);
    }
  }
}
