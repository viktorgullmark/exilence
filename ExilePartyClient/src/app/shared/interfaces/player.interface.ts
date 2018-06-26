import { Character } from './character.interface';

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
}

export interface RecentPlayer {
    name: string;
    invited: boolean;
    private: boolean;
}
