# Skills Manager — implementation contract

Observed: **2026-11-02**, live Desktop DSH **0.2.1-rc.5**. Runtime versions in the package are rendered from the fleet toolchain snapshot.

## Product boundary

One native Host + React Client bundle; a new `skillre-skills-manager` sidebar icon and the same keyed `main` panel. No replacement shell, iframe, standalone preview, preset overrides, remote publishing, or automatic user-profile installation.

The Host owns local skill files, provenance, bounded public GitHub downloads and reversible changes. The Client owns filter/tab state and explicit confirmations. Network requests happen only after a search, source inspection, or update-check action. Downloaded scripts are **never executed**.

## Minimum discovered DSH contracts

- Client `Slots.listSubTree`: `sidebar.panellist` is a root list, registered with unique `id`, `order`, and localized `label`; its component receives `{size, active}` and the sidebar owns navigation. `main` is root keyed, registered with the matching key, with no Session binding. Both contributions use `ctx.slots.inject` / `register` and belong to their Fiber.
- Client `locale`: `register(namespace, locale, dict)`, `bind(namespace)`, `getSnapshot`, `subscribe`; scoped dictionary disposers and React external-store subscription drive locale changes.
- Theme: only the inspected `--dsw-alias-*` tokens are used for UI colors; literals exist only in the original icon.
- Host `connection.fetch.register({ path: '/api/skillre-skills-manager/execute', methods: ['POST'], requestBody: 'buffered', fetch })`: exact Fetch routes dispatch before Gateway fallback, are owner-only, and are registered/disposed per Fiber. The shared `/api` RPC interceptor stays exclusively owned by DSH API Gateway. The Client still calls `ctx.connection.rpc.call('/api', 'skillre-skills-manager/execute', payload, signal)`; authentication, Host/Origin trust and Desktop shell-carrier dispatch remain Connection-owned.
- Client Connection is NOT catalogued by the current Inspect Provider (explicit query failed). The current package README and published rc.3 `lib/types/rpc.d.ts` establish `ctx.connection.rpc.call(channel,endpoint,payload,signal?) -> Promise<{ok,value}|{ok:false,error}>`. This is a generic Connection extension, not fabricated Typert metadata or an Inspect method invoked as a business service. Its use is tested through the real carrier.
- Host optional `workspaceRegistry.list()` exposes `{id,path,title}`; only registered workspace IDs may select project roots. The nearest `.git` ancestor matches the queried filesystem provider's project-root semantics.
- Host optional `skills.list/get` supply read-only registry entries. Physical entries are listed independently so shadowed/invalid local skills remain manageable; registry-only and configured bundled/custom entries remain read-only.
- Host optional `tools.register` exposes the SAME core operations to Agents. Mutations require an exact logged `approval.request` grant; no model parameter grants authority. Missing approval fails closed. All registrations and pending work drain on unload.

## Filesystem and integrity boundaries

Editable roots: user DSH and user `.agents` skill roots, and a selected registered workspace's `.dsh/skills` / `.agents/skills`. Custom and bundled roots are read-only. `includeDefaultRoots:false` and explicit test homes isolate integration tests.

No request supplies an arbitrary filesystem path. Entry IDs are resolved against freshly derived roots. `.system`, plugin state, root symlinks, external skill symlinks, path traversal, device files, and remote symlinks/submodules are protected. GitHub sources must be public `owner/repo` (or equivalent HTTPS GitHub URL); immutable commit and tree/blob hashes pin the inspected source. Bounded raw-file downloads are verified against Git blob IDs.

Updates and removal recheck a complete local fingerprint from the confirmation preview, serialize per root with a disk lock, and preserve the previous entry in root-local backups. A changed local baseline refuses update unless explicitly selected for backup-and-replacement. Install never overwrites an existing entry. Restore refuses collisions. Staging, mutation journal and recovery paths stay on the same filesystem. Corrupt state or an unfinished transaction fails loudly rather than inventing empty state. Files are synced before metadata publication, but directories are not fsynced: this is process-failure/cancellation protection, not a tested power-loss durability guarantee.

The filesystem fence rejects static symlinks and traversal and serializes cooperating writers. Native Node path I/O does not supply a portable `openat`/dirfd fence: a hostile process running as the SAME OS user can race ancestor replacement or modify the plugin itself. Do not run other installers/editors against the same root during a mutation; this is not a defense against same-user hostile filesystem races. File restore uses atomic hard-link no-replace publication, and directory publication exclusively reserves its final name before replacing only its verified empty reservation.

The plugin owns `.skills-manager` state under each editable skill root. It reads supported global Skills CLI v3 `.skill-lock.json` provenance for two source kinds: GitHub (immutable commit + skill folder tree hash) and well-known HTTPS catalogs (base URL + `sha256` artifact digest from `.well-known/agent-skills/index.json`). It does not rewrite that third-party lock or other agents' installations. Other source types are shown with their recorded origin label but reported as untracked, not up-to-date. No timer auto-updates skills.

Well-known updates fetch the catalog index, compare the digest, download the archive only from the catalog's own HTTPS origin, verify its `sha256`, and extract it with a strict in-memory tar.gz parser before the same fingerprint/lock/journal/backup transaction used for GitHub updates. Links, devices, traversal, duplicate or normalization-colliding paths, and size/file-count overruns fail closed; downloaded content is never executed.

Additional bounded operations share those primitives: batch updates re-verify each skill and keep per-item outcomes; backups record size/file count and can be purged individually or keeping the newest N; move/rename republishes verified files into a writable root and backs the source entry up (rename uses an atomic same-root `rename` transaction); permanent removal uses a journaled staged rename; local archive install accepts only strict `.tar.gz`/`.tgz`/`.zip` bundles parsed in memory; well-known catalog install reuses the digest-verified archive path; restore-to crosses roots by publishing verified backup content and then purging the source backup; diff downloads the remote revision/archive and compares it byte-for-byte with the local snapshot without writing. Client requests never supply a filesystem path except the authenticated owner's explicit local-archive path, which must be absolute, regular and bounded.

## Verification and handoff

Run local behavior/security/lifecycle tests, check declarations and real packed resources, install the tarball in a NEW owned non-desktop profile using the packaged current CLI, inspect composition, positively check RPC activation and bounded startup, then await owned-process shutdown and verify test-home removal in `finally`.

Real current-profile visual testing requires separate user consent, baseline inventory and reversible cleanup. An install or Slot registration alone is not visual acceptance. Hand off the absolute `.tgz` for the USER's Plugins → Add plugin action; do not publish or leave a development installation in their profile.
