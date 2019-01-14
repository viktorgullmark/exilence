export interface XRateLimitState {
    requests: number;
    allowed: number;
    timeout: number;
}
