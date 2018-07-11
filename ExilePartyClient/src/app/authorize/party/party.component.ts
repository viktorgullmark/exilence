import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material';

import { AnalyticsService } from '../../shared/providers/analytics.service';
import { PartyService } from '../../shared/providers/party.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit {
  selectedIndex = 0;

  @ViewChild('tabGroup') tabGroup: MatTabGroup;

  constructor(
    public partyService: PartyService,
    private analyticsService: AnalyticsService
  ) {


  }

  ngOnInit() {
    this.partyService.selectedPlayer.next(this.partyService.party.players[0]);
    this.tabGroup.selectedIndexChange.subscribe(res => {
      if (res === 0) {
        this.analyticsService.sendLastPartyPlayerScreen();
      }
      this.selectedIndex = res;
    });
  }


}
