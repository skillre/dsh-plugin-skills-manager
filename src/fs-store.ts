import { constants } from 'node:fs'
import { lstat, mkdir, open, readdir, readFile, realpath, rename, rm, rmdir, unlink, link } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, parse, relative, resolve, sep } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { ManagerConfig } from './config.js'
import type { Backup, Provenance, PurgeResult, SkillFile, SkillRoot } from './types.js'
import { fail, hasCode, throwIfAborted } from './errors.js'

export const STATE_DIR = '.skills-manager'
export interface BundleFile { path: string; bytes: Uint8Array; executable: boolean }
export interface Snapshot { files: BundleFile[]; fingerprint: string; gitTreeHash: string; totalBytes: number }
export interface StoreState { version: 1; records: Record<string, Provenance>; backups: Backup[] }
const provenanceSchema = z.object({
  kind: z.enum(['github', 'well-known']).optional(),
  repository: z.string().min(3).max(400), ref: z.string().min(1).max(200).optional(), skillPath: z.string().min(1).max(1024).optional(),
  commit: z.string().max(100).optional(), treeHash: z.string().regex(/^[0-9a-f]{40}$/).optional(),
  digest: z.string().regex(/^sha256:[0-9a-f]{64}$/).optional(), sourceBaseUrl: z.string().min(1).max(2048).optional(), skillName: z.string().min(1).max(200).optional(),
  fingerprint: z.string().regex(/^[0-9a-f]{64}$/).optional(), installedAt: z.string().optional(), updatedAt: z.string().optional(), imported: z.boolean().optional(),
}).strict()
const backupSchema = z.object({ id: z.string().uuid(), rootId: z.string(), entry: z.string(), name: z.string(), action: z.enum(['update', 'remove']), createdAt: z.string(), sizeBytes: z.number().int().nonnegative().optional(), fileCount: z.number().int().nonnegative().optional(), source: provenanceSchema.optional() }).strict()
const storeSchema = z.object({ version: z.literal(1), records: z.record(z.string(), provenanceSchema), backups: z.array(backupSchema).max(10000) }).strict()

