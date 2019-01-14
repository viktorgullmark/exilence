import { XRateLimitState } from '../interfaces/x-rate-limit.interface';

export class RequestHelper {

    public static headerToModel(header: string): XRateLimitState {
        const shortLimit = header.split(',')[0];
        const limitStats = shortLimit.split(':');

        const state = {
            requests: +limitStats[0],
            allowed: +limitStats[1],
            timeout: +limitStats[2]
        } as XRateLimitState;

        return state;
    }
}
