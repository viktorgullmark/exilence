import { NetWorthHistory } from './income.interface';

export interface Settings {
  account: AccountSettings;
  networth: NetWorthHistory;
  recentParties: string[];
}

export interface AccountSettings {
  accountName: string;
  filePath: string;
  characterName: string;
  sessionId; string;
  selectedStashTabs: number[];
}
