/**
 * This module provides a JavaScript DNS resolver implemented using Google's
 * HTTP-based public DNS API.
 */
import URI from 'urijs';
let debug;
/** The URL of the DNS HTTP API */
let apiUrl;
// Selected DNS response codes
var Response;
(function (Response) {
    Response[Response["NoError"] = 0] = "NoError";
    Response[Response["FormErr"] = 1] = "FormErr";
    Response[Response["ServFail"] = 2] = "ServFail";
    Response[Response["NXDomain"] = 3] = "NXDomain";
    Response[Response["NotImp"] = 4] = "NotImp";
    Response[Response["Refused"] = 5] = "Refused";
    Response[Response["YXDomain"] = 6] = "YXDomain";
    Response[Response["YXRRSet"] = 7] = "YXRRSet";
    Response[Response["NXRRSet"] = 8] = "NXRRSet";
    Response[Response["NotAuth"] = 9] = "NotAuth";
    Response[Response["NotZone"] = 10] = "NotZone";
})(Response || (Response = {}));
// Selected DNS response code error messages, indexed by the response code
// number.
const MESSAGES = [
    'No Error',
    'Format Error',
    'Server Failure',
    'Non-Existent Domain',
    'Not Implemented',
    'Query Refused',
    'Name Exists when it should not',
    'RR Set Exists when it should not',
    'RR Set that should exist does not',
    'Server Not Authoritative for zone',
    'Name not contained in zone'
];
// Selected DNS resource record types. Obtained from:
// http://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml
export const RR_TYPES = {
    'A': 1,
    'NS': 2,
    'CNAME': 5,
    'SOA': 6,
    'PTR': 12,
    'HINFO': 13,
    'MX': 15,
    'TXT': 16,
    'SIG': 24,
    'KEY': 25,
    'GPOS': 27,
    'AAAA': 28,
    'LOC': 29,
    'SRV': 33,
    'NAPTR': 35,
    'CERT': 37,
    'SSHFP': 44,
    'TLSA': 52,
    'URI': 256
};
function abort(text, response) {
    const error = new Error(text);
    error.response = response;
    throw error;
}
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
export async function resolve(name, type, cd) {
    const args = { name };
    if (type !== undefined) {
        const t = RR_TYPES[type];
        if (t === undefined) {
            throw new Error(`Unsupported RR type ${type}`);
        }
        args.type = t;
    }
    if (cd !== undefined)
        args.cd = cd;
    const uri = URI(apiUrl).query(args);
    const r = await fetch(uri.toString());
    if (r.status < 200 || r.status >= 300)
        abort(r.statusText, r);
    const d = await r.json();
    if (d.TC !== false)
        abort('Truncated DNS response received', r);
    if (d.Status !== Response.NoError && d.Status != Response.NXDomain) {
        const msg = MESSAGES[d.Status] || '';
        abort(`DNS request failed (${d.Status}): ${msg}`, r);
    }
    if (d.Answer === Response.NXDomain)
        return [];
    return d.Answer || [];
}
/**
 * Parse a DNS SRV record. Raises an Error if the record cannot be
 * parsed.
 *
 * @param {string} record - A DNS SRV record as string
 * @return {Object} A parsed representation of the record.
 */
function parseSRV(record) {
    const data = record.split(' ').filter(el => el.length > 0);
    if (data.length != 4)
        throw new Error(`Malformed SRV record: ${record}`);
    const priority = parseInt(data[0]), weight = parseInt(data[1]), port = parseInt(data[2]);
    if (isNaN(priority) || priority < 0 || priority > 65535)
        throw new Error(`Invalid priority in SRV record ${record}`);
    if (isNaN(weight) || weight < 0 || weight > 65535)
        throw new Error(`Invalid weight in SRV record ${record}`);
    if (isNaN(port) || port < 0 || port > 65535)
        throw new Error(`Invalid port in SRV record ${record}`);
    return {
        priority,
        weight,
        port,
        target: data[3]
    };
}
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
export async function resolveSRV(srv) {
    // Only one RR with target "." means the service is decidely not
    // available in the domain.
    const type = RR_TYPES['SRV'];
    const r = await resolve(srv, 'SRV');
    // Keep SRV records only and parse the data property
    let d = r.filter((e) => e.type == type).map((e) => {
        e.data = parseSRV(e.data);
        return e;
    });
    if (d.length == 1 && d[0].data.target === '.')
        d = [];
    return d;
}
/**
 * RFC 2782 compatible DNS SRV record iterator. This class makes it
 * possible to iterate over the records returned by resolveSRV.
 *
 * @see resolveSRV
 */
export class SRVIterator {
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
    constructor(records) {
        this.input = records;
        // Sort the array in the order of ascending priorities
        const data = this.input.sort((a, b) => a.data.priority - b.data.priority);
        // Create a new map and insert the elements into the map, keyed by
        // priorities. For each priority also calculate the sum of all
        // weights for that priority. Since the input array is sorted, we
        // are inserting into the Map in the ascending order of priorites.
        // Maps iterate over items in inserted order which means that when
        // we iterate over the map, we still iterate over elements sorted
        // by their ascending priorites.
        this.recs = new Map();
        for (const i of data) {
            const cur = this.recs.get(i.data.priority);
            if (cur === undefined) {
                this.recs.set(i.data.priority, { sum: i.data.weight, rrs: [i] });
            }
            else {
                cur.sum += i.data.weight;
                cur.rrs.push(i);
            }
        }
    }
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
    *[Symbol.iterator]() {
        // Process records in the increasing order of priorities.
        // this.recs is a Map whose elements were inserted in the
        // increasing order of priorities, thus its iterator returns them
        // in the same order.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [k, v] of this.recs) {
            // Sort the records with the same priority according to their
            // weights. This ensures that records with weight 0 will be at
            // the beginning.
            const sorted = v.rrs.sort((a, b) => a.data.weight - b.data.weight);
            while (sorted.length > 0) {
                // Calculate the sum of all weights within a priority group,
                // and generate a random number in <0, sum>. Initialize
                // running sum (rsum) to 0.
                const sum = sorted.reduce((prev, cur) => prev + cur.data.weight, 0);
                const rnd = Math.floor(Math.random() * (sum - 0 + 1)) + 0;
                let rsum = 0;
                // Find the first record whose running sum is >= than the
                // random number, yield the record, and remove it from the
                // array. Break the loop to recalculate sum and rnd.
                for (const i in sorted) {
                    rsum += sorted[i].data.weight;
                    if (rsum >= rnd) {
                        yield sorted.splice(i, 1)[0];
                        break;
                    }
                }
            }
        }
    }
}
export function init(url, logger) {
    apiUrl = url;
    if (logger)
        debug = logger;
    else
        debug = () => void 0;
    debug(`Initializing DNS resolver using ${apiUrl}`);
}
