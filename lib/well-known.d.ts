import type { ManagerConfig } from './config.js';
import type { WellKnownSkillEntry } from './types.js';
import type { Fetcher } from './github.js';
import type { BundleFile } from './fs-store.js';
export interface WellKnownBase {
    baseUrl: string;
    label: string;
    indexUrl: string;
}
export interface WellKnownEntry {
    name: string;
    description?: string;
    type: string;
    url: string;
    digest: string;
}
export interface WellKnownDownload {
    name: string;
    digest: string;
    files: BundleFile[];
}
/** Accept only a public HTTPS base URL; the catalog path is appended explicitly. */
export declare function parseWellKnownBase(source: string): WellKnownBase;
export declare class WellKnownSource {
    private readonly config;
    private readonly doFetch;
    private readonly indexes;
    constructor(config: ManagerConfig, doFetch?: Fetcher);
    clear(): void;
    private bytes;
    private index;
    entry(sourceBaseUrl: string, name: string, signal: AbortSignal, updateCheck: boolean): Promise<{
        base: WellKnownBase;
        entry: WellKnownEntry;
    } | undefined>;
    catalog(sourceBaseUrl: string, signal: AbortSignal): Promise<{
        entries: WellKnownSkillEntry[];
        warnings: string[];
    }>;
    digest(sourceBaseUrl: string, name: string, signal: AbortSignal): Promise<string | undefined>;
    download(sourceBaseUrl: string, name: string, signal: AbortSignal): Promise<WellKnownDownload>;
}
