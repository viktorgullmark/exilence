import { Component, OnDestroy } from '@angular/core';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';

import * as pkg from '../../package.json';
import { AppConfig } from '../environments/environment.js';
import { AlertMessage } from './shared/interfaces/alert-message.interface';
import { Player } from './shared/interfaces/player.interface';
import { AlertService } from './shared/providers/alert.service';
import { ElectronService } from './shared/providers/electron.service';
import { SessionService } from './shared/providers/session.service';
import { SettingsService } from './shared/providers/settings.service';
import { PartyService } from './shared/providers/party.service';
import { DependencyStatus } from './shared/interfaces/dependency-status.interface.js';
import { DependencyStatusState } from './app.states.js';
import { Store } from '@ngrx/store';
import * as fromReducer from './store/dependency-status/dependency-status.reducer';
import { ErrorMessage } from './shared/interfaces/error-message.interface';
import { ErrorMessageDialogComponent } from './authorize/components/error-message-dialog/error-message-dialog.component';

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
  private errorShown = false;
  public statusTooltipContent = '';
  private offlineModalOpen = false;
  private depStatusStoreSub: Subscription;
  private depStatuses: Array<DependencyStatus> = [];
  private allDepStatuses$: Observable<DependencyStatus[]>;

  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    public sessionService: SessionService,
    private settingsService: SettingsService,
    private router: Router,
    private alertService: AlertService,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    public partyService: PartyService,
    private depStatusStore: Store<DependencyStatusState>
  ) {

    this.depStatusStoreSub = this.depStatusStore.select(fromReducer.selectAllDepStatuses).subscribe(statuses => {
      this.depStatuses = statuses;

      // update tooltip-content
      this.statusTooltipContent = ``;
      this.depStatuses.forEach(status => {
        const statusText = status.online ? 'UP' : 'DOWN';
        this.statusTooltipContent += `${status.url}: ${statusText}\n`;
      });

      // pathofexile is down
      const poe = this.depStatuses.find(s => s.name === 'pathofexile');
      if (!poe.online && !this.errorShown && !this.offlineModalOpen && router.url !== '/login') {
        this.errorShown = true;
        this.offlineModalOpen = true;
        this.openErrorMsgDialog({
          title: 'pathofexile.com could not be reached',
          // tslint:disable-next-line:max-line-length
          body: '<a class="inline-link">https://pathofexile.com</a> could not be reached.<br/><br/>' +
            'You can continue using Exilence in offline-mode, but your character wont update.<br/><br/>' +
            'We will automatically reconnect you when the site is back up.'
        } as ErrorMessage);
      } else if (poe.online) {
        this.errorShown = false;
      }
    });

    if (AppConfig.environment === 'DEV' && this.electronService.isElectron()) {
      this.logout();
    }

    this.appVersion = pkg['version'];

    translate.setDefaultLang('en');

    if (electronService.isElectron()) {
      moment.locale(this.electronService.remote.app.getLocale());
      this.loadWindowSettings();
    } else {
      moment.locale(this.getBrowserLang());
    }

    this.alertSub = this.alertService.alert.subscribe(res => {
      if (res !== undefined) {
        this.alertMsg = res;
        this.displayAlert(this.alertMsg.message, this.alertMsg.action);
      }
    });
  }

  getBrowserLang() {
    return (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
  }
  displayAlert(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  isPoeOnline() {
    const poe = this.depStatuses.find(s => s.name === 'pathofexile');
    if (poe !== undefined) {
      return poe.online;
    }
    return false;
  }

  logout() {
    this.sessionService.cancelSession();
    this.router.navigate(['login']);
  }

  changeGroup() {
    this.partyService.leaveParty('', this.partyService.party.spectatorCode, this.partyService.currentPlayer);
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

  openErrorMsgDialog(data: ErrorMessage): void {
    setTimeout(() => {
      const dialogRef = this.dialog.open(ErrorMessageDialogComponent, {
        width: '850px',
        data: {
          icon: 'error',
          title: data.title,
          content: data.body
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.offlineModalOpen = false;
      });
    }, 0);
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
    if (this.depStatusStoreSub !== undefined) {
      this.depStatusStoreSub.unsubscribe();
    }
  }
}
