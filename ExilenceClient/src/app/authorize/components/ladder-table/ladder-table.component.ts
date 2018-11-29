import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

import { LadderPlayer, Player } from '../../../shared/interfaces/player.interface';
import { LadderService } from '../../../shared/providers/ladder.service';
import { PartyService } from '../../../shared/providers/party.service';

@Component({
  selector: 'app-ladder-table',
  templateUrl: './ladder-table.component.html',
  styleUrls: ['./ladder-table.component.scss']
})
export class LadderTableComponent implements OnInit {
  @Input() player: Player;
  displayedColumns: string[] = ['online', 'rank', 'level', 'character', 'account', 'experience_per_hour'];
  dataSource = [];
  filteredArr = [];
  source: any;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private partyService: PartyService, private ladderService: LadderService) {
  }

  ngOnInit() {
    this.updateTable(this.player.ladderInfo);
    this.partyService.selectedPlayer.subscribe(res => {
      if (res !== undefined && res !== null) {
        this.player = res;
        this.dataSource = [];
        if (res.ladderInfo !== null && res.ladderInfo !== undefined) {
          this.updateTable(res.ladderInfo);
        }
        this.init();
      }
    });
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

