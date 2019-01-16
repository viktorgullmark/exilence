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
  value_min: number;
  value_max: number;
  value_mode: number;
  value_median: number;
  value_average: number;
  quantity: number;
  valuePerUnit: number;
  name: string;
  stacksize: number;
  quality: number;
  gemLevel: number;
  links: number;
  variation: string;
  frameType: number;
  totalStacksize: number;
}