export function safeEntry(entry: string): string {
  if (!entry || entry.length > 200 || entry.startsWith('.') || entry.includes('/') || entry.includes('\\') || /[\x00-\x1f\x7f]/.test(entry) || entry === '..' || entry.endsWith(' ') || entry.endsWith('.')) fail('unsafe-path', 'A skill entry must be a safe direct child of its root.')
  // Windows device names are not regular files, even with extensions.
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(entry) || entry.includes(':')) fail('unsafe-path', 'Reserved skill entry name.')
  return entry
}
export function safeRelativePath(path: string): string {
  if (!path || path.length > 1024 || path.startsWith('/') || path.includes('\\') || /[\x00-\x1f\x7f]/.test(path)) fail('unsafe-path', 'Unsafe relative skill resource path.')
  const parts = path.split('/')
  if (parts.length > 30 || parts.some(part => !part || part === '.' || part === '..' || part === '.git' || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part) || part.includes(':') || part.endsWith('.') || part.endsWith(' '))) fail('unsafe-path', 'Unsafe skill resource path segment.')
  return path
}
export function assertInside(parent: string, target: string): void {
  const delta = relative(resolve(parent), resolve(target))
  if (!delta || delta === '..' || delta.startsWith(`..${sep}`) || isAbsolute(delta)) fail('unsafe-path', 'Filesystem target escaped its expected owning directory.')
}
export async function pathExists(path: string): Promise<boolean> {
  try { await lstat(path); return true } catch (error) { if (hasCode(error, 'ENOENT')) return false; throw error }
}
export async function assertNoSymlinkPath(path: string): Promise<void> {
  const absolute = resolve(path)
  if (!isAbsolute(path)) fail('unsafe-path', 'Skill roots must be absolute.')
  let current = parse(absolute).root
  const parts = absolute.slice(current.length).split(sep).filter(Boolean)
  for (let i = 0; i < parts.length; i++) {
    current = join(current, parts[i]!)
    try {
      const info = await lstat(current)
      if (info.isSymbolicLink()) fail('read-only', 'Symlinked roots and resources are read-only; manage them with their original installer.')
      if (i < parts.length - 1 && !info.isDirectory()) fail('unsafe-path', 'A skill path ancestor is not a directory.')
    } catch (error) { if (hasCode(error, 'ENOENT')) return; throw error }
  }
}
export async function readBytes(path: string, limit: number, signal?: AbortSignal): Promise<Uint8Array> {
  throwIfAborted(signal)
  const handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0))
  try {
    const info = await handle.stat()
    if (!info.isFile()) fail('unsafe-path', 'A skill resource is not a regular file.')
    if (info.size > limit) fail('limit', 'A skill resource exceeds the configured file-size limit.')
    const chunks: Buffer[] = []
    let length = 0
    for (;;) {
      throwIfAborted(signal)
      const buffer = Buffer.alloc(Math.min(65536, limit + 1 - length))
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, length)
      if (!bytesRead) break
      length += bytesRead
      if (length > limit) fail('limit', 'A skill resource grew beyond the configured file-size limit.')
      chunks.push(buffer.subarray(0, bytesRead))
    }
    throwIfAborted(signal)
    return Buffer.concat(chunks, length)
  } finally { await handle.close() }
}
export function gitBlobHash(bytes: Uint8Array): string {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}
export function bundleFingerprint(files: readonly BundleFile[]): string {
  const hash = createHash('sha256')
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path, 'en'))) hash.update(`${file.path}\0${file.executable ? 'x' : '-'}\0${gitBlobHash(file.bytes)}\n`)
  return hash.digest('hex')
}
export function gitTreeHash(files: readonly BundleFile[]): string {
  function tree(prefix: string): string {
    const children = new Map<string, { directory: boolean; sha: string; executable: boolean }>()
    for (const file of files) {
      if (!file.path.startsWith(prefix)) continue
      const tail = file.path.slice(prefix.length)
      const slash = tail.indexOf('/')
      if (slash < 0) children.set(tail, { directory: false, sha: gitBlobHash(file.bytes), executable: file.executable })
      else {
        const part = tail.slice(0, slash)
        if (!children.has(part)) children.set(part, { directory: true, sha: tree(`${prefix}${part}/`), executable: false })
      }
    }
    const entries = [...children].sort(([an, av], [bn, bv]) => Buffer.compare(Buffer.from(an + (av.directory ? '/' : '')), Buffer.from(bn + (bv.directory ? '/' : ''))))
    const body = Buffer.concat(entries.map(([name, value]) => Buffer.concat([Buffer.from(`${value.directory ? '40000' : value.executable ? '100755' : '100644'} ${name}\0`), Buffer.from(value.sha, 'hex')])))
    return createHash('sha1').update(`tree ${body.length}\0`).update(body).digest('hex')
  }
  return tree('')
}
export async function snapshotPath(path: string, config: ManagerConfig, signal?: AbortSignal): Promise<Snapshot> {
  await assertNoSymlinkPath(path)
  const files: BundleFile[] = []
  let totalBytes = 0
  let visited = 0
  async function visit(absolute: string, local: string, depth: number): Promise<void> {
    throwIfAborted(signal)
    if (++visited > config.maxBundleFiles * 4 || depth > 30) fail('limit', 'Skill directory exceeds the configured traversal limit.')
    const info = await lstat(absolute)
    if (info.isSymbolicLink()) fail('read-only', 'Skill bundles containing symlinks are read-only.')
    if (info.isDirectory()) {
      const entries = await readdir(absolute)
      if (entries.length > config.maxBundleFiles * 4) fail('limit', 'Skill directory has too many entries.')
      for (const entry of entries.sort()) {
        const child = local ? `${local}/${entry}` : entry
        safeRelativePath(child)
        await visit(join(absolute, entry), child, depth + 1)
      }
    } else if (info.isFile()) {
      if (files.length >= config.maxBundleFiles) fail('limit', 'Skill bundle exceeds the configured file-count limit.')
      const bytes = await readBytes(absolute, config.maxFileBytes, signal)
      totalBytes += bytes.length
      if (totalBytes > config.maxBundleBytes) fail('limit', 'Skill bundle exceeds the configured total-size limit.')
      files.push({ path: local || basename(path), bytes, executable: !!(info.mode & 0o111) })
    } else fail('unsafe-path', 'Skill bundles may contain only regular files and directories.')
  }
  await visit(path, '', 0)
  return { files, totalBytes, fingerprint: bundleFingerprint(files), gitTreeHash: gitTreeHash(files) }
}
export function fileSummary(snapshot: Pick<Snapshot, 'files'>): SkillFile[] { return snapshot.files.map(file => ({ path: file.path, bytes: file.bytes.length })) }
export function ownValue<T>(record: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined
}
// Same-filesystem publication without clobbering an independently created target.
// Files use link(O_EXCL semantics); directories reserve the final name with an
// exclusive mkdir before atomically replacing only that owned empty reservation.
// Like Node path I/O generally, this assumes no hostile same-user ancestor swap.
export async function publishNoReplace(source: string, target: string): Promise<void> {
  await assertNoSymlinkPath(source)
  await assertNoSymlinkPath(target)
  const info = await lstat(source)
  if (info.isFile()) {
    await link(source, target)
    try { await unlink(source) } catch (error) {
      try {
        const current = await lstat(target)
        if (current.dev !== info.dev || current.ino !== info.ino || !current.isFile()) fail('recovery-required', 'Partially published file ownership cannot be proved.')
        assertInside(dirname(target), target)
        await unlink(target)
      } catch { fail('recovery-required', 'File publication rollback failed. Preserve the transaction journal and both file locations.') }
      throw error
    }
    return
  }
  if (!info.isDirectory()) fail('unsafe-path', 'Only regular entries can be published.')
  await mkdir(target, { mode: 0o700 })
  let reservation
  try { reservation = await lstat(target) } catch { fail('recovery-required', 'A publication reservation was created but cannot be inspected. Preserve the journal and staging.') }
  try {
    await assertNoSymlinkPath(target)
    const current = await lstat(target)
    if (current.dev !== reservation.dev || current.ino !== reservation.ino || !current.isDirectory() || current.isSymbolicLink()) fail('stale', 'The publication reservation changed.')
    if ((await readdir(target)).length) fail('stale', 'The publication reservation is no longer empty.')
    await rename(source, target)
  } catch (error) {
    try {
      const current = await lstat(target)
      if (current.dev !== reservation.dev || current.ino !== reservation.ino || !current.isDirectory() || current.isSymbolicLink()) fail('recovery-required', 'Publication reservation ownership changed.')
      assertInside(dirname(target), target)
      await rmdir(target) // Empty-only: external files are NEVER recursively deleted.
    } catch { fail('recovery-required', 'Publication rollback could not remove its verified empty reservation. Preserve the journal, backup and staging.') }
    throw error
  }
}
function emptyState(): StoreState { return { version: 1, records: Object.create(null) as Record<string, Provenance>, backups: [] } }
export async function readState(root: SkillRoot): Promise<StoreState> {
  const stateDir = join(root.path, STATE_DIR)
  if (!(await pathExists(stateDir))) return emptyState()
  await assertNoSymlinkPath(stateDir)
  const file = join(stateDir, 'state.json')
  if (!(await pathExists(file))) return emptyState()
  try {
    const bytes = await readBytes(file, 4 * 1024 * 1024)
    const state = storeSchema.parse(JSON.parse(Buffer.from(bytes).toString('utf8')))
    for (const entry of Object.keys(state.records)) safeEntry(entry)
    for (const backup of state.backups) safeEntry(backup.entry)
    return state as StoreState
  } catch (error) { fail('state-corrupt', `Skill-manager state cannot be read safely: ${error instanceof Error ? error.message : String(error)}`) }
}
async function writeJson(stateDir: string, filename: string, value: unknown): Promise<void> {
  if (!['state.json', 'journal.json', 'meta.json'].includes(filename)) fail('unsafe-path', 'Unexpected metadata target.')
  if (filename === 'state.json') {
    const state = storeSchema.parse(value)
    for (const entry of Object.keys(state.records)) safeEntry(entry)
    for (const backup of state.backups) safeEntry(backup.entry)
    value = state
  } else if (filename === 'meta.json') value = backupSchema.parse(value)
  const encoded = `${JSON.stringify(value, null, 2)}\n`
  const limit = filename === 'state.json' ? 4 * 1024 * 1024 : 65536
  if (Buffer.byteLength(encoded) > limit) fail('limit', 'Skill-manager metadata exceeds its safe storage limit. No oversized state will be committed.')
  const target = join(stateDir, filename)
  assertInside(stateDir, target)
  await assertNoSymlinkPath(target)
  const temporary = join(stateDir, `${filename}.${randomUUID()}.tmp`)
  assertInside(stateDir, temporary)
  const handle = await open(temporary, 'wx', 0o600)
  try {
    await handle.writeFile(encoded)
    await handle.sync()
    await handle.close()
    await rename(temporary, target)
  } catch (error) {
    await handle.close().catch(() => {})
    assertInside(stateDir, temporary)
    await unlink(temporary).catch(() => {})
    throw error
  }
}
async function removeOwned(stateDir: string, kind: 'staging' | 'backups', id: string): Promise<void> {
  if (!z.string().uuid().safeParse(id).success) fail('unsafe-path', 'Unexpected owned resource ID.')
  const parent = join(stateDir, kind)
  const target = join(parent, id)
  assertInside(parent, target)
  await assertNoSymlinkPath(target)
  await rm(target, { recursive: true, force: true })
}
export interface WriteStore { root: SkillRoot; stateDir: string; state: StoreState }
export async function withRootWrite<T>(root: SkillRoot, operation: (store: WriteStore) => Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!root.writable) fail('read-only', 'This skill root is read-only.')
  throwIfAborted(signal)
  await assertNoSymlinkPath(root.path)
  await mkdir(root.path, { recursive: true })
  const canonical = await realpath(root.path)
  if (canonical !== resolve(root.path)) fail('read-only', 'A skill root resolves through a symlink.')
  const stateDir = join(root.path, STATE_DIR)
  await assertNoSymlinkPath(stateDir)
  await mkdir(stateDir, { recursive: true, mode: 0o700 })
  await assertNoSymlinkPath(stateDir)
  const lockPath = join(stateDir, 'write.lock')
  const nonce = randomUUID()
  let handle
  try { handle = await open(lockPath, 'wx', 0o600) } catch (error) {
    if (hasCode(error, 'EEXIST')) fail('busy', 'Another operation or an interrupted process owns this skill root. Do not remove its lock while it is running.')
    throw error
  }
  try {
    await handle.writeFile(JSON.stringify({ id: nonce, pid: process.pid, createdAt: new Date().toISOString() }))
    await handle.sync()
    if (await pathExists(join(stateDir, 'journal.json'))) fail('recovery-required', 'An unfinished skill transaction exists. Preserve its journal, staging and backup before manual recovery.')
    const state = await readState(root)
    await assertNoSymlinkPath(root.path)
    if (await realpath(root.path) !== canonical) fail('unsafe-path', 'The skill root changed during admission.')
    return await operation({ root, stateDir, state })
  } finally {
    await handle.close()
    const current = JSON.parse(Buffer.from(await readBytes(lockPath, 4096)).toString('utf8')) as { id?: string }
    if (current.id !== nonce) fail('recovery-required', 'Skill-root lock ownership changed; the lock was preserved.')
    assertInside(stateDir, lockPath)
    await unlink(lockPath)
  }
}
async function createStage(store: WriteStore, files: readonly BundleFile[]): Promise<{ id: string; path: string }> {
  const id = randomUUID()
  const path = join(store.stateDir, 'staging', id)
  assertInside(join(store.stateDir, 'staging'), path)
  await assertNoSymlinkPath(path)
  await mkdir(path, { recursive: true, mode: 0o700 })
  try {
    for (const file of files) {
      safeRelativePath(file.path)
      const target = join(path, ...file.path.split('/'))
      assertInside(path, target)
      await mkdir(dirname(target), { recursive: true })
      const handle = await open(target, 'wx', file.executable ? 0o755 : 0o644)
      try { await handle.writeFile(file.bytes); await handle.sync() } finally { await handle.close() }
    }
    return { id, path }
  } catch (error) { await removeOwned(store.stateDir, 'staging', id); throw error }
}
async function reserveBackup(store: WriteStore, entry: string, name: string, action: Backup['action'], source?: Provenance, size?: { totalBytes: number; fileCount: number }): Promise<Backup> {
  const backup: Backup = { id: randomUUID(), rootId: store.root.id, entry: safeEntry(entry), name, action, createdAt: new Date().toISOString(), ...(size ? { sizeBytes: size.totalBytes, fileCount: size.fileCount } : {}), ...(source ? { source } : {}) }
  const path = join(store.stateDir, 'backups', backup.id)
  assertInside(join(store.stateDir, 'backups'), path)
  await assertNoSymlinkPath(path)
  await mkdir(path, { recursive: true, mode: 0o700 })
  try {
    await writeJson(path, 'meta.json', backup)
    return backup
  } catch (error) { await removeOwned(store.stateDir, 'backups', backup.id); throw error }
}
async function clearJournal(store: WriteStore): Promise<void> {
  const path = join(store.stateDir, 'journal.json')
  assertInside(store.stateDir, path)
  await assertNoSymlinkPath(path)
  await unlink(path)
}
export async function installEntry(store: WriteStore, entry: string, files: readonly BundleFile[], source: Provenance | undefined, signal?: AbortSignal): Promise<void> {
  const target = join(store.root.path, safeEntry(entry))
  assertInside(store.root.path, target)
  if (await pathExists(target)) fail('already-exists', 'A skill with this directory name already exists. Installation never overwrites it.')
  const stage = await createStage(store, files)
  let moved = false
  let committed = false
  try {
    throwIfAborted(signal)
    await assertNoSymlinkPath(target)
    if (await pathExists(target)) fail('stale', 'The installation target appeared during preparation.')
    await writeJson(store.stateDir, 'journal.json', { action: 'install', entry, stageId: stage.id })
    await publishNoReplace(stage.path, target); moved = true
    const records = { ...store.state.records }
    if (source) records[entry] = source
    else delete records[entry]
    await writeJson(store.stateDir, 'state.json', { ...store.state, records }); committed = true
    await clearJournal(store)
  } catch (error) {
    if (hasCode(error, 'recovery-required')) throw error
    if (!committed) {
      try {
        if (moved) { assertInside(store.root.path, target); await assertNoSymlinkPath(target); await rename(target, stage.path) }
        if (await pathExists(join(store.stateDir, 'journal.json'))) await clearJournal(store)
      } catch { fail('recovery-required', 'Installation rollback failed. Its journal and staging were preserved.') }
    }
    throw error
  } finally {
    if (!(await pathExists(join(store.stateDir, 'journal.json')))) await removeOwned(store.stateDir, 'staging', stage.id)
  }
}
export async function changeEntry(store: WriteStore, entry: string, name: string, action: Backup['action'], expectedFingerprint: string, config: ManagerConfig, source: Provenance | undefined, replacement?: { files: BundleFile[]; source: Provenance }, signal?: AbortSignal): Promise<Backup> {
  const target = join(store.root.path, safeEntry(entry))
  assertInside(store.root.path, target)
  const current = await snapshotPath(target, config, signal)
  if (current.fingerprint !== expectedFingerprint) fail('stale', 'Local skill files changed after confirmation. Reopen the preview before retrying.')
  const stage = replacement ? await createStage(store, replacement.files) : undefined
  let backup: Backup | undefined
  let moved = false
  let installed = false
  let committed = false
  try {
    throwIfAborted(signal)
    backup = await reserveBackup(store, entry, name, action, source, { totalBytes: current.totalBytes, fileCount: current.files.length })
    const backupPath = join(store.stateDir, 'backups', backup.id, 'content')
    assertInside(join(store.stateDir, 'backups', backup.id), backupPath)
    await writeJson(store.stateDir, 'journal.json', { action, entry, backupId: backup.id, ...(stage ? { stageId: stage.id } : {}) })
    await assertNoSymlinkPath(target)
    const final = await snapshotPath(target, config, signal)
    if (final.fingerprint !== expectedFingerprint) fail('stale', 'Local skill changed while preparing its backup.')
    await rename(target, backupPath); moved = true
    if (stage) { await publishNoReplace(stage.path, target); installed = true }
    const records = { ...store.state.records }
    if (replacement) records[entry] = replacement.source
    else delete records[entry]
    await writeJson(store.stateDir, 'state.json', { ...store.state, records, backups: [...store.state.backups, backup] }); committed = true
    await clearJournal(store)
    return backup
  } catch (error) {
    if (hasCode(error, 'recovery-required')) throw error
    if (!committed) {
      try {
        if (installed && stage) { assertInside(store.root.path, target); await assertNoSymlinkPath(target); await rename(target, stage.path) }
        if (moved && backup) {
          if (await pathExists(target)) fail('stale', 'Rollback target is occupied.')
          const backupPath = join(store.stateDir, 'backups', backup.id, 'content')
          assertInside(join(store.stateDir, 'backups', backup.id), backupPath)
          await assertNoSymlinkPath(backupPath)
          await publishNoReplace(backupPath, target)
        }
        if (await pathExists(join(store.stateDir, 'journal.json'))) await clearJournal(store)
        if (backup) await removeOwned(store.stateDir, 'backups', backup.id)
      } catch { fail('recovery-required', 'Skill rollback could not restore the prior entry. Its journal, stage and backup were preserved.') }
    }
    throw error
  } finally {
    if (stage && !(await pathExists(join(store.stateDir, 'journal.json')))) await removeOwned(store.stateDir, 'staging', stage.id)
  }
}
export async function renameEntry(store: WriteStore, from: string, to: string, expectedFingerprint: string, config: ManagerConfig, signal?: AbortSignal): Promise<void> {
  const source = safeEntry(from)
  const target = safeEntry(to)
  if (source === target) fail('no-change', 'The new entry name is identical to the current one.')
  const sourcePath = join(store.root.path, source)
  const targetPath = join(store.root.path, target)
  assertInside(store.root.path, sourcePath)
  assertInside(store.root.path, targetPath)
  if (await pathExists(targetPath)) fail('already-exists', 'An entry with the new name already exists.')
  const current = await snapshotPath(sourcePath, config, signal)
  if (current.fingerprint !== expectedFingerprint) fail('stale', 'Local skill files changed after confirmation. Reopen it before retrying.')
  await assertNoSymlinkPath(sourcePath)
  await assertNoSymlinkPath(targetPath)
  await writeJson(store.stateDir, 'journal.json', { action: 'rename', entry: source, entry2: target })
  let moved = false
  let committed = false
  try {
    if (await pathExists(targetPath)) fail('stale', 'The new entry name appeared during preparation.')
    await rename(sourcePath, targetPath); moved = true
    const records = { ...store.state.records }
    if (Object.hasOwn(records, source)) { records[target] = records[source]!; delete records[source] }
    await writeJson(store.stateDir, 'state.json', { ...store.state, records }); committed = true
    await clearJournal(store)
  } catch (error) {
    if (hasCode(error, 'recovery-required')) throw error
    if (!committed && moved) {
      try {
        if (await pathExists(sourcePath)) fail('stale', 'Rollback target is occupied.')
        await assertNoSymlinkPath(targetPath)
        await rename(targetPath, sourcePath)
        await clearJournal(store)
      } catch { fail('recovery-required', 'Entry rename rollback failed. The transaction journal was preserved.') }
    }
    throw error
  }
}

