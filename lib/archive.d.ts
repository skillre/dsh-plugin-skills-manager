import type { BundleFile } from './fs-store.js';
export interface ArchiveLimits {
    maxBytes: number;
    maxFiles: number;
    maxFileBytes: number;
}
/**
 * Strictly parse a gzip-compressed tar archive in memory. Only regular files
 * and directories are accepted; links, devices and unknown entry types fail
 * closed. The returned bundle is normalized so SKILL.md sits at its root.
 */
export declare function extractSkillBundle(bytes: Uint8Array, limits: ArchiveLimits, signal?: AbortSignal): BundleFile[];
/**
 * Parse a GitHub commit tarball into every regular file it contains. Unlike
 * skill-bundle extraction this tolerates unrelated files, symlinks and large
 * assets outside the selected skill; regular files above maxFileBytes are
 * skipped and the caller verifies only the tree-selected files.
 */
export declare function extractRepositoryFiles(bytes: Uint8Array, limits: ArchiveLimits, signal?: AbortSignal): BundleFile[];
/** Normalize an extracted archive to a skill bundle rooted at SKILL.md. */
export declare function finalizeBundle(files: BundleFile[], limits: ArchiveLimits): BundleFile[];
