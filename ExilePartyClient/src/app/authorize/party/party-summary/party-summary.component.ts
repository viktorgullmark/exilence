import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AnalyticsService } from '../../../shared/providers/analytics.service';
import { MessageValueService } from '../../../shared/providers/message-value.service';
import { PartyService } from '../../../shared/providers/party.service';
import { NetworthTableComponent } from '../../components/networth-table/networth-table.component';
import { RobotService } from '../../../shared/providers/robot.service';

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

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    public messageValueService: MessageValueService,
    private robotService: RobotService
  ) {
    this.analyticsService.sendScreenview('/authorized/party/summary');
    this.form = fb.group({
      searchText: ['']
    });
  }
  ngOnInit() {
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
