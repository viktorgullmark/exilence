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
}