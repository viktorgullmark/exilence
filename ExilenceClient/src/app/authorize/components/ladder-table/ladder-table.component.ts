import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';

import { LadderPlayer, Player } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';
import { Party } from '../../../shared/interfaces/party.interface';

@Component({
  selector: 'app-ladder-table',
  templateUrl: './ladder-table.component.html',
  styleUrls: ['./ladder-table.component.scss']
})
export class LadderTableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['online', 'rank', 'level', 'character', 'account', 'experiencePerHour'];
  dataSource = [];
  filteredArr = [];
  source: any;
  party: Party;
  private selectedFilterValueSub: Subscription;
  private partySub: Subscription;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private partyService: PartyService) {
  }

  ngOnInit() {
    this.partySub = this.partyService.partyUpdated.subscribe(party => {
      if (party !== undefined) {
        this.party = party;
      }
    });
    this.selectedFilterValueSub = this.partyService.selectedFilterValueSub.subscribe(res => {
      if (res !== undefined) {
        const foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.partyService.selectedFilterValue);
        this.dataSource = [];
        if (foundPlayer !== undefined) {
          if (foundPlayer.ladderInfo !== null && foundPlayer.ladderInfo !== undefined) {
            this.updateTable(foundPlayer.ladderInfo);
          }
          this.init();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.selectedFilterValueSub !== undefined) {
      this.selectedFilterValueSub.unsubscribe();
    }
    if (this.partySub !== undefined) {
      this.partySub.unsubscribe();
    }
  }

  init() {
    setTimeout(res => {
      this.filteredArr = [...this.dataSource];
      this.source = new MatTableDataSource(this.filteredArr);
      this.source.sort = this.sort;
    }, 0);
  }

  updateTable(playersOnLadder: LadderPlayer[]) {
    if (playersOnLadder !== null) {
      playersOnLadder.forEach((player: LadderPlayer) => {
        const newPlayerObj = {
          character: player.name,
          level: player.level,
          online: player.online,
          account: player.account,
          dead: player.dead,
          experience: player.experience,
          rank: player.rank.overall,
          twitch: player.twitch,
          class: player.class,
          class_rank: player.rank.class,
          experiencePerHour: this.numberWithSpaces(player.experiencePerHour)
        };

        this.dataSource.push(newPlayerObj);
      });
    }
  }

  numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}

