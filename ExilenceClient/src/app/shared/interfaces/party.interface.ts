import { Player } from './player.interface';
export interface Party {
    name: string;
    spectatorCode: string;
    players: Array<Player>;
}
