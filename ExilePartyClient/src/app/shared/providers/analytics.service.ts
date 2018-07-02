import { Injectable } from '@angular/core';
import ua from 'universal-analytics';

import * as pkg from '../../../../package.json';

@Injectable()
export class AnalyticsService {

  private visitor;
  private version: string;
  private appName: string;
  constructor() {
    this.version = pkg['version'];
    this.appName = 'ExileParty';
  }

  startTracking(account: string) {
    this.visitor = ua('UA-121704803-1', account, {strictCidFormat: false});
    this.visitor.set('uid', account);
    this.visitor.set('ds', 'app');
    this.visitor.set('an', this.appName);
    this.visitor.set('av', this.version);

  }

  sendPageview(page: string) {
    this.visitor.pageview(page).send((err) => {
      if (err) {
        console.log('Error sending pageview: ', err);
      }
    });
  }

  sendScreenview(screenName: string) {
    this.visitor.screenview(screenName, this.appName, this.version, (err) => {
      if (err) {
        console.log('Error sending screenview: ', err);
      }
    }).send();
  }
}
