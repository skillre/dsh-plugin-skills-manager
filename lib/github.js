import { posix } from 'node:path';
import { z, ZodError } from 'zod';
import { gitBlobHash, gitTreeHash, safeRelativePath } from './fs-store.js';
import { extractRepositoryFiles } from './archive.js';
import { SkillsManagerError, fail, hasCode, throwIfAborted } from './errors.js';
import { parseSkill } from './skill-metadata.js';
import { mapLimit } from './utils.js';
export function parseRepository(source) {
    let input = source.trim();
    if (input.startsWith('https://')) {
        let url;
        try {
            url = new URL(input);
        }
        catch {
            fail('invalid-source', 'Use a public GitHub owner/repo or HTTPS repository-root URL.');
        }
        if (url.hostname !== 'github.com' || url.port || url.username || url.password || url.search || url.hash)
            fail('invalid-source', 'Only public HTTPS GitHub repository roots are supported.');
        input = url.pathname.replace(/^\//, '').replace(/\/$/, '');
    }
    input = input.replace(/\.git$/, '');
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(input) || input.split('/')[1] === '..')
        fail('invalid-source', 'Use owner/repo (not a local path, Git URL, or a GitHub tree URL).');
    return input.toLowerCase();
}
export function parseRef(ref) {
    const value = ref ?? 'HEAD';
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,199}$/.test(value) || value.includes('..') || value.endsWith('/') || value.includes('//'))
        fail('invalid-source', 'Invalid GitHub branch, tag or commit reference.');
    return value;
}
const sha = z.string().regex(/^[0-9a-f]{40}$/);
const nodeSchema = z.object({ path: z.string(), mode: z.string(), type: z.enum(['blob', 'tree', 'commit']), sha, size: z.number().int().nonnegative().optional() });
const REF_TTL_MS = 120_000;
const TREE_CACHE_LIMIT = 20;
const REF_CACHE_LIMIT = 100;
const USER_AGENT = 'skillre-dsh-skills-manager';
const REF_ADVERTISEMENT_ACCEPT = 'application/x-git-upload-pack-advertisement';
const REF_ADVERTISEMENT_LIMIT = 8 * 1024 * 1024;
function lowerBound(files, value) {
    let low = 0;
    let high = files.length;
    while (low < high) {
        const middle = (low + high) >>> 1;
        if (files[middle].path < value)
            low = middle + 1;
        else
            high = middle;
    }
    return low;
}
/**
 * Build the same flattened tree the recursive Git trees API reports from a
 * commit archive. Git tree hashes are derived with the shared helpers so a
 * skill folder hash is identical to the API path.
 */
