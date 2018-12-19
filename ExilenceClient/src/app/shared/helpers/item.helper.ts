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
}
