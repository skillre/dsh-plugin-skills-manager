import { describe, expect, it } from 'vitest'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Backup, Catalog, MutationResult, SkillDetail, UpdateCheck } from '../src/types.js'
import { extractSkillBundle } from '../src/archive.js'
import { parseWellKnownBase } from '../src/well-known.js'
import { pathExists } from '../src/fs-store.js'
import { fixture, skillText, tarGz, versionFiles } from './helpers.js'

const limits = { maxBytes: 4 * 1024 * 1024, maxFiles: 100, maxFileBytes: 1024 * 1024 }
const encoder = new TextEncoder()

describe('strict well-known archive extraction', () => {
  it('extracts bundles and normalizes a single wrapper directory', () => {
    const files = versionFiles('one')
    const bundle = extractSkillBundle(tarGz([
      { path: 'demo', type: 'dir' },
      ...files.map(file => ({ path: `demo/${file.path}`, bytes: file.bytes, executable: file.executable })),
    ]), limits)
    expect(bundle.map(file => file.path).sort()).toEqual(files.map(file => file.path).sort())
    expect(bundle.find(file => file.path === 'scripts/run.sh')?.executable).toBe(true)
    expect(Buffer.from(bundle.find(file => file.path === 'references/example.txt')!.bytes).toString('utf8')).toBe('resource one')
    const direct = extractSkillBundle(tarGz(files.map(file => ({ path: file.path, bytes: file.bytes }))), limits)
    expect(direct.map(file => file.path).sort()).toEqual(files.map(file => file.path).sort())
  })
  it('rejects traversal, links, collisions and size limits', () => {
    expect(() => extractSkillBundle(tarGz([{ path: '../evil', bytes: encoder.encode('x') }]), limits)).toThrow(/Unsafe/)
    expect(() => extractSkillBundle(tarGz([{ path: '/etc/passwd', bytes: encoder.encode('x') }]), limits)).toThrow(/Unsafe/)
    expect(() => extractSkillBundle(tarGz([{ path: 'SKILL.md', bytes: encoder.encode(skillText()) }, { path: 'link', type: 'symlink', linkname: '/etc/passwd' }]), limits)).toThrow(/links, devices/)
    expect(() => extractSkillBundle(tarGz([{ path: 'SKILL.md', bytes: encoder.encode(skillText()) }, { path: 'skill.md', bytes: encoder.encode('x') }]), limits)).toThrow(/duplicate or normalization-colliding/)
    expect(() => extractSkillBundle(tarGz([{ path: 'SKILL.md', bytes: new Uint8Array(2048) }]), { ...limits, maxFileBytes: 1024 })).toThrow(/file-size limit/)
    expect(() => extractSkillBundle(tarGz([{ path: 'SKILL.md', bytes: encoder.encode(skillText()) }]), { ...limits, maxFiles: 0 })).toThrow(/more files than the configured/)
    expect(() => extractSkillBundle(tarGz([{ path: 'README.md', bytes: encoder.encode('x') }]), limits)).toThrow(/SKILL.md/)
    expect(() => extractSkillBundle(encoder.encode('not an archive'), limits)).toThrow(/not a valid gzip-compressed tar/)
  })
  it('accepts only public credential-free HTTPS catalog bases', () => {
    expect(parseWellKnownBase('https://open.feishu.cn/lark-cli/skills/regular')).toEqual({
      baseUrl: 'https://open.feishu.cn/lark-cli/skills/regular',
      label: 'open.feishu.cn/lark-cli/skills/regular',
      indexUrl: 'https://open.feishu.cn/lark-cli/skills/regular/.well-known/agent-skills/index.json',
    })
    for (const bad of ['http://open.feishu.cn/skills', 'https://127.0.0.1/skills', 'https://localhost/skills', 'https://user:pw@open.feishu.cn/skills', 'https://open.feishu.cn:8443/skills', 'https://open.feishu.cn/skills/.well-known/agent-skills', 'ftp://open.feishu.cn/skills']) {
      expect(() => parseWellKnownBase(bad)).toThrow()
    }
  })
})

