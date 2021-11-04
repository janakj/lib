"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortMachineId = exports.machineId = void 0;
const fs_1 = require("fs");
const machineId = async () => (await fs_1.promises.readFile('/etc/machine-id', 'ascii')).trim();
exports.machineId = machineId;
async function shortMachineId(length = 6) {
    return (await (0, exports.machineId)()).slice(0, length);
}
exports.shortMachineId = shortMachineId;
