import { EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
import { areaRadial } from 'd3';

export class AreaHelper {
    public static isSameInstance(areaHistory: ExtendedAreaInfo[]): boolean {

        if (areaHistory.length > 2) {
            const previousZoneNeutral = this.isNeutralZone(areaHistory[0]);
            const sameAreaAsPrevious = areaHistory[2].eventArea.name.indexOf(areaHistory[0].eventArea.name);
            const sameInstanceAsPrevious = areaHistory[2].instanceServer === areaHistory[0].instanceServer;

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

    public static formatName(areaEntered: EventArea): string {
        if (areaEntered.type === 'map' && areaEntered.info.length > 0) {
            areaEntered.name += ` map (T${areaEntered.info[0].tier})`;
        }
        return areaEntered.name;
    }
}
