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
    });
    this.stashService.stash.subscribe(res => {
      if (res !== undefined) {
        res.tabs = res.tabs.filter(x => x.type === 'PremiumStash');
        this.stash = res;
      }
    });
  }

  ngOnInit() {
    this.analyticsService.sendScreenview('/authorized/party/player/stash');
  }

  loadStashtab() {
    const tabToSelect = this.stash.tabs.find(x => x.id === this.stashFormGroup.controls.tabId.value);

    this.selectedTab = tabToSelect;
  }
}
