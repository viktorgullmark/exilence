import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSelect } from '@angular/material';
import { Subscription } from 'rxjs';

import { Party } from '../../../shared/interfaces/party.interface';
import { PartyService } from '../../../shared/providers/party.service';

@Component({
  selector: 'app-ladder-summary',
  templateUrl: './ladder-summary.component.html',
  styleUrls: ['./ladder-summary.component.scss']
})
export class LadderSummaryComponent implements OnInit, OnDestroy {

  private party: Party;
  private selectedFilterValueSub: Subscription;
  private partySub: Subscription;
  @ViewChild('playerDd') playerDd: MatSelect;

  constructor(
    @Inject(FormBuilder) fb: FormBuilder,
    public partyService: PartyService
  ) {
  }
  ngOnInit() {
    this.selectedFilterValueSub = this.partyService.selectedFilterValueSub.subscribe(res => {
      if (res !== undefined) {
        this.partyService.selectedFilterValue = res;
        // update the tables whenever the value changes
        this.updateFilterValue(this.partyService.selectedFilterValue);
        if (this.playerDd !== undefined) {
          this.playerDd.value = this.partyService.selectedFilterValue;
        }
      }
    });
    this.partySub = this.partyService.partyUpdated.subscribe(res => {
      if (res !== undefined) {
        this.party = res;

        // check if the current dropdown selection is a player in our party
        const foundPlayer = this.party.players.find(x =>
          x.character !== null && x.character.name === this.partyService.selectedFilterValue);

        // if player left or value is incorrect, update dropdown
        if (foundPlayer === undefined && this.partyService.selectedFilterValue !== 'All players') {
          // force-set the value here, since the subscription wont finish in time, should be reworked
          this.partyService.selectedFilterValue = this.getPlayers[0].character.name;
          this.partyService.selectedFilterValueSub.next(this.getPlayers[0].character.name);
          if (this.playerDd !== undefined) {
            this.playerDd.value = this.getPlayers[0].character.name;
          }
        }
      }
    });
  }
  getPlayers() {
    return this.partyService.party.players.filter(x => x.character !== null);
  }
  ngOnDestroy() {
    if (this.selectedFilterValueSub !== undefined) {
      this.selectedFilterValueSub.unsubscribe();
    }
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
  }

  selectPlayer(filterValue: any) {
    this.partyService.selectedFilterValueSub.next(filterValue.value);

    if (this.party !== undefined) {
      const foundPlayer = this.party.players.find(x => x.character !== null && x.character.name === this.partyService.selectedFilterValue);

      // update values for entire party, or a specific player, depending on selection
      if (this.partyService.selectedFilterValue === 'All players' || this.partyService.selectedFilterValue === undefined) {
        // TODO: update data 
      } else if (foundPlayer !== undefined) {
        // TODO: update data 
      }
    }
  }

  updateFilterValue(filterValue) {
    if (this.party !== undefined) {
      const foundPlayer = this.party.players.find(x => x.character !== null && x.character.name === filterValue);

      // TODO: update table with new value
    }
  }
}
