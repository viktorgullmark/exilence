import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { Subscription } from 'rxjs/internal/Subscription';

import { LadderPlayer, Player, PlayerLadder } from '../../../shared/interfaces/player.interface';
import { PartyService } from '../../../shared/providers/party.service';
import { Party } from '../../../shared/interfaces/party.interface';
import { StateService } from '../../../shared/providers/state.service';

@Component({
  selector: 'app-ladder-table',
  templateUrl: './ladder-table.component.html',
  styleUrls: ['./ladder-table.component.scss']
})
export class LadderTableComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:max-line-length
  displayedColumns: string[] = ['online', 'rank', 'level', 'challenges', 'account', 'character', 'class', 'classRank', 'depthGroup', 'depthGroupRank', 'depthSolo', 'depthSoloRank'];
  dataSource = [];
  filteredArr = [];
  source: any;
  party: Party;
  private selectedFilterValueSub: Subscription;
  private partySub: Subscription;
  private playerLadders: Array<PlayerLadder> = [];
  public selectedPlayerValue: any;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(private partyService: PartyService, private stateService: StateService) {
  }

  ngOnInit() {

    this.stateService.state$.subscribe(state => {
      this.playerLadders = 'playerLadders'.split('.').reduce((o, i) => o[i], state);
      this.dataSource = [];
      // if the selection is the right one, update table directly when state is updated
      if (this.party !== undefined) {
        const foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.selectedPlayerValue);
        const ladder = this.playerLadders.find(x => x.name === foundPlayer.character.league);
        if (ladder !== undefined) {
          this.updateTable(ladder.players);
        }
        this.init();
      }
    });

    this.partySub = this.partyService.partyUpdated.subscribe(party => {
      if (party !== undefined) {
        this.party = party;

        let foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.selectedPlayerValue);

        // temporary check
        if (this.partyService.selectedFilterValue === 'All players') {
          this.selectedPlayerValue = this.getPlayers()[0].character.name;
        } else if (foundPlayer !== undefined) {
          this.selectedPlayerValue = this.partyService.selectedFilterValue;
        } else {
          this.selectedPlayerValue = this.getPlayers()[0].character.name;
        }

        foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.selectedPlayerValue);

        this.dataSource = [];
        if (foundPlayer !== undefined) {
          const ladder = this.playerLadders.find(x => x.name === foundPlayer.character.league);
          if (ladder !== undefined) {
            this.updateTable(ladder.players);
          }
          this.init();
        }
      }
    });
    this.selectedFilterValueSub = this.partyService.selectedFilterValueSub.subscribe(res => {
      if (res !== undefined) {
        if (this.partyService.selectedFilterValue === 'All players') {
          this.selectedPlayerValue = this.getPlayers()[0].character.name;
        } else {
          this.selectedPlayerValue = this.partyService.selectedFilterValue;
        }
        const foundPlayer = this.party.players.find(x => x.character !== null &&
          x.character.name === this.selectedPlayerValue);
        this.dataSource = [];
        if (foundPlayer !== undefined) {
          const ladder = this.playerLadders.find(x => x.name === foundPlayer.character.league);
          if (ladder !== undefined) {
            this.updateTable(ladder.players);
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

  getPlayers() {
    return this.party.players.filter(x => x.character !== null);
  }

  init() {
    setTimeout(res => {
      this.filteredArr = [...this.dataSource];
      this.source = new MatTableDataSource(this.filteredArr);
      this.source.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'level': return item.experience;
          case 'class': return item.rank.class;
          default: return item[property];
        }
      };
      this.source.sort = this.sort;
      this.source.paginator = this.paginator;
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
          challenges: player.challenges,
          dead: player.dead,
          experience: player.experience,
          rank: player.rank.overall,
          twitch: player.twitch,
          depthSolo: player.depth.solo,
          depthGroup: player.depth.group,
          depthSoloRank: player.depth.soloRank,
          depthGroupRank: player.depth.groupRank,
          class: player.class,
          classRank: player.rank.class,
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

