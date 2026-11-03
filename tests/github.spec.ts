import { describe, expect, it } from 'vitest'
import { GitHubSource } from '../src/github.js'
import type { Fetcher } from '../src/github.js'
import { resolveConfig } from '../src/config.js'
import { gitBlobHash, gitTreeHash } from '../src/fs-store.js'
import type { BundleFile } from '../src/fs-store.js'
import { fakeGitHub, skillText, tarGz } from './helpers.js'

const signal = () => new AbortController().signal
const config = () => resolveConfig({})
describe('bounded public skill sources', () => {
  it('searches and inspects with no executable installer or credentials', async () => {
    const remote = fakeGitHub()
    const source = new GitHubSource(config(), remote.fetcher)
    expect((await source.search('demo', 3, signal())).items[0]).toMatchObject({ repository: 'test/skills', installs: 123 })
    const repo = await source.inspect('test/skills', undefined, signal())
    expect(repo.skills[0]).toMatchObject({ name: 'demo', skillPath: 'demo/SKILL.md' })
    const files = await source.download(repo.repository, repo.ref, repo.commit, repo.skills[0]!.skillPath, signal())
    expect(gitTreeHash(files.files)).toBe(repo.skills[0]?.treeHash)
    expect(remote.calls.every(url => /https:\/\/(skills.sh|api.github.com|raw.githubusercontent.com)\//.test(url))).toBe(true)
  })
  it('refuses a bad raw blob before local writes', async () => {
    const remote = fakeGitHub()
    const fetcher: Fetcher = async (url, init) => url.includes('raw.githubusercontent.com') ? new Response('tampered') : remote.fetcher(url, init)
    const source = new GitHubSource(config(), fetcher)
    await expect(source.download('test/skills', undefined, remote.variants[0]!.commit, 'demo/SKILL.md', signal())).rejects.toMatchObject({ code: 'integrity' })
  })
  it('refuses a missing resource even when every received blob is individually valid', async () => {
    const remote = fakeGitHub()
    remote.variants[0]!.nodes.pop()
    const source = new GitHubSource(config(), remote.fetcher)
    await expect(source.download('test/skills', undefined, remote.variants[0]!.commit, 'demo/SKILL.md', signal())).rejects.toMatchObject({ code: 'integrity' })
  })
  it('refuses remote symlinks and truncated repository trees', async () => {
    const remote = fakeGitHub()
    remote.variants[0]!.nodes[2]!.mode = '120000'
    const source = new GitHubSource(config(), remote.fetcher)
    await expect(source.preview('test/skills', undefined, remote.variants[0]!.commit, 'demo/SKILL.md', signal())).rejects.toMatchObject({ code: 'unsafe-source' })
    const truncated: Fetcher = async (url, init) => url.includes('/git/trees/') ? Response.json({ sha: remote.variants[0]!.rootHash, tree: [], truncated: true }) : remote.fetcher(url, init)
    await expect(new GitHubSource(config(), truncated).tree('test/skills', undefined, signal())).rejects.toMatchObject({ code: 'repository-limit' })
  })
  it('rejects case/Unicode parent collisions and file-directory prefix conflicts', async () => {
    for (const paths of [['Scripts/a.txt', 'scripts/b.txt'], ['é/a.txt', 'e\u0301/b.txt'], ['resources', 'resources/a.txt']]) {
      const files: BundleFile[] = [{ path: 'SKILL.md', bytes: new TextEncoder().encode(skillText()), executable: false }, ...paths.map(path => ({ path, bytes: new TextEncoder().encode('fixture'), executable: false }))]
      const treeHash = gitTreeHash(files)
      const rootHash = gitTreeHash(files.map(file => ({ ...file, path: `demo/${file.path}` })))
      const commit = 'a'.repeat(40)
      const fetcher: Fetcher = async url => url.includes('/commits/') ? Response.json({ sha: commit, commit: { tree: { sha: rootHash } } }) : Response.json({ sha: rootHash, tree: [{ path: 'demo', mode: '040000', type: 'tree', sha: treeHash }, ...files.map(file => ({ path: `demo/${file.path}`, mode: '100644', type: 'blob', sha: gitBlobHash(file.bytes), size: file.bytes.length }))] })
      await expect(new GitHubSource(config(), fetcher).preview('test/skills', undefined, commit, 'demo/SKILL.md', signal())).rejects.toMatchObject({ code: 'unsafe-source' })
    }
  })
  it('downloads large skills from one commit tarball and verifies every blob', async () => {
    const encoder = new TextEncoder()
    const files: BundleFile[] = [{ path: 'SKILL.md', bytes: encoder.encode(skillText()), executable: false }, ...Array.from({ length: 80 }, (_, index) => ({ path: `references/file-${index}.txt`, bytes: encoder.encode(`resource ${index}`), executable: false }))]
    const treeHash = gitTreeHash(files)
    const rootHash = gitTreeHash(files.map(file => ({ ...file, path: `demo/${file.path}` })))
    const commit = 'b'.repeat(40)
    const tree = [{ path: 'demo', mode: '040000', type: 'tree', sha: treeHash }, ...files.map(file => ({ path: `demo/${file.path}`, mode: '100644', type: 'blob', sha: gitBlobHash(file.bytes), size: file.bytes.length }))]
    const archive = tarGz(files.map(file => ({ path: `test-large-${commit}/demo/${file.path}`, bytes: file.bytes })))
    const calls: string[] = []
    const makeFetcher = (archiveBytes: Buffer): Fetcher => async url => {
      calls.push(url)
      const parsed = new URL(url)
      if (parsed.hostname === 'api.github.com') {
        if (parsed.pathname.includes('/commits/')) return Response.json({ sha: commit, commit: { tree: { sha: rootHash } } })
        return Response.json({ sha: rootHash, tree, truncated: false })
      }
      if (parsed.hostname === 'codeload.github.com') return new Response(new Uint8Array(archiveBytes))
      throw new Error(`Unexpected request: ${url}`)
    }
    const downloaded = await new GitHubSource(resolveConfig({ maxBundleFiles: 200 }), makeFetcher(archive)).download('test/large', undefined, commit, 'demo/SKILL.md', signal())
    expect(downloaded.files).toHaveLength(81)
    expect(downloaded.skill.name).toBe('demo')
    expect(calls.some(url => url.includes('codeload.github.com'))).toBe(true)
    expect(calls.some(url => url.includes('raw.githubusercontent.com'))).toBe(false)
    const badArchive = tarGz(files.map(file => ({ path: `test-large-${commit}/demo/${file.path}`, bytes: file.path === 'references/file-3.txt' ? encoder.encode('tampered') : file.bytes })))
    await expect(new GitHubSource(resolveConfig({ maxBundleFiles: 200 }), makeFetcher(badArchive)).download('test/large', undefined, commit, 'demo/SKILL.md', signal())).rejects.toMatchObject({ code: 'integrity' })
  })
  it('stops oversized streams and reports HTTP failures honestly', async () => {
    const over: Fetcher = async () => new Response(new Uint8Array(2048))
    await expect(new GitHubSource(resolveConfig({ maxFileBytes: 1024, maxBundleBytes: 1024 }), over).search('demo', 1, signal())).rejects.toMatchObject({ code: 'limit' })
    const limited: Fetcher = async () => new Response('limit', { status: 429 })
    await expect(new GitHubSource(config(), limited).search('demo', 1, signal())).rejects.toMatchObject({ code: 'rate-limit' })
  })
})