export async function deleteEntryPermanent(store: WriteStore, entry: string, expectedFingerprint: string, config: ManagerConfig, signal?: AbortSignal): Promise<void> {
  const target = join(store.root.path, safeEntry(entry))
  assertInside(store.root.path, target)
  const current = await snapshotPath(target, config, signal)
  if (current.fingerprint !== expectedFingerprint) fail('stale', 'Local skill files changed after confirmation. Reopen it before retrying.')
  const id = randomUUID()
  const trash = join(store.stateDir, 'staging', id)
  assertInside(join(store.stateDir, 'staging'), trash)
  await assertNoSymlinkPath(target)
  await assertNoSymlinkPath(trash)
  await mkdir(join(store.stateDir, 'staging'), { recursive: true, mode: 0o700 })
  await writeJson(store.stateDir, 'journal.json', { action: 'permanent-delete', entry, stageId: id })
  let moved = false
  let committed = false
  try {
    await rename(target, trash); moved = true
    const records = { ...store.state.records }
    delete records[entry]
    await writeJson(store.stateDir, 'state.json', { ...store.state, records }); committed = true
    await clearJournal(store)
    await removeOwned(store.stateDir, 'staging', id)
  } catch (error) {
    if (hasCode(error, 'recovery-required')) throw error
    if (!committed) {
      try {
        if (moved) {
          if (await pathExists(target)) fail('stale', 'Rollback target is occupied.')
          await rename(trash, target)
        }
        if (await pathExists(join(store.stateDir, 'journal.json'))) await clearJournal(store)
      } catch { fail('recovery-required', 'Permanent removal rollback failed. Its journal and staging were preserved.') }
    }
    throw error
  }
}

