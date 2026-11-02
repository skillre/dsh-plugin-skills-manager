import { lstat, readdir, realpath, stat } from 'node:fs/promises'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import type { ManagerConfig } from './config.js'
import { parseRequest } from './config.js'
import type { Backup, BatchUpdateItem, BatchUpdateResult, Catalog, LocalSkill, ManagerRequest, ManagerValue, MutationResult, Provenance, PurgeResult, SkillDetail, SkillDiff, SkillDiffFile, SkillOrigin, SkillRoot, UpdateCheck, WellKnownInspect, WorkspaceChoice } from './types.js'
import { MUTATING_ACTIONS } from './types.js'
import { STATE_DIR, assertNoSymlinkPath, bundleFingerprint, changeEntry, deleteEntryPermanent, fileSummary, installEntry, ownValue, pathExists, purgeBackup, purgeBackups, readBytes, readState, renameEntry, restoreEntry, safeEntry, safeRelativePath, snapshotPath, withRootWrite } from './fs-store.js'
import { extractSkillBundle } from './archive.js'
import { extractZipBundle } from './zip.js'
import { GitHubSource, parseRef, parseRepository } from './github.js'
import type { RepositoryTree } from './github.js'
import type { BundleFile } from './fs-store.js'
import { WellKnownSource, parseWellKnownBase } from './well-known.js'
import { errorMessage, fail, hasCode, SkillsManagerError, throwIfAborted } from './errors.js'
import { parseSkill } from './skill-metadata.js'
import { mapLimit } from './utils.js'

export interface RegistrySkill {
  name: string
  description: string
  path?: string
  source: string
  invocation: { modelInvocable: boolean; userInvocable: boolean }
}
export interface ManagerHooks {
  workspaces?: () => WorkspaceChoice[]
  registryList?: (cwd: string | undefined, signal: AbortSignal) => Promise<RegistrySkill[]>
  registryGet?: (name: string, cwd: string | undefined, signal: AbortSignal) => Promise<{ content: string } | undefined>
}
export type SourceProvider = Pick<GitHubSource, 'search' | 'inspect' | 'preview' | 'tree' | 'folderHashFor' | 'download' | 'clear'>
const entryId = (rootId: string, entry: string) => `${rootId}::${encodeURIComponent(entry)}`
function checkKey(source: Provenance | undefined, name: string, valid: boolean, writable: boolean): string {
  return JSON.stringify([source?.kind, source?.repository, source?.ref, source?.skillPath, source?.treeHash, source?.digest, source?.sourceBaseUrl, source?.skillName, name, valid, writable])
}
function originHint(entry: Record<string, unknown>): SkillOrigin {
  const sourceType = typeof entry.sourceType === 'string' && /^[a-z][a-z0-9-]{0,31}$/.test(entry.sourceType) ? entry.sourceType : 'external'
  const raw = typeof entry.source === 'string' ? entry.source.trim() : ''
  const candidate = typeof entry.sourceUrl === 'string' ? entry.sourceUrl : typeof entry.sourceBaseUrl === 'string' ? entry.sourceBaseUrl : undefined
  let url: string | undefined
  if (candidate && candidate.length <= 2048) {
    try { const parsed = new URL(candidate); if (parsed.protocol === 'https:') url = parsed.href } catch { url = undefined }
  }
  const label = raw && raw.length <= 200 && !/[\u0000-\u001f\u007f]/.test(raw) ? raw : url ? new URL(url).host : 'external'
  return { sourceType, label, ...(url ? { url } : {}) }
}
async function projectRoot(cwd: string): Promise<string> {
  const initial = await realpath(cwd)
  let current = initial
  for (;;) {
    if (await pathExists(join(current, '.git'))) return current
    const parent = dirname(current)
    if (parent === current) return initial
    current = parent
  }
}

