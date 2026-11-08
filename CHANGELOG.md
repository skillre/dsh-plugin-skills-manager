# Changelog

## 0.5.1 — install reveal, card accessibility and a stricter filter check

- **A reviewed repository install now refreshes the catalog before revealing the new skill.** `InstallDialog`'s success path called `onMutated()` but skipped the `onSettled()` reload that every other mutation dialog already performs, so the page switched to Installed and filtered to the installed name against a stale catalog — showing the no-matches empty state until a manual rescan. The dialog now reloads in its `finally` block like the other flows.
- **Skill cards expose their real contents to assistive technology.** The card content button no longer carries an overriding `aria-label`, so the status tag, description and location chips are part of the accessible name, and the check-error live region moved outside the button (a `role=status` inside a button is presentational). The card clips its children, so the content button's keyboard focus ring is now drawn inset and stays visible.
- **The overview filters are consistent.** The updates number card clears the location filter as well (its count is global, so a stale location filter could hide every update), and the read-only/updates/installed cards reset the view the same way.
- **The real-UI check proves the filtering, not just the chip.** `verify-hot-reenable.mjs` seeds a writable skill and a linked read-only skill, then asserts: the read-only card reduces the list to the linked entry only, clearing the chip restores both cards, and the updates/installed cards switch the tab and pressed state. The left-rail guard counts the new `技能管理 / Skills Manager` label too.
- `package-lock.json` re-synced to 0.5.1; README evidence names now match the compatibility checks (`web-ui-settings-page`).
- Verified on DSH 0.2.2-rc.1 (cordis 4.1.0): 88 tests, the display-contract check, an isolated packed mount and the extended real DSH Web page run (23 checks) including the stronger filter assertions. A manual repository-install run in the owned Web profile confirmed the installed skill appears immediately after the dialog closes. Bump to 0.5.1.

## 0.5.0 — one Settings design language, and the count cards are real filters

- **The page now speaks the host's Settings design language.** The custom surface (pill-shaped stat chips, bordered footer note, dashed empty box, ad-hoc buttons) is gone. The manager uses the running DSH build's own Settings tokens and metrics instead: `--dsw-alias-settings-card-fill/-stroke` cards with `--dsw-radius-xl`, an 18px/600 heading, 13px/20px tertiary intro, underline tabs on `--dsw-alias-border-l2`, native 36/28px buttons, 32px inputs with the inline search icon, the host focus ring, and dialogs that follow the host dialog contract (panel radius, layer-2 surface, prominent elevation, 16px/500 title, 24px gutters). The navigation label is now the page heading — **技能管理 / Skills Manager** in both places, where it used to say 技能 / Skills in the rail and 技能管理 / Skills Manager on the page.
- **The three number cards are clickable view filters.** `已发现技能 / Discovered skills`, `可用更新 / Updates available` and `只读技能 / Read-only` render as real `<button>` cards with `aria-pressed`, hover/active/focus states, and they switch the view: all skills, the updates tab, or the installed list narrowed to read-only entries. The read-only filter shows a removable chip so the state is never hidden, and the bar drops back to "all" on one click. The active card also tells you which view you are looking at.
- **Cards are rebuilt as one clickable content block plus a quiet action footer.** The skill name/description/meta block opens the detail dialog; `查看详情 / 更新 / 删除` are native link buttons in the footer instead of icon buttons floating over the card, so no interactive control is nested inside another. Status tags, code-style identity chips, job item cards, the discover results and the backup rows all reuse the same card contract.
- **Tabs behave like the host Settings tabs**: roving tab focus with ArrowLeft/ArrowRight/Home/End, `aria-controls`/`aria-labelledby` wiring, and the host underline instead of a count pill row. The header keeps three native actions (check updates, local archive, install from repository); the running-job progress moved to a slim status line above the tabs and the updates tab owns the batch update action.
- **A calm empty state instead of a dashed box**: title/description text plus a full-width dashed `从仓库安装 / Install from repository` button, matching the host's "add provider/plugin" pattern. The safety note is now a plain hint line, and the page no longer renders its own border, footer or extra title.
- **Preview banner and detail page stay honest**: both previews now show the unified page (技能管理 rail entry, clickable number cards, full tab labels) and the DETAIL alt text describes the new surface. `npm run preview:check` still passes with 0 warnings.
- Verified on DSH 0.2.2-rc.1 (cordis 4.1.0) with the complete 88-test suite, the packed-package mount checks, and a real DSH Web page run that now also asserts the heading repeats the rail label, the host Settings typography/card radius/hairline border, three clickable overview buttons, and filter + clear behaviour (`web-ui-settings-unified`, `web-ui-overview-tiles`, with screenshots recorded as evidence). Bump to 0.5.0.

