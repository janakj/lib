export function parseNumber(val, min, max) {
    if (typeof val === 'string')
        val = parseInt(val, 10);
    if (Number.isNaN(val))
        throw new Error(`Cannot convert '${val}' to integer`);
    if (typeof val !== 'number')
        throw new Error(`Unsupported number value type ${typeof val}`);
    if (min !== undefined) {
        if (typeof min === 'string')
            min = parseInt(min, 10);
        if (Number.isNaN(min))
            throw new Error(`Invalid minimum value '${min}'`);
        if (val < min)
            throw new Error(`Value ${val} must be >= than ${min}`);
    }
    if (max !== undefined) {
        if (typeof max === 'string')
            max = parseInt(max, 10);
        if (Number.isNaN(max))
            throw new Error(`Invalid maximum value '${max}'`);
        if (val > max)
            throw new Error(`Value ${val} must be <= than ${max}`);
    }
    return val;
}
export function parseBool(val) {
    if (typeof val === 'boolean')
        return val;
    if (typeof val === 'number')
        return val !== 0;
    if (val === undefined)
        return false;
    if (val === null)
        return false;
    if (typeof val === 'string') {
        switch (val.trim().toLowerCase()) {
            case 'true':
            case 'yes':
            case 'on':
            case '1':
            case 'enable':
            case 'enabled':
                return true;
            case 'false':
            case 'no':
            case 'off':
            case '0':
            case 'disable':
            case 'disabled':
                return false;
            default:
                break;
        }
    }
    throw new Error(`Could not convert "${val}" to boolean`);
}
export function parsePercentBreakdown(input) {
    if (!Array.isArray(input)) {
        return [[100, input]];
    }
    let nulls = 0, sum = 0;
    const data = input.map(([v, ...r]) => {
        if (v === null) {
            nulls++;
            return [v, ...r];
        }
        else {
            const n = parseNumber(v, 0, 100);
            sum += n;
            return [n, ...r];
        }
    });
    if (sum !== 100 && nulls === 0)
        if (!nulls)
            throw new Error(`Percentage values must add up to 100%`);
    if (nulls) {
        data.forEach(v => {
            if (v[0] === null)
                v[0] = (100 - sum) / nulls;
        });
    }
    return data;
}
