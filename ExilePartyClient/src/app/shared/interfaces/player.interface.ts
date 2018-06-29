import { Character } from './character.interface';
import { NetWorthSnapshot } from './income.interface';

export interface Player {
    connectionID: string;
    channel: string;
    account: string;
    character: Character;
    area: string;
    guild: string;
    sessionId: string;
    inArea: Array<string>;
    generic: boolean;
    genericHost: string;
    netWorthSnapshots: NetWorthSnapshot[];
}

export interface RecentPlayer {
    name: string;
}
