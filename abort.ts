export default function abort(error?: any, signame='SIGTERM') {
    if (error !== undefined)
        console.error('Aborting: ', error);
    if (process !== undefined)
        process.kill(process.pid, signame);
}