describe('Skills CLI well-known provenance', () => {
  async function importedWellKnown(f: Awaited<ReturnType<typeof fixture>>): Promise<void> {
    await mkdir(join(f.skillRoot, 'demo', 'references'), { recursive: true })
    await writeFile(join(f.skillRoot, 'demo', 'SKILL.md'), skillText('one'))
    await writeFile(join(f.skillRoot, 'demo', 'references/example.txt'), 'resource one')
    await f.writeLock({
      demo: {
        source: 'skills.example.test', sourceType: 'well-known',
        sourceUrl: 'https://skills.example.test/base/.well-known/agent-skills/demo.tar.gz',
        skillFolderHash: '', sourceBaseUrl: 'https://skills.example.test/base',
        wellKnownDigest: f.wellKnownRemote.variants[0]!.digest, installedAt: '2026-10-01T00:00:00.000Z',
      },
    })
  }
  const latest = async (f: Awaited<ReturnType<typeof fixture>>) => (await f.manager.execute({ action: 'list' }) as Catalog).skills.find(skill => skill.name === 'demo')!

  it('checks the catalog digest, updates with a backup and records a verifiable fingerprint', async () => {
    const f = await fixture()
    try {
      await importedWellKnown(f)
      const skill = await latest(f)
      expect(skill.source).toMatchObject({ kind: 'well-known', imported: true, repository: 'skills.example.test/base', digest: f.wellKnownRemote.variants[0]!.digest })
      expect(skill.origin).toBeUndefined()
      const first = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(first[0]?.status).toBe('latest')
      f.wellKnownRemote.setLatest(2)
      const second = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(second[0]).toMatchObject({ status: 'update', latestDigest: f.wellKnownRemote.variants[1]!.digest })
      expect(f.wellKnownRemote.calls.filter(url => url.endsWith('/index.json'))).toHaveLength(2)
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      expect(detail.locallyModified).toBeNull()
      const result = await f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: detail.fingerprint }) as MutationResult
      expect(result.digest).toBe(f.wellKnownRemote.variants[1]!.digest)
      expect(result.backupId).toBeTruthy()
      expect(await readFile(join(f.skillRoot, 'demo', 'SKILL.md'), 'utf8')).toBe(skillText('two'))
      expect(await readFile(join(f.skillRoot, 'demo', 'references/example.txt'), 'utf8')).toBe('resource two')
      const record = JSON.parse(await readFile(join(f.skillRoot, '.skills-manager/state.json'), 'utf8')).records.demo!
      expect(record).toMatchObject({ kind: 'well-known', repository: 'skills.example.test/base', skillName: 'demo', digest: f.wellKnownRemote.variants[1]!.digest })
      expect(record.fingerprint).toMatch(/^[0-9a-f]{64}$/)
      expect(record.imported).toBeUndefined()
      const after = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      expect(after.locallyModified).toBe(false)
      await writeFile(join(f.skillRoot, 'demo', 'SKILL.md'), skillText('edited'))
      expect(((await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail).locallyModified)).toBe(true)
      const backups = await f.manager.execute({ action: 'backups' }) as Backup[]
      expect(backups[0]?.source?.kind).toBe('well-known')
      expect(await readFile(join(f.skillRoot, '.skills-manager/backups', backups[0]!.id, 'content/SKILL.md'), 'utf8')).toBe(skillText('one'))
      const third = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(third[0]?.status).toBe('latest')
    } finally { await f.cleanup() }
  })
  it('fails closed on digest mismatch without touching local files', async () => {
    const f = await fixture()
    try {
      await importedWellKnown(f)
      const skill = await latest(f)
      const before = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      f.wellKnownRemote.setLatest(2)
      f.wellKnownRemote.variants[1]!.digest = `sha256:${'f'.repeat(64)}`
      await expect(f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: before.fingerprint })).rejects.toMatchObject({ code: 'integrity' })
      expect(await readFile(join(f.skillRoot, 'demo', 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      expect(await f.manager.execute({ action: 'backups' })).toEqual([])
      expect(await pathExists(join(f.skillRoot, '.skills-manager/state.json'))).toBe(false)
    } finally { await f.cleanup() }
  })
  it('reports catalog failures, missing entries, renames and no-update states', async () => {
    const f = await fixture()
    try {
      await importedWellKnown(f)
      const skill = await latest(f)
      f.wellKnownRemote.setFail(true)
      const failed = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(failed[0]).toMatchObject({ status: 'error' })
      expect(failed[0]?.message).toMatch(/HTTP 503/)
      f.wellKnownRemote.setFail(false)
      f.wellKnownRemote.setMissing(true)
      const missing = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(missing[0]).toMatchObject({ status: 'error' })
      expect(missing[0]?.message).toMatch(/no longer lists/)
      f.wellKnownRemote.setMissing(false)
      const detail = await f.manager.execute({ action: 'detail', id: skill.id }) as SkillDetail
      await expect(f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: detail.fingerprint })).rejects.toMatchObject({ code: 'no-update' })
      f.wellKnownRemote.setLatestName('renamed')
      f.wellKnownRemote.setLatest(2)
      await expect(f.manager.execute({ action: 'update', id: skill.id, expectedFingerprint: detail.fingerprint })).rejects.toMatchObject({ code: 'source-changed' })
      expect(await readFile(join(f.skillRoot, 'demo', 'SKILL.md'), 'utf8')).toBe(skillText('one'))
      expect(await pathExists(join(f.skillRoot, '.skills-manager/backups'))).toBe(false)
    } finally { await f.cleanup() }
  })
  it('shows external origin labels for unsupported lock entries and keeps them untracked', async () => {
    const f = await fixture()
    try {
      for (const [entry, name] of [['external', 'external'], ['unsupported', 'unsupported']] as const) {
        await mkdir(join(f.skillRoot, entry), { recursive: true })
        await writeFile(join(f.skillRoot, entry, 'SKILL.md'), skillText('one', name))
      }
      await f.writeLock({
        external: { source: 'mintlify.com', sourceType: 'mintlify', sourceUrl: 'https://mintlify.com/skills/external' },
        unsupported: { source: 'open.feishu.cn', sourceType: 'well-known', sourceUrl: 'https://open.feishu.cn/skills/unsupported', sourceBaseUrl: 'https://open.feishu.cn/skills', wellKnownDigest: '' },
      })
      const catalog = await f.manager.execute({ action: 'list' }) as Catalog
      const external = catalog.skills.find(skill => skill.name === 'external')!
      const unsupported = catalog.skills.find(skill => skill.name === 'unsupported')!
      expect(external.source).toBeUndefined()
      expect(external.origin).toMatchObject({ sourceType: 'mintlify', label: 'mintlify.com' })
      expect(unsupported.origin).toMatchObject({ sourceType: 'well-known', label: 'open.feishu.cn' })
      const checks = await f.manager.execute({ action: 'check' }) as UpdateCheck[]
      expect(checks.map(check => check.status)).toEqual(['untracked', 'untracked'])
    } finally { await f.cleanup() }
  })
})
