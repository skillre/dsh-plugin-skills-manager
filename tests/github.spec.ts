import { describe, expect, it } from 'vitest'
import { GitHubSource } from '../src/github.js'
import type { Fetcher } from '../src/github.js'
import { resolveConfig } from '../src/config.js'
import { gitBlobHash, gitTreeHash } from '../src/fs-store.js'
import type { BundleFile } from '../src/fs-store.js'
import { fakeGitHub, refAdvertisement, skillText, tarGz } from './helpers.js'

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

const tokenConfig = () => resolveConfig({ githubTokenEnv: 'TEST_GH_TOKEN' })
function capture(target: Fetcher) {
  const seen: { url: string; headers: Record<string, string> }[] = []
  const fetcher: Fetcher = async (input, init) => {
    seen.push({ url: input, headers: { ...(init.headers as Record<string, string>) } })
    return target(input, init)
  }
  return { seen, fetcher }
}
describe('GitHub API resilience', () => {
  it('scopes an optional token to api.github.com and never leaks it into errors', async () => {
    process.env.TEST_GH_TOKEN = 'secret-token-value'
    try {
      const remote = fakeGitHub()
      const limited = capture(remote.fetcher)
      const source = new GitHubSource(tokenConfig(), limited.fetcher)
      await source.search('demo', 3, signal())
      const repo = await source.inspect('test/skills', undefined, signal())
      await source.download(repo.repository, repo.ref, repo.commit, repo.skills[0]!.skillPath, signal())
      remote.setRateLimit(403, Math.floor(Date.now() / 1000) + 600)
      source.clear()
      expect((await source.inspect('test/skills', undefined, signal())).commit).toBe(repo.commit)
      for (const item of limited.seen.filter(entry => new URL(entry.url).hostname === 'api.github.com')) expect(item.headers.Authorization).toBe('Bearer secret-token-value')
      for (const host of ['skills.sh', 'github.com', 'codeload.github.com', 'raw.githubusercontent.com']) expect(limited.seen.some(entry => new URL(entry.url).hostname === host)).toBe(true)
      for (const item of limited.seen.filter(entry => new URL(entry.url).hostname !== 'api.github.com')) expect(item.headers.Authorization).toBeUndefined()
      const plainRemote = fakeGitHub()
      const plain = capture(plainRemote.fetcher)
      const plainSource = new GitHubSource(config(), plain.fetcher)
      await plainSource.search('demo', 3, signal())
      const plainRepo = await plainSource.inspect('test/skills', undefined, signal())
      await plainSource.download(plainRepo.repository, plainRepo.ref, plainRepo.commit, plainRepo.skills[0]!.skillPath, signal())
      expect(plain.seen.length).toBeGreaterThan(0)
      expect(plain.seen.every(item => item.headers.Authorization === undefined)).toBe(true)
      const rejected: Fetcher = async input => {
        if (new URL(input).hostname === 'api.github.com') return new Response('rejected', { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 60) } })
        throw new Error('offline')
      }
      const error = await new GitHubSource(tokenConfig(), rejected).inspect('test/skills', undefined, signal()).catch(value => value)
      expect(error).toMatchObject({ code: 'rate-limit' })
      expect(error.message).not.toContain('secret-token-value')
    } finally { delete process.env.TEST_GH_TOKEN }
  })
  it('reports an actionable GitHub rate-limit error with the reset clock time', async () => {
    const reset = Math.floor(Date.now() / 1000) + 3600
    const expected = new Date(reset * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const rejected: Fetcher = async input => {
      if (new URL(input).hostname === 'api.github.com') return new Response('rejected', { status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) } })
      throw new Error('offline')
    }
    const error = await new GitHubSource(config(), rejected).inspect('test/skills', undefined, signal()).catch(value => value)
    expect(error).toMatchObject({ code: 'rate-limit' })
    expect(error.message).toContain('60 requests/hour')
    expect(error.message).toContain(expected)
    expect(error.message).toContain('githubTokenEnv')
  })
  it('deduplicates ref resolution across inspect calls and forgets it on clear', async () => {
    const remote = fakeGitHub()
    let commits = 0
    const fetcher: Fetcher = async (input, init) => {
      const url = new URL(input)
      if (url.hostname === 'api.github.com' && url.pathname.includes('/commits/')) commits += 1
      return remote.fetcher(input, init)
    }
    const source = new GitHubSource(config(), fetcher)
    await source.inspect('test/skills', undefined, signal())
    expect(commits).toBe(1)
    await source.tree('test/skills', undefined, signal())
    expect(commits).toBe(1)
    await source.inspect('test/skills', undefined, signal())
    expect(commits).toBe(1)
    source.clear()
    await source.inspect('test/skills', undefined, signal())
    expect(commits).toBe(2)
  })
  it('rebuilds an identical tree from the archive when api.github.com is rate limited', async () => {
    const remote = fakeGitHub()
    const happy = new GitHubSource(config(), remote.fetcher)
    const happyTree = await happy.tree('test/skills', undefined, signal())
    const happyRepo = await happy.inspect('test/skills', undefined, signal())
    const happyPreview = await happy.preview('test/skills', undefined, happyTree.commit, 'demo/SKILL.md', signal())
    const happyDownload = await happy.download('test/skills', undefined, happyTree.commit, 'demo/SKILL.md', signal())
    expect(happyTree.source).toBe('api')
    remote.setRateLimit(403, Math.floor(Date.now() / 1000) + 600)
    const apiStatuses: number[] = []
    const fetcher: Fetcher = async (input, init) => {
      const response = await remote.fetcher(input, init)
      if (new URL(input).hostname === 'api.github.com') apiStatuses.push(response.status)
      return response
    }
    const fallback = new GitHubSource(config(), fetcher)
    const tree = await fallback.tree('test/skills', undefined, signal())
    expect(tree.source).toBe('archive')
    expect(tree.commit).toBe(happyTree.commit)
    expect(tree.rootHash).toBe(happyTree.rootHash)
    expect(apiStatuses.length).toBeGreaterThan(0)
    expect(apiStatuses.every(status => status === 403)).toBe(true)
    const repo = await fallback.inspect('test/skills', undefined, signal())
    expect(repo.commit).toBe(happyRepo.commit)
    expect(repo.skills).toEqual(happyRepo.skills)
    const preview = await fallback.preview('test/skills', undefined, tree.commit, 'demo/SKILL.md', signal())
    expect(preview.content).toBe(happyPreview.content)
    expect(preview.skill.treeHash).toBe(happyPreview.skill.treeHash)
    expect(preview.files).toEqual(happyPreview.files)
    expect(preview.totalBytes).toBe(happyPreview.totalBytes)
    const download = await fallback.download('test/skills', undefined, tree.commit, 'demo/SKILL.md', signal())
    expect(download.files.map(file => ({ path: file.path, text: Buffer.from(file.bytes).toString('utf8'), executable: file.executable }))).toEqual(happyDownload.files.map(file => ({ path: file.path, text: Buffer.from(file.bytes).toString('utf8'), executable: file.executable })))
    expect(download.skill.treeHash).toBe(happyDownload.skill.treeHash)
    const cold = new GitHubSource(config(), fetcher)
    const coldPreview = await cold.preview('test/skills', undefined, happyTree.commit, 'demo/SKILL.md', signal())
    expect(coldPreview.content).toBe(happyPreview.content)
    expect(coldPreview.skill.treeHash).toBe(happyPreview.skill.treeHash)
    const coldDownload = await cold.download('test/skills', undefined, happyTree.commit, 'demo/SKILL.md', signal())
    expect(coldDownload.files.map(file => Buffer.from(file.bytes).toString('utf8'))).toEqual(happyDownload.files.map(file => Buffer.from(file.bytes).toString('utf8')))
  })
  it('resolves HEAD, a branch and a peeled annotated tag from a pkt-line advertisement', async () => {
    const remote = fakeGitHub()
    remote.setRateLimit(403, Math.floor(Date.now() / 1000) + 600)
    const head = remote.variants[0]!.commit
    const other = remote.variants[1]!.commit
    const advertisement = refAdvertisement({ 'refs/heads/main': head, 'refs/heads/release/v1': other, 'refs/tags/v1': 'c'.repeat(40), 'refs/tags/v1^{}': head }, 'refs/heads/main')
    const fetcher: Fetcher = async (input, init) => {
      if (new URL(input).hostname === 'github.com') return new Response(new Uint8Array(advertisement), { headers: { 'content-type': 'application/x-git-upload-pack-advertisement' } })
      return remote.fetcher(input, init)
    }
    const source = new GitHubSource(config(), fetcher)
    expect((await source.tree('test/skills', 'HEAD', signal())).commit).toBe(head)
    expect((await source.tree('test/skills', 'main', signal())).commit).toBe(head)
    expect((await source.tree('test/skills', 'release/v1', signal())).commit).toBe(other)
    expect((await source.tree('test/skills', 'v1', signal())).commit).toBe(head)
    await expect(source.tree('test/skills', 'absent', signal())).rejects.toMatchObject({ code: 'source-not-found' })
  })
  it('does not reconstruct from the archive after a GitHub 404', async () => {
    const remote = fakeGitHub()
    const source = new GitHubSource(config(), remote.fetcher)
    await expect(source.tree('test/skills', 'f'.repeat(40), signal())).rejects.toMatchObject({ code: 'source-not-found' })
    expect(remote.calls.some(url => url.includes('codeload.github.com'))).toBe(false)
    expect(remote.calls.some(url => url.includes('info/refs'))).toBe(false)
  })
  it('derives the skill id and canonical skills.sh URL from the upstream id path', async () => {
    const remote = fakeGitHub()
    const results = await new GitHubSource(config(), remote.fetcher).search('demo', 3, signal())
    expect(results.items[0]).toMatchObject({ skillId: 'demo', url: 'https://skills.sh/test/skills/demo' })
    const explicit: Fetcher = async () => Response.json({ skills: [{ id: 'owner/repo/upstream', name: 'demo', source: 'test/skills', installs: 4, skillId: 'reported' }] })
    expect((await new GitHubSource(config(), explicit).search('demo', 3, signal())).items[0]).toMatchObject({ skillId: 'reported', url: 'https://skills.sh/owner/repo/upstream' })
    const short: Fetcher = async () => Response.json({ skills: [{ id: 'owner/repo', name: 'demo', source: 'test/skills', installs: 4 }] })
    const shortResults = await new GitHubSource(config(), short).search('demo', 3, signal())
    expect(shortResults.items[0]).toMatchObject({ url: 'https://skills.sh/test/skills/demo' })
    expect(shortResults.items[0]?.skillId).toBeUndefined()
  })
})
