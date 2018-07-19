import { NetWorthSnapshot } from '../interfaces/income.interface';
import { ExtendedAreaInfo } from '../interfaces/area.interface';

export class HistoryHelper {
    public static filterNetworth(history: NetWorthSnapshot[], timestamp: number) {
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
    public static filterAreas(history: ExtendedAreaInfo[], timestamp: number) {
        history = history.filter((area: ExtendedAreaInfo) => area.timestamp > timestamp);
        return history;
    }
}
