export interface RequestError {
    errorType: ErrorType;
    message: string;
}

export enum ErrorType {
    Unauthorized,
    Unreachable
}
