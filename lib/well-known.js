import { createHash } from 'node:crypto';
import { z } from 'zod';
import { extractSkillBundle } from './archive.js';
import { parseSkill } from './skill-metadata.js';
import { fail, throwIfAborted } from './errors.js';
const digestPattern = /^sha256:[0-9a-f]{64}$/;
const indexEntrySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1024).optional(),
    type: z.string().min(1).max(32),
    url: z.string().min(1).max(2048),
    digest: z.string().regex(digestPattern),
}).passthrough();
const indexSchema = z.object({ skills: z.array(z.unknown()) }).passthrough();
function publicHost(hostname) {
    if (!hostname.includes('.') || hostname.startsWith('.') || hostname.endsWith('.'))
        return false;
    if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal'))
        return false;
    if (/^[0-9.]+$/.test(hostname) || hostname.startsWith('['))
        return false;
    return true;
}
/** Accept only a public HTTPS base URL; the catalog path is appended explicitly. */
export function parseWellKnownBase(source) {
    let url;
    try {
        url = new URL(source);
    }
    catch {
        fail('invalid-source', 'Well-known skill sources must be absolute HTTPS URLs.');
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash)
        fail('invalid-source', 'Well-known skill sources must be credential-free HTTPS origins without ports, queries or fragments.');
    if (!publicHost(url.hostname))
        fail('invalid-source', 'Well-known skill sources must be public hostnames, not local or IP-literal addresses.');
    const pathname = url.pathname.replace(/\/+$/, '');
    if (pathname.includes('/.well-known/'))
        fail('invalid-source', 'Record the well-known source base URL, not its catalog path.');
    const baseUrl = `${url.protocol}//${url.host}${pathname}`;
    return { baseUrl, label: `${url.host}${pathname}`, indexUrl: `${baseUrl}/.well-known/agent-skills/index.json` };
}
function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
export class WellKnownSource {
    config;
    doFetch;
    indexes = new Map();
    constructor(config, doFetch = (input, init) => fetch(input, init)) {
        this.config = config;
        this.doFetch = doFetch;
    }
    clear() { this.indexes.clear(); }
    async bytes(url, limit, signal, accept, updateCheck) {
        throwIfAborted(signal);
        const timeout = AbortSignal.timeout(this.config.requestTimeoutMs);
        const response = await this.doFetch(url, {
            signal: AbortSignal.any([signal, timeout]),
            redirect: 'error',
            credentials: 'omit',
            headers: { 'User-Agent': 'skillre-dsh-skills-manager', Accept: accept, ...(updateCheck ? { 'X-Skills-Update-Check': '1' } : {}) },
        });
        if (!response.ok) {
            await response.body?.cancel().catch(() => { });
            if (response.status === 403 || response.status === 429)
                fail('rate-limit', 'The skill source is rate-limited. Wait and retry; this plugin does not read your credentials.');
            if (response.status === 404)
                fail('source-not-found', 'The well-known skill catalog was not found.');
            fail('network', `Skill source returned HTTP ${response.status}.`);
        }
        const declared = Number(response.headers.get('content-length'));
        if (Number.isFinite(declared) && declared > limit) {
            await response.body?.cancel().catch(() => { });
            fail('limit', 'Source response exceeds the configured size limit.');
        }
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
                    fail('limit', 'Source download exceeds the configured size limit.');
                chunks.push(item.value);
            }
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
    async index(baseUrl, signal, updateCheck) {
        const base = parseWellKnownBase(baseUrl);
        let pending = this.indexes.get(base.baseUrl);
        if (!pending) {
            pending = (async () => {
                const bytes = await this.bytes(base.indexUrl, Math.min(this.config.maxBundleBytes, 8 * 1024 * 1024), signal, 'application/json', updateCheck);
                let raw;
                try {
                    raw = JSON.parse(new TextDecoder().decode(bytes));
                }
                catch {
                    fail('source-invalid', 'The well-known skill catalog is not valid JSON.');
                }
                const parsed = indexSchema.safeParse(raw);
                if (!parsed.success)
                    fail('source-invalid', 'The well-known skill catalog does not declare a skills array.');
                const entries = new Map();
                for (const item of parsed.data.skills.slice(0, this.config.maxRepositoryEntries)) {
                    const entry = indexEntrySchema.safeParse(item);
                    if (!entry.success)
                        continue;
                    if (entries.has(entry.data.name))
                        fail('source-invalid', 'The well-known skill catalog lists duplicate skill names.');
                    entries.set(entry.data.name, { name: entry.data.name, ...(entry.data.description ? { description: entry.data.description } : {}), type: entry.data.type, url: entry.data.url, digest: entry.data.digest });
                }
                return entries;
            })();
            this.indexes.set(base.baseUrl, pending);
        }
        return pending;
    }
    async entry(sourceBaseUrl, name, signal, updateCheck) {
        const base = parseWellKnownBase(sourceBaseUrl);
        const index = await this.index(base.baseUrl, signal, updateCheck);
        const entry = index.get(name);
        return entry ? { base, entry } : undefined;
    }
    async catalog(sourceBaseUrl, signal) {
        this.clear();
        const base = parseWellKnownBase(sourceBaseUrl);
        const index = await this.index(base.baseUrl, signal, false);
        const all = [...index.values()].sort((a, b) => a.name.localeCompare(b.name));
        const entries = all.slice(0, this.config.maxSkills).map(entry => ({ name: entry.name, ...(entry.description ? { description: entry.description } : {}), type: entry.type, digest: entry.digest }));
        const warnings = all.length > entries.length ? ['The source lists more skills than the configured maxSkills limit; only the first entries are shown.'] : [];
        if (all.some(entry => entry.type !== 'archive'))
            warnings.push('Only archive entries can be installed from this source; other entries are listed but cannot be installed.');
        return { entries, warnings };
    }
    async digest(sourceBaseUrl, name, signal) {
        return (await this.entry(sourceBaseUrl, name, signal, true))?.entry.digest;
    }
    async download(sourceBaseUrl, name, signal) {
        this.clear();
        const found = await this.entry(sourceBaseUrl, name, signal, false);
        if (!found)
            fail('source-not-found', 'The well-known skill catalog no longer lists this skill.');
        if (found.entry.type !== 'archive')
            fail('unsupported-source', 'Only archive well-known skills can be updated; this catalog uses another artifact type.');
        let archiveUrl;
        try {
            archiveUrl = new URL(found.entry.url, found.base.indexUrl);
        }
        catch {
            fail('invalid-source', 'The well-known catalog declares an invalid skill artifact URL.');
        }
        if (archiveUrl.protocol !== 'https:' || archiveUrl.origin !== new URL(found.base.indexUrl).origin || archiveUrl.username || archiveUrl.password)
            fail('invalid-source', 'Skill artifacts must stay on the same HTTPS origin as their catalog.');
        const bytes = await this.bytes(archiveUrl.href, this.config.maxBundleBytes, signal, 'application/octet-stream', false);
        const digest = `sha256:${sha256(bytes)}`;
        if (digest !== found.entry.digest)
            fail('integrity', 'Downloaded skill archive did not match the catalog digest; no local files were changed.');
        const files = extractSkillBundle(bytes, { maxBytes: this.config.maxBundleBytes, maxFiles: this.config.maxBundleFiles, maxFileBytes: this.config.maxFileBytes }, signal);
        const skillFile = files.find(file => file.path === 'SKILL.md');
        if (!skillFile)
            fail('invalid-source', 'Archive does not contain SKILL.md at its root.');
        const metadata = parseSkill(new TextDecoder().decode(skillFile.bytes));
        if (metadata.name !== name)
            fail('source-changed', 'The upstream skill was renamed. Inspect and install it separately instead of silently replacing this entry.');
        return { name: metadata.name, digest, files };
    }
}
