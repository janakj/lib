export class HttpError extends Error {
    constructor(message, code, reason) {
        super(message);
        this.http_code = code;
        this.http_reason = reason;
    }
}
export class BadRequestError extends HttpError {
    constructor(message, reason = 'Bad Request', code = 400) {
        super(message, code, reason);
    }
}
export class NotFoundError extends HttpError {
    constructor(message, reason = 'Not Found', code = 404) {
        super(message, code, reason);
    }
}
export class ConflictError extends HttpError {
    constructor(message, reason = 'Conflict', code = 409) {
        super(message, code, reason);
    }
}
export class UnauthorizedError extends HttpError {
    constructor(message, reason = 'Unauthorized', code = 401) {
        super(message, code, reason);
    }
}
export class ForbiddenError extends HttpError {
    constructor(message, reason = 'Forbidden', code = 403) {
        super(message, code, reason);
    }
}
export function jsonifyError(res, error, includeStack = false) {
    const code = error.http_code || 500, reason = error.http_reason || 'Internal Server Error';
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
export function jsonify(fn, includeStack = false) {
    return (req, res, next) => {
        void (async function () {
            try {
                const rv = await fn(req, res, next);
                if (rv !== undefined)
                    res.json(rv);
            }
            catch (error) {
                try {
                    jsonifyError(res, error, includeStack);
                }
                catch (e) {
                    // If we get an error here, it's most likely because jsonifyError
                    // attempted to set headers after they have been sent by express. Not
                    // much we can do about it other than notify the admin on the console.
                    console.log(e);
                }
            }
        })();
    };
}
export async function throwForErrors(res) {
    if (res.ok)
        return;
    let msg;
    try {
        const body = await res.json();
        if (typeof body === 'object')
            msg = body.message;
    }
    catch (error) { /* nothing */ }
    throw new Error(msg || res.statusText);
}
