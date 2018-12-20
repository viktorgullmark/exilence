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
  valuePerUnit: number;
  name: string;
  stacksize: number;
  quality: number;
  gemLevel: number;
  links: number;
  variation: string;
}
