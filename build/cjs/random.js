"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.randomIntIncl = void 0;
const crypto_1 = require("crypto");
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomIntIncl(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return random(min, max);
}
exports.randomIntIncl = randomIntIncl;
/*
 * Fisher-Yates shuffle algorithm, Durstenfeld's variant as described in
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 *
 * This function shuffles the given array in-place.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = (0, crypto_1.randomInt)(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}
exports.shuffle = shuffle;
