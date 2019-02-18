import { EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';

export class AreaHelper {
    public static isSameInstance(areaHistory: ExtendedAreaInfo[], instanceServer: string): boolean {

        if (areaHistory.length > 2) {
            const previousZoneNeutral = this.isNeutralZone(areaHistory[0]);
            const sameAreaAsPrevious = areaHistory[2].eventArea.name.indexOf(areaHistory[0].eventArea.name);
            const sameInstanceAsPrevious = areaHistory[2].instanceServer === instanceServer;

            return (previousZoneNeutral &&
                sameAreaAsPrevious &&
                sameInstanceAsPrevious);
        }
        return false;
    }

    public static isNeutralZone(area: ExtendedAreaInfo): boolean {
        return ((area.eventArea.name.endsWith('Hideout')
            || area.eventArea.info[0].town)
            || area.eventArea.name === ('The Templar Laboratory'));
    }
}