async function purgeBackupLocked(store: WriteStore, backup: Backup): Promise<void> {
  const id = z.string().uuid().parse(backup.id)
  const parent = join(store.stateDir, 'backups')
  const directory = join(parent, id)
  const trash = join(store.stateDir, 'staging', id)
  assertInside(parent, directory)
  assertInside(join(store.stateDir, 'staging'), trash)
  await assertNoSymlinkPath(directory)
  await writeJson(store.stateDir, 'journal.json', { action: 'purge', backupId: id, stageId: id })
  let moved = false
  let committed = false
  try {
    await mkdir(join(store.stateDir, 'staging'), { recursive: true, mode: 0o700 })
    await rename(directory, trash); moved = true
    await writeJson(store.stateDir, 'state.json', { ...store.state, backups: store.state.backups.filter(item => item.id !== id) }); committed = true
    await clearJournal(store)
    await removeOwned(store.stateDir, 'staging', id)
  } catch (error) {
    if (hasCode(error, 'recovery-required')) throw error
    if (!committed) {
      try {
        if (moved) {
          if (await pathExists(directory)) fail('stale', 'Rollback target is occupied.')
          await rename(trash, directory)
        }
        if (await pathExists(join(store.stateDir, 'journal.json'))) await clearJournal(store)
      } catch { fail('recovery-required', 'Backup cleanup rollback failed. Its journal and staging were preserved.') }
    }
    throw error
  }
}

