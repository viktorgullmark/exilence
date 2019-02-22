import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material';
import { Subscription, Observable } from 'rxjs';

import { Player } from '../../shared/interfaces/player.interface';
import { AccountService } from '../../shared/providers/account.service';
import { AnalyticsService } from '../../shared/providers/analytics.service';
import { ElectronService } from '../../shared/providers/electron.service';
import { MessageValueService } from '../../shared/providers/message-value.service';
import { PartyService } from '../../shared/providers/party.service';
import { SettingsService } from '../../shared/providers/settings.service';
import { StateService } from '../../shared/providers/state.service';
import { PartySummaryComponent } from './party-summary/party-summary.component';
import { LadderSummaryComponent } from './ladder-summary/ladder-summary.component';
import { AreaSummaryComponent } from './area-summary/area-summary.component';
import { Store, select } from '@ngrx/store';
import { SpectatorCountState } from '../../app.states';
import * as specCountReducer from '../../store/spectator-count/spectator-count.reducer';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})
export class PartyComponent implements OnInit, OnDestroy {
  selectedIndex = 0;
  player: Player;
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('tabSummary') tabSummary: PartySummaryComponent;
  @ViewChild('tabLadder') tabLadder: LadderSummaryComponent;
  @ViewChild('tabArea') tabArea: AreaSummaryComponent;

  private selectedPlayerSub: Subscription;
  private playerSub: Subscription;
  private partySub: Subscription;
  private currentPlayerValueSub: Subscription;
  private tabSubscription: any;
  private spectatorCountSub: any;
  private gainHours = 1;
  private stateSub: Subscription;
  public spectatorCount: number;

  private specCount$: Observable<number>;

  constructor(
    public partyService: PartyService,
    private analyticsService: AnalyticsService,
    private messageValueService: MessageValueService,
    private electronService: ElectronService,
    private settingsService: SettingsService,
    private stateService: StateService,
    private specCountStore: Store<SpectatorCountState>
  ) {

    this.specCount$ = this.specCountStore.select(specCountReducer.selectSpectatorCount).pipe();

    this.selectedPlayerSub = this.partyService.selectedPlayer.subscribe(res => {
      if (res !== undefined) {
        this.player = res;
      }
    });
    this.spectatorCountSub = this.specCount$.subscribe(count => {
      this.spectatorCount = count;
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
    const gainHourSetting = this.settingsService.get('gainHours');
    if (gainHourSetting !== undefined) {
      this.gainHours = gainHourSetting;
    } else {
      this.gainHours = 1;
      this.settingsService.set('gainHours', 1);
    }

  }

  ngOnInit() {
    setTimeout(() => { this.stateService.dispatch({ key: 'selectedGroupIndex', value: 0 }); });
    this.partyService.selectedPlayer.next(this.partyService.party.players[0]);
    this.tabSubscription = this.tabGroup.selectedIndexChange.subscribe(res => {
      this.stateService.dispatch({ key: 'selectedGroupIndex', value: res });
      if (res === 0) {
        this.analyticsService.sendLastPartyPlayerScreen();
      }
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
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
    if (this.spectatorCountSub !== undefined) {
      this.spectatorCountSub.unsubscribe();
    }
    if (this.currentPlayerValueSub !== undefined) {
      this.currentPlayerValueSub.unsubscribe();
    }
    if (this.tabSubscription !== undefined) {
      this.tabSubscription.unsubscribe();
    }
    if (this.stateSub !== undefined) {
      this.stateSub.unsubscribe();
    }
  }

  openDialog() {
    switch (this.selectedIndex) {
      // character
      case 0: {
        break;
      }
      // summary
      case 1: {
        this.analyticsService.sendScreenview('/authorized/party/summary');
        this.tabSummary.openSummaryDialog();
        break;
      }
    }

  }
}