function buildArchiveTree(files, maxEntries) {
    const sorted = [...files].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    const directories = new Set();
    for (const file of sorted) {
        const segments = file.path.split('/');
        for (let index = 1; index < segments.length; index++)
            directories.add(segments.slice(0, index).join('/'));
    }
    if (sorted.length + directories.size > maxEntries)
        fail('repository-limit', `Repository contains more resources than the configured limit (maxRepositoryEntries=${maxEntries}). Choose a smaller skills repository.`);
    const nodes = [];
    for (const directory of [...directories].sort()) {
        const prefix = `${directory}/`;
        const scoped = [];
        for (let index = lowerBound(sorted, prefix); index < sorted.length && sorted[index].path.startsWith(prefix); index++) {
            const file = sorted[index];
            scoped.push({ path: file.path.slice(prefix.length), bytes: file.bytes, executable: file.executable });
        }
        nodes.push({ path: directory, mode: '040000', type: 'tree', sha: gitTreeHash(scoped) });
    }
    for (const file of sorted)
        nodes.push({ path: file.path, mode: file.executable ? '100755' : '100644', type: 'blob', sha: gitBlobHash(file.bytes), size: file.bytes.length });
    return { rootHash: gitTreeHash(sorted), nodes };
}
/** Parse a git smart-HTTP pkt-line ref advertisement (`info/refs`). */
function parseRefAdvertisement(bytes) {
    const refs = new Map();
    const symrefs = new Map();
    const buffer = Buffer.from(bytes);
    let offset = 0;
    while (offset + 4 <= buffer.length) {
        const header = buffer.subarray(offset, offset + 4).toString('ascii');
        if (!/^[0-9a-f]{4}$/.test(header))
            fail('source-invalid', 'GitHub returned a malformed Git reference advertisement.');
        const length = Number.parseInt(header, 16);
        offset += 4;
        if (length === 0)
            continue;
        if (length < 4 || offset + length - 4 > buffer.length)
            fail('source-invalid', 'GitHub returned a truncated Git reference advertisement.');
        let line = buffer.subarray(offset, offset + length - 4).toString('utf8');
        offset += length - 4;
        if (line.endsWith('\n'))
            line = line.slice(0, -1);
        if (!line || line.startsWith('#'))
            continue;
        const nul = line.indexOf('\0');
        if (nul >= 0) {
            for (const capability of line.slice(nul + 1).split(' ')) {
                if (!capability.startsWith('symref='))
                    continue;
                const [name, target] = capability.slice('symref='.length).split(':');
                if (name && target)
                    symrefs.set(name, target);
            }
            line = line.slice(0, nul);
        }
        const match = /^([0-9a-f]{40}) (.+)$/.exec(line);
        if (!match)
            fail('source-invalid', 'GitHub returned an unexpected Git reference line.');
        refs.set(match[2], match[1]);
    }
    return { refs, symrefs };
}
function resolveAdvertisedRef(advertisement, requestedRef) {
    const { refs, symrefs } = advertisement;
    if (requestedRef === 'HEAD') {
        const target = symrefs.get('HEAD');
        if (target && refs.has(target))
            return refs.get(target);
        return refs.get('refs/heads/main') ?? refs.get('refs/heads/master') ?? refs.get('HEAD');
    }
    if (/^[0-9a-f]{40}$/.test(requestedRef))
        return requestedRef;
    const branch = `refs/heads/${requestedRef}`;
    if (refs.has(branch))
        return refs.get(branch);
    const peeled = `refs/tags/${requestedRef}^{}`;
    if (refs.has(peeled))
        return refs.get(peeled);
    const tag = `refs/tags/${requestedRef}`;
    if (refs.has(tag))
        return refs.get(tag);
    return requestedRef.startsWith('refs/') && refs.has(requestedRef) ? refs.get(requestedRef) : undefined;
}
export class GitHubSource {
    config;
    doFetch;
    immutableTrees = new Map();
    resolvedRefs = new Map();
    constructor(config, doFetch = (input, init) => fetch(input, init)) {
        this.config = config;
        this.doFetch = doFetch;
    }
    clear() { this.immutableTrees.clear(); this.resolvedRefs.clear(); }
    githubToken() {
        const name = this.config.githubTokenEnv;
        const value = name ? process.env[name]?.trim() : undefined;
        // Keep a malformed environment value away from header validators whose
        // error text could echo it back into a user-facing failure.
        return value && /^[\x21-\x7e]+$/.test(value) ? value : undefined;
    }
    failRateLimit(response) {
        const resetHeader = response.headers.get('x-ratelimit-reset');
        const reset = resetHeader === null ? Number.NaN : Number(resetHeader);
        const remainingHeader = response.headers.get('x-ratelimit-remaining');
        const remaining = remainingHeader !== null && /^\d+$/.test(remainingHeader) ? remainingHeader : undefined;
        const clock = Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined;
        fail('rate-limit', `GitHub API rate limit reached: the API request budget is exhausted or this request was rejected (60 requests/hour unauthenticated)${remaining === undefined ? '' : ` (remaining: ${remaining})`}${clock === undefined ? '' : `; resets at ${clock} local`}. Set the plugin option githubTokenEnv to the name of an environment variable holding a GitHub token to raise the limit, or retry after the reset.`);
    }
    async bytes(url, limit, signal, github = false, redirect = 'error', timeoutMs = this.config.requestTimeoutMs, onBytes, accept) {
        throwIfAborted(signal);
        const headers = { 'User-Agent': USER_AGENT };
        if (github) {
            headers.Accept = 'application/vnd.github+json';
            headers['X-GitHub-Api-Version'] = '2022-11-28';
        }
        else if (accept)
            headers.Accept = accept;
        if (github && new URL(url).hostname === 'api.github.com') {
            const token = this.githubToken();
            if (token)
                headers.Authorization = `Bearer ${token}`;
        }
        const timeout = AbortSignal.timeout(timeoutMs);
        const response = await this.doFetch(url, { signal: AbortSignal.any([signal, timeout]), redirect, credentials: 'omit', headers });
        if (!response.ok) {
            await response.body?.cancel().catch(() => { });
            if (response.status === 403 || response.status === 429) {
                if (github)
                    this.failRateLimit(response);
                fail('rate-limit', 'The public skill source is rate-limited. Wait and retry; this plugin does not read your GitHub credentials.');
            }
            if (response.status === 404)
                fail('source-not-found', 'Public repository, revision, or skill resource was not found.');
            fail('network', `Skill source returned HTTP ${response.status}.`);
        }
        const declared = Number(response.headers.get('content-length'));
        if (Number.isFinite(declared) && declared > limit) {
            await response.body?.cancel().catch(() => { });
            fail('limit', 'Source response exceeds the configured download limit.');
        }
        const total = Number.isFinite(declared) ? declared : undefined;
        onBytes?.(0, total);
        if (!response.body)
            return new Uint8Array();
        const reader = response.body.getReader();
        const chunks = [];
        let size = 0;
        try {
            for (;;) {
                throwIfAborted(signal);
                const item = await reader.read();
                if (item.done)
                    break;
                size += item.value.length;
                if (size > limit)
                    fail('limit', 'Source download exceeds the configured byte limit.');
                chunks.push(item.value);
                onBytes?.(size, total);
            }
            throwIfAborted(signal);
            const result = new Uint8Array(size);
            let offset = 0;
            for (const chunk of chunks) {
                result.set(chunk, offset);
                offset += chunk.length;
            }
            return result;
        }
        finally {
            await reader.cancel().catch(() => { });
            reader.releaseLock();
        }
    }
    async json(url, signal) {
        const github = new URL(url).hostname === 'api.github.com';
        const bytes = await this.bytes(url, Math.min(this.config.maxBundleBytes, 16 * 1024 * 1024), signal, github);
        try {
            return JSON.parse(new TextDecoder().decode(bytes));
        }
        catch {
            fail('source-invalid', 'Skill source did not return valid JSON.');
        }
    }
    static fallbackAllowed(error) {
        if (error instanceof ZodError)
            return false;
        return hasCode(error, 'rate-limit') || !(error instanceof SkillsManagerError);
    }
    rememberRef(repository, requestedRef, commit) {
        if (this.resolvedRefs.size >= REF_CACHE_LIMIT)
            this.resolvedRefs.delete(this.resolvedRefs.keys().next().value);
        this.resolvedRefs.set(`${repository}@${requestedRef}`, { commit, expiresAt: Date.now() + REF_TTL_MS });
    }
    cacheTree(result) {
        const key = `${result.repository}@${result.commit}`;
        if (this.immutableTrees.size >= TREE_CACHE_LIMIT && !this.immutableTrees.has(key))
            this.immutableTrees.delete(this.immutableTrees.keys().next().value);
        this.immutableTrees.set(key, result);
        return result;
    }
    async apiTree(repository, requestedRef, signal, pinnedCommit) {
        const data = z.object({ sha, commit: z.object({ tree: z.object({ sha }) }) }).parse(await this.json(`https://api.github.com/repos/${repository}/commits/${encodeURIComponent(pinnedCommit ?? requestedRef)}`, signal));
        if (pinnedCommit && data.sha !== pinnedCommit)
            fail('source-invalid', 'GitHub resolved a different commit from the inspected revision.');
        const cached = this.immutableTrees.get(`${repository}@${data.sha}`);
        if (cached)
            return { ...cached, ref: requestedRef };
        const tree = z.object({ sha, truncated: z.boolean().optional(), tree: z.array(nodeSchema).max(this.config.maxRepositoryEntries) }).parse(await this.json(`https://api.github.com/repos/${repository}/git/trees/${data.commit.tree.sha}?recursive=1`, signal));
        if (tree.truncated)
            fail('repository-limit', 'GitHub truncated this repository tree. Choose a smaller skills repository; an incomplete tree cannot establish update status.');
        if (tree.sha !== data.commit.tree.sha)
            fail('source-invalid', 'Repository tree hash did not match its immutable commit.');
        return this.cacheTree({ repository, ref: requestedRef, commit: data.sha, rootHash: tree.sha, tree: tree.tree, source: 'api' });
    }
    async commitFromRefs(repository, requestedRef, signal) {
        const bytes = await this.bytes(`https://github.com/${repository}/info/refs?service=git-upload-pack`, REF_ADVERTISEMENT_LIMIT, signal, false, 'error', this.config.requestTimeoutMs, undefined, REF_ADVERTISEMENT_ACCEPT);
        const commit = resolveAdvertisedRef(parseRefAdvertisement(bytes), requestedRef);
        if (!commit)
            fail('source-not-found', `GitHub did not advertise the requested revision (${requestedRef}); the branch, tag or commit cannot be resolved without the API.`);
        if (/^0{40}$/.test(commit))
            fail('source-not-found', 'GitHub advertised an empty revision; the repository or branch has no commit.');
        return commit;
    }
    /** Reconstruct a repository tree from the codeload archive without any api.github.com request. */
    async archiveTree(repository, requestedRef, signal, pinnedCommit) {
        const commit = pinnedCommit ?? await this.commitFromRefs(repository, requestedRef, signal);
        const archiveLimit = Math.min(this.config.maxBundleBytes * 3, 128 * 1024 * 1024);
        const bytes = await this.bytes(`https://codeload.github.com/${repository}/tar.gz/${commit}`, archiveLimit, signal, false, 'follow', Math.max(this.config.requestTimeoutMs, this.config.operationTimeoutMs));
        const entries = extractRepositoryFiles(bytes, { maxBytes: archiveLimit, maxFiles: this.config.maxRepositoryEntries, maxFileBytes: this.config.maxFileBytes }, signal);
        const files = [];
        const seen = new Set();
        let top;
        for (const entry of entries) {
            const slash = entry.path.indexOf('/');
            if (slash < 0)
                fail('source-invalid', 'Repository archive entries did not share one top-level directory.');
            if (top === undefined)
                top = entry.path.slice(0, slash);
            else if (entry.path.slice(0, slash) !== top)
                fail('source-invalid', 'Repository archive entries did not share one top-level directory.');
            const path = entry.path.slice(slash + 1);
            if (!path)
                continue;
            try {
                safeRelativePath(path);
            }
            catch {
                fail('unsafe-source', 'Repository archive contains a resource path that cannot be installed safely.');
            }
            if (seen.has(path))
                fail('unsafe-source', 'Repository archive contains duplicate resource paths.');
            seen.add(path);
            files.push({ path, bytes: entry.bytes, executable: entry.executable });
        }
        const built = buildArchiveTree(files, this.config.maxRepositoryEntries);
        return this.cacheTree({ repository, ref: requestedRef, commit, rootHash: built.rootHash, tree: built.nodes, source: 'archive' });
    }
    async resolveTree(source, ref, signal, pinnedCommit, useRefCache) {
        throwIfAborted(signal);
        const repository = parseRepository(source);
        const requestedRef = parseRef(ref);
        if (pinnedCommit && !sha.safeParse(pinnedCommit).success)
            fail('invalid-source', 'An inspected immutable commit is required.');
        if (pinnedCommit) {
            const cached = this.immutableTrees.get(`${repository}@${pinnedCommit}`);
            if (cached)
                return { ...cached, ref: requestedRef };
        }
        else if (useRefCache) {
            const resolved = this.resolvedRefs.get(`${repository}@${requestedRef}`);
            if (resolved && resolved.expiresAt > Date.now()) {
                const cached = this.immutableTrees.get(`${repository}@${resolved.commit}`);
                if (cached)
                    return { ...cached, ref: requestedRef };
            }
            if (resolved)
                this.resolvedRefs.delete(`${repository}@${requestedRef}`);
        }
        try {
            const result = await this.apiTree(repository, requestedRef, signal, pinnedCommit);
            if (useRefCache && !pinnedCommit)
                this.rememberRef(repository, requestedRef, result.commit);
            return result;
        }
        catch (error) {
            throwIfAborted(signal);
            if (!GitHubSource.fallbackAllowed(error))
                throw error;
            try {
                const result = await this.archiveTree(repository, requestedRef, signal, pinnedCommit);
                if (useRefCache && !pinnedCommit)
                    this.rememberRef(repository, requestedRef, result.commit);
                return result;
            }
            catch (fallback) {
                throwIfAborted(signal);
                // A failed fallback transport keeps the original, more actionable API error.
                if (fallback instanceof SkillsManagerError && fallback.code !== 'network' && fallback.code !== 'rate-limit')
                    throw fallback;
                throw error;
            }
        }
    }
    /**
     * Resolve a repository tree. A named ref is always resolved again so update
     * checks and updates observe a moved branch; an omitted ref uses the
     * short-lived discovery cache shared with inspect().
     */
    async tree(source, ref, signal, pinnedCommit) {
        return this.resolveTree(source, ref, signal, pinnedCommit, ref === undefined);
    }
    folderHash(tree, skillPath) {
        safeRelativePath(skillPath);
        if (posix.basename(skillPath) !== 'SKILL.md')
            fail('invalid-skill', 'Select an exact SKILL.md from the inspected repository.');
        const folder = posix.dirname(skillPath);
        const hash = folder === '.' ? tree.rootHash : tree.tree.find(node => node.type === 'tree' && node.path === folder)?.sha;
        if (!hash)
            fail('source-not-found', 'Selected skill directory is absent from this revision.');
        return hash;
    }
    folderHashFor(tree, skillPath) { return this.folderHash(tree, skillPath); }
    selectedFiles(tree, skillPath) {
        this.folderHash(tree, skillPath);
        const folder = posix.dirname(skillPath);
        const prefix = folder === '.' ? '' : `${folder}/`;
        const selected = tree.tree.filter(node => node.path.startsWith(prefix) && node.type !== 'tree');
        if (!selected.some(node => node.path === skillPath && node.type === 'blob'))
            fail('source-not-found', 'Selected SKILL.md is absent from this revision.');
        if (selected.length > this.config.maxBundleFiles)
            fail('limit', `Selected skill exceeds the configured file-count limit (maxBundleFiles=${this.config.maxBundleFiles}). Raise maxBundleFiles in the plugin configuration if you trust this source.`);
        const paths = new Map();
        let declaredBytes = 0;
        for (const node of selected) {
            const path = safeRelativePath(node.path.slice(prefix.length));
            if (!['100644', '100755'].includes(node.mode) || node.type !== 'blob')
                fail('unsafe-source', 'Remote symlinks, submodules and non-regular resources cannot be installed.');
            const segments = path.split('/');
            for (let index = 0; index < segments.length; index++) {
                const actual = segments.slice(0, index + 1).join('/');
                const folded = actual.normalize('NFC').toLowerCase();
                const directory = index < segments.length - 1;
                const previous = paths.get(folded);
                if (previous && (previous.actual !== actual || previous.directory !== directory || !directory))
                    fail('unsafe-source', 'Source contains duplicate, case-colliding or normalization-colliding resource paths.');
                paths.set(folded, { actual, directory });
            }
            if (node.size !== undefined && node.size > this.config.maxFileBytes)
                fail('limit', `Remote resource exceeds the configured file-size limit (maxFileBytes=${this.config.maxFileBytes}).`);
            declaredBytes += node.size ?? 0;
        }
        if (declaredBytes > this.config.maxBundleBytes)
            fail('limit', `Selected skill exceeds the configured total-size limit (maxBundleBytes=${this.config.maxBundleBytes}). Raise maxBundleBytes in the plugin configuration if you trust this source.`);
        return selected;
    }
    async file(tree, node, signal) {
        const path = safeRelativePath(node.path).split('/').map(encodeURIComponent).join('/');
        const bytes = await this.bytes(`https://raw.githubusercontent.com/${tree.repository}/${tree.commit}/${path}`, this.config.maxFileBytes, signal);
        if (gitBlobHash(bytes) !== node.sha)
            fail('integrity', 'Downloaded resource did not match its Git blob hash; no local files were changed.');
        return bytes;
    }
    async downloadArchive(tree, nodes, skillPath, signal, onBytes) {
        const archiveLimit = Math.min(this.config.maxBundleBytes * 3, 256 * 1024 * 1024);
        const bytes = await this.bytes(`https://codeload.github.com/${tree.repository}/tar.gz/${tree.commit}`, Math.min(this.config.maxBundleBytes * 2, archiveLimit), signal, false, 'follow', Math.max(this.config.requestTimeoutMs, this.config.operationTimeoutMs), onBytes);
        const entries = extractRepositoryFiles(bytes, { maxBytes: archiveLimit, maxFiles: this.config.maxRepositoryEntries, maxFileBytes: this.config.maxFileBytes }, signal);
        const repoFiles = new Map();
        for (const entry of entries) {
            const slash = entry.path.indexOf('/');
            if (slash < 0)
                continue;
            const repoPath = entry.path.slice(slash + 1);
            if (repoFiles.has(repoPath))
                fail('integrity', 'Repository archive contains duplicate paths; no local files were changed.');
            repoFiles.set(repoPath, entry.bytes);
        }
        const prefix = posix.dirname(skillPath) === '.' ? '' : `${posix.dirname(skillPath)}/`;
        let totalBytes = 0;
        const files = nodes.map(node => {
            if (node.size !== undefined && node.size > this.config.maxFileBytes)
                fail('limit', 'Selected skill resource exceeds the configured file-size limit.');
            const content = repoFiles.get(node.path);
            if (!content)
                fail('source-invalid', `Repository archive is missing ${node.path}.`);
            if (node.size !== undefined && content.length !== node.size)
                fail('integrity', 'Downloaded resource size did not match its Git tree entry; no local files were changed.');
            if (gitBlobHash(content) !== node.sha)
                fail('integrity', 'Downloaded resource did not match its Git blob hash; no local files were changed.');
            totalBytes += content.length;
            if (totalBytes > this.config.maxBundleBytes)
                fail('limit', 'Downloaded skill exceeds the configured total-size limit. Raise maxBundleBytes in the plugin configuration if you trust this skill.');
            return { path: node.path.slice(prefix.length), bytes: content, executable: node.mode === '100755' };
        });
        if (files.length > this.config.maxBundleFiles)
            fail('limit', `Selected skill exceeds the configured file-count limit (${this.config.maxBundleFiles} files). Raise maxBundleFiles in the plugin configuration if you trust this skill.`);
        return files;
    }
    async inspect(source, ref, signal) {
        // Discovery always uses the short-lived ref cache. Update checks and updates
        // name their ref and re-resolve it, so a moved branch is observed.
        const tree = await this.resolveTree(source, ref, signal, undefined, true);
        const candidates = tree.tree.filter(node => node.type === 'blob' && posix.basename(node.path) === 'SKILL.md');
        const paths = candidates.slice(0, this.config.maxSkills);
        const warnings = [];
        const results = await mapLimit(paths, this.config.checkConcurrency, async (node) => {
            try {
                if (!['100644', '100755'].includes(node.mode))
                    fail('unsafe-source', 'SKILL.md cannot be a symlink.');
                const meta = parseSkill(new TextDecoder().decode(await this.file(tree, node, signal)));
                return { name: meta.name, description: meta.description, skillPath: node.path, treeHash: this.folderHash(tree, node.path) };
            }
            catch (error) {
                throwIfAborted(signal);
                warnings.push(`${node.path}: ${error instanceof Error ? error.message : String(error)}`);
                return null;
            }
        }, signal);
        return { repository: tree.repository, ref: tree.ref, commit: tree.commit, skills: results.filter((item) => item !== null), truncated: candidates.length > paths.length, warnings: warnings.slice(0, 20) };
    }
    async preview(source, ref, commit, skillPath, signal) {
        const tree = await this.tree(source, ref, signal, commit);
        const nodes = this.selectedFiles(tree, skillPath);
        const node = nodes.find(item => item.path === skillPath);
        const content = new TextDecoder().decode(await this.file(tree, node, signal));
        const metadata = parseSkill(content);
        const prefix = posix.dirname(skillPath) === '.' ? '' : `${posix.dirname(skillPath)}/`;
        return { repository: tree.repository, ref: tree.ref, commit: tree.commit, skill: { name: metadata.name, description: metadata.description, skillPath, treeHash: this.folderHash(tree, skillPath) }, content, files: nodes.map(item => ({ path: item.path.slice(prefix.length), bytes: item.size ?? 0 })), totalBytes: nodes.reduce((sum, item) => sum + (item.size ?? 0), 0) };
    }
    async download(source, ref, commit, skillPath, signal, onProgress) {
        const tree = await this.tree(source, ref, signal, commit);
        const nodes = this.selectedFiles(tree, skillPath);
        const prefix = posix.dirname(skillPath) === '.' ? '' : `${posix.dirname(skillPath)}/`;
        let files;
        if (nodes.length > 64) {
            onProgress?.('download', 0);
            files = await this.downloadArchive(tree, nodes, skillPath, signal, (received, total) => onProgress?.('download', total === undefined ? undefined : Math.min(1, received / total)));
        }
        else {
            let totalBytes = 0;
            let fetched = 0;
            onProgress?.('download', 0);
            files = await mapLimit(nodes, this.config.checkConcurrency, async (node) => {
                const bytes = await this.file(tree, node, signal);
                totalBytes += bytes.length;
                fetched += 1;
                onProgress?.('download', fetched / nodes.length);
                if (totalBytes > this.config.maxBundleBytes)
                    fail('limit', 'Downloaded skill exceeds the configured total-size limit.');
                return { path: node.path.slice(prefix.length), bytes, executable: node.mode === '100755' };
            }, signal);
        }
        onProgress?.('verify', 0);
        if (gitTreeHash(files) !== this.folderHash(tree, skillPath))
            fail('integrity', 'Downloaded skill did not reconstruct the selected Git tree; no local files were changed.');
        onProgress?.('verify', 1);
        const skillFile = files.find(file => file.path === 'SKILL.md');
        if (!skillFile)
            fail('invalid-skill', 'Selected bundle has no root SKILL.md.');
        const content = new TextDecoder().decode(skillFile.bytes);
        const metadata = parseSkill(content);
        return { tree, files, content, skill: { name: metadata.name, description: metadata.description, skillPath, treeHash: this.folderHash(tree, skillPath) } };
    }
    async search(query, limit, signal) {
        const url = new URL('https://skills.sh/api/search');
        url.searchParams.set('q', query);
        url.searchParams.set('limit', String(limit));
        const data = z.object({ skills: z.array(z.object({ id: z.string().max(500), name: z.string().max(200), source: z.string().max(400), installs: z.number().nonnegative().optional(), skillId: z.string().max(200).optional() })).max(100) }).parse(await this.json(url.toString(), signal));
        const items = data.skills.slice(0, limit).flatMap(item => {
            try {
                const repository = parseRepository(item.source);
                const segments = item.id.split('/');
                const derived = segments.length === 3 && segments.every(segment => segment.length > 0) ? segments[2] : undefined;
                const skillId = item.skillId || derived;
                const safeId = segments.length === 3 && segments.every(segment => /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/.test(segment));
                return [{ id: item.id, name: item.name, ...(skillId ? { skillId } : {}), repository, installs: item.installs ?? 0, url: safeId ? `https://skills.sh/${item.id}` : `https://skills.sh/${repository}/${encodeURIComponent(item.name)}` }];
            }
            catch {
                return [];
            }
        });
        return { query, items };
    }
}
