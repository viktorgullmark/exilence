import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { Player } from '../../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../../shared/providers/analytics.service';
import { ElectronService } from '../../../shared/providers/electron.service';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SessionService } from '../../../shared/providers/session.service';
import { CharEquipmentComponent } from './char-equipment/char-equipment.component';
import { CharMapsComponent } from './char-maps/char-maps.component';
import { CharWealthComponent } from './char-wealth/char-wealth.component';

@Component({
  selector: 'app-char-profile',
  templateUrl: './char-profile.component.html',
  styleUrls: ['./char-profile.component.scss']
})
export class CharProfileComponent implements OnInit, OnDestroy {
  player: Player;

  @Input() localProfile = false;
  @ViewChild('subTabGroup') subTabGroup: MatTabGroup;
  @ViewChild('equipmentTab') equipmentTab: MatTab;
  @ViewChild('charWealth') charWealth: CharWealthComponent;
  @ViewChild('charMaps') charMaps: CharMapsComponent;
  @ViewChild('charEquipment') charEquipment: CharEquipmentComponent;

  selectedIndex = 0;
  private selectedPlayerSub: Subscription;
  private selectedGenPlayerSub: Subscription;

  constructor(
    private partyService: PartyService,
    private sessionService: SessionService,
    private externalService: ExternalService,
    private router: Router,
    private electronService: ElectronService,
    private analyticsService: AnalyticsService,
  ) {
    this.analyticsService.sendScreenview('/authorized/party/player/profile');
  }


  ngOnInit() {
    if (!this.localProfile) {
      this.selectedPlayerSub = this.partyService.selectedPlayer.subscribe(res => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 1000);
        this.player = res;
      });
    } else {
      this.selectedGenPlayerSub = this.partyService.selectedGenericPlayer.subscribe(res => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 1000);
        this.player = res;
      });
    }


    // select first tab
    this.equipmentTab.isActive = true;
    this.subTabGroup.selectedIndex = this.selectedIndex;

    // update local index when tab is changed
    this.subTabGroup.selectedIndexChange.subscribe(res => {
      this.selectedIndex = res;
    });
  }

  ngOnDestroy() {
    if (this.selectedPlayerSub !== undefined) {
      this.selectedPlayerSub.unsubscribe();
    }
    if (this.selectedGenPlayerSub !== undefined) {
      this.selectedGenPlayerSub.unsubscribe();
    }
  }

  handleTabEvent() {
    switch (this.selectedIndex) {
      // equipment
      case 0: {
        this.charEquipment.openEquipmentDialog();
        this.analyticsService.sendScreenview('/authorized/party/player/profile');
        break;
      }
      // wealth
      case 1: {
        this.charWealth.openCurrencyDialog();
        this.analyticsService.sendScreenview('/authorized/party/player/wealth');
        break;
      }
      // maps
      case 2: {
        this.charMaps.openMapDialog();
        this.analyticsService.sendScreenview('/authorized/party/player/maps');
        break;
      }
      // ladder
      case 3: {
        this.analyticsService.sendScreenview('/authorized/party/player/ladder');
        break;
      }
    }
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
