export declare const ENDPOINT = "skillre-skills-manager/execute";
export declare const PANEL_ID = "skillre-skills-manager";
export declare const LOCALE_NAMESPACE = "skillreSkillsManager";
export interface SkillRoot {
    id: string;
    label: string;
    path: string;
    writable: boolean;
    source: 'user-agents' | 'user-dsh' | 'project-agents' | 'project-dsh' | 'custom' | 'bundled' | 'runtime';
}
export interface WorkspaceChoice {
    id: string;
    title: string;
    path: string;
}
export interface Provenance {
    kind?: 'github' | 'well-known';
    repository: string;
    ref?: string;
    skillPath?: string;
    commit?: string;
    treeHash?: string;
    digest?: string;
    sourceBaseUrl?: string;
    skillName?: string;
    fingerprint?: string;
    installedAt?: string;
    updatedAt?: string;
    imported?: boolean;
}
export interface SkillOrigin {
    sourceType: string;
    label: string;
    url?: string;
}
export type CheckStatus = 'update' | 'latest' | 'untracked' | 'protected' | 'error';
export interface UpdateCheck {
    id: string;
    status: CheckStatus;
    checkedAt: string;
    latestCommit?: string;
    latestTreeHash?: string;
    latestDigest?: string;
    message?: string;
}
export interface LocalSkill {
    id: string;
    rootId: string;
    entry: string;
    name: string;
    description: string;
    path: string;
    format: 'directory' | 'file' | 'registry';
    writable: boolean;
    valid: boolean;
    modelInvocable: boolean;
    userInvocable: boolean;
    issue?: string;
    source?: Provenance;
    origin?: SkillOrigin;
    check?: UpdateCheck;
}
export interface Catalog {
    roots: SkillRoot[];
    workspaces: WorkspaceChoice[];
    skills: LocalSkill[];
    warnings: string[];
    truncated: boolean;
    mutationsAllowed: boolean;
}
export interface SkillFile {
    path: string;
    bytes: number;
}
export interface SkillDetail {
    skill: LocalSkill;
    content: string;
    files: SkillFile[];
    fingerprint: string;
    locallyModified: boolean | null;
    totalBytes: number;
}
export interface SearchHit {
    id: string;
    name: string;
    repository: string;
    installs: number;
    url: string;
}
export interface SearchResults {
    query: string;
    items: SearchHit[];
}
export interface RepositorySkill {
    name: string;
    description: string;
    skillPath: string;
    treeHash: string;
}
export interface RepositoryInfo {
    repository: string;
    ref: string;
    commit: string;
    skills: RepositorySkill[];
    truncated: boolean;
    warnings: string[];
}
export interface RemotePreview {
    repository: string;
    ref: string;
    commit: string;
    skill: RepositorySkill;
    content: string;
    files: SkillFile[];
    totalBytes: number;
}
export interface Backup {
    id: string;
    rootId: string;
    entry: string;
    name: string;
    action: 'update' | 'remove';
    createdAt: string;
    sizeBytes?: number;
    fileCount?: number;
    source?: Provenance;
}
export interface SkillDiffFile {
    path: string;
    status: 'added' | 'removed' | 'changed' | 'unchanged';
    localBytes?: number;
    remoteBytes?: number;
}
export interface SkillDiff {
    id: string;
    name: string;
    files: SkillDiffFile[];
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
    totalBytes: number;
}
export interface BatchUpdateItem {
    id: string;
    name: string;
    status: 'updated' | 'skipped' | 'failed';
    backupId?: string;
    message?: string;
}
export interface BatchUpdateResult {
    items: BatchUpdateItem[];
    updated: number;
    skipped: number;
    failed: number;
}
export interface PurgeResult {
    removed: number;
    freedBytes: number;
}
export interface WellKnownSkillEntry {
    name: string;
    description?: string;
    type: string;
    digest: string;
}
export interface WellKnownInspect {
    baseUrl: string;
    label: string;
    skills: WellKnownSkillEntry[];
    warnings: string[];
}
export interface MutationResult {
    action: 'install' | 'update' | 'remove' | 'restore' | 'move' | 'install-local' | 'well-known-install' | 'restore-to';
    name: string;
    rootId: string;
    path: string;
    backupId?: string;
    commit?: string;
    digest?: string;
    warning?: string;
}
export interface RequestBase {
    workspaceId?: string;
}
export type ManagerRequest = RequestBase & ({
    action: 'list';
} | {
    action: 'detail';
    id: string;
} | {
    action: 'search';
    query: string;
    limit?: number;
} | {
    action: 'inspect';
    source: string;
    ref?: string;
} | {
    action: 'preview';
    source: string;
    ref?: string;
    commit: string;
    skillPath: string;
} | {
    action: 'check';
    id?: string;
} | {
    action: 'install';
    rootId: string;
    source: string;
    ref?: string;
    commit: string;
    skillPath: string;
} | {
    action: 'update';
    id: string;
    expectedFingerprint: string;
    commit?: string;
    overwriteModified?: boolean;
} | {
    action: 'update-batch';
    ids: string[];
    overwriteModified?: boolean;
} | {
    action: 'diff';
    id: string;
} | {
    action: 'remove';
    id: string;
    expectedFingerprint: string;
    permanent?: boolean;
} | {
    action: 'backups';
} | {
    action: 'purge-backup';
    rootId: string;
    backupId: string;
} | {
    action: 'purge-backups';
    rootId: string;
    keep?: number;
} | {
    action: 'restore';
    rootId: string;
    backupId: string;
} | {
    action: 'restore-to';
    fromRootId: string;
    backupId: string;
    toRootId: string;
    entry?: string;
} | {
    action: 'move';
    id: string;
    rootId: string;
    entry?: string;
} | {
    action: 'install-local';
    rootId: string;
    path: string;
} | {
    action: 'well-known-inspect';
    source: string;
} | {
    action: 'well-known-install';
    rootId: string;
    source: string;
    name: string;
});
export type ManagerValue = Catalog | SkillDetail | SkillDiff | SearchResults | RepositoryInfo | RemotePreview | UpdateCheck[] | BatchUpdateResult | PurgeResult | WellKnownInspect | Backup[] | MutationResult;
export type RpcResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: {
        code: string;
        message: string;
        details: object;
    };
};
export declare const MUTATING_ACTIONS: Set<"update" | "remove" | "install" | "restore" | "move" | "install-local" | "well-known-install" | "restore-to" | "list" | "detail" | "search" | "inspect" | "preview" | "check" | "update-batch" | "diff" | "backups" | "purge-backup" | "purge-backups" | "well-known-inspect">;
