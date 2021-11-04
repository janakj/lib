"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomIntIncl = void 0;
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomIntIncl(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return random(min, max);
}
exports.randomIntIncl = randomIntIncl;
