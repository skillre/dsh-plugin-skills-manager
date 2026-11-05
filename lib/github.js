import { posix } from 'node:path';
import { z } from 'zod';
import { gitBlobHash, gitTreeHash, safeRelativePath } from './fs-store.js';
import { extractRepositoryFiles } from './archive.js';
import { fail, throwIfAborted } from './errors.js';
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
export class GitHubSource {
    config;
    doFetch;
    immutableTrees = new Map();
    constructor(config, doFetch = (input, init) => fetch(input, init)) {
        this.config = config;
        this.doFetch = doFetch;
    }
    clear() { this.immutableTrees.clear(); }
    async bytes(url, limit, signal, github = false, redirect = 'error', timeoutMs = this.config.requestTimeoutMs, onBytes) {
        throwIfAborted(signal);
        const timeout = AbortSignal.timeout(timeoutMs);
        const response = await this.doFetch(url, { signal: AbortSignal.any([signal, timeout]), redirect, credentials: 'omit', headers: { 'User-Agent': 'skillre-dsh-skills-manager', ...(github ? { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } : {}) } });
        if (!response.ok) {
            await response.body?.cancel().catch(() => { });
            if (response.status === 403 || response.status === 429)
                fail('rate-limit', 'The public skill source is rate-limited. Wait and retry; this plugin does not read your GitHub credentials.');
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
        const bytes = await this.bytes(url, Math.min(this.config.maxBundleBytes, 16 * 1024 * 1024), signal, true);
        try {
            return JSON.parse(new TextDecoder().decode(bytes));
        }
        catch {
            fail('source-invalid', 'Skill source did not return valid JSON.');
        }
    }
    async tree(source, ref, signal, pinnedCommit) {
        const repository = parseRepository(source);
        const requestedRef = parseRef(ref);
        if (pinnedCommit && !sha.safeParse(pinnedCommit).success)
            fail('invalid-source', 'An inspected immutable commit is required.');
        const cacheKey = `${repository}@${pinnedCommit ?? ''}`;
        if (pinnedCommit && this.immutableTrees.has(cacheKey))
            return { ...this.immutableTrees.get(cacheKey), ref: requestedRef };
        const data = z.object({ sha, commit: z.object({ tree: z.object({ sha }) }) }).parse(await this.json(`https://api.github.com/repos/${repository}/commits/${encodeURIComponent(pinnedCommit ?? requestedRef)}`, signal));
        if (pinnedCommit && data.sha !== pinnedCommit)
            fail('source-invalid', 'GitHub resolved a different commit from the inspected revision.');
        const tree = z.object({ sha, truncated: z.boolean().optional(), tree: z.array(nodeSchema).max(this.config.maxRepositoryEntries) }).parse(await this.json(`https://api.github.com/repos/${repository}/git/trees/${data.commit.tree.sha}?recursive=1`, signal));
        if (tree.truncated)
            fail('repository-limit', 'GitHub truncated this repository tree. Choose a smaller skills repository; an incomplete tree cannot establish update status.');
        if (tree.sha !== data.commit.tree.sha)
            fail('source-invalid', 'Repository tree hash did not match its immutable commit.');
        const result = { repository, ref: requestedRef, commit: data.sha, rootHash: tree.sha, tree: tree.tree };
        if (this.immutableTrees.size >= 20)
            this.immutableTrees.delete(this.immutableTrees.keys().next().value);
        this.immutableTrees.set(`${repository}@${data.sha}`, result);
        return result;
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
        const tree = await this.tree(source, ref, signal);
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
        const data = z.object({ skills: z.array(z.object({ id: z.string().max(500), name: z.string().max(200), source: z.string().max(400), installs: z.number().nonnegative().optional() })).max(100) }).parse(await this.json(url.toString(), signal));
        const items = data.skills.slice(0, limit).flatMap(item => {
            try {
                const repository = parseRepository(item.source);
                return [{ id: item.id, name: item.name, repository, installs: item.installs ?? 0, url: `https://skills.sh/${repository}/${encodeURIComponent(item.name)}` }];
            }
            catch {
                return [];
            }
        });
        return { query, items };
    }
}
