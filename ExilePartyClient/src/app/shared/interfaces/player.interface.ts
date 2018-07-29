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
    sessionIdProvided: boolean;
    genericHost: string;
    netWorthSnapshots: NetWorthSnapshot[];
    areaInfo: ExtendedAreaInfo;
    pastAreas: ExtendedAreaInfo[];
    ladderInfo: LadderPlayer[];
}

export interface RecentPlayer {
    name: string;
}

export interface LadderPlayer {
    name: string;
    level: number;
    online: boolean;
    account: string;
    dead: boolean;
    experience: number;
    rank: number;
    twitch: string;
    class: string;
    class_rank: number;
    experience_per_hour: number;
}
