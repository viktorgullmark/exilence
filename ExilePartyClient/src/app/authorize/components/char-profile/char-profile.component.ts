import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Player } from '../../../shared/interfaces/player.interface';
import { ExternalService } from '../../../shared/providers/external.service';
import { PartyService } from '../../../shared/providers/party.service';
import { SessionService } from '../../../shared/providers/session.service';

@Component({
  selector: 'app-char-profile',
  templateUrl: './char-profile.component.html',
  styleUrls: ['./char-profile.component.scss']
})
export class CharProfileComponent implements OnInit {
  player: Player;

  constructor(private partyService: PartyService, private sessionService: SessionService,
    private externalService: ExternalService, private router: Router) { }

  ngOnInit() {
    this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
    });
  }

}
