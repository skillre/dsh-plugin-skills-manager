import { createHash } from 'node:crypto'
import { chmod, mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { deflateRawSync, gzipSync } from 'node:zlib'
import { resolveConfig } from '../src/config.js'
import { SkillsManager } from '../src/manager.js'
import { GitHubSource } from '../src/github.js'
import { WellKnownSource } from '../src/well-known.js'
import type { Fetcher } from '../src/github.js'
import { gitBlobHash, gitTreeHash } from '../src/fs-store.js'
import type { BundleFile } from '../src/fs-store.js'
import type { ManagerConfig } from '../src/config.js'
import type { Provenance, SkillOrigin } from '../src/types.js'

const encode = (text: string) => new TextEncoder().encode(text)
export const skillText = (version = 'one', name = 'demo') => `---\nname: ${name}\ndescription: A safe test skill\n---\n\n${version}\n`
export function versionFiles(version: string): BundleFile[] {
  return [{ path: 'SKILL.md', bytes: encode(skillText(version)), executable: false }, { path: 'references/example.txt', bytes: encode(`resource ${version}`), executable: false }, { path: 'scripts/run.sh', bytes: encode('#!/bin/sh\necho THIS_MUST_NOT_RUN\n'), executable: true }]
}
export function fakeGitHub(initial = 1) {
  let latest = initial
  let apiFailure: number | undefined
  let rateLimitReset: number | undefined
  const archives = new Map<string, Buffer>()
  const archiveFor = (variant: { files: BundleFile[]; commit: string }): Buffer => {
    let archive = archives.get(variant.commit)
    if (!archive) {
      archive = tarGz(variant.files.map(file => ({ path: `skills-${variant.commit}/demo/${file.path}`, bytes: file.bytes, executable: file.executable })))
      archives.set(variant.commit, archive)
    }
    return archive
  }
  const variants = [1, 2].map(number => {
    const files = versionFiles(number === 1 ? 'one' : 'two')
    const commit = createHash('sha1').update(`fixture-commit-${number}`).digest('hex')
    const treeHash = gitTreeHash(files)
    const rootHash = gitTreeHash(files.map(file => ({ ...file, path: `demo/${file.path}` })))
    const nodes = [{ path: 'demo', mode: '040000', type: 'tree', sha: treeHash }, ...files.map(file => ({ path: `demo/${file.path}`, mode: file.executable ? '100755' : '100644', type: 'blob', sha: gitBlobHash(file.bytes), size: file.bytes.length }))]
    return { files, commit, treeHash, rootHash, nodes }
  })
  const calls: string[] = []
  const fetcher: Fetcher = async (input, init) => {
    if (init.signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    calls.push(input)
    const url = new URL(input)
    if (url.hostname === 'skills.sh') return Response.json({ skills: [{ id: 'test/skills/demo', name: 'demo', source: 'test/skills', installs: 123 }] })
    if (url.hostname === 'api.github.com') {
      if (apiFailure !== undefined) {
        const headers: Record<string, string> = { 'x-ratelimit-remaining': '0' }
        if (rateLimitReset !== undefined) headers['x-ratelimit-reset'] = String(rateLimitReset)
        return new Response('api unavailable', { status: apiFailure, headers })
      }
      const value = url.pathname.split('/').pop()!
      if (url.pathname.includes('/commits/')) {
        const version = value === 'HEAD' || value === 'main' ? variants[latest - 1]! : variants.find(item => item.commit === value)
        return version ? Response.json({ sha: version.commit, commit: { tree: { sha: version.rootHash } } }) : new Response('missing', { status: 404 })
      }
      const version = variants.find(item => item.rootHash === value)
      return version ? Response.json({ sha: version.rootHash, tree: version.nodes, truncated: false }) : new Response('missing', { status: 404 })
    }
    if (url.hostname === 'github.com') {
      const segments = url.pathname.split('/')
      if (segments[1] !== 'test' || segments[2] !== 'skills' || segments[3] !== 'info' || segments[4] !== 'refs' || url.searchParams.get('service') !== 'git-upload-pack') throw new Error(`Unexpected test network request: ${input}`)
      const version = variants[latest - 1]!
      return new Response(new Uint8Array(refAdvertisement({ 'refs/heads/main': version.commit })), { headers: { 'content-type': 'application/x-git-upload-pack-advertisement' } })
    }
    if (url.hostname === 'codeload.github.com') {
      const match = /^\/test\/skills\/tar\.gz\/([0-9a-f]{40})$/.exec(url.pathname)
      const version = match ? variants.find(item => item.commit === match[1]) : undefined
      return version ? new Response(new Uint8Array(archiveFor(version)), { headers: { 'content-type': 'application/gzip' } }) : new Response('missing', { status: 404 })
    }
    if (url.hostname === 'raw.githubusercontent.com') {
      const [, , , commit, ...path] = url.pathname.split('/')
      const version = variants.find(item => item.commit === commit)
      const file = version?.files.find(item => `demo/${item.path}` === path.map(decodeURIComponent).join('/'))
      return file ? new Response(file.bytes.slice().buffer) : new Response('missing', { status: 404 })
    }
    throw new Error(`Unexpected test network request: ${input}`)
  }
  return {
    fetcher, variants, calls,
    setLatest(number: number) { latest = number },
    setApiFailure(status: number | undefined) { apiFailure = status },
    setRateLimit(status: number, resetEpochSeconds?: number) { apiFailure = status; rateLimitReset = resetEpochSeconds },
  }
}
export type TarEntry = { path: string; bytes?: Uint8Array; executable?: boolean; type?: 'file' | 'dir' | 'symlink'; linkname?: string; prefix?: string }
function tarHeader(entry: TarEntry): Buffer {
  const header = Buffer.alloc(512)
  const name = Buffer.from(entry.path, 'utf8')
  name.copy(header, 0, 0, Math.min(100, name.length))
  const mode = entry.type === 'dir' ? 0o755 : entry.type === 'symlink' ? 0o777 : entry.executable ? 0o755 : 0o644
  header.write(`${mode.toString(8).padStart(7, '0')}\0`, 100, 'utf8')
  header.write('0000000\0', 108, 'utf8')
  header.write('0000000\0', 116, 'utf8')
  const size = entry.type === 'file' || !entry.type ? entry.bytes?.length ?? 0 : 0
  header.write(`${size.toString(8).padStart(11, '0')}\0`, 124, 'utf8')
  header.write('0000000\0', 136, 'utf8')
  header.fill(32, 148, 156)
  header.write(entry.type === 'dir' ? '5' : entry.type === 'symlink' ? '2' : '0', 156, 'utf8')
  if (entry.linkname) Buffer.from(entry.linkname, 'utf8').copy(header, 157, 0, Math.min(100, entry.linkname.length))
  header.write('ustar\0', 257, 'utf8')
  header.write('00', 263, 'utf8')
  header.write('0000000\0', 329, 'utf8')
  header.write('0000000\0', 337, 'utf8')
  if (entry.prefix) Buffer.from(entry.prefix, 'utf8').copy(header, 345, 0, Math.min(155, entry.prefix.length))
  let total = 0
  for (const byte of header) total += byte
  header.write(`${total.toString(8).padStart(6, '0')}\0 `, 148, 'utf8')
  return header
}
export function tarGz(entries: TarEntry[]): Buffer {
  const blocks: Buffer[] = []
  for (const entry of entries) {
    blocks.push(tarHeader(entry))
    const data = entry.type === 'file' || !entry.type ? entry.bytes ?? new Uint8Array() : new Uint8Array()
    if (data.length > 0) {
      blocks.push(Buffer.from(data))
      blocks.push(Buffer.alloc((512 - (data.length % 512)) % 512))
    }
  }
  blocks.push(Buffer.alloc(1024))
  return gzipSync(Buffer.concat(blocks))
}
const ZIP_CRC = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < 256; index++) {
    let value = index
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1
    table[index] = value >>> 0
  }
  return table
})()
function crc32(bytes: Uint8Array): number {
  let value = 0xFFFFFFFF
  for (const byte of bytes) value = ZIP_CRC[(value ^ byte) & 0xFF]! ^ (value >>> 8)
  return (value ^ 0xFFFFFFFF) >>> 0
}
export function zipArchive(entries: { path: string; bytes: Uint8Array }[], deflate = false): Buffer {
  const parts: Buffer[] = []
  const central: Buffer[] = []
  let offset = 0
  for (const entry of entries) {
    const name = Buffer.from(entry.path, 'utf8')
    const raw = Buffer.from(entry.bytes)
    const data = deflate ? deflateRawSync(raw) : raw
    const method = deflate ? 8 : 0
    const crc = crc32(raw)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6); local.writeUInt16LE(method, 8)
    local.writeUInt16LE(0, 10); local.writeUInt16LE(0, 12)
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(raw.length, 22)
    local.writeUInt16LE(name.length, 26); local.writeUInt16LE(0, 28)
    parts.push(local, name, data)
    const directory = Buffer.alloc(46)
    directory.writeUInt32LE(0x02014b50, 0)
    directory.writeUInt16LE(0x031E, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0, 8)
    directory.writeUInt16LE(method, 10); directory.writeUInt16LE(0, 12); directory.writeUInt16LE(0, 14)
    directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(data.length, 20); directory.writeUInt32LE(raw.length, 24)
    directory.writeUInt16LE(name.length, 28); directory.writeUInt16LE(0, 30); directory.writeUInt16LE(0, 32)
    directory.writeUInt16LE(0, 34); directory.writeUInt16LE(0, 36); directory.writeUInt32LE(0o100644 << 16 >>> 0, 38)
    directory.writeUInt32LE(offset, 42)
    central.push(directory, name)
    offset += 30 + name.length + data.length
  }
  const centralSize = central.reduce((sum, buffer) => sum + buffer.length, 0)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralSize, 12); eocd.writeUInt32LE(offset, 16)
  return Buffer.concat([...parts, ...central, eocd])
}
export function fakeWellKnown(initial = 1) {
  let latest = initial
  let fail = false
  let missing = false
  const calls: string[] = []
  const name = 'demo'
  const makeVariant = (number: number, skillName = name) => {
    const base = versionFiles(number === 1 ? 'one' : 'two')
    const files: BundleFile[] = [{ ...base[0]!, bytes: new TextEncoder().encode(skillText(number === 1 ? 'one' : 'two', skillName)) }, ...base.slice(1)]
    const tar = tarGz(files.map(file => ({ path: file.path, bytes: file.bytes, executable: file.executable })))
    return { files, tar, digest: `sha256:${createHash('sha256').update(tar).digest('hex')}` }
  }
  const variants = [makeVariant(1), makeVariant(2)]
  const fetcher: Fetcher = async (input, init) => {
    if (init.signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
    calls.push(input)
    const url = new URL(input)
    if (url.origin !== 'https://skills.example.test') throw new Error(`Unexpected well-known request: ${input}`)
    if (url.pathname === '/base/.well-known/agent-skills/index.json') {
      if (fail) return new Response('unavailable', { status: 503 })
      const variant = variants[latest - 1]!
      return Response.json({ $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json', skills: missing ? [] : [{ name, description: 'A well-known fixture skill', type: 'archive', url: `./${name}.tar.gz`, digest: variant.digest }] })
    }
    if (url.pathname === `/base/.well-known/agent-skills/${name}.tar.gz`) {
      const variant = variants[latest - 1]!
      return new Response(new Uint8Array(variant.tar), { headers: { 'content-type': 'application/gzip', 'content-length': String(variant.tar.length) } })
    }
    throw new Error(`Unexpected well-known request: ${input}`)
  }
  return {
    fetcher, calls, variants, name,
    get latest() { return latest },
    setLatest(number: number) { latest = number },
    setFail(value: boolean) { fail = value },
    setMissing(value: boolean) { missing = value },
    setLatestName(skillName: string) { variants[1] = makeVariant(2, skillName) },
  }
}
export async function fixture(overrides: Partial<ManagerConfig> = {}) {
  const base = await realpath(tmpdir())
  const root = await mkdtemp(join(base, 'dsh-skills-manager-test-'))
  const config = resolveConfig({ dshHome: join(root, 'dsh'), agentsHome: join(root, 'agents'), enableAgentTool: false, ...overrides })
  const remote = fakeGitHub()
  const wellKnownRemote = fakeWellKnown()
  const source = new GitHubSource(config, remote.fetcher)
  const wellKnown = new WellKnownSource(config, wellKnownRemote.fetcher)
  const manager = new SkillsManager(config, {}, source, wellKnown)
  return {
    root, config, remote, wellKnownRemote, source, wellKnown, manager,
    skillRoot: join(config.agentsHome, 'skills'),
    async writeLock(skills: Record<string, Record<string, unknown>>) {
      await mkdir(config.agentsHome, { recursive: true })
      await writeFile(join(config.agentsHome, '.skill-lock.json'), JSON.stringify({ version: 3, skills }))
    },
    async cleanup() {
      await manager.dispose()
      const target = resolve(root)
      if (!target.startsWith(join(base, 'dsh-skills-manager-test-')) || await realpath(root) !== target) throw new Error('Unexpected owned test cleanup target')
      await rm(target, { recursive: true, force: true })
    },
  }
}
export async function writeBundle(path: string, files = versionFiles('one')): Promise<void> {
  await mkdir(path, { recursive: true })
  for (const file of files) {
    const target = join(path, ...file.path.split('/'))
    await mkdir(join(target, '..'), { recursive: true })
    await writeFile(target, file.bytes)
    await chmod(target, file.executable ? 0o755 : 0o644)
  }
}

/** Encode one git smart-HTTP pkt-line including its four-byte hexadecimal length prefix. */
export function pktLine(value: string): Buffer {
  const payload = Buffer.from(value, 'utf8')
  return Buffer.concat([Buffer.from((payload.length + 4).toString(16).padStart(4, '0'), 'ascii'), payload])
}

/** Build a git-upload-pack ref advertisement with a HEAD symref capability on the first ref. */
export function refAdvertisement(refs: Record<string, string>, symref = 'refs/heads/main'): Buffer {
  const lines = Object.entries(refs).map(([name, commit], index) => pktLine(`${commit} ${name}${index === 0 ? `\0multi_ack thin-pack symref=HEAD:${symref}` : ''}\n`))
  return Buffer.concat([pktLine('# service=git-upload-pack\n'), Buffer.from('0000'), ...lines, Buffer.from('0000')])
}
