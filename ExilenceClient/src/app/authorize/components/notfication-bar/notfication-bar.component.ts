import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GithubRelease } from '../../../shared/interfaces/github.interface';
import { ExternalService } from '../../../shared/providers/external.service';
import { LogService } from '../../../shared/providers/log.service';
import { ElectronService } from '../../../shared/providers/electron.service';




@Component({
  selector: 'app-notfication-bar',
  templateUrl: './notfication-bar.component.html',
  styleUrls: ['./notfication-bar.component.scss']
})

export class NotficationBarComponent implements OnInit, OnDestroy {

  @Input() appVersion: string;
  public latestVersion;
  public notifications: string[] = [];
  private releaseSub: Subscription;
  constructor(
    private externalService: ExternalService,
    private logService: LogService,
    private electronService: ElectronService
  ) {
    setTimeout(res => {
      setInterval(inner => this.checkForNewRelease(), 1000 * 60 * 10); // Check every 10 minutes.
    }, 60 * 2 * 1000);
  }

  ngOnInit() {
  }


  checkForNewRelease() {
    this.releaseSub = this.externalService.getLatestRelease().subscribe((release: GithubRelease) => {
      this.logService.log('Current Version: ' + this.appVersion);
      this.logService.log('Latest Version: ' + release.name);

      if (this.appVersion !== release.name) {
        if (this.notifications.indexOf('NEW_VERSION') === -1) {
          this.notifications.push('NEW_VERSION');
        }
      }

      this.latestVersion = release.name;
    });
  }

  relaunch() {
    this.electronService.ipcRenderer.send('relaunch');
  }

  ngOnDestroy() {
    if (this.releaseSub !== undefined) {
      this.releaseSub.unsubscribe();
    }
  }

}
