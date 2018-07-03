
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
  instanceServer: string;
}
