import { posix } from 'node:path'
import { z } from 'zod'
import type { ManagerConfig } from './config.js'
import type { RemotePreview, RepositoryInfo, RepositorySkill, SearchResults } from './types.js'
import type { BundleFile } from './fs-store.js'
import { gitBlobHash, gitTreeHash, safeRelativePath } from './fs-store.js'
import { fail, throwIfAborted } from './errors.js'
import { parseSkill } from './skill-metadata.js'
import { mapLimit } from './utils.js'

export function parseRepository(source: string): string {
  let input = source.trim()
  if (input.startsWith('https://')) {
    let url: URL
    try { url = new URL(input) } catch { fail('invalid-source', 'Use a public GitHub owner/repo or HTTPS repository-root URL.') }
    if (url.hostname !== 'github.com' || url.port || url.username || url.password || url.search || url.hash) fail('invalid-source', 'Only public HTTPS GitHub repository roots are supported.')
    input = url.pathname.replace(/^\//, '').replace(/\/$/, '')
  }
  input = input.replace(/\.git$/, '')
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(input) || input.split('/')[1] === '..') fail('invalid-source', 'Use owner/repo (not a local path, Git URL, or a GitHub tree URL).')
  return input.toLowerCase()
}
export function parseRef(ref?: string): string {
  const value = ref ?? 'HEAD'
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,199}$/.test(value) || value.includes('..') || value.endsWith('/') || value.includes('//')) fail('invalid-source', 'Invalid GitHub branch, tag or commit reference.')
  return value
}
const sha = z.string().regex(/^[0-9a-f]{40}$/)
const nodeSchema = z.object({ path: z.string(), mode: z.string(), type: z.enum(['blob', 'tree', 'commit']), sha, size: z.number().int().nonnegative().optional() })
type TreeNode = z.infer<typeof nodeSchema>
export interface RepositoryTree { repository: string; ref: string; commit: string; rootHash: string; tree: TreeNode[] }
export interface DownloadedSkill { skill: RepositorySkill; files: BundleFile[]; content: string; tree: RepositoryTree }
export type Fetcher = (input: string, init: RequestInit) => Promise<Response>

