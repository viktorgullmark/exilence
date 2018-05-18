import { Item } from './item.interface';
import { Character } from './character.interface';
export interface EquipmentResponse {
    character: Character;
    items: Array<Item>;
}
