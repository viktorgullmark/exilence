import { NetWorthItem } from '../interfaces/income.interface';

export class TableHelper {
    public static formatNetworthObj(item: NetWorthItem, index: number, iconLink: string, playerName: string) {
        return {
            position: index,
            name: item.name,
            stacksize: item.stacksize,
            value: item.value,
            value_min: item.value_min,
            quantity: item.quantity,
            value_max: item.value_max,
            value_mode: item.value_mode,
            value_median: item.value_median,
            value_average: item.value_average,
            variation: item.variation,
            corrupted: item.corrupted,
            valuePerUnit: item.valuePerUnit,
            gemLevel: item.gemLevel,
            icon: iconLink,
            links: item.links,
            quality: item.quality,
            holdingPlayers: [playerName],
            frameType: item.frameType,
            totalStacksize: item.totalStacksize
        };
    }

    public static findNetworthObj(array: any[], itemToFind: NetWorthItem) {
        return array.find(x =>
            x.name === itemToFind.name
            && x.quality === itemToFind.quality
            && x.links === itemToFind.links
            && x.gemLevel === itemToFind.gemLevel
            && x.corrupted === itemToFind.corrupted
            && x.variation === itemToFind.variation
            && x.frameType === itemToFind.frameType
        );
    }
}
