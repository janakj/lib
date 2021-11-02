import path from 'path';
import { promises as fs, constants } from 'fs';


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
export async function testAtomicWrite(filename: string) {
    const dirname = path.dirname(filename);

    // First make sure that the target directory exists
    await fs.mkdir(dirname, { recursive: true });

    try {
        // Make sure that we can write to the target directory
        await fs.access(dirname, constants.W_OK);
    } catch(error) {
        throw new Error(`Cannot update ${filename} (directory ${dirname} must be writable).`);
    }
}


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
export async function atomicWrite(filename: string, data: Buffer | string, mode?: string | number, uid?: number, gid?: number) {
    const dirname = path.dirname(filename);

    // First make sure that the target directory exists
    await fs.mkdir(dirname, { recursive: true });

    const tmp = path.join(dirname, `.${path.basename(filename)}.tmp`);

    try {
        // Write data into a temporary file, fsync the file and close it.
        const f = await fs.open(tmp, 'w', mode);
        if (typeof uid === 'number' || typeof gid === 'number') {
            if (typeof uid === 'undefined' ||  typeof gid === 'undefined')
                throw new Error('Please provide both uid and gid');
            await f.chown(uid, gid);
        }

        await f.write(data as any);
        await f.sync();
        await f.close();

        // Rename the temporary file into place. This ensures that the target file
        // will be updated in an atomic manner.
        await fs.rename(tmp, filename);
    } catch (e) {
        // If an error was encountered while the temporary file exists, attempt to
        // unlink it before re-throwing the original exception. Ignore any errors
        // the unlink may generate.
        try {
            await fs.unlink(tmp);
        } catch (ex) { /* empty */ }

        throw e;
    }

    // Invoke fsync on the directory that contains the file to make sure it exists
    // in case the file was newly created.
    const d = await fs.open(dirname, 'r');
    await d.sync();
    await d.close();
}
