import { NetWorthItem } from '../interfaces/income.interface';
import { ItemPricing } from '../interfaces/item-pricing.interface';
import { Item } from '../interfaces/item.interface';
import { TableHelper } from './table.helper';


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
    public static isSixSocket(item: Item): boolean {
        if (item.sockets !== undefined &&
            item.sockets !== null &&
            item.sockets.length === 6 &&
            (item.frameType === 0 ||
                item.frameType === 1 ||
                item.frameType === 2)
        ) {
            return true;
        }
        return false;
    }
    public static generateJewellersOrb(): Item {
        return {
            frameType: 5,
            // tslint:disable-next-line:max-line-length
            icon: 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketNumbers.png?scale=1&w=1&h=1&v=2946b0825af70f796b8f15051d75164d',
            name: '',
            stackSize: 7,
            typeLine: 'Jeweller\'s Orb'
        } as Item;
    }
    public static getItemVariant(item: Item): string {

        if (item.sockets === null || item.sockets === undefined) {
            return '';
        }

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

    public static getInventoryItems(items: Item[]) {
        return [...items.filter(i => i.inventoryId === 'MainInventory')];
    }

    public static toNetworthItem(item: Item, pricing: ItemPricing): NetWorthItem {
        let icon = item.icon.indexOf('?') >= 0
            ? item.icon.substring(0, item.icon.indexOf('?')) + '?scale=1&scaleIndex=3&w=1&h=1'
            : item.icon + '?scale=1&scaleIndex=3&w=1&h=1';

        if (item.typeLine.indexOf(' Map') > -1) {
            icon = item.icon;
        }

        let stacksize = 1;
        let totalValueForItem = pricing.chaosequiv;
        if (item.stackSize) {
            stacksize = item.stackSize;
            totalValueForItem = (pricing.chaosequiv * stacksize);
        }

        const netWorthItem = {
            name: pricing.name,
            value: totalValueForItem,
            value_min: pricing.chaosequiv_min,
            value_max: pricing.chaosequiv_max,
            value_mode: pricing.chaosequiv_mode,
            value_median: pricing.chaosequiv_median,
            value_average: pricing.chaosequiv_average,
            quantity: pricing.quantity,
            valuePerUnit: pricing.chaosequiv,
            icon,
            stacksize,
            links: pricing.links,
            gemLevel: pricing.gemlevel,
            quality: pricing.quality,
            variation: pricing.variation,
            frameType: pricing.frameType,
            corrupted: pricing.corrupted,
            totalStacksize: pricing.totalStacksize
        } as NetWorthItem;

        return netWorthItem;
    }

    public static CombineNetworthItemStacks(items: NetWorthItem[]): NetWorthItem[] {

        const combinedStacks: NetWorthItem[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const foundStackIndex = combinedStacks.indexOf(TableHelper.findNetworthObj(combinedStacks, item));
            if (foundStackIndex === -1) {
                combinedStacks.push(item);
            } else {
                combinedStacks[foundStackIndex].stacksize += item.stacksize;
                combinedStacks[foundStackIndex].value = combinedStacks[foundStackIndex].stacksize * item.valuePerUnit;
            }
        }

        return combinedStacks;
    }


    public static GetNetworthItemDifference(currentItems: NetWorthItem[], previousItems: NetWorthItem[]): NetWorthItem[] {

        const difference = [];

        const removedItems = previousItems.filter(x =>
            TableHelper.findNetworthObj(currentItems, x) === undefined
        );
        const changedItems = currentItems.filter(x =>
            TableHelper.findNetworthObj(previousItems, x) !== undefined
        );
        const addedItems = currentItems.filter(x =>
            TableHelper.findNetworthObj(previousItems, x) === undefined
        );

        const changedOrAdded = changedItems.concat(addedItems);
        changedOrAdded.forEach(item => {
            // if item exists in first snapshot
            const existingItem = TableHelper.findNetworthObj(previousItems, item);

            if (existingItem !== undefined) {
                const recentItem = Object.assign({}, item);
                recentItem.stacksize = recentItem.stacksize - existingItem.stacksize;
                existingItem.value = recentItem.valuePerUnit * existingItem.stacksize;
                recentItem.value = recentItem.value - existingItem.value;
                if (recentItem.value !== 0 && recentItem.stacksize !== 0) {
                    difference.push(recentItem);
                }
            } else {
                if (item.value !== 0 && item.stacksize !== 0) {
                    difference.push(item);
                }
            }
        });

        removedItems.forEach(item => {
            const recentItem = Object.assign({}, item);
            if (recentItem.value !== 0 && recentItem.stacksize !== 0) {
                recentItem.value = -Math.abs(recentItem.value);
                recentItem.stacksize = -Math.abs(recentItem.stacksize);
                difference.push(recentItem);
            }
        });

        return difference;
    }


}

