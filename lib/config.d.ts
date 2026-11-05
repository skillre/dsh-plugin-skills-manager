import Schema from '@deepseek-ai/schemastery';
import { z } from 'zod';
import type { ManagerRequest } from './types.js';
export interface ManagerConfig {
    includeDefaultRoots: boolean;
    dshHome: string;
    agentsHome: string;
    customSkillDirs: string[];
    readOnlySkillDirs: string[];
    allowMutations: boolean;
    enableAgentTool: boolean;
    requestTimeoutMs: number;
    operationTimeoutMs: number;
    maxSkills: number;
    maxFileBytes: number;
    maxBundleBytes: number;
    maxBundleFiles: number;
    maxRepositoryEntries: number;
    checkConcurrency: number;
}
export declare const Config: Schema<ManagerConfig>;
export declare function resolveConfig(raw?: unknown): ManagerConfig;
export declare const RequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"list">;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"detail">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"search">;
    query: z.ZodString;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"inspect">;
    source: z.ZodString;
    ref: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"preview">;
    source: z.ZodString;
    ref: z.ZodOptional<z.ZodString>;
    commit: z.ZodString;
    skillPath: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"check">;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"diff">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"install">;
    rootId: z.ZodString;
    source: z.ZodString;
    ref: z.ZodOptional<z.ZodString>;
    commit: z.ZodString;
    skillPath: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"install-local">;
    rootId: z.ZodString;
    path: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"well-known-inspect">;
    source: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"well-known-install">;
    rootId: z.ZodString;
    source: z.ZodString;
    name: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"update">;
    id: z.ZodString;
    expectedFingerprint: z.ZodString;
    commit: z.ZodOptional<z.ZodString>;
    overwriteModified: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"update-batch">;
    ids: z.ZodArray<z.ZodString>;
    overwriteModified: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"update-start">;
    id: z.ZodString;
    expectedFingerprint: z.ZodString;
    commit: z.ZodOptional<z.ZodString>;
    overwriteModified: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"update-batch-start">;
    ids: z.ZodArray<z.ZodString>;
    overwriteModified: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"job-list">;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"job-get">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"job-cancel">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"remove">;
    id: z.ZodString;
    expectedFingerprint: z.ZodString;
    permanent: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"backups">;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"purge-backup">;
    rootId: z.ZodString;
    backupId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"purge-backups">;
    rootId: z.ZodString;
    keep: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"restore">;
    rootId: z.ZodString;
    backupId: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"restore-to">;
    fromRootId: z.ZodString;
    backupId: z.ZodString;
    toRootId: z.ZodString;
    entry: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    workspaceId: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"move">;
    id: z.ZodString;
    rootId: z.ZodString;
    entry: z.ZodOptional<z.ZodString>;
}, z.core.$strict>], "action">;
export declare function parseRequest(raw: unknown): ManagerRequest;
