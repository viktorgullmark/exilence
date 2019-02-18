import { EventArea, ExtendedAreaInfo } from '../interfaces/area.interface';
import { areaRadial } from 'd3';

export class AreaHelper {
    public static isSameInstance(firstArea: ExtendedAreaInfo, secondArea: ExtendedAreaInfo): boolean {
        const sameAreaAsPrevious = firstArea.eventArea.name.indexOf(secondArea.eventArea.name) > -1;
        const sameInstanceAsPrevious = firstArea.instanceServer === secondArea.instanceServer;

        return sameAreaAsPrevious && sameInstanceAsPrevious;
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
