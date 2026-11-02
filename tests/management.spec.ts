import { describe, expect, it } from 'vitest'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Backup, BatchUpdateResult, Catalog, MutationResult, RepositoryInfo, SkillDiff, WellKnownInspect } from '../src/types.js'
import { pathExists } from '../src/fs-store.js'
import { fixture, skillText, tarGz, versionFiles, zipArchive } from './helpers.js'

async function install(f: Awaited<ReturnType<typeof fixture>>, rootId = 'user-agents'): Promise<MutationResult> {
  const repo = await f.manager.execute({ action: 'inspect', source: 'test/skills' }) as RepositoryInfo
  return await f.manager.execute({ action: 'install', rootId, source: repo.repository, commit: repo.commit, skillPath: 'demo/SKILL.md' }) as MutationResult
}
const list = async (f: Awaited<ReturnType<typeof fixture>>) => await f.manager.execute({ action: 'list' }) as Catalog
const backups = async (f: Awaited<ReturnType<typeof fixture>>) => await f.manager.execute({ action: 'backups' }) as Backup[]

describe('batch updates and backup management', () => {
  it('updates several checked skills with backups, skips latest and honours local-modification policy', async () => {
    const f = await fixture()
    try {
      const first = await install(f, 'user-agents')
      const second = await install(f, 'user-dsh')
      const skills = (await list(f)).skills.filter(skill => skill.name === 'demo')
      expect(skills).toHaveLength(2)
      f.remote.setLatest(2)
      const batch = await f.manager.execute({ action: 'update-batch', ids: [...skills.map(skill => skill.id), 'missing::id'] }) as BatchUpdateResult
      expect(batch).toMatchObject({ updated: 2, skipped: 0, failed: 1 })
      expect(await readFile(join(first.path, 'SKILL.md'), 'utf8')).toBe(skillText('two'))
      expect(await readFile(join(second.path, 'SKILL.md'), 'utf8')).toBe(skillText('two'))
      const retained = await backups(f)
      expect(retained).toHaveLength(2)
      expect(retained.every(backup => typeof backup.sizeBytes === 'number' && backup.sizeBytes > 0 && backup.fileCount === 3)).toBe(true)
      const again = await f.manager.execute({ action: 'update-batch', ids: skills.map(skill => skill.id) }) as BatchUpdateResult
      expect(again).toMatchObject({ updated: 0, skipped: 2, failed: 0 })
      await writeFile(join(first.path, 'SKILL.md'), skillText('local edit'))
      const skipped = await f.manager.execute({ action: 'update-batch', ids: [skills[0]!.id] }) as BatchUpdateResult
      expect(skipped.items[0]).toMatchObject({ status: 'skipped' })
      const overwritten = await f.manager.execute({ action: 'update-batch', ids: [skills[0]!.id], overwriteModified: true }) as BatchUpdateResult
      expect(overwritten.items[0]).toMatchObject({ status: 'updated' })
      expect(await readFile(join(first.path, 'SKILL.md'), 'utf8')).toBe(skillText('two'))
    } finally { await f.cleanup() }
  })
  it('keeps other updates visible after updating one skill', async () => {
    const f = await fixture()
    try {
      await install(f, 'user-agents')
      await install(f, 'user-dsh')
      f.remote.setLatest(2)
      const checked = await f.manager.execute({ action: 'check' }) as { id: string; status: string }[]
      expect(checked.filter(check => check.status === 'update')).toHaveLength(2)
      const first = (await list(f)).skills.find(skill => skill.rootId === 'user-agents')!
      const detail = await f.manager.execute({ action: 'detail', id: first.id }) as { fingerprint: string }
      await f.manager.execute({ action: 'update', id: first.id, expectedFingerprint: detail.fingerprint })
      const after = (await list(f)).skills
      expect(after.find(skill => skill.id === first.id)?.check?.status).toBe('latest')
      expect(after.find(skill => skill.rootId === 'user-dsh')?.check?.status).toBe('update')
      expect(after.filter(skill => skill.check?.status === 'update')).toHaveLength(1)
    } finally { await f.cleanup() }
  })
  it('purges single and older backups without touching other state', async () => {
    const f = await fixture()
    try {
      const installed = await install(f)
      const skill = (await list(f)).skills[0]!
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as { fingerprint: string }
      f.remote.setLatest(2)
      await f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: detail.fingerprint })
      const afterUpdate = await f.manager.execute({ action: 'detail', id: skill.id }) as { fingerprint: string }
      await f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: afterUpdate.fingerprint })
      const all = await backups(f)
      expect(all).toHaveLength(2)
      const target = all[0]!
      const single = await f.manager.execute({ action: 'purge-backup', rootId: target.rootId, backupId: target.id }) as { removed: number; freedBytes: number }
      expect(single.removed).toBe(1)
      expect(single.freedBytes).toBe(target.sizeBytes)
      expect(await pathExists(join(f.skillRoot, '.skills-manager/backups', target.id))).toBe(false)
      expect(await backups(f)).toHaveLength(1)
      const rest = await f.manager.execute({ action: 'purge-backups', rootId: 'user-agents', keep: 0 }) as { removed: number }
      expect(rest.removed).toBe(1)
      expect(await backups(f)).toEqual([])
      expect(await pathExists(installed.path)).toBe(false)
    } finally { await f.cleanup() }
  })
  it('removes permanently without retaining a backup', async () => {
    const f = await fixture()
    try {
      const installed = await install(f)
      const skill = (await list(f)).skills[0]!
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as { fingerprint: string }
      const result = await f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint, permanent: true }) as MutationResult
      expect(result.backupId).toBeUndefined()
      expect(await pathExists(installed.path)).toBe(false)
      expect(await backups(f)).toEqual([])
      expect((await list(f)).skills).toEqual([])
    } finally { await f.cleanup() }
  })
})

