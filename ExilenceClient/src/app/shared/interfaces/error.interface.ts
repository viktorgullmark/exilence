export interface RequestError {
    type: ErrorType;
    message: string;
}

export enum ErrorType {
    Unauthorized,
    Unreachable
}