export async function purgeBackup(store: WriteStore, backupId: string, signal?: AbortSignal): Promise<Backup> {
  throwIfAborted(signal)
  const fresh = await readState(store.root)
  const backup = fresh.backups.find(item => item.id === backupId)
  if (!backup || !z.string().uuid().safeParse(backupId).success) fail('not-found', 'This backup does not exist in the selected skill root.')
  const before = store.state.backups.length
  await purgeBackupLocked({ ...store, state: fresh }, backup)
  if (store.state.backups.length === before) store.state = await readState(store.root)
  return backup
}

export async function purgeBackups(store: WriteStore, keep: number, signal?: AbortSignal): Promise<PurgeResult> {
  throwIfAborted(signal)
  const fresh = await readState(store.root)
  const sorted = [...fresh.backups].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const removals = sorted.slice(0, Math.max(0, sorted.length - keep))
  let freedBytes = 0
  let removed = 0
  let state = fresh
  for (const backup of removals) {
    throwIfAborted(signal)
    const next = { ...state, backups: state.backups.filter(item => item.id !== backup.id) }
    await purgeBackupLocked({ ...store, state }, backup)
    state = next
    removed++
    freedBytes += backup.sizeBytes ?? 0
  }
  store.state = state
  return { removed, freedBytes }
}

