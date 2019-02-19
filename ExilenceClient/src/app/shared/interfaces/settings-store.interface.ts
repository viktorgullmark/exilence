import { ExtendedAreaInfo } from './area.interface';
import { NetWorthHistory } from './income.interface';

export interface CharacterStore {
    name: string;
    areas: Array<ExtendedAreaInfo>;
    networth: NetWorthHistory;
}

export interface LeagueStore {
    name: string;
    stashtabs: Array<StashStore>;
}

export interface StashStore {
    name: string;
    position: number;
    isMapTab: boolean;
}

export interface ProfileSelection {
    accountName: string;
    characterName: string;
    leagueName: string;
    tradeLeagueName: string;
    filePath: string;
    sessionIdValid: boolean;
    sessionId: string;
}
