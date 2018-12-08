import { NetWorthSnapshot } from '../interfaces/income.interface';
import { ExtendedAreaInfo } from '../interfaces/area.interface';

export class HistoryHelper {
    public static filterNetworth(networth: NetWorthSnapshot[], timestamp: number) {
        let history = Object.assign([], networth);
        history = history.filter((snapshot: NetWorthSnapshot) => snapshot.timestamp > timestamp);
        if (history.length === 0) {
            history = [{
                timestamp: 0,
                value: 0,
                items: []
            }];
        }
        return history;
    }
    public static filterAreas(areas: ExtendedAreaInfo[], timestamp: number) {
        let history = Object.assign([], areas);
        history = history.filter((area: ExtendedAreaInfo) => area.timestamp > timestamp);
        return history;
    }
}
