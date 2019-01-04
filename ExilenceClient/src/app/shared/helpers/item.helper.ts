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

        if (item.name === 'Impresence') {
            if (item.explicitMods.filter(s => s.includes('Lightning Damage'))) { return 'Lightning'; }
            if (item.explicitMods.filter(s => s.includes('Fire Damage'))) { return 'Fire'; }
            if (item.explicitMods.filter(s => s.includes('Cold Damage'))) { return 'Cold'; }
            if (item.explicitMods.filter(s => s.includes('Physical Damage'))) { return 'Physical'; }
            if (item.explicitMods.filter(s => s.includes('Chaos Damage'))) { return 'Chaos'; }
        }

        // Abyssal
        if (item.name === 'Lightpoacher') {
            const count = item.sockets.filter(x => x.sColour === 'A' || x.sColour === 'a').length;
            return count === 1 ? count + ' Jewel' : count + ' Jewels';
        }
        if (item.name === 'Shroud of the Lightless') {
            const count = item.sockets.filter(x => x.sColour === 'A' || x.sColour === 'a').length;
            return count === 1 ? count + ' Jewel' : count + ' Jewels';
        }
        if (item.name === 'Bubonic Trail') {
            const count = item.sockets.filter(x => x.sColour === 'A' || x.sColour === 'a').length;
            return count === 1 ? count + ' Jewel' : count + ' Jewels';
        }
        if (item.name === 'Tombfist') {
            const count = item.sockets.filter(x => x.sColour === 'A' || x.sColour === 'a').length;
            return count === 1 ? count + ' Jewel' : count + ' Jewels';
        }
        if (item.name === 'Hale Negator') {
            const count = item.sockets.filter(x => x.sColour === 'A' || x.sColour === 'a').length;
            return count === 1 ? count + ' Jewel' : count + ' Jewels';
        }
        if (item.name === 'Command of the Pit') {
            const count = item.sockets.filter(x => x.sColour === 'A' || x.sColour === 'a').length;
            return count === 1 ? count + ' Jewel' : count + ' Jewels';
        }

        return '';
    }

    public static getMapTier(properties: any[]) {

        for (let i = 0; i < properties.length; i++) {
            const prop = properties[i];
            if (prop.name === 'Map Tier') {
                return +prop.values[0][0];
            }
        }
        return 0;
    }
}
