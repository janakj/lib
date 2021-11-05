/**
 * Globally Unique Identifiers (GUID)
 *
 * This module implements a globally unique random-based identifier (GUID) based
 * on UUID version 4 and encoded in base64-url. The GUID is 128 bits long and
 * contains 122 bits of randomness. The remaining 6 bits are reserved. Using
 * UUIDs as the base implementation makes the GUID compatible with external
 * implementations, e.g.,  PostgreSQL's uuid columnt type.
 *
 * Unlike UUIDs, GUIDs are by default encoded in the URL-safe base64 variant
 * with padding removed. Padding is not necessary since the size of the GUID is
 * fixed and known. When encoded in a string, the GUID is exactly 22 characters
 * long.
 */
export default function GUID(): string;
export declare function asUUID(guid: string): string;
