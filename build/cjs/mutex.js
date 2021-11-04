"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class Lock {
    constructor() {
        this._locked = false;
        this._emitter = new events_1.default();
    }
    acquire() {
        return new Promise(resolve => {
            if (!this._locked) {
                this._locked = true;
                resolve(void 0);
                return;
            }
            const try_acquire = () => {
                if (!this._locked) {
                    this._locked = true;
                    this._emitter.removeListener('release', try_acquire);
                    resolve(void 0);
                }
            };
            this._emitter.on('release', try_acquire);
        });
    }
    release() {
        this._locked = false;
        setImmediate(() => this._emitter.emit('release'));
    }
}
exports.default = Lock;
