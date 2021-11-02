function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomIntIncl(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return random(min, max);
}
