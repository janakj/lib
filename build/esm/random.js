import cryptoNode from 'crypto';
const RAND_MAX = 4294967295;
function randomIntBrowser(min, max) {
    if (!Number.isSafeInteger(min))
        throw new Error('min must be a safe integer');
    if (!Number.isSafeInteger(max))
        throw new Error('max must be a safe integer');
    if (max <= min)
        throw new Error('max must be greater than min');
    const range = max - min;
    if (!(range <= RAND_MAX))
        throw new Error(`max - min range must be smaller than ${RAND_MAX}`);
    // For (x % range) to produce an unbiased value greater than or equal to 0
    // and less than range, x must be drawn randomly from the set of integers
    // greater than or equal to 0 and less than limit.
    const limit = RAND_MAX - (RAND_MAX % range);
    const array = new Uint8Array(4);
    const view = new DataView(array.buffer, 0);
    for (;;) {
        crypto.getRandomValues(array);
        const x = view.getUint32(0);
        if (x < limit)
            return (x % range) + min;
    }
}
export function randomInt(min, max) {
    if (cryptoNode !== undefined && cryptoNode.randomInt !== undefined)
        return cryptoNode.randomInt(min, max);
    else
        return randomIntBrowser(min, max);
}
/*
 * Fisher-Yates shuffle algorithm, Durstenfeld's variant as described in
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 *
 * This function shuffles the given array in-place.
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}
