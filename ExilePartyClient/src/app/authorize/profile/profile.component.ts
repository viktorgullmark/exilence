import { Component, OnInit } from '@angular/core';
import { Character } from '../../shared/interfaces/character.interface';
import { AccountService } from '../../shared/providers/account.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  private character: Character;
  constructor(private accountService: AccountService) { }

  ngOnInit() {

    this.accountService.player.subscribe(res => {
      this.character = res.character;
      console.log(this.character);
    });
  }
}
