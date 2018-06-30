import { ExtendedAreaInfo } from './area.interface';
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
    areaInfo: ExtendedAreaInfo;
    pastAreas: ExtendedAreaInfo[];
}

export interface RecentPlayer {
    name: string;
}