export async function restoreEntry(store: WriteStore, backupId: string, signal?: AbortSignal): Promise<Backup> {
  const backup = store.state.backups.find(item => item.id === backupId)
  if (!backup || !z.string().uuid().safeParse(backupId).success) fail('not-found', 'This backup does not exist in the selected skill root.')
  const target = join(store.root.path, safeEntry(backup.entry))
  assertInside(store.root.path, target)
  if (await pathExists(target)) fail('already-exists', 'Restore never overwrites an existing skill. Remove or move that entry first.')
  const content = join(store.stateDir, 'backups', backup.id, 'content')
  assertInside(join(store.stateDir, 'backups', backup.id), content)
  await assertNoSymlinkPath(content)
  throwIfAborted(signal)
  await writeJson(store.stateDir, 'journal.json', { action: 'restore', entry: backup.entry, backupId })
  let moved = false
  let committed = false
  try {
    if (await pathExists(target)) fail('stale', 'The restore target appeared during preparation.')
    await publishNoReplace(content, target); moved = true
    const records = { ...store.state.records }
    if (backup.source) records[backup.entry] = backup.source
    else delete records[backup.entry]
    await writeJson(store.stateDir, 'state.json', { ...store.state, records, backups: store.state.backups.filter(item => item.id !== backupId) }); committed = true
    await clearJournal(store)
    await removeOwned(store.stateDir, 'backups', backup.id)
    return backup
  } catch (error) {
    if (hasCode(error, 'recovery-required')) throw error
    if (!committed) {
      try {
        if (moved) { assertInside(store.root.path, target); await assertNoSymlinkPath(target); await rename(target, content) }
        await clearJournal(store)
      } catch { fail('recovery-required', 'Backup restore rollback failed. The transaction journal was preserved.') }
    }
    throw error
  }
}
