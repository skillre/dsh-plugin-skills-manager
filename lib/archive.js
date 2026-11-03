import { gunzipSync } from 'node:zlib';
import { fail, throwIfAborted } from './errors.js';
import { safeRelativePath } from './fs-store.js';
const BLOCK = 512;
const decoder = new TextDecoder();
function field(block, start, length) {
    const slice = block.subarray(start, start + length);
    const end = slice.indexOf(0);
    return (end < 0 ? slice : slice.subarray(0, end)).toString('utf8');
}
function octal(block, start, length, label) {
    const raw = block.subarray(start, start + length).toString('utf8').replace(/\0.*$/, '').trim();
    if (!raw)
        return 0;
    if (!/^[0-7]+$/.test(raw))
        fail('invalid-source', `Archive has an invalid ${label} field.`);
    return Number.parseInt(raw, 8);
}
function checksum(block) {
    const declared = octal(block, 148, 8, 'checksum');
    let total = 0;
    for (let index = 0; index < BLOCK; index++)
        total += index >= 148 && index < 156 ? 32 : block[index];
    if (declared !== total)
        fail('invalid-source', 'Archive header checksum does not match its contents.');
}
function paxPath(data) {
    let offset = 0;
    let path;
    while (offset < data.length) {
        const space = data.indexOf(0x20, offset);
        if (space < 0)
            break;
        const length = Number.parseInt(data.subarray(offset, space).toString('utf8'), 10);
        if (!Number.isFinite(length) || length <= 0 || offset + length > data.length)
            fail('invalid-source', 'Archive has a malformed extended header.');
        const record = data.subarray(space + 1, offset + length - 1).toString('utf8');
        const equals = record.indexOf('=');
        if (equals > 0) {
            const key = record.slice(0, equals);
            const value = record.slice(equals + 1);
            if (key === 'path')
                path = value;
            if (key === 'linkpath' && value)
                fail('unsafe-source', 'Archive extended headers must not declare links.');
        }
        offset += length;
    }
    return path;
}
function normalize(path) {
    const value = path.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '').replace(/\/+$/, '');
    if (!value)
        fail('unsafe-source', 'Archive contains an empty resource path.');
    return safeRelativePath(value);
}
/**
 * Strictly parse a gzip-compressed tar archive in memory. Only regular files
 * and directories are accepted; links, devices and unknown entry types fail
 * closed. The returned bundle is normalized so SKILL.md sits at its root.
 */
