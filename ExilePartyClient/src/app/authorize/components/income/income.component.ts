import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/range';
import 'rxjs/add/operator/take';

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Stash, Tab } from '../../../shared/interfaces/stash.interface';
import { ExternalService } from '../../../shared/providers/external.service';
import { NinjaService } from '../../../shared/providers/ninja.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SessionService } from '../../../shared/providers/session.service';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})
export class IncomeComponent implements OnInit {

  constructor(
    private ninjaService: NinjaService,
    private partyService: PartyService,
    private externalService: ExternalService,
    private sessionService: SessionService
  ) {

    // this.ninjaService.getFromNinja('Incursion', NinjaTypes.DIVINATION_CARD).subscribe(r => {
    //   console.log(r);
    // });

    const sessionId = this.sessionService.getSession();
    const accountName = this.partyService.accountInfo.accountName;
    const league = this.partyService.player.character.league;

    // this.getPlayerStashTabs(sessionId, accountName, league);

  }

  ngOnInit() {
  }


  getPlayerStashTabs(sessionId: string, accountName: string, league: string) {
    this.externalService.getStashTabs(sessionId, accountName, league).subscribe((tabResponse: Stash) => {

      const numTabs = tabResponse.numTabs;

      Observable.interval(330)
      .map((index) => {
        this.externalService.getStashTab(sessionId, accountName, league, index).subscribe((stashResponse: Stash) => {
          this.parsePlayerStashTab(tabResponse.tabs[index], stashResponse);
        });
      })
      .take(numTabs)
      .subscribe();

    });
  }


  parsePlayerStashTab(tab: Tab, stash: Stash) {
    console.log('Parsing stashtab: ', tab.n);
  }

}
