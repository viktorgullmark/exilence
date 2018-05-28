import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AppConfig } from './app.config';
import { Player } from './shared/interfaces/player.interface';
import { AccountService } from './shared/providers/account.service';
import { ElectronService } from './shared/providers/electron.service';
import { SessionService } from './shared/providers/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  player: Player;
  constructor(public electronService: ElectronService,
    private translate: TranslateService,
    public sessionService: SessionService,
    private router: Router) {

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  logout() {
    this.sessionService.cancelSession();
    this.router.navigate(['login']);
  }
}
