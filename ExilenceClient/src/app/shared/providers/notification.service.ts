import { Injectable } from '@angular/core';
import { Player } from '../interfaces/player.interface';
import { Item } from '../interfaces/item.interface';
import { ItemHelper } from '../helpers/item.helper';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {

  }

  public handleNotifications(oldPlayer: Player, newPlayer: Player) {

    const newItems = this.newitems(oldPlayer, newPlayer);
    const ascendency = oldPlayer.character.class !== newPlayer.character.class;

    if (newItems.length > 0) {
      newItems.forEach(item => console.log(`Player ${newPlayer.character.name} equipped ${item.name} ${item.typeLine}`));
    }
    if (ascendency) {
      console.log(`Player ${newPlayer.character.name} just ascended to ${newPlayer.character.class}`);
    }

  }

  private newitems(oldPlayer: Player, newPlayer: Player): Item[] {
    const oldPlayerEquiped = ItemHelper.getEquipedItems(oldPlayer.character.items).map(i => i.name + i.typeLine);
    const newPlayerEquiped = ItemHelper.getEquipedItems(newPlayer.character.items).map(i => i.name + i.typeLine);
    const newItemNames = newPlayerEquiped.filter(i => oldPlayerEquiped.indexOf(i) === -1);
    const newItems = newPlayer.character.items.filter(i => newItemNames.indexOf(i.name + i.typeLine) > -1);
    return newItems;
  }
}
