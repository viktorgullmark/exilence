import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material';
import { Router } from '@angular/router';

import { Player } from '../../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../../shared/providers/analytics.service';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SessionService } from '../../../shared/providers/session.service';
import { ElectronService } from '../../../shared/providers/electron.service';
import { LadderService } from '../../../shared/providers/ladder.service';

@Component({
  selector: 'app-char-profile',
  templateUrl: './char-profile.component.html',
  styleUrls: ['./char-profile.component.scss']
})
export class CharProfileComponent implements OnInit {
  player: Player;

  @Input() localProfile = false;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('equipmentTab') equipmentTab: MatTab;

  selectedIndex = 0;

  constructor(
    private partyService: PartyService,
    private sessionService: SessionService,
    private externalService: ExternalService,
    private router: Router,
    private electronService: ElectronService,
    private analyticsService: AnalyticsService,
    private ladderService: LadderService
  ) { }

  ngOnInit() {
    if (!this.localProfile) {
      this.partyService.selectedPlayer.subscribe(res => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 1000);
        this.player = res;
      });
    } else {
      this.partyService.selectedGenericPlayer.subscribe(res => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 1000);
        this.player = res;
      });
    }


    // select first tab
    this.equipmentTab.isActive = true;
    this.tabGroup.selectedIndex = this.selectedIndex;

    // update local index when tab is changed
    this.tabGroup.selectedIndexChange.subscribe(res => {
      if (res === 0) {
        this.analyticsService.sendScreenview('/authorized/party/player/profile');
      }
      this.selectedIndex = res;
    });

  }

  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
  goToProfile() {
    this.openLink('https://www.pathofexile.com/account/view-profile/'
      + this.player.account
      + '/characters?characterName='
      + this.player.character.name);
  }


}
