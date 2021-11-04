export function toBase64url(base64) {
    return base64.replace(/[+/]/g, c => {
        return {
            '+': '-',
            '/': '_'
        }[c];
    });
}
export function toBase64(base64url) {
    return base64url.replace(/[-_]/g, c => {
        return {
            '-': '+',
            '_': '/'
        }[c];
    });
}
