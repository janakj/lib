export default class Lock {
    private _locked;
    private _emitter;
    constructor();
    acquire(): Promise<unknown>;
    release(): void;
}
