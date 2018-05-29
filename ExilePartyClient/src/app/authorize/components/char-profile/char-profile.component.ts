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

  mods: any[] = [];

  twoStoneRegex = '\\+(.*)\\%\\sto (Fire|Cold|Lightning) and (Fire|Cold|Lightning) Resistance';
  singleRegex = '\\+(.*)\\%\\sto ((?:Fire|Cold|Lightning) Resistance)';

  constructor(private partyService: PartyService, private sessionService: SessionService,
    private externalService: ExternalService, private router: Router) { }

  ngOnInit() {
    this.partyService.selectedPlayer.subscribe(res => {
      this.player = res;
      this.calculateResistances(res);
    });
  }

  calculateResistances(player: Player) {

    player.character.items.forEach(item => {

      let mods = [];
      if (item.craftedMods) {
        mods = mods.concat(item.craftedMods);
      }
      if (item.explicitMods) {
        mods = mods.concat(item.explicitMods);
      }
      if (item.implicitMods) {
        mods = mods.concat(item.implicitMods);
      }
      if (item.enchantMods) {
        mods = mods.concat(item.enchantMods);
      }

      mods.forEach((mod: string) => {

        const singleMatch = mod.match(new RegExp(this.singleRegex));
        if (singleMatch) {
          this.modifyValues(singleMatch[1], singleMatch[2]);
        }

        const twoStoneMatch = mod.match(new RegExp(this.twoStoneRegex));
        if (twoStoneMatch) {
          this.modifyValues(twoStoneMatch[1], twoStoneMatch[2] + ' Resistance');
          this.modifyValues(twoStoneMatch[1], twoStoneMatch[3] + ' Resistance');
        }
      });
    });
    console.log(this.mods);
  }

  modifyValues(value, res) {
    if (this.mods[res]) {
      this.mods[res] += parseInt(value, 10);
    } else {
      this.mods[res] = parseInt(value, 10);
    }
  }
}
