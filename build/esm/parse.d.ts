export declare type PercentBreakdown<V> = PercentValue<V>[];
export declare type PercentValue<V> = [number | string | null, V];
export declare function parseNumber(val: any, min?: number | string, max?: number | string): number;
export declare function parseBool(val: any): boolean;
export declare function parsePercentBreakdown<T>(input: T | PercentBreakdown<T>): [number, T][];
