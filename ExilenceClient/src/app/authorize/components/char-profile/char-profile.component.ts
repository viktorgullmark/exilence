import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material';
import { Router } from '@angular/router';
import { Player } from '../../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../../shared/providers/analytics.service';
import { ElectronService } from '../../../shared/providers/electron.service';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SessionService } from '../../../shared/providers/session.service';
import { CharEquipmentComponent } from './char-equipment/char-equipment.component';
import { Subscription } from 'rxjs/internal/Subscription';
import { AccountService } from '../../../shared/providers/account.service';

@Component({
  selector: 'app-char-profile',
  templateUrl: './char-profile.component.html',
  styleUrls: ['./char-profile.component.scss']
})
export class CharProfileComponent implements OnInit, OnDestroy {
  player: Player;
  currentPlayer: Player;
  @Input() localProfile = false;
  @ViewChild('subTabGroup') subTabGroup: MatTabGroup;
  @ViewChild('equipmentTab') equipmentTab: MatTab;
  @ViewChild('charEquipment') charEquipment: CharEquipmentComponent;

  selectedIndex = 0;
  private selectedPlayerSub: Subscription;
  private selectedGenPlayerSub: Subscription;
  private playerSub: Subscription;

  constructor(
    private partyService: PartyService,
    private sessionService: SessionService,
    private externalService: ExternalService,
    private router: Router,
    private electronService: ElectronService,
    private analyticsService: AnalyticsService,
    private accountService: AccountService
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
      this.playerSub = this.accountService.player.subscribe(res => {
        this.currentPlayer = res;
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
    if (this.playerSub !== undefined) {
      this.playerSub.unsubscribe();
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
    }
  }
  openLink(link: string) {
    if (this.electronService.isElectron()) {
      this.electronService.shell.openExternal(link);
    } else {
      window.open(link, '_blank');
    }
  }
  goToProfile() {
    this.openLink('https://www.pathofexile.com/account/view-profile/'
      + this.player.account
      + '/characters?characterName='
      + this.player.character.name);
  }


}
