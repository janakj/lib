import { randomInt } from 'crypto';

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomIntIncl(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return random(min, max);
}

/*
 * Fisher-Yates shuffle algorithm, Durstenfeld's variant as described in
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 *
 * This function shuffles the given array in-place.
 */
export function shuffle(array: any[]){
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

