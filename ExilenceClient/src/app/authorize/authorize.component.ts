import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Player } from '../shared/interfaces/player.interface';
import { ServerMessage } from '../shared/interfaces/server-message.interface';
import { AccountService } from '../shared/providers/account.service';
import { ElectronService } from '../shared/providers/electron.service';
import { IncomeService } from '../shared/providers/income.service';
import { MapService } from '../shared/providers/map.service';
import { MessageValueService } from '../shared/providers/message-value.service';
import { PartyService } from '../shared/providers/party.service';
import { SettingsService } from '../shared/providers/settings.service';
import { ServerMessageDialogComponent } from './components/server-message-dialog/server-message-dialog.component';

@Component({
  selector: 'app-authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.scss']
})
export class AuthorizeComponent implements OnInit, OnDestroy {
  form: FormGroup;
  player: Player;
  private playerSub: Subscription;
  private serverMsgSub: Subscription;
  public copyText = 'Copy spectate link';
  public isCopying = false;
  constructor(@Inject(FormBuilder) fb: FormBuilder,
    public partyService: PartyService,
    private mapService: MapService,
    private accountService: AccountService,
    private messageValueService: MessageValueService,
    private incomeService: IncomeService,
    public electronService: ElectronService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private router: Router) {
    this.form = fb.group({
      partyCode: [this.partyService.party.name !== '' ? this.partyService.party.name : this.generatePartyName(),
      [Validators.maxLength(25), Validators.required]]
    });
  }

  ngOnInit() {
    this.playerSub = this.accountService.player.subscribe(res => {
      this.player = res;
    });
    this.serverMsgSub = this.partyService.serverMessageReceived.subscribe(res => {
      if (res !== undefined) {
        this.openServerMsgDialog(res);
        // clear message after it has been displayed
        this.partyService.serverMessageReceived.next(undefined);
      }
    });
  }

  openServerMsgDialog(data: ServerMessage): void {
    setTimeout(() => {
      const dialogRef = this.dialog.open(ServerMessageDialogComponent, {
        width: '650px',
        data: {
          icon: 'error',
          title: data.title,
          content: data.body
        }
      });
      if (this.electronService.isElectron()) {
        this.electronService.ipcRenderer.send('servermsg');
      }
      dialogRef.afterClosed().subscribe(result => {
      });
    }, 0);
  }

  ngOnDestroy() {
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
    }
    if (this.serverMsgSub !== undefined) {
      this.serverMsgSub.unsubscribe();
    }
  }

  saveMaskedSetting() {
    this.settingsService.set('maskedGroupname', this.partyService.maskedName);
  }

  saveMaskedSpectatorCodeSetting() {
    this.settingsService.set('maskedSpectatorCode', this.partyService.maskedSpectatorCode);
  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }

  getSpectateLink() {
    return 'https://exilence.app/spectate/' + this.partyService.party.spectatorCode;
  }

  copyLink() {
    if (this.electronService.isElectron()) {
      this.electronService.clipboard.writeText(this.getSpectateLink());
      this.isCopying = true;
      this.copyText = 'Copied!';
      setTimeout(x => {
        this.isCopying = false;
        this.copyText = 'Copy spectate link';
      }, 1500);
    }
  }

  generatePartyName(): string {
    let partyName = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 5; i++) {
      partyName += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return partyName;
  }

  enterParty() {
    this.partyService.joinInProgress = true;
    this.partyService.leaveParty(this.partyService.party.name, this.partyService.party.spectatorCode, this.player);
    setTimeout(() => {
      this.partyService.joinParty(this.form.controls.partyCode.value.toUpperCase(), '', this.player);
      this.incomeService.Snapshot();
      this.partyService.addPartyToRecent(this.form.controls.partyCode.value.toUpperCase());
      this.router.navigateByUrl('/404', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/authorized/party']));
      this.partyService.joinInProgress = false;
    }, 750);
  }
}
