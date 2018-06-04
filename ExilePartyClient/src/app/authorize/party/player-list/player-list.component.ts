import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../../shared/providers/party.service';
import { Player } from '../../../shared/interfaces/player.interface';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {
  constructor(public partyService: PartyService) { }

  hc: Player[];
  std: Player[];
  incursion: Player[];
  incursionSsf: Player[];
  incursionHc: Player[];
  incursionSsfHc: Player[];

  ngOnInit() {
    this.partyService.hc.subscribe(res => {
      this.hc = res;
    });
    this.partyService.std.subscribe(res => {
      this.std = res;
    });
    this.partyService.incursionHc.subscribe(res => {
      this.incursionHc = res;
    });
    this.partyService.incursionStd.subscribe(res => {
      this.incursion = res;
    });
    this.partyService.incursionSsfHc.subscribe(res => {
      this.incursionSsfHc = res;
    });
    this.partyService.incursionSsfStd.subscribe(res => {
      this.incursionSsf = res;
    });
  }
}