0.5.0 is now published on npm as `@skillre/dsh-plugin-skills-manager@0.5.0` through the reviewed OIDC workflow (workflow run 42491291002; registry integrity `sha512-0jiG42ajgu1udIeeznncoDYmPV7Dznpjji1KTJlt484xNSKm2DTUBDT7G1HjjD/WcE2mVBXAR1v4Qq0fMISpHw==`; the GitHub Release asset is byte-identical to the registry tarball). The user's market index lists 0.5.0 from npm.

## 0.4.0 — the detail page is a picture (display contract)

- **The plugin detail page is now one preview image, not a manual.** `locale/en.json` and `locale/zh.json` gained `meta.detail` pointing at `docs/DETAIL.md` / `docs/DETAIL.zh.md`, and each DETAIL document contains exactly one image reference. DSH no longer falls back to the README for the detail page; the README stays the full developer document (install, configuration, permissions, rollback, evidence).
- **Bilingual 640×300 preview banners** (`docs/preview.svg`, `docs/preview.zh.svg`) show the real product moment: the Skills page inside DSH Settings with its tabs, discovered/updates/read-only counts and installed-skill cards with latest/update badges, beside the search → review → install loop and the "Settings › Skills, no extra left-rail button" inset. They use one restrained accent palette, text as `<text>` (no outlined glyphs), no external references and only the SVG elements the Feishu whiteboard parser keeps editable.
- **`docs/PREVIEW.md` records the whiteboard workflow** (one board per language) and `scripts/preview.mjs` provides the offline `check` plus `push`/`pull` round-trip. `npm run check` now starts with `npm run preview:check`, which validates the 640×300 ratio, the allowed element set, alt text and the `meta.detail` target; the current banners are hand-authored until the boards exist.
- **`package.json#files` now ships `docs`**, so the image and DETAIL documents reach the installed package — without them the detail page is blank with no error anywhere.
- Verified: preview check with 0 warnings, the full 88-test suite, an isolated packed mount of the final tarball and a real DSH Web page check that opens the plugin detail page and asserts the shipped banner renders at the 640×300 ratio (`web-ui-detail-preview-image`). Bump to 0.4.0.

## 0.3.0 — Settings section and a search-to-install flow that finishes (local build)

