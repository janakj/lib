import type { NextFunction, Request, Response } from 'express';


export class HttpError extends Error {
    http_code: number | undefined;
    http_reason: string | undefined;
    constructor(message?: string, code?: number, reason?: string) {
        super(message);
        this.http_code = code;
        this.http_reason = reason;
    }
}

export class BadRequestError extends HttpError {
    constructor(message?: string, reason='Bad Request', code=400) {
        super(message, code, reason);
    }
}

export class NotFoundError extends HttpError {
    constructor(message?: string, reason='Not Found', code=404) {
        super(message, code, reason);
    }
}

export class ConflictError extends HttpError {
    constructor(message?: string, reason='Conflict', code=409) {
        super(message, code, reason);
    }
}

export function jsonifyError(res: Response, error: Error, includeStack=false) {
    const code = (error as HttpError).http_code || 500,
        reason = (error as HttpError).http_reason || 'Internal Server Error';
    res.statusMessage = reason;
    res.status(code);
    res.type('application/json');
    res.json({
        code,
        reason,
        message: error.message,
        ...(includeStack && { stack: error.stack })
    });
}

export function jsonify(fn: (req: Request, res: Response, next: NextFunction) => any | Promise<any>, includeStack=false) {
    return (req: Request, res: Response, next: NextFunction) => {
        void (async function () {
            try {
                const rv = await fn(req, res, next);
                if (rv !== undefined) res.json(rv);
            } catch(error: any) {
                try {
                    jsonifyError(res, error, includeStack);
                } catch(e) {
                    // If we get an error here, it's most likely because jsonifyError
                    // attempted to set headers after they have been sent by express. Not
                    // much we can do about it other than notify the admin on the console.
                    console.log(e);
                }
            }
        })();
    };
}
