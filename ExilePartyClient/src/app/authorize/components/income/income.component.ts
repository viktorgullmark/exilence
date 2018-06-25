import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/range';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/mergeMap';



import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Stash, Tab } from '../../../shared/interfaces/stash.interface';
import { ExternalService } from '../../../shared/providers/external.service';
import { NinjaService } from '../../../shared/providers/ninja.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SessionService } from '../../../shared/providers/session.service';
import { NinjaTypes, NinjaResponse, NinjaLine } from '../../../shared/interfaces/poe-ninja.interface';
import { Subscription } from 'rxjs';
import { BootstrapOptions } from '@angular/core/src/application_ref';


@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})
export class IncomeComponent implements OnInit {

  private prices: any[] = [];

  constructor(
    private ninjaService: NinjaService,
    private partyService: PartyService,
    private externalService: ExternalService,
    private sessionService: SessionService
  ) {

    const sessionId = this.sessionService.getSession();
    const accountName = this.partyService.accountInfo.accountName;
    const league = this.partyService.player.character.league;


    // this.getValuesFromNinja(league);
    // this.getPlayerStashTabs(sessionId, accountName, league);

    // setTimeout(() => {
    //   console.log('Loaded prices from poe.ninja: ', this.prices);
    // }, 5000);

  }

  ngOnInit() {
  }

  getValuesFromNinja(league: string) {

    const enumTypes = Object.values(NinjaTypes);

    Observable.from(enumTypes)
      .mergeMap((type) => this.ninjaService.getFromNinja(league, type))
      .subscribe((response: NinjaResponse) => {
        response.lines.forEach((line) => {

          let links = 0;
          let value = 0;
          let name = '';

          if ('chaosEquivalent' in line) {
            value = line.chaosEquivalent;
          }
          if ('chaosValue' in line) {
            value = line.chaosValue;
          }
          if ('currencyTypeName' in line) {
            name = line.currencyTypeName;
          }
          if ('name' in line) {
            name = line.name;
          }
          if ('links' in line) {
            links = line.links;
          }

          if (value > 2 && links === 0 && name !== '') {
            const obj = {
              name,
              value
            };
            this.prices.push(obj);
          }

        });
      }, error => console.log(error));
  }

  getPlayerStashTabs(sessionId: string, accountName: string, league: string) {
    this.externalService.getStashTabs(sessionId, accountName, league).subscribe((tabResponse: Stash) => {

      const numTabs = tabResponse.numTabs;

      Observable.interval(750)
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
