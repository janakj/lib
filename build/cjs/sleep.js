"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sleep(ms, value) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}
exports.default = sleep;
