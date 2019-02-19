import { NetWorthItem } from './income.interface';

export enum AreaType {
  area = 0,
  vaal = 1,
  map = 2,
  master = 3,
  labyrinth = 4,
  unknown = 5
}

export interface AreaInfo {
  act: number;
  level: number;
  tier: number;
  town: boolean;
  waypoint: boolean;
  trial: boolean;
  bosses: string[];
}

export interface EventArea {
  name: string;
  type: string;
  info: AreaInfo[];
  timestamp: string;
}

export enum AreaEventType {
  Join = 0,
  Leave = 1
}

export interface ExtendedAreaInfo {
  eventArea: EventArea;
  type: AreaEventType;
  timestamp: number;
  duration: number;
  difference: NetWorthItem[];
  inventory: NetWorthItem[];
  instanceServer: string;
  subAreas: ExtendedAreaInfo[];
}
