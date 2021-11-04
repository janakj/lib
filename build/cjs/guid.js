"use strict";
/**
 * Globally Unique Identifiers (GUID)
 *
 * This module implements a globally unique random-based identifier (GUID) based
 * on UUID version 4 and encoded in base64-url. The GUID is 128 bits long and
 * contains 122 bits of randomness. The remaining 6 bits are reserved. Using
 * UUIDs as the base implementation makes the GUID compatible with external
 * implementations, e.g.,  PostgreSQL's uuid columnt type.
 *
 * Unlike UUIDs, GUIDs are by default encoded in the URL-safe base64 variant
 * with padding removed. Padding is not necessary since the size of the GUID is
 * fixed and known. When encoded in a string, the GUID is exactly 22 characters
 * long.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asUUID = void 0;
const uuid_1 = require("uuid");
const base64_js_1 = __importDefault(require("base64-js"));
const base64_1 = require("./base64");
function GUID() {
    const buffer = new Uint8Array(16);
    return (0, base64_1.toBase64url)(base64_js_1.default.fromByteArray((0, uuid_1.v4)(undefined, buffer))
        .slice(0, 22));
}
exports.default = GUID;
function asUUID(guid) {
    if (!guid)
        return '';
    return (0, uuid_1.stringify)(base64_js_1.default.toByteArray(`${(0, base64_1.toBase64)(guid)}==`));
}
exports.asUUID = asUUID;
