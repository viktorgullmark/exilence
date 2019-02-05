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
    isLeader: boolean;
    isSpectator: boolean;
    netWorthSnapshots: NetWorthSnapshot[];
    areaInfo: ExtendedAreaInfo;
    pastAreas: ExtendedAreaInfo[];
    ladderInfo: LadderPlayer[];
}

export interface RecentPlayer {
    name: string;
}

export interface Rank {
    overall: number;
    class: number;
    depth: number;
}

export interface Depth {
    solo: number;
    soloRank: number;
    group: number;
    groupRank: number;
}

export interface LadderPlayer {
    name: string;
    level: number;
    online: boolean;
    dead: boolean;
    account: string;
    challenges: number;
    experience: number;
    experiencePerHour: number;
    rank: Rank;
    depth: Depth;
    twitch: string;
    class: string;
    updated: Date;
}



