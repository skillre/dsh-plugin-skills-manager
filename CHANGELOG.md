# Changelog

## 0.1.7 — installed skill details (local build)

- Every installed-skill card now has an explicit **Details** action and the card body is clickable, so the detail dialog no longer depends on finding the small skill name link.
- The detail dialog now shows an **update status** badge with the last check time, the skill's **absolute path with a copy button**, and a full **resource inventory** for read-only skills too (bundled/custom locations are listed when readable; unreadable linked entries stay content-only instead of failing).
- The detail dialog title names the skill and its actions are labelled by intent: **Check** when no update is known, **Update** when one is available.
- Add the matching zh/en labels and a regression test for read-only details (66 tests total); rebuild the committed `lib/`.

No npm publication or user-profile change is included; the GitHub source repository and Release asset are updated in the same user-authorized GitHub flow.

## 0.1.6 — one header entry for update checks (local build)

- Remove the ambiguous second refresh button from the page header: the header now offers a single **Check updates** action.
- Move the local-only rescan button into the list toolbar (Installed and Updates tabs) and the Backups toolbar. Its tooltip states that it only re-reads local directories and never contacts remote sources; in the Backups tab it only reloads backup records.
- Add the matching zh/en labels and README usage notes explaining the difference between rescan and Check updates.
- Rebuild and commit `lib/`.

No npm publication or user-profile change is included; the GitHub source repository and Release asset are updated in the same user-authorized GitHub flow.

## 0.1.5 — large skill support (local build)

- Raise the default bundle limits to real-world sizes (`maxBundleFiles` 20,000, `maxBundleBytes` 100 MiB, `operationTimeoutMs` 300 s); the schemas allow `maxBundleFiles` up to 50,000.
- GitHub skills with more than 64 files are now fetched as one commit-pinned `codeload` tarball and parsed in memory, with every selected file still verified against its Git blob SHA and the complete folder tree; this replaces thousands of per-file requests for asset-heavy skills (e.g. `ppt-master`, 13k files).
- Use the same longer operation timeout for well-known archive downloads.
- Limit failures now name the exact configured limit and which `maxBundleFiles`/`maxBundleBytes` setting to raise.
- Real-world verification: `tt-a1i/archify` (206 files) and `hugohe3/ppt-master` (13,051 files, 39.5 MB) downloaded and verified through the new archive path; 65 tests pass.
- Rebuild and commit `lib/`.

No npm publication or user-profile change is included; the GitHub source repository and Release asset are updated in the same user-authorized GitHub flow.

## 0.1.4 — update and backup usability fixes (local build)

- Keep the cached update results of all other skills after an update, install, removal, move or restore, so the Updates tab no longer empties and the remaining updates stay visible without running the check again.
- Mark a successfully updated or freshly installed skill as up to date instead of "not checked".
- Show the Update all action in the page header whenever updates are known, in addition to the Updates tab, so batch updates are discoverable from any view.
- Explain why and where updates/removals are backed up (`.skills-manager/backups/<id>/content` under each skill location), display each backup path, and add a labelled Delete backup action next to Restore; the update dialog now names the backup location and the restore/delete path.
- List failed skill names in the batch-update result notice.
- Add a regression test for preserved update results (64 tests total); rebuild the committed `lib/` output.

No npm publication or user-profile change is included; the GitHub source repository and Release asset are updated in the same user-authorized GitHub flow.

## 0.1.3 — batch operations, backup management and wider install sources (local build)