export function extractSkillBundle(bytes, limits, signal) {
    throwIfAborted(signal);
    let tar;
    try {
        tar = gunzipSync(Buffer.from(bytes), { maxOutputLength: limits.maxBytes + 1 });
    }
    catch (error) {
        if (error instanceof RangeError || error.code === 'ERR_BUFFER_TOO_LARGE')
            fail('limit', 'Archive expands beyond the configured size limit.');
        fail('invalid-source', 'The source archive is not a valid gzip-compressed tar file.');
    }
    if (tar.length > limits.maxBytes)
        fail('limit', 'Archive expands beyond the configured size limit.');
    const files = [];
    const seen = new Map();
    let offset = 0;
    let entries = 0;
    let totalBytes = 0;
    let longName;
    let extendedPath;
    let ended = false;
    while (offset + BLOCK <= tar.length) {
        throwIfAborted(signal);
        const header = tar.subarray(offset, offset + BLOCK);
        if (header.every(byte => byte === 0)) {
            ended = true;
            break;
        }
        checksum(header);
        const type = String.fromCharCode(header[156] ?? 0);
        const size = octal(header, 124, 12, 'size');
        if ((header[124] ?? 0) & 0x80)
            fail('invalid-source', 'Archive uses an unsupported base-256 size field.');
        if (size > limits.maxFileBytes && type !== 'x' && type !== 'g' && type !== 'L' && type !== 'K')
            fail('limit', `Archive entry exceeds the configured file-size limit (maxFileBytes=${limits.maxFileBytes}).`);
        const dataStart = offset + BLOCK;
        const dataEnd = dataStart + size;
        if (dataEnd > tar.length)
            fail('invalid-source', 'Archive entry is truncated.');
        const data = tar.subarray(dataStart, dataEnd);
        offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;
        if (++entries > limits.maxFiles * 4 + 8)
            fail('limit', 'Archive contains too many entries.');
        if (type === 'L') {
            longName = decoder.decode(data).replace(/\0+$/, '');
            continue;
        }
        if (type === 'K')
            fail('unsafe-source', 'Archive long-link entries are not supported.');
        if (type === 'x') {
            extendedPath = paxPath(data) ?? extendedPath;
            continue;
        }
        if (type === 'g')
            continue;
        if (type !== '0' && type !== '\0' && type !== '5')
            fail('unsafe-source', 'Archive contains links, devices or other unsupported entry types.');
        const shortName = field(header, 0, 100);
        const prefix = field(header, 345, 155);
        const overridden = extendedPath ?? longName;
        extendedPath = undefined;
        longName = undefined;
        const directory = type === '5';
        const raw = overridden ?? (prefix ? `${prefix}/${shortName}` : shortName);
        const rootEntry = directory && /^(?:\.\/+)?$/.test(raw);
        if (rootEntry)
            continue;
        const path = normalize(raw);
        const folded = path.normalize('NFC').toLowerCase();
        const previous = seen.get(folded);
        if (previous && (previous.path !== path || previous.directory !== directory))
            fail('unsafe-source', 'Archive contains duplicate or normalization-colliding resource paths.');
        if (previous)
            fail('unsafe-source', 'Archive contains a duplicate resource path.');
        seen.set(folded, { path, directory });
        if (directory)
            continue;
        totalBytes += size;
        if (totalBytes > limits.maxBytes)
            fail('limit', `Archive extracts beyond the configured total-size limit (maxBundleBytes=${limits.maxBytes}).`);
        if (files.length >= limits.maxFiles)
            fail('limit', `Archive contains more files than the configured file-count limit (maxBundleFiles=${limits.maxFiles}). Raise maxBundleFiles in the plugin configuration if you trust this source.`);
        const mode = octal(header, 100, 8, 'mode');
        files.push({ path, bytes: Buffer.from(data), executable: (mode & 0o111) !== 0 });
    }
    if (!ended)
        fail('invalid-source', 'Archive is truncated and has no end-of-archive marker.');
    return finalizeBundle(files, limits);
}
function repositoryPath(raw) {
    const value = raw.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '').replace(/\/+$/, '');
    if (!value)
        return undefined;
    if (value.startsWith('/') || /[\x00-\x1f\x7f]/.test(value))
        fail('unsafe-source', 'Repository archive has an unsafe resource path.');
    const segments = value.split('/');
    if (segments.some(segment => !segment || segment === '.' || segment === '..'))
        fail('unsafe-source', 'Repository archive has path traversal segments.');
    return value;
}
/**
 * Parse a GitHub commit tarball into every regular file it contains. Unlike
 * skill-bundle extraction this tolerates unrelated files, symlinks and large
 * assets outside the selected skill; regular files above maxFileBytes are
 * skipped and the caller verifies only the tree-selected files.
 */
