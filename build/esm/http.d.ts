import type { NextFunction, Request, Response } from 'express';
import type { Response as FetchResponse } from 'node-fetch';
export declare class HttpError extends Error {
    http_code: number | undefined;
    http_reason: string | undefined;
    constructor(message?: string, code?: number, reason?: string);
}
export declare class BadRequestError extends HttpError {
    constructor(message?: string, reason?: string, code?: number);
}
export declare class NotFoundError extends HttpError {
    constructor(message?: string, reason?: string, code?: number);
}
export declare class ConflictError extends HttpError {
    constructor(message?: string, reason?: string, code?: number);
}
export declare class UnauthorizedError extends HttpError {
    constructor(message?: string, reason?: string, code?: number);
}
export declare class ForbiddenError extends HttpError {
    constructor(message?: string, reason?: string, code?: number);
}
export declare function jsonifyError(res: Response, error: Error, includeStack?: boolean): void;
export declare function jsonify(fn: (req: Request, res: Response, next: NextFunction) => any | Promise<any>, includeStack?: boolean): (req: Request, res: Response, next: NextFunction) => void;
export declare function throwForErrors(res: FetchResponse): Promise<void>;