export class SkillsManager {
  private readonly lifetime = new AbortController()
  private readonly active = new Set<Promise<unknown>>()
  private readonly checks = new Map<string, UpdateCheck>()
  private readonly checkKeys = new Map<string, string>()
  private mutationEpoch = 0
  private closed = false
  readonly source: SourceProvider
  readonly wellKnown: WellKnownSource
  constructor(readonly config: ManagerConfig, private readonly hooks: ManagerHooks = {}, source?: SourceProvider, wellKnownSource?: WellKnownSource) {
    this.source = source ?? new GitHubSource(config)
    this.wellKnown = wellKnownSource ?? new WellKnownSource(config)
  }
  execute(raw: unknown, callerSignal?: AbortSignal): Promise<ManagerValue> {
    if (this.closed) return Promise.reject(new SkillsManagerError('unloaded', 'The skill-manager plugin has been unloaded.'))
    const request = parseRequest(raw)
    const timeout = AbortSignal.timeout(this.config.operationTimeoutMs)
    const signal = AbortSignal.any([this.lifetime.signal, timeout, ...(callerSignal ? [callerSignal] : [])])
    const task = this.run(request, signal).catch(error => {
      if (hasCode(error, 'recovery-required')) throw error
      if (timeout.aborted && !callerSignal?.aborted && !this.lifetime.signal.aborted) fail('timeout', 'Skill operation exceeded its configured deadline. Refresh local state before retrying a mutation.')
      if (signal.aborted && !(error instanceof SkillsManagerError && error.code === 'recovery-required')) fail('cancelled', 'Skill operation was cancelled. Refresh local state before retrying a mutation.')
      throw error
    }).finally(() => { this.active.delete(task) })
    this.active.add(task)
    return task
  }
  async dispose(): Promise<void> {
    this.closed = true
    this.lifetime.abort()
    await Promise.allSettled([...this.active])
    this.checks.clear()
    this.checkKeys.clear()
    this.source.clear()
    this.wellKnown.clear()
  }
  private async roots(workspaceId?: string): Promise<{ roots: SkillRoot[]; workspaces: WorkspaceChoice[]; cwd?: string }> {
    const workspaces = this.hooks.workspaces?.() ?? []
    const roots: SkillRoot[] = []
    const add = (id: string, source: SkillRoot['source'], path: string, writable: boolean) => {
      const absolute = resolve(path)
      const existing = roots.find(item => item.path === absolute)
      if (existing) { existing.writable &&= writable; return }
      roots.push({ id, label: source, source, path: absolute, writable: writable && this.config.allowMutations })
    }
    let cwd: string | undefined
    if (this.config.includeDefaultRoots) {
      add('user-agents', 'user-agents', join(this.config.agentsHome, 'skills'), true)
      add('user-dsh', 'user-dsh', join(this.config.dshHome, 'skills'), true)
      if (workspaceId) {
        const workspace = workspaces.find(item => item.id === workspaceId)
        if (!workspace) fail('not-found', 'Select a registered DSH workspace before managing project skills.')
        cwd = await projectRoot(workspace.path)
        add(`project-agents-${workspaceId}`, 'project-agents', join(cwd, '.agents/skills'), true)
        add(`project-dsh-${workspaceId}`, 'project-dsh', join(cwd, '.dsh/skills'), true)
      }
    } else if (workspaceId) fail('read-only', 'Workspace skill roots are disabled in this configuration.')
    this.config.customSkillDirs.forEach((path, index) => add(`custom-${index}`, 'custom', path, false))
    this.config.readOnlySkillDirs.forEach((path, index) => add(`bundled-${index}`, 'bundled', path, false))
    for (const root of roots) {
      if (root.writable) {
        try { await assertNoSymlinkPath(root.path) } catch { root.writable = false }
      }
    }
    return { roots, workspaces: workspaces.map(item => ({ id: item.id, title: item.title, path: item.path })), ...(cwd ? { cwd } : {}) }
  }
  private async cliOrigins(): Promise<{ provenance: Record<string, Provenance>; hints: Record<string, SkillOrigin> }> {
    const empty = { provenance: Object.create(null) as Record<string, Provenance>, hints: Object.create(null) as Record<string, SkillOrigin> }
    const file = join(this.config.agentsHome, '.skill-lock.json')
    if (!(await pathExists(file))) return empty
    await assertNoSymlinkPath(file)
    const raw = JSON.parse(Buffer.from(await readBytes(file, 2 * 1024 * 1024)).toString('utf8')) as Record<string, unknown>
    if (raw.version !== 3 || !raw.skills || typeof raw.skills !== 'object' || Array.isArray(raw.skills)) return empty
    for (const [name, item] of Object.entries(raw.skills as Record<string, unknown>).slice(0, this.config.maxSkills * 2)) {
      if (!item || typeof item !== 'object' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) continue
      const entry = item as Record<string, unknown>
      const hint = originHint(entry)
      if (entry.sourceType === 'well-known') {
        try {
          const base = parseWellKnownBase(typeof entry.sourceBaseUrl === 'string' ? entry.sourceBaseUrl : '')
          if (typeof entry.wellKnownDigest !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(entry.wellKnownDigest)) throw new Error('Unsupported well-known lock entry')
          empty.provenance[name] = {
            kind: 'well-known', repository: base.label, sourceBaseUrl: base.baseUrl, skillName: name, digest: entry.wellKnownDigest, imported: true,
            ...(typeof entry.installedAt === 'string' ? { installedAt: entry.installedAt } : {}),
            ...(typeof entry.updatedAt === 'string' ? { updatedAt: entry.updatedAt } : {}),
          }
        } catch { if (hint) empty.hints[name] = hint }
        continue
      }
      if (entry.sourceType !== 'github') { if (hint) empty.hints[name] = hint; continue }
      if (typeof entry.source !== 'string' || typeof entry.skillPath !== 'string' || typeof entry.skillFolderHash !== 'string' || !/^[0-9a-f]{40}$/.test(entry.skillFolderHash)) { if (hint) empty.hints[name] = hint; continue }
      try {
        safeRelativePath(entry.skillPath)
        if (!entry.skillPath.endsWith('SKILL.md')) throw new Error('Unsupported GitHub lock entry')
        empty.provenance[name] = {
          kind: 'github', repository: parseRepository(entry.source), ref: parseRef(typeof entry.ref === 'string' ? entry.ref : undefined), skillPath: entry.skillPath,
          commit: 'unknown', treeHash: entry.skillFolderHash, imported: true,
          ...(typeof entry.installedAt === 'string' ? { installedAt: entry.installedAt } : {}),
          ...(typeof entry.updatedAt === 'string' ? { updatedAt: entry.updatedAt } : {}),
        }
      } catch { if (hint) empty.hints[name] = hint }
    }
    return empty
  }
  private async local(root: SkillRoot, entry: string, records: Record<string, Provenance>, origins: { provenance: Record<string, Provenance>; hints: Record<string, SkillOrigin> }, signal: AbortSignal): Promise<LocalSkill | null> {
    safeEntry(entry)
    const entryPath = join(root.path, entry)
    const info = await lstat(entryPath)
    const linked = info.isSymbolicLink()
    let resolvedInfo = info
    if (linked) {
      try { resolvedInfo = await stat(entryPath) } catch { return null }
    }
    const directory = resolvedInfo.isDirectory()
    if (!directory && (!resolvedInfo.isFile() || !entry.endsWith('.md'))) return null
    const skillPath = directory ? join(entryPath, 'SKILL.md') : entryPath
    if (!(await pathExists(skillPath))) return null
    let metadata = { name: directory ? entry : entry.replace(/\.md$/, ''), description: '', modelInvocable: false, userInvocable: false }
    let issue: string | undefined
    let valid = true
    let writable = root.writable && !linked
    try { metadata = parseSkill(Buffer.from(await readBytes(skillPath, this.config.maxFileBytes, signal)).toString('utf8')) } catch (error) { throwIfAborted(signal); valid = false; issue = errorMessage(error) }
    if (linked) issue = 'Externally linked skill: read-only. Use its original installer to manage the link.'
    if (writable) {
      try { await assertNoSymlinkPath(entryPath) } catch (error) { writable = false; issue = errorMessage(error) }
    }
    const imported = root.source === 'user-agents' && directory && entry === metadata.name
    const source = ownValue(records, entry) ?? (imported ? ownValue(origins.provenance, metadata.name) : undefined)
    const origin = source ? undefined : imported ? ownValue(origins.hints, metadata.name) : undefined
    const id = entryId(root.id, entry)
    const key = checkKey(source, metadata.name, valid, writable)
    const check = this.checkKeys.get(id) === key ? this.checks.get(id) : undefined
    return { id, rootId: root.id, entry, path: skillPath, format: directory ? 'directory' : 'file', writable, valid, ...metadata, ...(issue ? { issue } : {}), ...(origin ? { origin } : {}), ...(source ? { source } : {}), ...(check ? { check } : {}) }
  }
  async catalog(workspaceId: string | undefined, signal: AbortSignal): Promise<Catalog> {
    const selected = await this.roots(workspaceId)
    const skills: LocalSkill[] = []
    const warnings: string[] = []
    let truncated = false
    let origins: { provenance: Record<string, Provenance>; hints: Record<string, SkillOrigin> } = { provenance: {}, hints: {} }
    try { origins = await this.cliOrigins() } catch (error) { warnings.push(`Skills CLI provenance is unavailable: ${errorMessage(error)}`) }
    for (const root of selected.roots) {
      throwIfAborted(signal)
      if (!(await pathExists(root.path))) continue
      let records: Record<string, Provenance> = {}
      try {
        records = (await readState(root)).records
        if (await pathExists(join(root.path, '.skills-manager/journal.json'))) { root.writable = false; warnings.push(`${root.path}: unfinished transaction; preserve its journal and backups.`) }
      } catch (error) { root.writable = false; warnings.push(`${root.path}: ${errorMessage(error)}`) }
      let entries: string[]
      try { entries = await readdir(root.path) } catch (error) { warnings.push(`${root.path}: ${errorMessage(error)}`); continue }
      if (entries.length > this.config.maxSkills * 4) { truncated = true; entries = entries.slice(0, this.config.maxSkills * 4) }
      for (const entry of entries.sort()) {
        if (entry.startsWith('.')) continue
        if (skills.length >= this.config.maxSkills) { truncated = true; break }
        try {
          const skill = await this.local(root, entry, records, origins, signal)
          if (skill) skills.push(skill)
        } catch (error) { throwIfAborted(signal); warnings.push(`${join(root.path, entry)}: ${errorMessage(error)}`) }
      }
    }
    if (this.hooks.registryList) {
      try {
        const registry = await this.hooks.registryList(selected.cwd, signal)
        for (const item of registry) {
          if (skills.length >= this.config.maxSkills) { truncated = true; break }
          if (item.path && skills.some(skill => resolve(skill.path) === resolve(item.path!))) continue
          if (skills.some(skill => skill.id === entryId('runtime', item.name))) continue
          skills.push({ id: entryId('runtime', item.name), rootId: 'runtime', entry: item.name, name: item.name, description: item.description, path: item.path ?? '', format: 'registry', writable: false, valid: true, modelInvocable: item.invocation.modelInvocable, userInvocable: item.invocation.userInvocable })
        }
        if (skills.some(skill => skill.rootId === 'runtime')) selected.roots.push({ id: 'runtime', label: 'runtime', source: 'runtime', path: '', writable: false })
      } catch (error) { throwIfAborted(signal); warnings.push(`DSH read-only skill catalog: ${errorMessage(error)}`) }
    }
    return { roots: selected.roots, workspaces: selected.workspaces, skills: skills.sort((a, b) => a.name.localeCompare(b.name)), warnings: warnings.slice(0, 30), truncated, mutationsAllowed: this.config.allowMutations }
  }
  private async find(id: string, workspaceId: string | undefined, signal: AbortSignal): Promise<{ skill: LocalSkill; root: SkillRoot }> {
    const catalog = await this.catalog(workspaceId, signal)
    const skill = catalog.skills.find(item => item.id === id)
    const root = catalog.roots.find(item => item.id === skill?.rootId)
    if (!skill || !root) fail('not-found', 'This skill is no longer present in the selected roots. Refresh the list.')
    return { skill, root }
  }
  private async detail(id: string, workspaceId: string | undefined, signal: AbortSignal): Promise<SkillDetail> {
    const { skill, root } = await this.find(id, workspaceId, signal)
    if (skill.format === 'registry') {
      const selected = await this.roots(workspaceId)
      const loaded = await this.hooks.registryGet?.(skill.name, selected.cwd, signal)
      if (!loaded) fail('not-found', 'The read-only registry skill is no longer available.')
      return { skill, content: loaded.content.slice(0, this.config.maxFileBytes), files: [], fingerprint: '', locallyModified: null, totalBytes: Buffer.byteLength(loaded.content) }
    }
    const content = Buffer.from(await readBytes(skill.path, this.config.maxFileBytes, signal)).toString('utf8')
    if (!skill.writable) return { skill, content, files: [], fingerprint: '', locallyModified: null, totalBytes: Buffer.byteLength(content) }
    const snapshot = await snapshotPath(join(root.path, skill.entry), this.config, signal)
    const source = skill.source
    const locallyModified = source
      ? source.fingerprint
        ? snapshot.fingerprint !== source.fingerprint
        : source.kind === 'well-known' || !source.treeHash ? null : snapshot.gitTreeHash !== source.treeHash
      : null
    return { skill, content, files: fileSummary(snapshot), fingerprint: snapshot.fingerprint, locallyModified, totalBytes: snapshot.totalBytes }
  }
  private async check(workspaceId: string | undefined, id: string | undefined, signal: AbortSignal): Promise<UpdateCheck[]> {
    const epoch = this.mutationEpoch
    const catalog = await this.catalog(workspaceId, signal)
    const selected = id ? catalog.skills.filter(item => item.id === id) : catalog.skills
    if (id && selected.length === 0) fail('not-found', 'The requested skill is not present.')
    const trees = new Map<string, Promise<RepositoryTree>>()
    this.wellKnown.clear()
    const checkedAt = new Date().toISOString()
    const results = await mapLimit(selected, this.config.checkConcurrency, async skill => {
      let result: UpdateCheck
      if (!skill.writable) result = { id: skill.id, status: 'protected', checkedAt }
      else if (!skill.source || !skill.valid) result = { id: skill.id, status: 'untracked', checkedAt, message: 'No supported remote provenance is recorded; no update claim can be made.' }
      else {
        try {
          const source = skill.source
          if (source.kind === 'well-known') {
            if (!source.sourceBaseUrl || !source.skillName || !source.digest) fail('untracked', 'This skill has incomplete well-known provenance; remove and reinstall it before checking updates.')
            const latestDigest = await this.wellKnown.digest(source.sourceBaseUrl, source.skillName, signal)
            if (!latestDigest) fail('source-not-found', 'The skill source no longer lists this skill.')
            result = { id: skill.id, status: latestDigest === source.digest ? 'latest' : 'update', checkedAt, latestDigest }
          } else {
            if (!source.skillPath || !source.treeHash) fail('untracked', 'This skill has incomplete GitHub provenance; reinstall it before checking updates.')
            const key = `${source.repository}@${source.ref ?? 'HEAD'}`
            if (!trees.has(key)) trees.set(key, this.source.tree(source.repository, source.ref, signal))
            const tree = await trees.get(key)!
            const latestTreeHash = this.source.folderHashFor(tree, source.skillPath)
            result = { id: skill.id, status: latestTreeHash === source.treeHash ? 'latest' : 'update', checkedAt, latestCommit: tree.commit, latestTreeHash }
          }
        } catch (error) { throwIfAborted(signal); result = { id: skill.id, status: 'error', checkedAt, message: errorMessage(error) } }
      }
      if (epoch === this.mutationEpoch) {
        this.checks.set(skill.id, result)
        this.checkKeys.set(skill.id, checkKey(skill.source, skill.name, skill.valid, skill.writable))
      }
      return result
    }, signal)
    if (epoch !== this.mutationEpoch) fail('stale', 'Skills changed while their sources were being checked. Run the update check again.')
    return results
  }
  private assertMutable(skill?: LocalSkill): void {
    if (!this.config.allowMutations || (skill && !skill.writable)) fail('read-only', 'This skill or configuration is read-only.')
  }
  private async writableRoot(rootId: string, workspaceId?: string): Promise<SkillRoot> {
    const selected = await this.roots(workspaceId)
    const root = selected.roots.find(item => item.id === rootId)
    if (!root) fail('not-found', 'Select an available skill installation root.')
    if (!root.writable) fail('read-only', 'The selected skill root is read-only.')
    return root
  }
  private async run(request: ManagerRequest, signal: AbortSignal): Promise<ManagerValue> {
    throwIfAborted(signal)
    if (MUTATING_ACTIONS.has(request.action)) {
      this.assertMutable()
      this.mutationEpoch++
    }
    switch (request.action) {
      case 'list': return this.catalog(request.workspaceId, signal)
      case 'detail': return this.detail(request.id, request.workspaceId, signal)
      case 'search': return this.source.search(request.query, request.limit ?? 24, signal)
      case 'inspect': return this.source.inspect(request.source, request.ref, signal)
      case 'preview': return this.source.preview(request.source, request.ref, request.commit, request.skillPath, signal)
      case 'check': return this.check(request.workspaceId, request.id, signal)
      case 'backups': {
        const selected = await this.roots(request.workspaceId)
        const backups: Backup[] = []
        for (const root of selected.roots) {
          const state = await readState(root)
          backups.push(...state.backups.map(backup => ({ ...backup, rootId: root.id })))
        }
        return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, this.config.maxSkills)
      }
      case 'install': {
        const root = await this.writableRoot(request.rootId, request.workspaceId)
        const downloaded = await this.source.download(request.source, request.ref, request.commit, request.skillPath, signal)
        const name = safeEntry(downloaded.skill.name)
        const now = new Date().toISOString()
        const source: Provenance = { kind: 'github', repository: downloaded.tree.repository, ref: downloaded.tree.ref, skillPath: downloaded.skill.skillPath, commit: downloaded.tree.commit, treeHash: downloaded.skill.treeHash, fingerprint: bundleFingerprint(downloaded.files), installedAt: now, updatedAt: now }
        await withRootWrite(root, store => installEntry(store, name, downloaded.files, source, signal), signal)
        this.rememberLatest(entryId(root.id, name), source, name)
        return { action: 'install', name, rootId: root.id, path: join(root.path, name), ...(source.commit ? { commit: source.commit } : {}) } satisfies MutationResult
      }
      case 'update': {
        const detail = await this.detail(request.id, request.workspaceId, signal)
        return this.applyUpdate(detail, request.expectedFingerprint, request.commit, request.overwriteModified ?? false, request.workspaceId, signal)
      }
      case 'remove': {
        const { skill, root } = await this.find(request.id, request.workspaceId, signal)
        this.assertMutable(skill)
        if (request.permanent) {
          await withRootWrite(root, store => deleteEntryPermanent(store, skill.entry, request.expectedFingerprint, this.config, signal), signal)
          this.checks.delete(skill.id)
          return { action: 'remove', name: skill.name, rootId: root.id, path: join(root.path, skill.entry) } satisfies MutationResult
        }
        const backup = await withRootWrite(root, store => changeEntry(store, skill.entry, skill.name, 'remove', request.expectedFingerprint, this.config, skill.source, undefined, signal), signal)
        this.checks.delete(skill.id)
        return { action: 'remove', name: skill.name, rootId: root.id, path: join(root.path, skill.entry), backupId: backup.id } satisfies MutationResult
      }
      case 'restore': {
        const root = await this.writableRoot(request.rootId, request.workspaceId)
        const backup = await withRootWrite(root, store => restoreEntry(store, request.backupId, signal), signal)
        this.checks.delete(entryId(root.id, backup.entry))
        return { action: 'restore', name: backup.name, rootId: root.id, path: join(root.path, backup.entry) } satisfies MutationResult
      }
      case 'restore-to': return this.restoreTo(request.fromRootId, request.backupId, request.toRootId, request.entry, request.workspaceId, signal)
      case 'move': return this.moveSkill(request.id, request.rootId, request.entry, request.workspaceId, signal)
      case 'install-local': return this.installLocal(request.rootId, request.path, request.workspaceId, signal)
      case 'well-known-inspect': return this.wellKnownInspect(request.source, signal)
      case 'well-known-install': return this.wellKnownInstall(request.rootId, request.source, request.name, request.workspaceId, signal)
      case 'update-batch': return this.batchUpdate(request.ids, request.overwriteModified ?? false, request.workspaceId, signal)
      case 'diff': return this.diffSkill(request.id, request.workspaceId, signal)
      case 'purge-backup': {
        const root = await this.writableRoot(request.rootId, request.workspaceId)
        const backup = await withRootWrite(root, store => purgeBackup(store, request.backupId, signal), signal)
        return { removed: 1, freedBytes: backup.sizeBytes ?? 0 } satisfies PurgeResult
      }
      case 'purge-backups': {
        const root = await this.writableRoot(request.rootId, request.workspaceId)
        return withRootWrite(root, store => purgeBackups(store, request.keep ?? 0, signal), signal)
      }
    }
  }

  private async applyUpdate(detail: SkillDetail, expectedFingerprint: string, commit: string | undefined, overwriteModified: boolean, workspaceId: string | undefined, signal: AbortSignal): Promise<MutationResult> {
    const skill = detail.skill
    this.assertMutable(skill)
    if (detail.fingerprint !== expectedFingerprint) fail('stale', 'Local skill changed after the preview. Reopen it before updating.')
    if (!skill.source || skill.format !== 'directory') fail('untracked', 'This skill has no supported update source. Only provenance-tracked directory bundles can be updated.')
    if (detail.locallyModified && !overwriteModified) fail('local-modified', 'Local files differ from the recorded source. Explicitly choose backup-and-replacement to update them.')
    const previous = skill.source
    if (previous.kind === 'well-known') {
      if (!previous.sourceBaseUrl || !previous.skillName || !previous.digest) fail('untracked', 'This skill has incomplete well-known provenance; remove and reinstall it before updating.')
      this.wellKnown.clear()
      const latestDigest = await this.wellKnown.digest(previous.sourceBaseUrl, previous.skillName, signal)
      if (!latestDigest) fail('source-not-found', 'The skill source no longer lists this skill; nothing was changed.')
      if (latestDigest === previous.digest && !detail.locallyModified) fail('no-update', 'This skill is already at the latest published revision.')
      const downloaded = await this.wellKnown.download(previous.sourceBaseUrl, previous.skillName, signal)
      const root = await this.writableRoot(skill.rootId, workspaceId)
      const now = new Date().toISOString()
      const source: Provenance = {
        kind: 'well-known', repository: previous.repository, sourceBaseUrl: previous.sourceBaseUrl, skillName: previous.skillName,
        digest: downloaded.digest, fingerprint: bundleFingerprint(downloaded.files), ...(previous.installedAt ? { installedAt: previous.installedAt } : { installedAt: now }), updatedAt: now,
      }
      const backup = await withRootWrite(root, async store => {
        const imported = root.source === 'user-agents' ? ownValue((await this.cliOrigins()).provenance, skill.name) : undefined
        const current = ownValue(store.state.records, skill.entry) ?? imported
        if (!current || current.kind !== 'well-known' || current.sourceBaseUrl !== previous.sourceBaseUrl || current.skillName !== previous.skillName || current.digest !== previous.digest) fail('stale', 'Skill provenance changed while its update was downloading.')
        return changeEntry(store, skill.entry, skill.name, 'update', expectedFingerprint, this.config, previous, { files: downloaded.files, source }, signal)
      }, signal)
      this.checks.delete(skill.id)
      return { action: 'update', name: skill.name, rootId: root.id, path: join(root.path, skill.entry), backupId: backup.id, digest: downloaded.digest } satisfies MutationResult
    }
    if (!previous.skillPath || !previous.treeHash) fail('untracked', 'This skill has incomplete GitHub provenance; remove and reinstall it before updating.')
    const skillPath = previous.skillPath
    const tree = await this.source.tree(previous.repository, previous.ref, signal, commit)
    const newTreeHash = this.source.folderHashFor(tree, skillPath)
    if (newTreeHash === previous.treeHash && !detail.locallyModified) fail('no-update', 'This skill is already at the selected revision.')
    const downloaded = await this.source.download(previous.repository, previous.ref, tree.commit, skillPath, signal)
    if (downloaded.skill.name !== skill.name) fail('source-changed', 'The upstream skill was renamed. Inspect and install it separately instead of silently replacing this entry.')
    const root = await this.writableRoot(skill.rootId, workspaceId)
    const now = new Date().toISOString()
    const source: Provenance = { kind: 'github', repository: downloaded.tree.repository, ref: downloaded.tree.ref, skillPath, commit: downloaded.tree.commit, treeHash: downloaded.skill.treeHash, fingerprint: bundleFingerprint(downloaded.files), installedAt: previous.installedAt ?? now, updatedAt: now }
    const backup = await withRootWrite(root, async store => {
      const imported = root.source === 'user-agents' ? ownValue((await this.cliOrigins()).provenance, skill.name) : undefined
      const current = ownValue(store.state.records, skill.entry) ?? imported
      if (!current || current.kind === 'well-known' || current.repository !== previous.repository || current.ref !== previous.ref || current.skillPath !== skillPath || current.treeHash !== previous.treeHash) fail('stale', 'Skill provenance changed while its update was downloading.')
      return changeEntry(store, skill.entry, skill.name, 'update', expectedFingerprint, this.config, previous, { files: downloaded.files, source }, signal)
    }, signal)
    this.rememberLatest(skill.id, source, skill.name)
    return { action: 'update', name: skill.name, rootId: root.id, path: join(root.path, skill.entry), backupId: backup.id, ...(source.commit ? { commit: source.commit } : {}) } satisfies MutationResult
  }

  private rememberLatest(id: string, source: Provenance, name: string): void {
    this.checks.set(id, { id, status: 'latest', checkedAt: new Date().toISOString(), ...(source.digest ? { latestDigest: source.digest } : {}), ...(source.treeHash ? { latestTreeHash: source.treeHash } : {}) })
    this.checkKeys.set(id, checkKey(source, name, true, true))
  }

  private async batchUpdate(ids: string[], overwriteModified: boolean, workspaceId: string | undefined, signal: AbortSignal): Promise<BatchUpdateResult> {
    const catalog = await this.catalog(workspaceId, signal)
    const items: BatchUpdateItem[] = []
    const seen = new Set<string>()
    for (const id of ids) {
      throwIfAborted(signal)
      if (seen.has(id)) continue
      seen.add(id)
      const skill = catalog.skills.find(item => item.id === id)
      if (!skill) { items.push({ id, name: id, status: 'failed', message: 'The requested skill is not present.' }); continue }
      if (!skill.source) { items.push({ id, name: skill.name, status: 'skipped', message: 'No supported update source is recorded.' }); continue }
      try {
        const detail = await this.detail(id, workspaceId, signal)
        if (detail.locallyModified && !overwriteModified) { items.push({ id, name: skill.name, status: 'skipped', message: 'Local modifications were detected; select overwrite to replace them.' }); continue }
        const result = await this.applyUpdate(detail, detail.fingerprint, undefined, overwriteModified, workspaceId, signal)
        items.push({ id, name: skill.name, status: 'updated', ...(result.backupId ? { backupId: result.backupId } : {}) })
      } catch (error) {
        if (hasCode(error, 'recovery-required')) throw error
        if (hasCode(error, 'no-update')) { items.push({ id, name: skill.name, status: 'skipped', message: errorMessage(error) }); continue }
        items.push({ id, name: skill.name, status: 'failed', message: errorMessage(error) })
      }
    }
    return { items, updated: items.filter(item => item.status === 'updated').length, skipped: items.filter(item => item.status === 'skipped').length, failed: items.filter(item => item.status === 'failed').length }
  }

  private async diffSkill(id: string, workspaceId: string | undefined, signal: AbortSignal): Promise<SkillDiff> {
    const { skill, root } = await this.find(id, workspaceId, signal)
    if (!skill.source || skill.format !== 'directory') fail('untracked', 'Only provenance-tracked directory bundles can be compared.')
    const local = await snapshotPath(join(root.path, skill.entry), this.config, signal)
    const source = skill.source
    let remote: BundleFile[]
    if (source.kind === 'well-known') {
      if (!source.sourceBaseUrl || !source.skillName) fail('untracked', 'This skill has incomplete well-known provenance.')
      this.wellKnown.clear()
      remote = (await this.wellKnown.download(source.sourceBaseUrl, source.skillName, signal)).files
    } else {
      if (!source.skillPath) fail('untracked', 'This skill has incomplete GitHub provenance.')
      const tree = await this.source.tree(source.repository, source.ref, signal)
      remote = (await this.source.download(source.repository, source.ref, tree.commit, source.skillPath, signal)).files
    }
    const localMap = new Map(local.files.map(file => [file.path, file]))
    const remoteMap = new Map(remote.map(file => [file.path, file]))
    const paths = [...new Set([...localMap.keys(), ...remoteMap.keys()])].sort()
    const files: SkillDiffFile[] = paths.map(path => {
      const current = localMap.get(path)
      const latest = remoteMap.get(path)
      const same = current && latest && current.bytes.length === latest.bytes.length && Buffer.compare(Buffer.from(current.bytes), Buffer.from(latest.bytes)) === 0
      return {
        path,
        status: !current ? 'added' : !latest ? 'removed' : same ? 'unchanged' : 'changed',
        ...(current ? { localBytes: current.bytes.length } : {}),
        ...(latest ? { remoteBytes: latest.bytes.length } : {}),
      }
    })
    return {
      id: skill.id, name: skill.name, files,
      added: files.filter(file => file.status === 'added').length,
      removed: files.filter(file => file.status === 'removed').length,
      changed: files.filter(file => file.status === 'changed').length,
      unchanged: files.filter(file => file.status === 'unchanged').length,
      totalBytes: remote.reduce((sum, file) => sum + file.bytes.length, 0),
    }
  }

  private async moveSkill(id: string, targetRootId: string, entry: string | undefined, workspaceId: string | undefined, signal: AbortSignal): Promise<MutationResult> {
    const { skill, root } = await this.find(id, workspaceId, signal)
    this.assertMutable(skill)
    if (skill.format === 'registry') fail('untracked', 'Registry-only skills cannot be moved.')
    const targetRoot = await this.writableRoot(targetRootId, workspaceId)
    const desired = safeEntry(entry ?? skill.entry)
    const detail = await this.detail(id, workspaceId, signal)
    if (root.id === targetRoot.id) {
      if (desired === skill.entry) fail('no-change', 'Choose a different entry name or a different target location.')
      await withRootWrite(root, store => renameEntry(store, skill.entry, desired, detail.fingerprint, this.config, signal), signal)
      this.checks.delete(skill.id)
      return { action: 'move', name: skill.name, rootId: root.id, path: join(root.path, desired) }
    }
    if (await pathExists(join(targetRoot.path, desired))) fail('already-exists', 'An entry with that name already exists in the target location.')
    const snapshot = await snapshotPath(join(root.path, skill.entry), this.config, signal)
    await withRootWrite(targetRoot, store => installEntry(store, desired, snapshot.files, skill.source, signal), signal)
    let backup
    try {
      backup = await withRootWrite(root, store => changeEntry(store, skill.entry, skill.name, 'remove', detail.fingerprint, this.config, skill.source, undefined, signal), signal)
    } catch (error) {
      try {
        await withRootWrite(targetRoot, async store => {
          const current = await snapshotPath(join(targetRoot.path, desired), this.config, signal)
          await deleteEntryPermanent(store, desired, current.fingerprint, this.config, signal)
        }, signal)
      } catch { fail('recovery-required', 'Move partially applied: the target copy exists and source removal failed. Review both locations before retrying.') }
      throw error
    }
    this.checks.delete(skill.id)
    return { action: 'move', name: skill.name, rootId: targetRoot.id, path: join(targetRoot.path, desired), backupId: backup.id }
  }

  private async installLocal(rootId: string, path: string, workspaceId: string | undefined, signal: AbortSignal): Promise<MutationResult> {
    const root = await this.writableRoot(rootId, workspaceId)
    if (!isAbsolute(path) || path.includes('\0')) fail('invalid-source', 'Provide an absolute path to a local skill archive.')
    const bytes = await readBytes(path, this.config.maxBundleBytes, signal)
    const limits = { maxBytes: this.config.maxBundleBytes, maxFiles: this.config.maxBundleFiles, maxFileBytes: this.config.maxFileBytes }
    let files: BundleFile[]
    if (/\.(?:tar\.gz|tgz)$/i.test(path)) files = extractSkillBundle(bytes, limits, signal)
    else if (/\.zip$/i.test(path)) files = extractZipBundle(bytes, limits, signal)
    else fail('invalid-source', 'Local installation accepts only .tar.gz/.tgz or .zip skill archives.')
    const skillFile = files.find(file => file.path === 'SKILL.md')
    if (!skillFile) fail('invalid-source', 'Archive does not contain SKILL.md at its root.')
    const metadata = parseSkill(new TextDecoder().decode(skillFile.bytes))
    const name = safeEntry(metadata.name)
    await withRootWrite(root, store => installEntry(store, name, files, undefined, signal), signal)
    this.checks.delete(entryId(root.id, name))
    return { action: 'install-local', name, rootId: root.id, path: join(root.path, name) }
  }

  private async wellKnownInspect(source: string, signal: AbortSignal): Promise<WellKnownInspect> {
    const base = parseWellKnownBase(source)
    const catalog = await this.wellKnown.catalog(base.baseUrl, signal)
    return { baseUrl: base.baseUrl, label: base.label, skills: catalog.entries, warnings: catalog.warnings }
  }

  private async wellKnownInstall(rootId: string, source: string, name: string, workspaceId: string | undefined, signal: AbortSignal): Promise<MutationResult> {
    const root = await this.writableRoot(rootId, workspaceId)
    const base = parseWellKnownBase(source)
    this.wellKnown.clear()
    const downloaded = await this.wellKnown.download(base.baseUrl, name, signal)
    const now = new Date().toISOString()
    const provenance: Provenance = { kind: 'well-known', repository: base.label, sourceBaseUrl: base.baseUrl, skillName: downloaded.name, digest: downloaded.digest, fingerprint: bundleFingerprint(downloaded.files), installedAt: now, updatedAt: now }
    const entry = safeEntry(downloaded.name)
    await withRootWrite(root, store => installEntry(store, entry, downloaded.files, provenance, signal), signal)
    this.checks.delete(entryId(root.id, entry))
    return { action: 'well-known-install', name: entry, rootId: root.id, path: join(root.path, entry), digest: downloaded.digest }
  }

  private async restoreTo(fromRootId: string, backupId: string, toRootId: string, entry: string | undefined, workspaceId: string | undefined, signal: AbortSignal): Promise<MutationResult> {
    const roots = await this.roots(workspaceId)
    const from = roots.roots.find(item => item.id === fromRootId)
    const to = roots.roots.find(item => item.id === toRootId)
    if (!from) fail('not-found', 'Select the skill location that owns the backup.')
    if (!to) fail('not-found', 'Select an available target skill location.')
    if (!to.writable) fail('read-only', 'The target skill location is read-only.')
    const state = await readState(from)
    const backup = state.backups.find(item => item.id === backupId)
    if (!backup) fail('not-found', 'This backup does not exist in the selected skill location.')
    const content = join(from.path, STATE_DIR, 'backups', backup.id, 'content')
    await assertNoSymlinkPath(content)
    const snapshot = await snapshotPath(content, this.config, signal)
    const desired = safeEntry(entry ?? backup.entry)
    await withRootWrite(to, store => installEntry(store, desired, snapshot.files, backup.source, signal), signal)
    this.checks.delete(entryId(to.id, desired))
    let warning: string | undefined
    if (from.writable) {
      try { await withRootWrite(from, store => purgeBackup(store, backup.id, signal), signal) }
      catch (error) { warning = `Restored to the target location, but the original backup could not be removed: ${errorMessage(error)}` }
    } else warning = 'Restored to the target location; the original location is read-only, so its backup was kept.'
    return { action: 'restore-to', name: backup.name, rootId: to.id, path: join(to.path, desired), backupId: backup.id, ...(warning ? { warning } : {}) }
  }
}
