import { Item } from './item.interface';
export interface Character {
    name: string;
    league: string;
    classId: number;
    ascendancyClass: number;
    class: string;
    level: number;
    items: Array<Item>;
}
