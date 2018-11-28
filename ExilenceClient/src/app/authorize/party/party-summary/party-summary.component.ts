import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AnalyticsService } from '../../../shared/providers/analytics.service';
import { MessageValueService } from '../../../shared/providers/message-value.service';
import { PartyService } from '../../../shared/providers/party.service';
import { NetworthTableComponent } from '../../components/networth-table/networth-table.component';
import { RobotService } from '../../../shared/providers/robot.service';
import { KeybindService } from '../../../shared/providers/keybind.service';
import { SettingsService } from '../../../shared/providers/settings.service';
import { MatDialog } from '@angular/material';
import { InfoDialogComponent } from '../../components/info-dialog/info-dialog.component';

@Component({
  selector: 'app-party-summary',
  templateUrl: './party-summary.component.html',
  styleUrls: ['./party-summary.component.scss']
})
export class PartySummaryComponent implements OnInit {
  form: FormGroup;

  isGraphHidden = false;
  @ViewChild('table') table: NetworthTableComponent;

  public graphDimensions = [1000, 300];
  public reportKeybind: any;
  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    public messageValueService: MessageValueService,
    private robotService: RobotService,
    private keybindService: KeybindService,
    private settingsService: SettingsService,
    private dialog: MatDialog
  ) {
    this.analyticsService.sendScreenview('/authorized/party/summary');
    this.form = fb.group({
      searchText: ['']
    });
    this.reportKeybind = this.keybindService.activeBinds.find(x => x.event === 'party-summary-networth');
  }
  ngOnInit() {
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
          'We store all your parties net worth data one week back in time. This will be extended in the future.'
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
    this.table.doSearch(this.form.controls.searchText.value);
  }

  report(toGame: boolean) {
    this.messageValueService.updateMessages();
    if (toGame) {
      this.robotService.sendTextToPathWindow(this.messageValueService.partyNetworthMsg, true);
    } else {
      this.robotService.setTextToClipboard(this.messageValueService.partyNetworthMsg);
    }
  }
}
