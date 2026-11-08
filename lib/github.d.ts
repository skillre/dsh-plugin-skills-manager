import { z } from 'zod';
import type { ManagerConfig } from './config.js';
import type { RemotePreview, RepositoryInfo, RepositorySkill, SearchResults } from './types.js';
import type { BundleFile } from './fs-store.js';
export declare function parseRepository(source: string): string;
export declare function parseRef(ref?: string): string;
declare const nodeSchema: z.ZodObject<{
    path: z.ZodString;
    mode: z.ZodString;
    type: z.ZodEnum<{
        commit: "commit";
        blob: "blob";
        tree: "tree";
    }>;
    sha: z.ZodString;
    size: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
type TreeNode = z.infer<typeof nodeSchema>;
export interface RepositoryTree {
    repository: string;
    ref: string;
    commit: string;
    rootHash: string;
    tree: TreeNode[];
    source?: 'api' | 'archive';
}
export interface DownloadedSkill {
    skill: RepositorySkill;
    files: BundleFile[];
    content: string;
    tree: RepositoryTree;
}
export type Fetcher = (input: string, init: RequestInit) => Promise<Response>;
export declare class GitHubSource {
    private readonly config;
    private readonly doFetch;
    private readonly immutableTrees;
    private readonly resolvedRefs;
    constructor(config: ManagerConfig, doFetch?: Fetcher);
    clear(): void;
    private githubToken;
    private failRateLimit;
    private bytes;
    private json;
    private static fallbackAllowed;
    private rememberRef;
    private cacheTree;
    private apiTree;
    private commitFromRefs;
    /** Reconstruct a repository tree from the codeload archive without any api.github.com request. */
    private archiveTree;
    private resolveTree;
    /**
     * Resolve a repository tree. A named ref is always resolved again so update
     * checks and updates observe a moved branch; an omitted ref uses the
     * short-lived discovery cache shared with inspect().
     */
    tree(source: string, ref: string | undefined, signal: AbortSignal, pinnedCommit?: string): Promise<RepositoryTree>;
    private folderHash;
    folderHashFor(tree: RepositoryTree, skillPath: string): string;
    private selectedFiles;
    private file;
    private downloadArchive;
    inspect(source: string, ref: string | undefined, signal: AbortSignal): Promise<RepositoryInfo>;
    preview(source: string, ref: string | undefined, commit: string, skillPath: string, signal: AbortSignal): Promise<RemotePreview>;
    download(source: string, ref: string | undefined, commit: string, skillPath: string, signal: AbortSignal, onProgress?: (phase: 'download' | 'verify', ratio?: number) => void): Promise<DownloadedSkill>;
    search(query: string, limit: number, signal: AbortSignal): Promise<SearchResults>;
}
export {};
