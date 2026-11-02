import { inflateRawSync } from 'node:zlib';
import { fail, throwIfAborted } from './errors.js';
import { safeRelativePath } from './fs-store.js';
import { finalizeBundle } from './archive.js';
const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index++) {
        let value = index;
        for (let bit = 0; bit < 8; bit++)
            value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
        table[index] = value >>> 0;
    }
    return table;
})();
function crc32(bytes) {
    let value = 0xFFFFFFFF;
    for (const byte of bytes)
        value = CRC_TABLE[(value ^ byte) & 0xFF] ^ (value >>> 8);
    return (value ^ 0xFFFFFFFF) >>> 0;
}
function u16(buffer, offset) { return buffer.readUInt16LE(offset); }
function u32(buffer, offset) { return buffer.readUInt32LE(offset); }
/** Strict in-memory ZIP extraction: only stored/deflated regular files, CRC and size verified. */
export function extractZipBundle(bytes, limits, signal) {
    throwIfAborted(signal);
    const buffer = Buffer.from(bytes);
    if (buffer.length > limits.maxBytes)
        fail('limit', 'Archive exceeds the configured size limit.');
    let eocd = -1;
    for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 65557); offset--) {
        if (u32(buffer, offset) === 0x06054b50) {
            eocd = offset;
            break;
        }
    }
    if (eocd < 0)
        fail('invalid-source', 'The source archive is not a valid ZIP file.');
    const entries = u16(buffer, eocd + 10);
    const directorySize = u32(buffer, eocd + 12);
    const directoryOffset = u32(buffer, eocd + 16);
    if (entries === 0 || entries === 0xffff || directoryOffset === 0xffffffff || directorySize === 0xffffffff)
        fail('invalid-source', 'Empty or ZIP64 archives are not supported.');
    if (directoryOffset + directorySize > buffer.length)
        fail('invalid-source', 'ZIP central directory is truncated.');
    const files = [];
    const seen = new Map();
    let cursor = directoryOffset;
    let totalBytes = 0;
    for (let index = 0; index < entries; index++) {
        throwIfAborted(signal);
        if (u32(buffer, cursor) !== 0x02014b50)
            fail('invalid-source', 'ZIP central directory is malformed.');
        const flags = u16(buffer, cursor + 8);
        const method = u16(buffer, cursor + 10);
        const expectedCrc = u32(buffer, cursor + 16);
        const compressedSize = u32(buffer, cursor + 20);
        const uncompressedSize = u32(buffer, cursor + 24);
        const nameLength = u16(buffer, cursor + 28);
        const extraLength = u16(buffer, cursor + 30);
        const commentLength = u16(buffer, cursor + 32);
        const externalAttributes = u32(buffer, cursor + 38);
        const localOffset = u32(buffer, cursor + 42);
        if (cursor + 46 + nameLength + extraLength + commentLength > buffer.length)
            fail('invalid-source', 'ZIP central directory entry is truncated.');
        const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
        cursor += 46 + nameLength + extraLength + commentLength;
        if (flags & 0x1)
            fail('unsafe-source', 'Encrypted ZIP entries are not supported.');
        if (method !== 0 && method !== 8)
            fail('unsafe-source', 'ZIP entries must use stored or deflated compression.');
        if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff)
            fail('limit', 'ZIP64 entries are not supported.');
        const unixMode = (externalAttributes >>> 16) & 0xFFFF;
        const kind = unixMode & 0o170000;
        const directory = name.endsWith('/') || kind === 0o040000;
        if (!directory && kind !== 0 && kind !== 0o100000)
            fail('unsafe-source', 'ZIP archives may contain only regular files and directories.');
        const normalized = name.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '').replace(/\/+$/, '');
        if (!normalized)
            continue;
        const path = safeRelativePath(normalized);
        const folded = path.normalize('NFC').toLowerCase();
        const previous = seen.get(folded);
        if (previous)
            fail('unsafe-source', 'Archive contains duplicate or normalization-colliding resource paths.');
        seen.set(folded, { path, directory });
        if (directory)
            continue;
        if (files.length >= limits.maxFiles)
            fail('limit', 'Archive contains more files than the configured limit.');
        if (uncompressedSize > limits.maxFileBytes)
            fail('limit', 'Archive entry exceeds the configured file-size limit.');
        totalBytes += uncompressedSize;
        if (totalBytes > limits.maxBytes)
            fail('limit', 'Archive extracts beyond the configured total-size limit.');
        if (localOffset + 30 > buffer.length || u32(buffer, localOffset) !== 0x04034b50)
            fail('invalid-source', 'ZIP local file header is malformed.');
        const dataStart = localOffset + 30 + u16(buffer, localOffset + 26) + u16(buffer, localOffset + 28);
        const dataEnd = dataStart + compressedSize;
        if (dataEnd > buffer.length)
            fail('invalid-source', 'ZIP entry data is truncated.');
        const compressed = buffer.subarray(dataStart, dataEnd);
        let content;
        try {
            content = method === 0 ? Buffer.from(compressed) : inflateRawSync(compressed, { maxOutputLength: limits.maxFileBytes + 1 });
        }
        catch (error) {
            if (error instanceof RangeError || error.code === 'ERR_BUFFER_TOO_LARGE')
                fail('limit', 'ZIP entry expands beyond the configured file-size limit.');
            fail('invalid-source', 'ZIP entry decompression failed.');
        }
        if (content.length !== uncompressedSize)
            fail('invalid-source', 'ZIP entry size does not match its central directory record.');
        if (crc32(content) !== expectedCrc)
            fail('integrity', 'ZIP entry checksum does not match its contents.');
        files.push({ path, bytes: content, executable: (unixMode & 0o111) !== 0 });
    }
    return finalizeBundle(files, limits);
}
