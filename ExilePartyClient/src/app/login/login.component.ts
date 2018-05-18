import { Component, OnInit } from '@angular/core';
import { ExternalService } from '../shared/providers/external.service';
import { EquipmentResponse } from '../shared/interfaces/equipment-response.interface';
import { PlayerService } from '../shared/providers/player.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private externalService: ExternalService, private playerService: PlayerService) { }

  ngOnInit() {
  }

  login() {
    this.externalService.getCharacter('cojl', 'CojL_letshunt', '593d693827a1cc8663dc9b82486a3445')
      .subscribe((data: EquipmentResponse) => {
        this.playerService.currentPlayerObj.character = data.character;
        this.playerService.currentPlayerObj.character.items = data.items;
        console.log('received player: ', this.playerService.currentPlayerObj);
        localStorage.set('sessionId', '593d693827a1cc8663dc9b82486a3445');
        this.router.navigate(['/authorized/profile']);
      });
  }
}
