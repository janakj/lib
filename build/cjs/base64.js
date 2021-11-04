"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBase64 = exports.toBase64url = void 0;
function toBase64url(base64) {
    return base64.replace(/[+/]/g, c => {
        return {
            '+': '-',
            '/': '_'
        }[c];
    });
}
exports.toBase64url = toBase64url;
function toBase64(base64url) {
    return base64url.replace(/[-_]/g, c => {
        return {
            '-': '+',
            '_': '/'
        }[c];
    });
}
exports.toBase64 = toBase64;
