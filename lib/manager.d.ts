import type { ManagerConfig } from './config.js';
import type { Catalog, ManagerValue, WorkspaceChoice } from './types.js';
import { GitHubSource } from './github.js';
import { WellKnownSource } from './well-known.js';
export interface RegistrySkill {
    name: string;
    description: string;
    path?: string;
    source: string;
    invocation: {
        modelInvocable: boolean;
        userInvocable: boolean;
    };
}
export interface ManagerHooks {
    workspaces?: () => WorkspaceChoice[];
    registryList?: (cwd: string | undefined, signal: AbortSignal) => Promise<RegistrySkill[]>;
    registryGet?: (name: string, cwd: string | undefined, signal: AbortSignal) => Promise<{
        content: string;
    } | undefined>;
}
export type SourceProvider = Pick<GitHubSource, 'search' | 'inspect' | 'preview' | 'tree' | 'folderHashFor' | 'download' | 'clear'>;
export declare class SkillsManager {
    readonly config: ManagerConfig;
    private readonly hooks;
    private readonly lifetime;
    private readonly active;
    private readonly checks;
    private readonly checkKeys;
    private readonly jobs;
    private readonly jobTasks;
    private activeJobId;
    private jobSeq;
    private mutationEpoch;
    private closed;
    readonly source: SourceProvider;
    readonly wellKnown: WellKnownSource;
    constructor(config: ManagerConfig, hooks?: ManagerHooks, source?: SourceProvider, wellKnownSource?: WellKnownSource);
    execute(raw: unknown, callerSignal?: AbortSignal): Promise<ManagerValue>;
    dispose(): Promise<void>;
    private roots;
    private cliOrigins;
    private local;
    catalog(workspaceId: string | undefined, signal: AbortSignal): Promise<Catalog>;
    private find;
    private detail;
    private check;
    private assertMutable;
    private writableRoot;
    private run;
    private applyUpdate;
    private rememberLatest;
    private batchUpdate;
    private startJob;
    private jobItemFor;
    private runJob;
    private settleJobItem;
    private jobItemProgress;
    private recomputeJob;
    private listJobs;
    private getJob;
    private cancelJob;
    private pruneJobs;
    private diffSkill;
    private moveSkill;
    private installLocal;
    private wellKnownInspect;
    private wellKnownInstall;
    private restoreTo;
}
