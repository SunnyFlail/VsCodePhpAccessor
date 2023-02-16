export class ScriptEndingMessage extends Error {
    constructor(msg: string) {
        super(msg);

        Object.setPrototypeOf(this, ScriptEndingMessage.prototype);
    }
}
