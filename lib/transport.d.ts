import type { ManagerValue } from './types.js';
export declare const EXECUTE_PATH = "/api/skillre-skills-manager/execute";
export interface ExecuteRoute {
    readonly path: string;
    readonly methods: readonly ['POST'];
    readonly requestBody: 'buffered';
    readonly fetch: (request: Request) => Promise<Response>;
}
export interface HostConnection {
    readonly fetch: {
        register(route: ExecuteRoute): () => Promise<void>;
    };
}
interface ExecuteTarget {
    execute(payload: unknown, signal?: AbortSignal): Promise<ManagerValue>;
}
/** Exact buffered POST adapter preserving the existing Client RPC path/result. */
export declare function createExecuteRoute(manager: ExecuteTarget): ExecuteRoute;
export {};
