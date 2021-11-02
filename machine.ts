import { promises as fs } from 'fs';


export const machineId = async () => (await fs.readFile('/etc/machine-id', 'ascii')).trim();


export async function shortMachineId(length=6) {
    return (await machineId()).slice(0,length);
}
