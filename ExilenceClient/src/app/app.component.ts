import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';


import * as pkg from '../../package.json';
import { Player } from './shared/interfaces/player.interface';
import { ElectronService } from './shared/providers/electron.service';
import { SessionService } from './shared/providers/session.service';
import { SettingsService } from './shared/providers/settings.service';
import { AlertService } from './shared/providers/alert.service';
import { AlertMessage } from './shared/interfaces/alert-message.interface';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  player: Player;
  alertMsg: AlertMessage;
  public appVersion;
  maximized = false;
  private alertSub: Subscription;
  constructor(public electronService: ElectronService,
    private translate: TranslateService,
    public sessionService: SessionService,
    private settingsService: SettingsService,
    private router: Router,
    private alertService: AlertService,
    public snackBar: MatSnackBar
  ) {
    this.appVersion = pkg['version'];

    this.logout();

    translate.setDefaultLang('en');

    // console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      moment.locale(this.electronService.remote.app.getLocale());
      // console.log('Mode electron');
      // console.log('Electron ipcRenderer', electronService.ipcRenderer);
      // console.log('NodeJS childProcess', electronService.childProcess);
      this.loadWindowSettings();
    } else {
      // console.log('Mode web');
    }

    this.alertSub = this.alertService.alert.subscribe(res => {
      if (res !== undefined) {
        this.alertMsg = res;
        this.displayAlert(this.alertMsg.message, this.alertMsg.action);
      }
    });
  }

  displayAlert(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  logout() {
    this.sessionService.cancelSession();
    this.router.navigate(['login']);
  }

  close() {
    this.sessionService.cancelSession();
    this.electronService.remote.getCurrentWindow().close();
  }

  minimize() {
    this.electronService.remote.getCurrentWindow().minimize();
  }

  maximize() {
    this.maximized = true;
    this.electronService.remote.getCurrentWindow().maximize();
  }

  unmaximize() {
    this.maximized = false;
    this.electronService.remote.getCurrentWindow().unmaximize();
  }

  loadWindowSettings() {
    const alwaysOnTop = this.settingsService.get('alwaysOnTop');
    if (alwaysOnTop !== undefined) {
      this.electronService.remote.getCurrentWindow().setAlwaysOnTop(alwaysOnTop);
      this.electronService.remote.getCurrentWindow().setVisibleOnAllWorkspaces(alwaysOnTop);
    }
    const resizableWindow = this.settingsService.get('isResizable');
    if (resizableWindow !== undefined) {
      this.electronService.remote.getCurrentWindow().setResizable(resizableWindow);
    }
  }

  ngOnDestroy() {
    if (this.alertSub !== undefined) {
      this.alertSub.unsubscribe();
    }
  }
}
