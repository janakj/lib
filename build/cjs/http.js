"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwForErrors = exports.jsonify = exports.jsonifyError = exports.ForbiddenError = exports.UnauthorizedError = exports.ConflictError = exports.NotFoundError = exports.BadRequestError = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, code, reason) {
        super(message);
        this.http_code = code;
        this.http_reason = reason;
    }
}
exports.HttpError = HttpError;
class BadRequestError extends HttpError {
    constructor(message, reason = 'Bad Request', code = 400) {
        super(message, code, reason);
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends HttpError {
    constructor(message, reason = 'Not Found', code = 404) {
        super(message, code, reason);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends HttpError {
    constructor(message, reason = 'Conflict', code = 409) {
        super(message, code, reason);
    }
}
exports.ConflictError = ConflictError;
class UnauthorizedError extends HttpError {
    constructor(message, reason = 'Unauthorized', code = 401) {
        super(message, code, reason);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message, reason = 'Forbidden', code = 403) {
        super(message, code, reason);
    }
}
exports.ForbiddenError = ForbiddenError;
function jsonifyError(res, error, includeStack) {
    const code = error.http_code || 500, reason = error.http_reason || 'Internal Server Error';
    const stack = typeof includeStack === 'boolean' ? includeStack : res.app.get('env') === 'development';
    res.statusMessage = reason;
    res.status(code);
    res.type('application/json');
    res.json({
        code,
        reason,
        message: error.message,
        ...(stack && { stack: error.stack })
    });
}
exports.jsonifyError = jsonifyError;
function jsonify(fn, includeStack) {
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
exports.jsonify = jsonify;
async function throwForErrors(res) {
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
exports.throwForErrors = throwForErrors;
