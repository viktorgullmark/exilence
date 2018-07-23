import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Player } from '../../../../shared/interfaces/player.interface';
import { AnalyticsService } from '../../../../shared/providers/analytics.service';
import { PartyService } from '../../../../shared/providers/party.service';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { StashService } from '../../../../shared/providers/stash.service';
import { Stash, Tab } from '../../../../shared/interfaces/stash.interface';
import { StashTypes } from '../../../../shared/enums/stash-type.enum';
import { Item } from '../../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-char-stash',
  templateUrl: './char-stash.component.html',
  styleUrls: ['./char-stash.component.scss']
})
export class CharStashComponent implements OnInit {
  stashFormGroup: FormGroup;
  @Input() player: Player;
  private stash: Stash;
  private selectedTab: Tab;
  private items: Item[];
  constructor(@Inject(FormBuilder)
  fb: FormBuilder,
    private partyService: PartyService,
    private analyticsService: AnalyticsService,
    private electronService: ElectronService,
    private stashService: StashService
  ) {
    this.stashFormGroup = fb.group({
      tabId: ['']
    });
    this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
      this.loadStashtab();
    });
    this.stashService.stash.subscribe(res => {
      if (res !== undefined) {
        this.stash = res;
      }
    });
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/party/player/stash');
  }

  loadStashtab() {
    this.selectedTab = undefined;
    if (this.stash !== undefined) {
      const tabToSelect = this.stash.tabs.find(x => x.i === this.stashFormGroup.controls.tabId.value);
      if (this.player.stashTabs !== null && this.player.stashTabs !== undefined && tabToSelect !== undefined) {
        const playerTab = this.player.stashTabs.find(x => x.index === tabToSelect.i);
        if (playerTab !== undefined) {
          tabToSelect.items = playerTab.items;
        }
      }
      this.selectedTab = tabToSelect;
    }
  }

  getInventoryId(selectedTab: Tab){
    if(selectedTab.items !== null && selectedTab.items !== undefined && selectedTab.items.length > 0){
      return selectedTab.items[0].inventoryId;
    }
    return '';
  }

  private deepClone(array: any[]): any[] {
    return JSON.parse(JSON.stringify(array));
  }
}
