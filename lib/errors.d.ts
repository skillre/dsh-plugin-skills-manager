export declare class SkillsManagerError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare function fail(code: string, message: string): never;
export declare function errorMessage(error: unknown): string;
export declare function throwIfAborted(signal?: AbortSignal): void;
export declare function hasCode(error: unknown, code: string): boolean;
