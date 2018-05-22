import { Component, OnInit } from '@angular/core';
import { Character } from '../../shared/interfaces/character.interface';
import { AccountService } from '../../shared/providers/account.service';
import { EquipmentResponse } from '../../shared/interfaces/equipment-response.interface';
import { Player } from '../../shared/interfaces/player.interface';
import { SessionService } from '../../shared/providers/session.service';
import { ExternalService } from '../../shared/providers/external.service';
import { Router } from '@angular/router';
import { Item } from '../../shared/interfaces/item.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // tmp
  player = {} as Player;
  constructor(private accountService: AccountService, private sessionService: SessionService,
    private externalService: ExternalService, private router: Router) { }

  ngOnInit() {
    this.tmpBypass();
  }

  // TMP
  tmpBypass() {
    this.externalService.getCharacter({
      accountName: 'cojl', characterName: 'Cojl__', sessionId: '9e4ee6258fbd53063c072abcc5337ba6'
    })
      .subscribe((data: EquipmentResponse) => {
        this.setCharacter(data);
        this.accountService.player.next(this.player);
        this.sessionService.initSession('123');
      });
  }
  // TMP
  setCharacter(data: EquipmentResponse) {
    this.player.character = data.character;
    this.player.character.items = data.items;
  }
}
