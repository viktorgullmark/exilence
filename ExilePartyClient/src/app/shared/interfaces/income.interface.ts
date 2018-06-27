export interface NetWorthSnapshot {
  timestamp: number;
  value: number;
  items: NetWorthItem[];
}

export interface NetWorthHistory {
  lastSnapshot: number;
  history: NetWorthSnapshot[];
}

export interface NetWorthItem {
  icon: string;
  value: number;
  name: string;
  stacksize: number;
}
