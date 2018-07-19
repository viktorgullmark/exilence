import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import * as pkg from '../../package.json';
import { Player } from './shared/interfaces/player.interface';
import { ElectronService } from './shared/providers/electron.service';
import { SessionService } from './shared/providers/session.service';
import { SettingsService } from './shared/providers/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  player: Player;
  public appVersion;
  maximized = false;
  constructor(public electronService: ElectronService,
    private translate: TranslateService,
    public sessionService: SessionService,
    private settingsService: SettingsService,
    private router: Router,
  ) {
    this.appVersion = pkg['version'];

    this.logout();

    translate.setDefaultLang('en');
    moment.locale('en');
    // console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      // console.log('Mode electron');
      // console.log('Electron ipcRenderer', electronService.ipcRenderer);
      // console.log('NodeJS childProcess', electronService.childProcess);
      this.loadWindowSettings();
    } else {
      // console.log('Mode web');
    }
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
  }
}
