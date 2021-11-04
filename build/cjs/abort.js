"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function abort(error, signame = 'SIGTERM') {
    if (error !== undefined)
        console.error('Aborting: ', error);
    if (process !== undefined)
        process.kill(process.pid, signame);
}
exports.default = abort;
