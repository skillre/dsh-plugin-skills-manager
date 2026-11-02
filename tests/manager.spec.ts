import { describe, expect, it } from 'vitest'
import { mkdir, readFile, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Backup, Catalog, MutationResult, RepositoryInfo, SkillDetail, UpdateCheck } from '../src/types.js'
import { bundleFingerprint, pathExists, publishNoReplace, readState } from '../src/fs-store.js'
import { fixture, skillText, versionFiles, writeBundle } from './helpers.js'

async function install(f: Awaited<ReturnType<typeof fixture>>): Promise<MutationResult> {
  const repo = await f.manager.execute({ action: 'inspect', source: 'test/skills' }) as RepositoryInfo
  return await f.manager.execute({ action: 'install', rootId: 'user-agents', source: repo.repository, ref: repo.ref, commit: repo.commit, skillPath: 'demo/SKILL.md' }) as MutationResult
}
const catalog = (f: Awaited<ReturnType<typeof fixture>>) => f.manager.execute({ action: 'list' }) as Promise<Catalog>

describe('real filesystem skill lifecycle', () => {
  it('installs verified resources, updates with a backup, removes and restores without overwriting', async () => {
    const f = await fixture()
    try {
      const result = await install(f)
      expect(result.name).toBe('demo')
      expect(await readFile(join(result.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      expect(await readFile(join(result.path, 'scripts/run.sh'), 'utf8')).toContain('THIS_MUST_NOT_RUN')
      const skill = (await catalog(f)).skills[0]!
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      expect(detail.locallyModified).toBe(false)
      expect(detail.files).toHaveLength(3)
      const current = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(current[0]?.status).toBe('latest')
      f.remote.setLatest(2)
      const checks = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(checks[0]?.status).toBe('update')
      const update = await f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: detail.fingerprint, commit: checks[0]!.latestCommit }) as MutationResult
      expect(update.backupId).toBeTruthy()
      expect(await readFile(join(result.path, 'SKILL.md'), 'utf8')).toBe(skillText('two'))
      expect((await catalog(f)).skills[0]?.check).toBeUndefined()
      const backups = await f.manager.execute({ action: 'backups' }) as Backup[]
      expect(backups).toHaveLength(1)
      expect(await readFile(join(f.skillRoot, '.skills-manager/backups', backups[0]!.id, 'content/SKILL.md'), 'utf8')).toBe(skillText('one'))
      const newer = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      const remove = await f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: newer.fingerprint }) as MutationResult
      expect(await pathExists(result.path)).toBe(false)
      await f.manager.execute({ action: 'restore', rootId: 'user-agents', backupId: update.backupId })
      expect(await readFile(join(result.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      await expect(f.manager.execute({ action: 'restore', rootId: 'user-agents', backupId: remove.backupId })).rejects.toMatchObject({ code: 'already-exists' })
      expect(await readFile(join(result.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      expect(await pathExists(join(f.skillRoot, '.skills-manager/write.lock'))).toBe(false)
      expect(await pathExists(join(f.skillRoot, '.skills-manager/journal.json'))).toBe(false)
    } finally { await f.cleanup() }
  })
  it('refuses stale confirmation and local modifications unless backup-and-replacement is selected', async () => {
    const f = await fixture()
    try {
      const installed = await install(f)
      const skill = (await catalog(f)).skills[0]!
      const old = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      await writeFile(join(installed.path, 'SKILL.md'), skillText('my local edits'))
      await expect(f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: old.fingerprint })).rejects.toMatchObject({ code: 'stale' })
      const changed = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      expect(changed.locallyModified).toBe(true)
      f.remote.setLatest(2)
      await expect(f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: changed.fingerprint })).rejects.toMatchObject({ code: 'local-modified' })
      const result = await f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: changed.fingerprint, overwriteModified: true }) as MutationResult
      expect(await readFile(join(f.skillRoot, '.skills-manager/backups', result.backupId!, 'content/SKILL.md'), 'utf8')).toBe(skillText('my local edits'))
    } finally { await f.cleanup() }
  })
  it('install and publication never overwrite a pre-existing file or even an empty directory', async () => {
    const f = await fixture()
    try {
      await install(f)
      const repo = await f.manager.execute({ action: 'inspect', source: 'test/skills' }) as RepositoryInfo
      await expect(f.manager.execute({ action: 'install', rootId: 'user-agents', source: repo.repository, commit: repo.commit, skillPath: 'demo/SKILL.md' })).rejects.toMatchObject({ code: 'already-exists' })
      const source = join(f.root, 'source.md'), target = join(f.root, 'target.md')
      await writeFile(source, 'old'); await writeFile(target, 'new')
      await expect(publishNoReplace(source, target)).rejects.toMatchObject({ code: 'EEXIST' })
      expect(await readFile(target, 'utf8')).toBe('new')
      expect(await readFile(source, 'utf8')).toBe('old')
      const dirSource = join(f.root, 'dir-source'), dirTarget = join(f.root, 'dir-target')
      await mkdir(dirSource); await mkdir(dirTarget)
      await expect(publishNoReplace(dirSource, dirTarget)).rejects.toMatchObject({ code: 'EEXIST' })
      expect(await pathExists(dirSource)).toBe(true)
    } finally { await f.cleanup() }
  })
  it('removes and restores flat markdown files with no-clobber publication', async () => {
    const f = await fixture()
    try {
      await mkdir(f.skillRoot, { recursive: true })
      await writeFile(join(f.skillRoot, 'flat.md'), skillText('flat', 'flat'))
      const skill = (await catalog(f)).skills[0]!
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      const removal = await f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint }) as MutationResult
      await f.manager.execute({ action: 'restore', rootId: 'user-agents', backupId: removal.backupId })
      expect(await readFile(join(f.skillRoot, 'flat.md'), 'utf8')).toBe(skillText('flat', 'flat'))
    } finally { await f.cleanup() }
  })
  it('treats symlinked skills as read-only and never follows a resource link during mutation', async () => {
    const f = await fixture()
    try {
      const outside = join(f.root, 'outside')
      await writeBundle(outside)
      await mkdir(f.skillRoot, { recursive: true })
      await symlink(outside, join(f.skillRoot, 'linked'))
      const linked = (await catalog(f)).skills[0]!
      expect(linked.writable).toBe(false)
      await expect(f.manager.execute({ action: 'remove', id: linked.id, expectedFingerprint: '0'.repeat(64) })).rejects.toMatchObject({ code: 'read-only' })
      const installed = await install(f)
      await symlink(join(outside, 'SKILL.md'), join(installed.path, 'external.md'))
      const skill = (await catalog(f)).skills.find(item => item.entry === 'demo')!
      await expect(f.manager.execute({ action: 'detail', id: skill.id })).rejects.toMatchObject({ code: 'read-only' })
      expect(await readFile(join(outside, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
    } finally { await f.cleanup() }
  })
  it('does not use inherited provenance for constructor or __proto__ directories', async () => {
    const f = await fixture()
    try {
      await writeBundle(join(f.skillRoot, '__proto__'))
      await writeBundle(join(f.skillRoot, 'constructor'), [{ path: 'SKILL.md', bytes: new TextEncoder().encode(skillText('one', 'constructor')), executable: false }])
      const skills = (await catalog(f)).skills
      expect(skills.every(skill => skill.source === undefined)).toBe(true)
      for (const skill of skills) {
        const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
        await f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint })
      }
      const root = (await catalog(f)).roots[0]!
      expect((await readState(root)).backups).toHaveLength(2)
    } finally { await f.cleanup() }
  })
  it('imports only canonical global Skills CLI provenance and leaves its lock unchanged', async () => {
    const f = await fixture()
    try {
      await writeBundle(join(f.skillRoot, 'demo'))
      await writeBundle(join(f.skillRoot, 'custom-copy'))
      const lock = JSON.stringify({ version: 3, skills: { demo: { source: 'test/skills', sourceType: 'github', skillPath: 'demo/SKILL.md', skillFolderHash: f.remote.variants[0]!.treeHash } } })
      const lockPath = join(f.config.agentsHome, '.skill-lock.json')
      await writeFile(lockPath, lock)
      const skills = (await catalog(f)).skills
      expect(skills.find(skill => skill.entry === 'demo')?.source?.imported).toBe(true)
      expect(skills.find(skill => skill.entry === 'custom-copy')?.source).toBeUndefined()
      const demo = skills.find(skill => skill.entry === 'demo')!
      const detail = await f.manager.execute({ action: 'detail', id: demo.id }) as SkillDetail
      expect(detail.locallyModified).toBe(false)
      f.remote.setLatest(2)
      await f.manager.execute({ action: 'update', id: demo.id, expectedFingerprint: detail.fingerprint })
      expect(await readFile(lockPath, 'utf8')).toBe(lock)
    } finally { await f.cleanup() }
  })
  it('locks concurrent writers and refuses corrupt or interrupted state without deleting skills', async () => {
    const f = await fixture()
    try {
      const installed = await install(f)
      const skill = (await catalog(f)).skills[0]!
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      const dir = join(f.skillRoot, '.skills-manager')
      await writeFile(join(dir, 'write.lock'), '{}')
      await expect(f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint })).rejects.toMatchObject({ code: 'busy' })
      expect(await pathExists(installed.path)).toBe(true)
      // Test-owned lock removed only after its exact path is established.
      const { unlink } = await import('node:fs/promises')
      await unlink(join(dir, 'write.lock'))
      await writeFile(join(dir, 'journal.json'), JSON.stringify({ action: 'remove', entry: 'demo', backupId: randomUUID() }))
      await expect(f.manager.execute({ action: 'install', rootId: 'user-dsh', source: 'test/skills', commit: f.remote.variants[0]!.commit, skillPath: 'demo/SKILL.md' })).resolves.toMatchObject({ action: 'install' })
      const interrupted = await catalog(f)
      expect(interrupted.skills.find(item => item.rootId === 'user-agents')?.writable).toBe(false)
      expect(await pathExists(installed.path)).toBe(true)
      await unlink(join(dir, 'journal.json'))
      await writeFile(join(dir, 'state.json'), '{broken')
      expect((await catalog(f)).warnings.some(message => message.includes('state'))).toBe(true)
      expect(await pathExists(installed.path)).toBe(true)
    } finally { await f.cleanup() }
  })
  it('enforces read-only configuration and untracked checks', async () => {
    const f = await fixture({ allowMutations: false })
    try {
      await writeBundle(join(f.skillRoot, 'demo'))
      expect((await catalog(f)).mutationsAllowed).toBe(false)
      await expect(f.manager.execute({ action: 'install', rootId: 'user-agents', source: 'test/skills', commit: f.remote.variants[0]!.commit, skillPath: 'demo/SKILL.md' })).rejects.toMatchObject({ code: 'read-only' })
    } finally { await f.cleanup() }
    const g = await fixture()
    try {
      await writeBundle(join(g.skillRoot, 'demo'))
      expect((await g.manager.execute({ action: 'check' }) as UpdateCheck[])[0]?.status).toBe('untracked')
      expect(g.remote.calls).toHaveLength(0)
    } finally { await g.cleanup() }
  })
})
