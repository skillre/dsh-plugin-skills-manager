import type { ManagerConfig } from './config.js';
import type { Backup, Provenance, PurgeResult, SkillFile, SkillRoot } from './types.js';
export declare const STATE_DIR = ".skills-manager";
export interface BundleFile {
    path: string;
    bytes: Uint8Array;
    executable: boolean;
}
export interface Snapshot {
    files: BundleFile[];
    fingerprint: string;
    gitTreeHash: string;
    totalBytes: number;
}
export interface StoreState {
    version: 1;
    records: Record<string, Provenance>;
    backups: Backup[];
}
export declare function safeEntry(entry: string): string;
export declare function safeRelativePath(path: string): string;
export declare function assertInside(parent: string, target: string): void;
export declare function pathExists(path: string): Promise<boolean>;
export declare function assertNoSymlinkPath(path: string): Promise<void>;
export declare function readBytes(path: string, limit: number, signal?: AbortSignal): Promise<Uint8Array>;
export declare function gitBlobHash(bytes: Uint8Array): string;
export declare function bundleFingerprint(files: readonly BundleFile[]): string;
export declare function gitTreeHash(files: readonly BundleFile[]): string;
export declare function snapshotPath(path: string, config: ManagerConfig, signal?: AbortSignal): Promise<Snapshot>;
export declare function fileSummary(snapshot: Pick<Snapshot, 'files'>): SkillFile[];
export declare function ownValue<T>(record: Record<string, T>, key: string): T | undefined;
export declare function publishNoReplace(source: string, target: string): Promise<void>;
export declare function readState(root: SkillRoot): Promise<StoreState>;
export interface WriteStore {
    root: SkillRoot;
    stateDir: string;
    state: StoreState;
}
export declare function withRootWrite<T>(root: SkillRoot, operation: (store: WriteStore) => Promise<T>, signal?: AbortSignal): Promise<T>;
export declare function installEntry(store: WriteStore, entry: string, files: readonly BundleFile[], source: Provenance | undefined, signal?: AbortSignal): Promise<void>;
export declare function changeEntry(store: WriteStore, entry: string, name: string, action: Backup['action'], expectedFingerprint: string, config: ManagerConfig, source: Provenance | undefined, replacement?: {
    files: BundleFile[];
    source: Provenance;
}, signal?: AbortSignal): Promise<Backup>;
export declare function renameEntry(store: WriteStore, from: string, to: string, expectedFingerprint: string, config: ManagerConfig, signal?: AbortSignal): Promise<void>;
export declare function deleteEntryPermanent(store: WriteStore, entry: string, expectedFingerprint: string, config: ManagerConfig, signal?: AbortSignal): Promise<void>;
export declare function purgeBackup(store: WriteStore, backupId: string, signal?: AbortSignal): Promise<Backup>;
export declare function purgeBackups(store: WriteStore, keep: number, signal?: AbortSignal): Promise<PurgeResult>;
export declare function restoreEntry(store: WriteStore, backupId: string, signal?: AbortSignal): Promise<Backup>;
