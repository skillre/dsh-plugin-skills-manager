import type { BundleFile } from './fs-store.js';
import type { ArchiveLimits } from './archive.js';
/** Strict in-memory ZIP extraction: only stored/deflated regular files, CRC and size verified. */
export declare function extractZipBundle(bytes: Uint8Array, limits: ArchiveLimits, signal?: AbortSignal): BundleFile[];
