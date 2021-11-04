"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atomicWrite = exports.testAtomicWrite = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
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
async function testAtomicWrite(filename) {
    const dirname = path_1.default.dirname(filename);
    // First make sure that the target directory exists
    await fs_1.promises.mkdir(dirname, { recursive: true });
    try {
        // Make sure that we can write to the target directory
        await fs_1.promises.access(dirname, fs_1.constants.W_OK);
    }
    catch (error) {
        throw new Error(`Cannot update ${filename} (directory ${dirname} must be writable).`);
    }
}
exports.testAtomicWrite = testAtomicWrite;
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
async function atomicWrite(filename, data, mode, uid, gid) {
    const dirname = path_1.default.dirname(filename);
    // First make sure that the target directory exists
    await fs_1.promises.mkdir(dirname, { recursive: true });
    const tmp = path_1.default.join(dirname, `.${path_1.default.basename(filename)}.tmp`);
    try {
        // Write data into a temporary file, fsync the file and close it.
        const f = await fs_1.promises.open(tmp, 'w', mode);
        if (typeof uid === 'number' || typeof gid === 'number') {
            if (typeof uid === 'undefined' || typeof gid === 'undefined')
                throw new Error('Please provide both uid and gid');
            await f.chown(uid, gid);
        }
        await f.write(data);
        await f.sync();
        await f.close();
        // Rename the temporary file into place. This ensures that the target file
        // will be updated in an atomic manner.
        await fs_1.promises.rename(tmp, filename);
    }
    catch (e) {
        // If an error was encountered while the temporary file exists, attempt to
        // unlink it before re-throwing the original exception. Ignore any errors
        // the unlink may generate.
        try {
            await fs_1.promises.unlink(tmp);
        }
        catch (ex) { /* empty */ }
        throw e;
    }
    // Invoke fsync on the directory that contains the file to make sure it exists
    // in case the file was newly created.
    const d = await fs_1.promises.open(dirname, 'r');
    await d.sync();
    await d.close();
}
exports.atomicWrite = atomicWrite;
