import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AnalyticsService } from '../../../shared/providers/analytics.service';
import { MessageValueService } from '../../../shared/providers/message-value.service';
import { PartyService } from '../../../shared/providers/party.service';
import { NetworthTableComponent } from '../../components/networth-table/networth-table.component';
import { RobotService } from '../../../shared/providers/robot.service';
import { KeybindService } from '../../../shared/providers/keybind.service';
import { SettingsService } from '../../../shared/providers/settings.service';
import { MatDialog, MatTabGroup } from '@angular/material';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';
import { AccountService } from '../../../shared/providers/account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-party-summary',
  templateUrl: './party-summary.component.html',
  styleUrls: ['./party-summary.component.scss']
})
export class PartySummaryComponent implements OnInit, OnDestroy {
  form: FormGroup;

  isGraphHidden = false;
  @ViewChild('table') table: NetworthTableComponent;
  @ViewChild('overTimeTable') overTimeTable: NetworthTableComponent;
  @ViewChild('networthTabs') networthTabs: MatTabGroup;
  gainHours: number;
  selectedIndex = 0;
  public graphDimensions = [950, 300];
  public reportKeybind: any;
  private partyGainSub: Subscription;
  public partyGain = 0;
  private partySub: Subscription;
  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    public messageValueService: MessageValueService,
    private robotService: RobotService,
    private keybindService: KeybindService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private partyService: PartyService
  ) {
    this.form = fb.group({
      searchText: [''],
      searchTextOverTime: ['']
    });
    this.reportKeybind = this.keybindService.activeBinds.find(x => x.event === 'party-summary-networth');
    this.gainHours = this.settingsService.get('gainHours');

    this.partyGainSub = this.messageValueService.partyGainSubject.subscribe(res => {
      this.partyGain = res;
    });

    this.partySub = this.partyService.partyUpdated.subscribe(res => {
      if (res !== undefined) {
        let networth = 0;
        this.messageValueService.partyGainSubject.next(0);
        this.partyService.updatePartyGain(this.partyService.party.players);
        res.players.forEach(p => {
          if (p.netWorthSnapshots[0] !== undefined) {
            networth = networth + p.netWorthSnapshots[0].value;
          }
        });
        this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
        this.messageValueService.partyValueSubject.next(networth);
      }
    });
  }
  ngOnInit() {
  }
  ngOnDestroy() {
    if (this.partyGainSub !== undefined) {
      this.partyGainSub.unsubscribe();
    }
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
  }

  toggleGainHours(event) {
    this.settingsService.set('gainHours', +event.value);
    if (this.overTimeTable !== undefined) {
      this.overTimeTable.updateGainHours(+event.value);
    }
    this.gainHours = +event.value;

    this.messageValueService.partyGainSubject.next(0);
    this.partyService.updatePartyGain(this.partyService.party.players);
    this.messageValueService.partyGainSubject.next(this.partyService.partyGain);
  }

  openSummaryDialog(): void {
    if (!this.settingsService.get('diaShown_partySummary') && !this.settingsService.get('hideTooltips')) {
      const dialogRef = this.dialog.open(InfoDialogComponent, {
        width: '650px',
        data: {
          icon: 'attach_money',
          title: 'Currency summary',
          // tslint:disable-next-line:max-line-length
          content: 'This tab updates when a partymember changes area in game, at most once every 5 minutes.<br/><br/>' +
            'We store all your parties net worth data two weeks back in time. This will be extended in the future.'
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.settingsService.set('diaShown_partySummary', true);
      });
    }
  }

  toggleGraph(event: boolean) {
    this.isGraphHidden = true;
  }

  hideGraph() {
    this.isGraphHidden = true;
  }

  showGraph() {
    this.isGraphHidden = false;
  }

  search() {
    if (this.table !== undefined) {
      this.table.doSearch(this.form.controls.searchText.value);
    }
  }

  searchOverTime() {
    if (this.overTimeTable !== undefined) {
      this.overTimeTable.doSearch(this.form.controls.searchTextOverTime.value);
    }
  }

  report(toGame: boolean) {
    this.messageValueService.updatePartyMsg();
    if (toGame) {
      this.robotService.sendTextToPathWindow(this.messageValueService.partyNetworthMsg, true);
    } else {
      this.robotService.setTextToClipboard(this.messageValueService.partyNetworthMsg);
    }
  }

  handleTabEvent() {
    // clear filter-fields when tab is changed
    this.form.controls.searchText.setValue('');
    this.form.controls.searchTextOverTime.setValue('');
  }
}
