export default function sleep<T=any>(ms: number, value?: T) {
    return new Promise<T | undefined>(resolve => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}
