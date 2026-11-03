import Schema from '@deepseek-ai/schemastery'
import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { z } from 'zod'
import type { ManagerRequest } from './types.js'

export interface ManagerConfig {
  includeDefaultRoots: boolean
  dshHome: string
  agentsHome: string
  customSkillDirs: string[]
  readOnlySkillDirs: string[]
  allowMutations: boolean
  enableAgentTool: boolean
  requestTimeoutMs: number
  operationTimeoutMs: number
  maxSkills: number
  maxFileBytes: number
  maxBundleBytes: number
  maxBundleFiles: number
  maxRepositoryEntries: number
  checkConcurrency: number
}
const home = homedir()
export const Config: Schema<ManagerConfig> = Schema.object({
  includeDefaultRoots: Schema.boolean().default(true),
  dshHome: Schema.string().default(process.env.DSH_HOME || join(home, '.dsh')),
  agentsHome: Schema.string().default(process.env.DSH_AGENTS_HOME || join(home, '.agents')),
  customSkillDirs: Schema.array(String).default([]),
  readOnlySkillDirs: Schema.array(String).default([]),
  allowMutations: Schema.boolean().default(true),
  enableAgentTool: Schema.boolean().default(true),
  requestTimeoutMs: Schema.number().min(1000).max(120000).step(1).default(15000),
  operationTimeoutMs: Schema.number().min(1000).max(600000).step(1).default(300000),
  maxSkills: Schema.number().min(1).max(5000).step(1).default(500),
  maxFileBytes: Schema.number().min(1024).max(10485760).step(1).default(2097152),
  maxBundleBytes: Schema.number().min(1024).max(104857600).step(1).default(104857600),
  maxBundleFiles: Schema.number().min(1).max(50000).step(1).default(20000),
  maxRepositoryEntries: Schema.number().min(1).max(100000).step(1).default(30000),
  checkConcurrency: Schema.number().min(1).max(6).step(1).default(3),
})
export function resolveConfig(raw: unknown = {}): ManagerConfig {
  const config = Config(raw as ManagerConfig)
  for (const path of [config.dshHome, config.agentsHome, ...config.customSkillDirs, ...config.readOnlySkillDirs]) {
    if (!isAbsolute(path) || path.includes('\0')) throw new Error('Skill root configuration must use absolute paths.')
  }
  return config
}

const id = z.string().min(1).max(1024)
const source = z.string().min(3).max(400)
const ref = z.string().min(1).max(200).optional()
const commit = z.string().regex(/^[0-9a-f]{40}$/)
const fingerprint = z.string().regex(/^[0-9a-f]{64}$/)
const backupId = z.string().uuid()
const rootId = z.string().min(1).max(200)
const entry = z.string().min(1).max(200)
const localPath = z.string().min(1).max(4096)
const base = { workspaceId: z.string().min(1).max(200).optional() }
const object = <T extends z.ZodRawShape>(shape: T) => z.object({ ...base, ...shape }).strict()
export const RequestSchema = z.discriminatedUnion('action', [
  object({ action: z.literal('list') }),
  object({ action: z.literal('detail'), id }),
  object({ action: z.literal('search'), query: z.string().trim().min(1).max(200), limit: z.number().int().min(1).max(50).optional() }),
  object({ action: z.literal('inspect'), source, ref }),
  object({ action: z.literal('preview'), source, ref, commit, skillPath: id }),
  object({ action: z.literal('check'), id: id.optional() }),
  object({ action: z.literal('diff'), id }),
  object({ action: z.literal('install'), rootId: id, source, ref, commit, skillPath: id }),
  object({ action: z.literal('install-local'), rootId, path: localPath }),
  object({ action: z.literal('well-known-inspect'), source }),
  object({ action: z.literal('well-known-install'), rootId, source, name: entry }),
  object({ action: z.literal('update'), id, expectedFingerprint: fingerprint, commit: commit.optional(), overwriteModified: z.boolean().optional() }),
  object({ action: z.literal('update-batch'), ids: z.array(id).min(1).max(2000), overwriteModified: z.boolean().optional() }),
  object({ action: z.literal('remove'), id, expectedFingerprint: fingerprint, permanent: z.boolean().optional() }),
  object({ action: z.literal('backups') }),
  object({ action: z.literal('purge-backup'), rootId, backupId }),
  object({ action: z.literal('purge-backups'), rootId, keep: z.number().int().min(0).max(10000).optional() }),
  object({ action: z.literal('restore'), rootId: id, backupId: z.string().uuid() }),
  object({ action: z.literal('restore-to'), fromRootId: rootId, backupId, toRootId: rootId, entry: entry.optional() }),
  object({ action: z.literal('move'), id, rootId, entry: entry.optional() }),
])
export function parseRequest(raw: unknown): ManagerRequest {
  return RequestSchema.parse(raw) as ManagerRequest
}