export class GitHubSource {
  private readonly immutableTrees = new Map<string, RepositoryTree>()
  constructor(private readonly config: ManagerConfig, private readonly doFetch: Fetcher = (input, init) => fetch(input, init)) {}
  clear(): void { this.immutableTrees.clear() }
  private async bytes(url: string, limit: number, signal: AbortSignal, github = false): Promise<Uint8Array> {
    throwIfAborted(signal)
    const timeout = AbortSignal.timeout(this.config.requestTimeoutMs)
    const response = await this.doFetch(url, { signal: AbortSignal.any([signal, timeout]), redirect: 'error', credentials: 'omit', headers: { 'User-Agent': 'skillre-dsh-skills-manager', ...(github ? { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } : {}) } })
    if (!response.ok) {
      await response.body?.cancel().catch(() => {})
      if (response.status === 403 || response.status === 429) fail('rate-limit', 'The public skill source is rate-limited. Wait and retry; this plugin does not read your GitHub credentials.')
      if (response.status === 404) fail('source-not-found', 'Public repository, revision, or skill resource was not found.')
      fail('network', `Skill source returned HTTP ${response.status}.`)
    }
    const declared = Number(response.headers.get('content-length'))
    if (Number.isFinite(declared) && declared > limit) { await response.body?.cancel().catch(() => {}); fail('limit', 'Source response exceeds the configured download limit.') }
    if (!response.body) return new Uint8Array()
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    try {
      for (;;) {
        throwIfAborted(signal)
        const item = await reader.read()
        if (item.done) break
        size += item.value.length
        if (size > limit) fail('limit', 'Source download exceeds the configured byte limit.')
        chunks.push(item.value)
      }
      throwIfAborted(signal)
      const result = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length }
      return result
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
  }
  private async json(url: string, signal: AbortSignal): Promise<unknown> {
    const bytes = await this.bytes(url, Math.min(this.config.maxBundleBytes, 16 * 1024 * 1024), signal, true)
    try { return JSON.parse(new TextDecoder().decode(bytes)) } catch { fail('source-invalid', 'Skill source did not return valid JSON.') }
  }
  async tree(source: string, ref: string | undefined, signal: AbortSignal, pinnedCommit?: string): Promise<RepositoryTree> {
    const repository = parseRepository(source)
    const requestedRef = parseRef(ref)
    if (pinnedCommit && !sha.safeParse(pinnedCommit).success) fail('invalid-source', 'An inspected immutable commit is required.')
    const cacheKey = `${repository}@${pinnedCommit ?? ''}`
    if (pinnedCommit && this.immutableTrees.has(cacheKey)) return { ...this.immutableTrees.get(cacheKey)!, ref: requestedRef }
    const data = z.object({ sha, commit: z.object({ tree: z.object({ sha }) }) }).parse(await this.json(`https://api.github.com/repos/${repository}/commits/${encodeURIComponent(pinnedCommit ?? requestedRef)}`, signal))
    if (pinnedCommit && data.sha !== pinnedCommit) fail('source-invalid', 'GitHub resolved a different commit from the inspected revision.')
    const tree = z.object({ sha, truncated: z.boolean().optional(), tree: z.array(nodeSchema).max(this.config.maxRepositoryEntries) }).parse(await this.json(`https://api.github.com/repos/${repository}/git/trees/${data.commit.tree.sha}?recursive=1`, signal))
    if (tree.truncated) fail('repository-limit', 'GitHub truncated this repository tree. Choose a smaller skills repository; an incomplete tree cannot establish update status.')
    if (tree.sha !== data.commit.tree.sha) fail('source-invalid', 'Repository tree hash did not match its immutable commit.')
    const result: RepositoryTree = { repository, ref: requestedRef, commit: data.sha, rootHash: tree.sha, tree: tree.tree }
    if (this.immutableTrees.size >= 20) this.immutableTrees.delete(this.immutableTrees.keys().next().value!)
    this.immutableTrees.set(`${repository}@${data.sha}`, result)
    return result
  }
  private folderHash(tree: RepositoryTree, skillPath: string): string {
    safeRelativePath(skillPath)
    if (posix.basename(skillPath) !== 'SKILL.md') fail('invalid-skill', 'Select an exact SKILL.md from the inspected repository.')
    const folder = posix.dirname(skillPath)
    const hash = folder === '.' ? tree.rootHash : tree.tree.find(node => node.type === 'tree' && node.path === folder)?.sha
    if (!hash) fail('source-not-found', 'Selected skill directory is absent from this revision.')
    return hash
  }
  folderHashFor(tree: RepositoryTree, skillPath: string): string { return this.folderHash(tree, skillPath) }
  private selectedFiles(tree: RepositoryTree, skillPath: string): TreeNode[] {
    this.folderHash(tree, skillPath)
    const folder = posix.dirname(skillPath)
    const prefix = folder === '.' ? '' : `${folder}/`
    const selected = tree.tree.filter(node => node.path.startsWith(prefix) && node.type !== 'tree')
    if (!selected.some(node => node.path === skillPath && node.type === 'blob')) fail('source-not-found', 'Selected SKILL.md is absent from this revision.')
    if (selected.length > this.config.maxBundleFiles) fail('limit', 'Selected skill exceeds the configured file-count limit.')
    const paths = new Map<string, { actual: string; directory: boolean }>()
    let declaredBytes = 0
    for (const node of selected) {
      const path = safeRelativePath(node.path.slice(prefix.length))
      if (!['100644', '100755'].includes(node.mode) || node.type !== 'blob') fail('unsafe-source', 'Remote symlinks, submodules and non-regular resources cannot be installed.')
      const segments = path.split('/')
      for (let index = 0; index < segments.length; index++) {
        const actual = segments.slice(0, index + 1).join('/')
        const folded = actual.normalize('NFC').toLowerCase()
        const directory = index < segments.length - 1
        const previous = paths.get(folded)
        if (previous && (previous.actual !== actual || previous.directory !== directory || !directory)) fail('unsafe-source', 'Source contains duplicate, case-colliding or normalization-colliding resource paths.')
        paths.set(folded, { actual, directory })
      }
      if (node.size !== undefined && node.size > this.config.maxFileBytes) fail('limit', 'Remote resource exceeds the configured file-size limit.')
      declaredBytes += node.size ?? 0
    }
    if (declaredBytes > this.config.maxBundleBytes) fail('limit', 'Selected skill exceeds the configured total-size limit.')
    return selected
  }
  private async file(tree: RepositoryTree, node: TreeNode, signal: AbortSignal): Promise<Uint8Array> {
    const path = safeRelativePath(node.path).split('/').map(encodeURIComponent).join('/')
    const bytes = await this.bytes(`https://raw.githubusercontent.com/${tree.repository}/${tree.commit}/${path}`, this.config.maxFileBytes, signal)
    if (gitBlobHash(bytes) !== node.sha) fail('integrity', 'Downloaded resource did not match its Git blob hash; no local files were changed.')
    return bytes
  }
  async inspect(source: string, ref: string | undefined, signal: AbortSignal): Promise<RepositoryInfo> {
    const tree = await this.tree(source, ref, signal)
    const candidates = tree.tree.filter(node => node.type === 'blob' && posix.basename(node.path) === 'SKILL.md')
    const paths = candidates.slice(0, this.config.maxSkills)
    const warnings: string[] = []
    const results = await mapLimit(paths, this.config.checkConcurrency, async node => {
      try {
        if (!['100644', '100755'].includes(node.mode)) fail('unsafe-source', 'SKILL.md cannot be a symlink.')
        const meta = parseSkill(new TextDecoder().decode(await this.file(tree, node, signal)))
        return { name: meta.name, description: meta.description, skillPath: node.path, treeHash: this.folderHash(tree, node.path) }
      } catch (error) {
        throwIfAborted(signal)
        warnings.push(`${node.path}: ${error instanceof Error ? error.message : String(error)}`)
        return null
      }
    }, signal)
    return { repository: tree.repository, ref: tree.ref, commit: tree.commit, skills: results.filter((item): item is RepositorySkill => item !== null), truncated: candidates.length > paths.length, warnings: warnings.slice(0, 20) }
  }
  async preview(source: string, ref: string | undefined, commit: string, skillPath: string, signal: AbortSignal): Promise<RemotePreview> {
    const tree = await this.tree(source, ref, signal, commit)
    const nodes = this.selectedFiles(tree, skillPath)
    const node = nodes.find(item => item.path === skillPath)!
    const content = new TextDecoder().decode(await this.file(tree, node, signal))
    const metadata = parseSkill(content)
    const prefix = posix.dirname(skillPath) === '.' ? '' : `${posix.dirname(skillPath)}/`
    return { repository: tree.repository, ref: tree.ref, commit: tree.commit, skill: { name: metadata.name, description: metadata.description, skillPath, treeHash: this.folderHash(tree, skillPath) }, content, files: nodes.map(item => ({ path: item.path.slice(prefix.length), bytes: item.size ?? 0 })), totalBytes: nodes.reduce((sum, item) => sum + (item.size ?? 0), 0) }
  }
  async download(source: string, ref: string | undefined, commit: string, skillPath: string, signal: AbortSignal): Promise<DownloadedSkill> {
    const tree = await this.tree(source, ref, signal, commit)
    const nodes = this.selectedFiles(tree, skillPath)
    const prefix = posix.dirname(skillPath) === '.' ? '' : `${posix.dirname(skillPath)}/`
    let totalBytes = 0
    const files = await mapLimit(nodes, this.config.checkConcurrency, async node => {
      const bytes = await this.file(tree, node, signal)
      totalBytes += bytes.length
      if (totalBytes > this.config.maxBundleBytes) fail('limit', 'Downloaded skill exceeds the configured total-size limit.')
      return { path: node.path.slice(prefix.length), bytes, executable: node.mode === '100755' }
    }, signal)
    if (gitTreeHash(files) !== this.folderHash(tree, skillPath)) fail('integrity', 'Downloaded skill did not reconstruct the selected Git tree; no local files were changed.')
    const skillFile = files.find(file => file.path === 'SKILL.md')
    if (!skillFile) fail('invalid-skill', 'Selected bundle has no root SKILL.md.')
    const content = new TextDecoder().decode(skillFile.bytes)
    const metadata = parseSkill(content)
    return { tree, files, content, skill: { name: metadata.name, description: metadata.description, skillPath, treeHash: this.folderHash(tree, skillPath) } }
  }
  async search(query: string, limit: number, signal: AbortSignal): Promise<SearchResults> {
    const url = new URL('https://skills.sh/api/search')
    url.searchParams.set('q', query)
    url.searchParams.set('limit', String(limit))
    const data = z.object({ skills: z.array(z.object({ id: z.string().max(500), name: z.string().max(200), source: z.string().max(400), installs: z.number().nonnegative().optional() })).max(100) }).parse(await this.json(url.toString(), signal))
    const items = data.skills.slice(0, limit).flatMap(item => {
      try {
        const repository = parseRepository(item.source)
        return [{ id: item.id, name: item.name, repository, installs: item.installs ?? 0, url: `https://skills.sh/${repository}/${encodeURIComponent(item.name)}` }]
      } catch { return [] }
    })
    return { query, items }
  }
}
