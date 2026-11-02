export class SkillsManagerError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'SkillsManagerError';
    }
}
export function fail(code, message) { throw new SkillsManagerError(code, message); }
export function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
}
export function throwIfAborted(signal) {
    if (signal?.aborted)
        fail('cancelled', 'The operation was cancelled. Refresh the list before retrying a mutation.');
}
export function hasCode(error, code) {
    return !!error && typeof error === 'object' && 'code' in error && error.code === code;
}
