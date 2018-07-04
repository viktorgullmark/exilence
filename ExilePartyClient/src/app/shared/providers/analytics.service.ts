import { Injectable } from '@angular/core';
import ua from 'universal-analytics';

import * as pkg from '../../../../package.json';
import { LogService } from './log.service';

@Injectable()
export class AnalyticsService {

  private visitor;
  private version: string;
  private appName: string;
  constructor(private logService: LogService) {
    this.version = pkg['version'];
    this.appName = 'ExileParty';
  }

  startTracking(account: string) {
    this.visitor = ua('UA-121704803-1', account.toLowerCase(), { strictCidFormat: false });
    this.visitor.set('uid', account);
    this.visitor.set('ds', 'app');
    this.visitor.set('an', this.appName);
    this.visitor.set('av', this.version);

  }

  sendPageview(page: string) {
    this.visitor.pageview(page).send((err) => {
      if (err) {
        this.logService.log('Sending pageview: ', err, true);
      }
    });
  }

  sendScreenview(screenName: string) {
    this.visitor.screenview(screenName, this.appName, this.version, (err) => {
      if (err) {
        this.logService.log('Sending screenview: ', err, true);
      }
    }).send();
  }
}
