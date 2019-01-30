import { Injectable } from '@angular/core';
import ua from 'universal-analytics';

import * as pkg from '../../../../package.json';
import { LogService } from './log.service';

@Injectable()
export class AnalyticsService {

  private visitor;
  private version: string;
  private appName: string;

  public isTracking = false;

  private pastScreens: string[] = [];

  constructor(private logService: LogService) {
    this.version = pkg['version'];
    this.appName = 'Exilence';
  }

  startTracking(account: string) {
    if (!this.isTracking && this.isElectron()) {
      this.isTracking = true;
      this.visitor = ua('UA-121704803-1', account.toLowerCase(), { strictCidFormat: false });
      this.visitor.set('uid', account);
      this.visitor.set('ds', 'app');
      this.visitor.set('an', this.appName);
      this.visitor.set('av', this.version);
    }
  }

  isElectron() {
    return window && window.process && window.process.type;
  }

  sendPageview(page: string) {
    if (this.isElectron()) {
      this.visitor.pageview(page).send((err) => {
        if (err) {
          this.logService.log('Sending pageview: ', err, false);
        }
      });
    }
  }

  sendEvent(category: string, action: string) {
    if (this.isElectron()) {
      const params = {
        ec: category,
        ea: action,
      };

      this.visitor.event(params).send((err) => {
        if (err) {
          this.logService.log('Sending event: ', err, false);
        }
      });
    }
  }

  sendLastPartyPlayerScreen() {
    if (this.isElectron()) {
      for (let i = 0; i < this.pastScreens.length; i++) {
        const screen = this.pastScreens[i];
        if (screen.indexOf('/authorized/party/player/') !== -1) {
          this.sendScreenview(screen);
          break;
        }
      }
    }
  }

  sendScreenview(screenName: string) {
    if (this.isElectron()) {
      this.pastScreens.unshift(screenName);

      this.visitor.screenview(screenName, this.appName, this.version).send((err) => {
        this.logService.log('Sending screenview: ', screenName, false);
      });
    }
  }
}
