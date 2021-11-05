/**
 * This module provides a JavaScript DNS resolver implemented using Google's
 * HTTP-based public DNS API.
 */
export declare const RR_TYPES: Record<string, number>;
/**
 * Resolve a domain name.
 *
 * @param {string} name     - The domain name to be resolve
 * @param {string} type     - Desired record type ('A', 'AAAA', 'SRV', ...)
 * @param {string} validate - Enable/disable DNSSEC validation
 * @return {Array} An array of matching resource records.
 *
 * Resolve the given domain name via Google's public DNS service. The
 * parameter type should contain a string that determines the
 * requested resource type. It can be one of 'A', 'AAAA', 'SRV',
 * 'CNAME', and others.
 *
 * The optional parameter cd (checking disabled) allows disabling
 * DNSSEC validation. When set to true, DNSSEC checks will not be
 * performed. When unset or set to false, the resolver will attempt to
 * perform DNSSEC validation where available.
 *
 * The function returns a Promise which is fulfilled with an array of
 * returned records. Each record is an object which contains the
 * following properties: name, type, TTL, data. The type property
 * contains the integer type of the record. The data property contains
 * the contents of the record, in the same format that is used in DNS
 * zones.
 *
 * If the domain name does not exist in the zone, or if it exists but
 * no matching records were found, the promise is fulfilled with an
 * empty array. If the resolver fails to resolve the domain name,
 * e.g., due to API or network error, the promise is rejected with an
 * exception. The exception has a response property with the object
 * returned by the HTTP API.
 */
export declare function resolve(name: string, type?: string, cd?: boolean): Promise<any>;
/**
 * Resolve the given DNS SRV record to an array of A or AAAA records.
 *
 * The function returns a promise that will be fullfiled with an array
 * of A or AAAA records. The returned array can be empty if there is
 * no such SRV record, or if the domain explicitly marked the service
 * as unavailable.
 *
 * @param {string} srv - A DNS SRV record to be resolved
 * @return {Promise} A promise that is fullfiled with an array of A or AAAA records.
 */
export declare function resolveSRV(srv: string): Promise<any>;
/**
 * RFC 2782 compatible DNS SRV record iterator. This class makes it
 * possible to iterate over the records returned by resolveSRV.
 *
 * @see resolveSRV
 */
export declare class SRVIterator {
    input: any[];
    recs: Map<number, any>;
    /**
     * Create an iterator for the given SRV records.
     * The constructor expects the following parameter format:
     *
     * [{ name: '_http._tcp.example.com.',
     *    type: 33,
     *    TTL: 3386,
     *    data: { priority: 0, weight: 90, port: 80, target: 'www.example.com.' }
     *  },
     *  { ... }
     * ]
     *
     * This is exactly the same data format returned by resolveSRV. The
     * records do not need to be sorted. Only SRV records must be
     * included.
     *
     * @param {Array} records - An array of SRV records.
     */
    constructor(records: Array<any>);
    /**
     * A iterator which performs DNS SRV selection according to RFC
     * 2782. Records are returned in the increasing order of priorities.
     * If there are multiple records with the same priority, their
     * weights are considered.
     *
     * Example use:
     *   resolveSRV('_http._tcp.example.com').then(records => {
     *     for (let rec of new SRVIterator(records)) {
     *       console.log(rec);
     *     }
     *   }
     *
     * Returned values:
     *   { name: '_http._tcp.example.com.',
     *     type: 33,
     *     TTL: 3599,
     *     data: { priority: 0, weight: 90, port: 80, target: 'www.example.com.' }
     *   }
     *
     * @return {Object} One DNS SRV record from the array provided to the constructor.
     */
    [Symbol.iterator](): Generator<any, void, unknown>;
}
export declare function init(url: string, logger?: (...a: any[]) => any): void;
