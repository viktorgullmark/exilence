import { Component, Input, OnInit } from '@angular/core';

import { Item } from '../../../../shared/interfaces/item.interface';
import * as data from './equipment-slots';
import { ElectronService } from '../../../../shared/providers/electron.service';
import { Player } from '../../../../shared/interfaces/player.interface';
import { PartyService } from '../../../../shared/providers/party.service';

@Component({
  selector: 'app-char-equipment',
  templateUrl: './char-equipment.component.html',
  styleUrls: ['./char-equipment.component.scss']
})
export class CharEquipmentComponent implements OnInit {
  @Input() items: Item[];
  equipment = data.equipmentSlots;
  flasks = data.flaskSlots;
  selectedPlayer: Player;
  constructor(private electronService: ElectronService, private partyService: PartyService) {
  }

  ngOnInit() {
    this.partyService.selectedPlayer.subscribe(res => {
      this.selectedPlayer = res;
    });
  }

  getItemByType(type: string) {
    return this.items.find(x => x.inventoryId === type);
  }
  getFlaskByIndex(index: number) {
    return this.items.find(x => x.inventoryId === 'Flask' && x.x === index);
  }
  openLink(link: string) {
    this.electronService.shell.openExternal(link);
  }
  goToProfile() {
    this.openLink('https://www.pathofexile.com/account/view-profile/'
      + this.selectedPlayer.account
      + '/characters?characterName='
      + this.selectedPlayer.character.name);
  }
}