describe('move, local install and restore-to', () => {
  it('moves across roots with a backup and renames within one root', async () => {
    const f = await fixture()
    try {
      const installed = await install(f, 'user-agents')
      const skill = (await list(f)).skills[0]!
      const moved = await f.manager.execute({ action: 'move', id: skill.id, rootId: 'user-dsh', entry: 'demo-moved' }) as MutationResult
      expect(moved.action).toBe('move')
      expect(await pathExists(installed.path)).toBe(false)
      expect(await readFile(join(moved.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      expect((await backups(f)).some(backup => backup.action === 'remove')).toBe(true)
      const relocated = (await list(f)).skills.find(item => item.name === 'demo')!
      expect(relocated.rootId).toBe('user-dsh')
      expect(relocated.source?.kind).toBe('github')
      const renamed = await f.manager.execute({ action: 'move', id: relocated.id, rootId: 'user-dsh', entry: 'demo-renamed' }) as MutationResult
      expect(renamed.path.endsWith('demo-renamed')).toBe(true)
      const state = JSON.parse(await readFile(join(f.config.dshHome, 'skills', '.skills-manager/state.json'), 'utf8')) as { records: Record<string, unknown> }
      expect(Object.keys(state.records)).toContain('demo-renamed')
      await mkdir(join(f.config.dshHome, 'skills', 'occupied'), { recursive: true })
      await writeFile(join(f.config.dshHome, 'skills', 'occupied', 'SKILL.md'), skillText('one', 'occupied'))
      const current = (await list(f)).skills.find(item => item.name === 'demo')!
      await expect(f.manager.execute({ action: 'move', id: current.id, rootId: 'user-dsh', entry: 'occupied' })).rejects.toMatchObject({ code: 'already-exists' })
    } finally { await f.cleanup() }
  })
  it('installs trusted local tar.gz and zip archives without overwriting', async () => {
    const f = await fixture()
    try {
      const files = versionFiles('one')
      const tarPath = join(f.root, 'local-skill.tar.gz')
      await writeFile(tarPath, tarGz(files.map(file => ({ path: file.path, bytes: file.bytes, executable: file.executable }))))
      const tar = await f.manager.execute({ action: 'install-local', rootId: 'user-agents', path: tarPath }) as MutationResult
      expect(tar).toMatchObject({ action: 'install-local', name: 'demo' })
      expect(await readFile(join(tar.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      const zipPath = join(f.root, 'local-skill.zip')
      await writeFile(zipPath, zipArchive(files.map(file => ({ path: file.path, bytes: file.bytes })), true))
      const zip = await f.manager.execute({ action: 'install-local', rootId: 'user-dsh', path: zipPath }) as MutationResult
      expect(zip.name).toBe('demo')
      expect((await list(f)).skills.filter(skill => skill.name === 'demo')).toHaveLength(2)
      await expect(f.manager.execute({ action: 'install-local', rootId: 'user-agents', path: tarPath })).rejects.toMatchObject({ code: 'already-exists' })
      await writeFile(join(f.root, 'broken.zip'), 'not a zip')
      await expect(f.manager.execute({ action: 'install-local', rootId: 'user-agents', path: join(f.root, 'broken.zip') })).rejects.toMatchObject({ code: 'invalid-source' })
    } finally { await f.cleanup() }
  })
  it('restores a backup into another writable root and removes the source backup', async () => {
    const f = await fixture()
    try {
      const installed = await install(f, 'user-agents')
      const skill = (await list(f)).skills[0]!
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as { fingerprint: string }
      await f.manager.execute({ action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint })
      const backup = (await backups(f))[0]!
      const restored = await f.manager.execute({ action: 'restore-to', fromRootId: 'user-agents', backupId: backup.id, toRootId: 'user-dsh', entry: 'demo-restored' }) as MutationResult
      expect(restored.action).toBe('restore-to')
      expect(restored.warning).toBeUndefined()
      expect(await readFile(join(restored.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      expect(await pathExists(installed.path)).toBe(false)
      expect(await backups(f)).toEqual([])
    } finally { await f.cleanup() }
  })
})

describe('well-known market install and update diff', () => {
  it('inspects and installs a digest-pinned well-known archive', async () => {
    const f = await fixture()
    try {
      const inspected = await f.manager.execute({ action: 'well-known-inspect', source: 'https://skills.example.test/base' }) as WellKnownInspect
      expect(inspected.label).toBe('skills.example.test/base')
      expect(inspected.skills).toHaveLength(1)
      expect(inspected.skills[0]).toMatchObject({ name: 'demo', type: 'archive', digest: f.wellKnownRemote.variants[0]!.digest })
      const installed = await f.manager.execute({ action: 'well-known-install', rootId: 'user-agents', source: inspected.baseUrl, name: 'demo' }) as MutationResult
      expect(installed.action).toBe('well-known-install')
      expect(await readFile(join(installed.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      const skill = (await list(f)).skills[0]!
      expect(skill.source).toMatchObject({ kind: 'well-known', repository: 'skills.example.test/base', digest: f.wellKnownRemote.variants[0]!.digest })
      const check = await f.manager.execute({ action: 'check' }) as { status: string }[]
      expect(check[0]?.status).toBe('latest')
      await expect(f.manager.execute({ action: 'well-known-install', rootId: 'user-agents', source: inspected.baseUrl, name: 'demo' })).rejects.toMatchObject({ code: 'already-exists' })
    } finally { await f.cleanup() }
  })
  it('reports file-level changes before an update', async () => {
    const f = await fixture()
    try {
      const installed = await install(f)
      const skill = (await list(f)).skills[0]!
      f.remote.setLatest(2)
      const diff = await f.manager.execute({ action: 'diff', id: skill.id }) as SkillDiff
      expect(diff.changed).toBeGreaterThanOrEqual(2)
      expect(diff.added).toBe(0)
      expect(diff.removed).toBe(0)
      expect(diff.files.find(file => file.path === 'scripts/run.sh')?.status).toBe('unchanged')
      expect(diff.files.find(file => file.path === 'SKILL.md')?.status).toBe('changed')
      expect(await readFile(join(installed.path, 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      await mkdir(join(f.config.dshHome, 'skills', 'manual'), { recursive: true })
      await writeFile(join(f.config.dshHome, 'skills', 'manual', 'SKILL.md'), skillText('one', 'manual'))
      const manual = (await list(f)).skills.find(item => item.name === 'manual')!
      await expect(f.manager.execute({ action: 'diff', id: manual.id })).rejects.toMatchObject({ code: 'untracked' })
    } finally { await f.cleanup() }
  })
})