- Batch-update all checked skills (`update-batch`): each item is re-verified against its source, previous versions are backed up, locally modified skills are skipped unless explicitly allowed, and the result reports updated/skipped/failed per skill.
- Backup management: backups record size/file count, individual backups can be purged, and a location can be cleaned while keeping the newest N. Backups remain manual-only by default.
- Move/rename (`move`): move a skill to another writable root (copy-verify-publish then back up the source) or rename its directory within a root, without overwriting existing entries.
- Permanent removal option for `remove`: explicit, second-factor confirmation deletes the files without a restorable backup.
- File-level update diff (`diff`): compare local files with the remote revision/archive before confirming an update; the update dialog shows added/removed/changed/unchanged files.
- Wider install sources: local `.tar.gz`/`.tgz`/`.zip` archives (strict in-memory parsing, never executed) and well-known HTTPS catalogs (digest-verified archive install from `well-known-inspect`), plus cross-root `restore-to` for backups.
- Add management regression tests (batch, purge, permanent removal, move, local install, well-known install, restore-to, diff). Upgrade from 0.1.2 in place; 0.1.0 remains withdrawn.
- Publish the source repository and the verified tarball as GitHub Release `v0.1.3`; README now links the Release asset. Dependabot version updates are disabled for this repository.
- Commit `lib/` so the repository URL can be installed directly through DSH Plugins without pnpm build-script approval; CI verifies committed build output matches `src/`.

No npm publication or user-profile change is included; the GitHub source repository and the GitHub Release asset are published. Real Web/Electron visual/restart acceptance remains user-owned.

## 0.1.2 — well-known provenance and clearer check summaries (local build)

- Track skills installed by the Skills CLI from well-known HTTPS catalogs (`sourceBaseUrl` + `.well-known/agent-skills/index.json`): compare the catalog's `sha256` artifact digest, report updates and update in place with a backup. GitHub provenance remains commit/tree-hash pinned.
- Download a well-known skill archive only from the catalog's own HTTPS origin, verify its `sha256` digest, and extract it with a strict in-memory tar parser that rejects links, devices, traversal, duplicate/collision paths and size/file-count overruns before any local change.
- Show externally recorded origins (`open.feishu.cn`, other Skills CLI source types) on untracked skills instead of a generic label. Unsupported entries remain untracked and are never claimed as up to date.
- Include the up-to-date count in the check summary so the reported numbers account for every checked skill.
- Add archive-extraction, well-known check/update/error, digest-mismatch, rename and origin-label regressions (7 new tests).
- Upgrade from 0.1.1 in place; 0.1.0 remains withdrawn and is not a rollback target.

No npm publication or user-profile change is included; the GitHub source repository and the GitHub Release asset are published. Real Web/Electron visual/restart acceptance remains user-owned.

## 0.1.1 — API Gateway coexistence fix (local build)

- Replace the shared `/api` RPC interceptor with the exact buffered POST Fetch route `/api/skillre-skills-manager/execute`; preserve the existing Client RPC path and result envelope.
- Keep DSH Gateway ownership, Connection authentication/owner-only dispatch and Desktop shell-carrier compatibility without another server.
- Add real current-DSH ConnectionRegistry tests for both registration orders, method/envelope validation, non-owner rejection, request cancellation and Fiber withdrawal that preserves Gateway.
- Extend packed isolated-profile verification to real `settings/describe` and Desktop welcome `llm/listConfigurableProviders`, before and after uninstall, plus every packed file's bytes and the original strict owned close/ESRCH/ENOENT cleanup proof.
- Keep the skill/filesystem/GitHub business core unchanged; Client source adjustments are type-only Host/Client realm separation.
- Withdraw 0.1.0 as an installation/rollback target after its Desktop startup failure. Preserve the historical tarball as evidence, never overwrite it.

No npm publication or user-profile change is included; the GitHub source repository and the GitHub Release asset are published. Real Web/Electron visual/restart acceptance remains user-owned.

## 0.1.0 — initial local build (withdrawn; unsafe to install)

- Add a native Skills sidebar page with installed, discovery, update and backup views.
- Add bounded public GitHub inspection/download and skills.sh search.
- Add provenance-aware update checks, safe installation, fingerprint-checked updates/removal and reversible backups.
- Expose the same operations through an approval-gated Agent tool.
- Add strict path/metadata/integrity, real-filesystem, native Cordis Fiber and cancellation regressions.
- Include English/Chinese display metadata, original icon and a packed-profile verification runner.

This build has not been published to npm or pushed to GitHub. Actual browser/Electron visual acceptance remains user-deferred; compatibility evidence records only checks actually performed.
