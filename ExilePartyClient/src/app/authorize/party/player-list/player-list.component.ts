import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../../shared/providers/party.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {
  constructor(private partyService: PartyService) { }

  ngOnInit() {
  }

}
