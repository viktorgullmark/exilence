import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Player } from '../../../shared/interfaces/player.interface';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SessionService } from '../../../shared/providers/session.service';
import { MatTab, MatTabGroup } from '@angular/material';

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

  constructor(private partyService: PartyService, private sessionService: SessionService,
    private externalService: ExternalService, private router: Router) { }

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
      this.selectedIndex = res;
    });

  }

}
