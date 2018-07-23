import { Item } from './item.interface';

export interface Stash {
    numTabs: number;
    tabs: Tab[];
    items: Item[];
    [x: string]: any;
}

export interface Tab {
    n: string;
    i: number;
    id: string;
    type: string;
    hidden: boolean;
    selected: boolean;
    colour: Colour;
    srcL: string;
    srcC: string;
    srcR: string;
    items: Item[];
}

export interface Colour {
    r: number;
    g: number;
    b: number;
}

export interface StashTab {
    items: Item[];
    index: number;
    name: string;
}
