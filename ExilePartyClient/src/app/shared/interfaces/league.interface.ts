import { Player } from './player.interface';

export interface League {
  id: string;
  description: string;
  event: boolean;
}

export interface LeagueWithPlayers {
  id: string;
  players: Player[];
}
