/// <reference types="node" />
/**
 * Test whether we can update given filename atomically
 *
 * This function checks whether the given filename can be updated atomically by
 * verifying that we have write permissions to the file's directory. A side
 * effect of executing this function is that the target directory will be
 * recursively created if it does not exist. The function throws an error if
 * filename cannot be updated (its directory cannot be written into).
 *
 * @param {string} filename Target filename
 */
export declare function testAtomicWrite(filename: string): Promise<void>;
/**
 * Write data into filename atomically
 *
 * This function writes data to the filename in such a way so that the
 * modification will appear as atomic to other processes. The data is written to
 * a temporary file within the filename's directory and the temporary file is
 * then moved into filename's place.
 *
 * @param {string} filename Filename to write to
 * @param {object} data Contents of the file
 */
export declare function atomicWrite(filename: string, data: Buffer | string, mode?: string | number, uid?: number, gid?: number): Promise<void>;
