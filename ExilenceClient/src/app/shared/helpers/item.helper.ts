import { Item } from '../interfaces/item.interface';


export class ItemHelper {
    public static getLinks(array: any[]) {
        const numMapping = {};
        let greatestFreq = 0;
        array.forEach(function findMode(number) {
            numMapping[number] = (numMapping[number] || 0) + 1;

            if (greatestFreq < numMapping[number]) {
                greatestFreq = numMapping[number];
            }
        });
        return greatestFreq;
    }
    public static getItemName(typeline: string, name: string) {
        let itemName = name;
        if (typeline) {
            itemName += ' ' + typeline;
        }
        return itemName.replace('<<set:MS>><<set:M>><<set:S>>', '').trim();
    }

    public static getItemVariant(item: Item): string {

        if (item.name === 'Atziri\'s Splendour') {
            if (item.explicitMods.filter(s => s.includes('increased Armour, Evasion and Energy Shield'))) { return 'ar/ev/es'; }
        }

        return null;
    }
}
