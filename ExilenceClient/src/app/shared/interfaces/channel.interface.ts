import { Player } from './player.interface';
export interface Channel {
    id: string;
    players: Array<Player>;
}