export function extractRepositoryFiles(bytes, limits, signal) {
    throwIfAborted(signal);
    let tar;
    try {
        tar = gunzipSync(Buffer.from(bytes), { maxOutputLength: limits.maxBytes + 1 });
    }
    catch (error) {
        if (error instanceof RangeError || error.code === 'ERR_BUFFER_TOO_LARGE')
            fail('limit', 'Repository archive expands beyond the configured size limit.');
        fail('invalid-source', 'The repository archive is not a valid gzip-compressed tar file.');
    }
    const files = [];
    const seen = new Set();
    let offset = 0;
    let totalBytes = 0;
    let longName;
    let extendedPath;
    let ended = false;
    while (offset + BLOCK <= tar.length) {
        throwIfAborted(signal);
        const header = tar.subarray(offset, offset + BLOCK);
        if (header.every(byte => byte === 0)) {
            ended = true;
            break;
        }
        checksum(header);
        const type = String.fromCharCode(header[156] ?? 0);
        const size = octal(header, 124, 12, 'size');
        if ((header[124] ?? 0) & 0x80)
            fail('invalid-source', 'Repository archive uses an unsupported base-256 size field.');
        const dataStart = offset + BLOCK;
        const dataEnd = dataStart + size;
        if (dataEnd > tar.length)
            fail('invalid-source', 'Repository archive entry is truncated.');
        const data = tar.subarray(dataStart, dataEnd);
        offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;
        if (type === 'L') {
            longName = decoder.decode(data).replace(/\0+$/, '');
            continue;
        }
        if (type === 'x') {
            extendedPath = paxPath(data) ?? extendedPath;
            continue;
        }
        if (type === 'g' || type === 'K')
            continue;
        if (type !== '0' && type !== '\0' && type !== '5') {
            extendedPath = undefined;
            longName = undefined;
            continue;
        }
        const shortName = field(header, 0, 100);
        const prefix = field(header, 345, 155);
        const overridden = extendedPath ?? longName;
        extendedPath = undefined;
        longName = undefined;
        const raw = overridden ?? (prefix ? `${prefix}/${shortName}` : shortName);
        const path = repositoryPath(raw);
        if (!path)
            continue;
        if (type === '5')
            continue;
        if (size > limits.maxFileBytes)
            continue;
        const folded = path.normalize('NFC');
        if (seen.has(folded))
            fail('unsafe-source', 'Repository archive contains duplicate resource paths.');
        seen.add(folded);
        totalBytes += size;
        if (totalBytes > limits.maxBytes)
            fail('limit', 'Repository archive expands beyond the configured total-size limit.');
        if (files.length >= limits.maxFiles)
            fail('limit', `Repository archive contains more files than the configured file-count limit (${limits.maxFiles}). Raise maxBundleFiles if you trust this repository.`);
        files.push({ path, bytes: Buffer.from(data), executable: (octal(header, 100, 8, 'mode') & 0o111) !== 0 });
    }
    if (!ended)
        fail('invalid-source', 'Repository archive is truncated and has no end-of-archive marker.');
    return files;
}
/** Normalize an extracted archive to a skill bundle rooted at SKILL.md. */
export function finalizeBundle(files, limits) {
    if (files.length === 0)
        fail('invalid-source', 'Archive contains no skill files.');
    if (files.length > limits.maxFiles)
        fail('limit', `Archive contains more files than the configured file-count limit (maxBundleFiles=${limits.maxFiles}).`);
    if (files.some(file => file.bytes.length > limits.maxFileBytes))
        fail('limit', 'Archive entry exceeds the configured file-size limit.');
    if (files.reduce((sum, file) => sum + file.bytes.length, 0) > limits.maxBytes)
        fail('limit', `Archive extracts beyond the configured total-size limit (maxBundleBytes=${limits.maxBytes}).`);
    const root = files.find(file => file.path === 'SKILL.md');
    if (root)
        return files;
    const wrapper = files.every(file => file.path.split('/').length >= 2) ? files[0].path.split('/')[0] : undefined;
    if (!wrapper || !files.some(file => file.path === `${wrapper}/SKILL.md`))
        fail('invalid-source', 'Archive does not contain SKILL.md at its root.');
    if (!files.every(file => file.path.startsWith(`${wrapper}/`)))
        fail('invalid-source', 'Archive mixes files from multiple roots.');
    const stripped = files.map(file => ({ ...file, path: file.path.slice(wrapper.length + 1) }));
    if (!stripped.some(file => file.path === 'SKILL.md'))
        fail('invalid-source', 'Archive does not contain SKILL.md at its root.');
    return stripped;
}
