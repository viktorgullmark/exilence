import { Component, OnInit } from '@angular/core';
import { Character } from '../../../shared/interfaces/character.interface';
import { AccountService } from '../../../shared/providers/account.service';
import { EquipmentResponse } from '../../../shared/interfaces/equipment-response.interface';
import { Player } from '../../../shared/interfaces/player.interface';
import { SessionService } from '../../../shared/providers/session.service';
import { ExternalService } from '../../../shared/providers/external.service';
import { Router } from '@angular/router';
import { Item } from '../../../shared/interfaces/item.interface';

@Component({
  selector: 'app-char-profile',
  templateUrl: './char-profile.component.html',
  styleUrls: ['./char-profile.component.scss']
})
export class CharProfileComponent implements OnInit {
  player: Player;
  isLoading = true;
  constructor(private accountService: AccountService, private sessionService: SessionService,
    private externalService: ExternalService, private router: Router) { }

  ngOnInit() {
    this.accountService.player.subscribe(res => {
      this.player = res;
    });
  }
}