- **The manager moved into Settings.** The DSH left rail no longer gains a「技能」panel icon and there is no `main` panel entry any more: the plugin registers one `settings.section` row (with its own `settings.section.icon`) so every skill operation lives behind the Settings seat that DSH already owns. The page keeps all five tabs, the workspace/location scope, filters, dialogs, job polling and backup management.
- **Search results become a full review in one step.** Choosing a hit in Discover now inspects the repository and opens the matching skill's review automatically — resolved by declared name, upstream skill id or skill folder — instead of leaving the user on an empty "Inspect repository" form. The review dialog shows the three-step flow (source → skill → review & install), filters long repository lists, and names the missing skill when the repository does not contain it.
- **Installation no longer dead-ends on a name collision.** The review step compares the target location with the installed catalog: the same source offers a one-click update of the installed skill (refusing to silently replace local modifications), another source explains that DSH resolves one skill per name and links to the installed entry, and a directory-only collision offers an explicit directory name that the Host now accepts on `install`.
- **A finished install is immediately visible**: after install, the page switches to the Installed tab and filters to the new skill name, so a successful install can never look like a no-op.
- **Rate limits stop blocking discovery and installation.** Repository resolution and trees are now reused briefly for discovery, immutable trees are cached by commit, and an exhausted GitHub budget reports the reset clock time plus the `githubTokenEnv` remedy instead of a dead end. Update checks and updates still always re-resolve the named ref, so a moved branch is observed.
- **Zero-API archive fallback.** When the GitHub API is rate-limited or unreachable, repository listing falls back to `github.com` ref advertisement plus the codeload tarball, reconstructing real Git blob/tree hashes so review and installation keep working with identical folder hashes and file bytes.
- **Optional token, credential-free by default.** New `githubTokenEnv` config accepts only an environment-variable name (a pasted token value is rejected) and is attached only to `api.github.com` requests; with the default empty value the plugin still reads no credentials.
- Discover results show their canonical skills.sh link, long skill descriptions are clamped in the review dialog, and the Discover toolbar no longer duplicates the header's install action.
- Add regression tests for search-hit resolution, install-collision decisions and the new `install` directory override, plus GitHub token scoping, rate-limit messaging, ref caching and archive-fallback equivalence (**88 tests total**). Rebuild the committed `lib/`.

0.3.0 is now published on npm as `@skillre/dsh-plugin-skills-manager@0.3.0` (first publish, manual login + 2FA; registry integrity `sha512-vy6XupXAKH9k9WXaLT/TcM8iakSVzkGOMqEnkmIkQSt5KlxE4IdTZlhLd6CWSWGoZeH1xuxxQ8Gj0kzJG/wszw==` matches the Release asset byte-for-byte). The package therefore appears in the user's market index with the npm source and can be updated in place; the GitHub source repository and Release asset remain available for pinned installs.

## 0.2.1 — hot re-enable fix (local build)

- Fix **hot re-enable**: turning the plugin off and back on left the sidebar entry and main panel missing until the page reloaded. The Client half registered its zh/en dictionaries without owning the registration, so the next activation failed on the locale service's duplicate-dictionary check before it reached the sidebar/main slot registrations.
- Register both dictionaries in one Fiber-owned `ctx.effect` (and own the two slot injections the same way), so every re-enable mounts exactly one fresh Client instance. Verified in a real DSH Web page: bundle off → sidebar entry removed; bundle on → sidebar entry and panel return, across two consecutive cycles with a clean console.
- Add a Client lifecycle regression test that unmounts and remounts the fake Client Fiber (73 tests total); rebuild the committed `lib/`.

No npm publication or user-profile change is included; the GitHub source repository and Release asset are updated in the same user-authorized GitHub flow.

## 0.2.0 — background updates with live progress (local build)

- Single and batch updates now run as Host-side **background jobs**: confirming an update closes the dialog, switches to the new **Update jobs** tab and keeps running while you use the rest of the plugin. A header button shows the running job and its overall progress, so progress is reachable at any time.
- Per-skill progress reports the current phase — resolving the source, downloading files (real byte/file-count ratio), verifying, backing up the previous version, installing the new version — with an approximate percentage. Batch jobs show overall progress plus each skill's status: not started, updating, updated, failed, skipped or cancelled, with timestamps, backup id, commit and failure reason.
- A running job can be stopped cooperatively: the current skill finishes atomically, remaining skills are marked cancelled. Failed items can be retried in one click with the current local state.
- Only one update job runs at a time; update actions and source checks stay disabled while it runs. Finished jobs refresh the skill list automatically.
- Job history (up to 20 jobs) lives in Host memory: a Host restart clears it, but in-flight skill transactions remain journaled and recoverable, so no partial skill state is lost silently.
- Add `update-start`, `update-batch-start`, `job-list`, `job-get` and `job-cancel` (also exposed to the `skills_manager` agent tool) and regression tests for background single/batch runs, live progress, busy rejection and cooperative cancellation (71 tests total).
- Rebuild and commit `lib/`.

No npm publication or user-profile change is included; the GitHub source repository and Release asset are updated in the same user-authorized GitHub flow.

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
