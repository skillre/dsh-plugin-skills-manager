# DSH Skills Manager

> `@skillre/dsh-plugin-skills-manager` · `0.3.0` · experimental

[中文](<README.md>)

A native Host + React Client bundle that adds a **Skills** page to the DSH **Settings** sidebar. It no longer reserves a left-rail panel entry, and there is no iframe or replacement application shell.

## Features

- List and filter local skills in user directories and registered workspaces; inspect instructions, validity and invocation policy.
- Check provenance-tracked GitHub skill directories or well-known catalog digests for updates; the summary reports updates, up-to-date, untracked and failed counts, and untracked skills are never claimed as up to date.
- Recognize Skills CLI GitHub and well-known provenance (`open.feishu.cn`-style sources): well-known archive skills are digest-checked and updated in place, while other external source types are labelled truthfully and remain untracked.
- Update an inspected revision after complete file/tree integrity and local-fingerprint checks; preserve the previous entry as a backup.
- Search the public [skills.sh](https://skills.sh) directory, or inspect a public GitHub repository directly. A search hit opens the **complete review** of that skill in the repository: the plugin resolves the matching skill, shows its `SKILL.md`, resource inventory and install location, so there is no second, unexplained "Inspect repository" click.
- Review and confirm third-party instructions before installing. Installation never overwrites an existing entry or executes downloaded scripts. The review is an explicit three-step flow (source → skill → review & install), and a name collision is resolved instead of dead-ending: the same source offers a one-click update, another source explains that DSH resolves one skill per name and links to the installed entry, and a directory-only collision offers an explicit directory name. After any install the page switches to Installed and filters to the new skill.
- **Rate-limit resilience**: GitHub's unauthenticated API allows 60 requests/hour. Discovery reuses repository resolutions briefly and immutable trees per commit, and an exhausted budget reports the reset clock time plus the `githubTokenEnv` remedy. When the API is rate-limited or unreachable, listing falls back to the `github.com` ref advertisement plus the codeload archive and reconstructs real Git blob/tree hashes, so search → review → install still completes.
- Remove an entry into a restorable backup; restore never overwrites an existing skill.
- Batch-update every checked skill; each item is re-verified, the previous version is backed up, locally modified skills are skipped unless explicitly allowed, and the result reports updated/skipped/failed.
- Manage backups: stored size/file counts, per-backup deletion, and cleanup that keeps the newest N. Nothing is auto-deleted by default.
- Move/rename a skill between writable roots (copy-verify-publish, then back up the source) or rename it inside a root without overwriting existing entries.
- Optional permanent removal: explicit second-factor confirmation deletes files without a restorable backup.
- File-level update diff: the update dialog shows added/removed/changed/unchanged files before confirmation.
- Wider install sources: local `.tar.gz`/`.tgz`/`.zip` archives (strict in-memory parsing, never executed), well-known HTTPS catalogs and cross-root backup restore.
- The `skills_manager` Agent tool uses the same core operations. Mutations require a logged, one-time user approval, not a model-supplied authorization flag.
- **Hot enable/disable**: switching the bundle off and back on unmounts and remounts the Settings section (and its navigation glyph) with the plugin Fiber. 0.3.0 no longer registers a left-rail panel entry.
- English/Chinese text, DSH theme colors, responsive layout, loading/error feedback and modal focus management.

## 0.1.0 startup failure and upgrade

**0.1.0 is withdrawn: do not install it or use it as a rollback target.** It called `connection.rpc.intercept('/api')` and occupied the single shared interceptor required by DSH API Gateway. This can cause `already has an interceptor`, Desktop welcome `Webrequest failed`, and API/page 404 errors; it is not skill-file corruption.

0.1.1 registers only the exact `POST /api/skillre-skills-manager/execute` with `connection.fetch.register`, preserving the existing Client RPC path and JSON result. Gateway retains the shared interceptor. DSH Connection owns authentication, owner-only admission and Web/Desktop shell-carrier dispatch; no new server is added.

For an existing installation, first disable or uninstall 0.1.0 in **Plugins**, confirm the Host recovers, then install 0.1.2 below and restart Desktop to check it; 0.1.1 upgrades in place. Skills, provenance and backups remain. If the failure makes Plugins inaccessible, preserve logs and request maintainer assistance; this task does not alter the daily profile or substitute CLI `--profile desktop`, a DSH reinstall or skill deletion for recovery.

## User installation

The source lives at [github.com/skillre/dsh-plugin-skills-manager](https://github.com/skillre/dsh-plugin-skills-manager). It is **not published to npm**. DSH Plugins accepts two sources:

**Option A: Git repository URL (tracks the default branch)** — paste this directly into **Add plugin**:

```
https://github.com/skillre/dsh-plugin-skills-manager
```

The repository commits its built output under `lib/`, so pnpm does not need to execute build scripts and the `allowBuilds` supply-chain policy does not block the install. Restart Desktop afterwards. This follows the latest `main` commit.

**Option B: Release tarball (pinned version)** — download [`skillre-dsh-plugin-skills-manager-0.3.0.tgz`](https://github.com/skillre/dsh-plugin-skills-manager/releases/download/v0.3.0/skillre-dsh-plugin-skills-manager-0.3.0.tgz) from the [GitHub Release v0.3.0](https://github.com/skillre/dsh-plugin-skills-manager/releases/tag/v0.3.0) and enter its **full absolute local path** in **Add plugin**.

1. Open **Plugins → Add plugin** in DSH.
2. Paste the Git URL or the tarball's absolute path, review the trust notice and initiate installation yourself.
3. Enable it, open **Settings** (the sidebar-foot account menu → Settings, or ⌘, on macOS), and choose **Skills** in the Settings sidebar. The left rail gains no skills button.

Final installation belongs to the user. Do not use an unpublished npm spec or source directory; use the Option B Release asset (the exact verified file) when pinning a version.

## Usage and scope

Installed shows global skills; choosing a registered workspace also adds its nearest `.git` project root's `.agents/skills` and `.dsh/skills`. Check updates is manual and never automatically installs changes. The rescan icon at the start of the list toolbar re-reads local skill directories only and does not contact remote sources; in the Backups tab it only reloads backup records. Click a skill name, the card body, or the card's Details button for the full view: description, location and absolute path (with copy), source and revision, update state, model/user invocation, the complete `SKILL.md` instructions, and the resource inventory; read-only skills list files too when their location is readable. Updates (single and batch) run as background jobs: confirming closes the dialog, switches to the Update jobs tab and keeps working while the job runs. A header button shows the running job and its overall progress, so the progress view is always one click away; job history (up to 20) lives in Host memory and a Host restart clears it, while in-flight skill transactions stay journaled and recoverable. Per-skill progress reports the current phase (resolve, download with real byte/file ratio, verify, back up, install) with an approximate percentage; batch jobs also show overall progress and each skill's status (not started, updating, updated, failed, skipped, cancelled), timestamps, backup id, commit and failure reason. Only one update job runs at a time; update actions and source checks are disabled while it runs, the current skill can be stopped only after it finishes atomically, failing items can be retried in one click, and the skill list refreshes when the job ends. Discover supports task/technology keywords and a review-before-install flow. Repository inspection accepts `owner/repo` or its HTTPS GitHub repository-root URL; branch/tag defaults to `HEAD`, while installation pins the inspected commit.

Writable locations are `$DSH_AGENTS_HOME/skills` (default `~/.agents/skills`), `$DSH_HOME/skills` (default `~/.dsh/skills`) and the selected registered workspace's project roots. `.system` and plugin state are not treated as skills. Configured custom/bundled directories, registry-only entries and linked skills remain read-only. Direct child `SKILL.md` bundles and top-level `.md` files are supported; automatic updates require provenance-tracked **directory bundles**.

The plugin tracks its own installs and reads supported global Skills CLI v3 provenance from `agentsHome/.skill-lock.json`: GitHub (commit + folder tree hash) and well-known archive sources (`sourceBaseUrl` + `sha256` digest), both requiring canonical directory/name matches. It does not rewrite that third-party lock, remove other Agent installations or infer provenance for arbitrary same-name copies. Hand-written skills, old lock formats and unsupported source types show their known external origin label when available, otherwise "untracked", and are never treated as up to date.

## Update sources and digest verification

- **GitHub**: pin the reviewed commit and compare the complete skill folder's Git tree hash; updates re-verify every blob and the selected tree.
- **well-known**: read `/.well-known/agent-skills/index.json` under the recorded base URL and compare the catalog's `sha256` archive digest; only a change triggers an artifact download. The archive must share the catalog's HTTPS origin, its digest is verified, and it is then strictly parsed in memory as tar.gz — links, devices, traversal, duplicate/case-colliding paths and size/file-count overruns are rejected before the normal backup-and-replace transaction begins.
- **Untracked or externally managed**: show the known origin label and install location. View, removal and restore work, but no remote-version claim or one-click update is offered.

## Install locations: where skill files go

Install writes into a **writable skill root**, never into the plugin package directory:

- User shared skills: `$DSH_AGENTS_HOME/skills`, default `~/.agents/skills` (most of the 42 current skills live here).
- User DSH skills: `$DSH_HOME/skills`, default `~/.dsh/skills` (currently `amap-cli-skill`).
- Registered workspace: the nearest `.git` project root's `.agents/skills` and `.dsh/skills` once a workspace is selected.
- Custom/bundled directories, registry-only entries and linked skills are read-only and never receive installs.

Every install/local-archive/well-known/move/restore dialog shows the target root's absolute path. The plugin package itself is installed by the DSH Plugins manager into the profile (for example `~/.dsh/profiles/<profile>/node_modules/@skillre/dsh-plugin-skills-manager`) and does not affect skill files.

## Batch, backups and migration

- Update all is available in the page header and the Updates tab once updates have been checked. It re-verifies each item; locally modified skills are skipped unless the overwrite checkbox is enabled, one failure does not abort the rest, and failed skill names are listed.
- After updating one skill, the cached results of the other checked skills are preserved, so the remaining updates stay visible without running Check updates again.
- Backups live under each skill location at `.skills-manager/backups/<id>/content` (for example `~/.agents/skills/.skills-manager/backups/<id>/content`). Every update/removal moves the complete previous entry there; each record shows size, file count, time, source and its full path.
- Updates are backed up because replacement is destructive: keeping the previous version makes a bad update reversible; backups are never auto-deleted.
- Restore: the Restore button on a backup returns it to its original location and refuses to overwrite an existing skill.
- Delete: the labelled Delete backup button removes that single backup permanently; Clean up keeps the newest N in a location. Backup cleanup only touches `.skills-manager/backups`, never installed skills.
- Move / rename lives in the skill detail dialog. Cross-root moves copy and verify first, then remove the source entry (kept as a backup), so a failure cannot lose files.
- Permanent removal still rechecks the complete fingerprint and keeps no restorable backup; the dialog warns explicitly.

Updates/removal retain complete previous files under Backups. Backups do not expire automatically; restore requires an unoccupied original location. DSH's filesystem provider observes changes for future skill lookups; already-loaded instructions in an existing conversation are not retroactively rewritten.

## Configuration

Use the user's own Cordis override layer, not edits to the installed package:

```yaml
- id: skillre-skills-manager
  config:
    allowMutations: true
    enableAgentTool: true
    includeDefaultRoots: true
    dshHome: /absolute/path/to/dsh-home
    agentsHome: /absolute/path/to/agents-home
    customSkillDirs: []
    readOnlySkillDirs: []
    requestTimeoutMs: 15000
    operationTimeoutMs: 300000
    maxSkills: 500
    maxFileBytes: 2097152
    maxBundleBytes: 104857600
    maxBundleFiles: 20000
    maxRepositoryEntries: 30000
    checkConcurrency: 3
    githubTokenEnv: ''
```

Loader overrides replace the whole `config`, but this plugin supplies defaults for omitted fields. All roots must be absolute.

| Field | Default | Meaning |
|---|---|---|
| `includeDefaultRoots` | `true` | User/project roots; false limits discovery to explicitly configured read-only roots |
| `dshHome` | `$DSH_HOME` or `~/.dsh` | User DSH home |
| `agentsHome` | `$DSH_AGENTS_HOME` or `~/.agents` | Shared Agent home |
| `customSkillDirs` | `[]` | Additional read-only roots |
| `readOnlySkillDirs` | `[]` | Bundled/other read-only roots |
| `allowMutations` | `true` | Installation, update, removal and restore; false makes every root read-only |
| `enableAgentTool` | `true` | Register the tool when Host tools are available; missing approval refuses mutations |
| `requestTimeoutMs` | `15000` | One network request deadline |
| `operationTimeoutMs` | `300000` | One operation deadline; always recheck state after cancellation during commit |
| `maxSkills` | `500` | Local/source directory result limit |
| `maxFileBytes` | `2097152` | 2 MiB per file |
| `maxBundleBytes` | `104857600` | 100 MiB per skill |
| `maxBundleFiles` | `20000` | File count limit; schema maximum 50000, sized for asset-heavy skills |
| `maxRepositoryEntries` | `30000` | Complete GitHub tree limit; truncated trees cannot establish update status |
| `checkConcurrency` | `3` | Bounded network concurrency, 1–6 |
| `githubTokenEnv` | `''` | Optional **environment variable name** (for example `GITHUB_TOKEN`). When set, its token is attached only to `api.github.com` requests to raise the hourly budget; the default empty value means no credential is ever read. A pasted token value is rejected |

## Permissions and safety

Host code accesses configured skill directories with Host permissions. UI RPC requires a live authenticated owner through DSH Connection, and refuses other Peers. The plugin contacts only public `skills.sh`, `api.github.com`, `raw.githubusercontent.com`, `codeload.github.com`, `github.com` (Git ref advertisement, used only as the rate-limit fallback) and recorded public HTTPS well-known catalogs. Well-known artifacts must stay on the catalog origin, are `sha256`-verified and strictly parsed as tar.gz in memory. By default it reads **no credentials**; only with an explicit `githubTokenEnv` does it read that environment variable and attach the token to `api.github.com` requests alone — never to raw/codeload/skills.sh, logs or error messages. It does not invoke Git or `npx`, or execute downloaded scripts.

Downloads are commit-pinned and checked against every Git blob and the complete selected tree. Remote symlinks/submodules, path traversal, Windows device names, case/Unicode collisions and oversized resources are rejected. Mutations recheck complete local fingerprints and use root-local disk locks, journals, same-filesystem publication and backups. Metadata is validated and limited to 4 MiB; corrupt state and unfinished transactions fail closed.

**Do not run another installer/editor against the same root during a mutation.** Static symlinks/traversal and cooperating writers are fenced; portable Node I/O is not a dirfd defense against hostile same-OS-user ancestor swaps. Directories are not fsynced, so power-loss durability is not claimed. Strong termination or uncertain rollback preserves locks/journals/staging/backups for manual recovery; never blindly delete them. Cancellation can overtake a committed change: refresh the list and inspect backups rather than assuming no mutation happened.

## Verification and limits

DSH **0.2.2-rc.1** (cordis 4.1.0) was re-inspected and mounted on **2026-11-08**, with the Settings-section delivery. Type checking, build, publint, package checks and **88 automated tests** pass, including **20 real ConnectionRegistry transport regressions**, **14 GitHub source/rate-limit/archive-fallback regressions**, **7 well-known/archive regressions**, **10 batch/backup/move/install/diff regressions**, **5 search-hit and install-conflict decision regressions** and **3 Client Settings-registration/lifecycle regressions**. The pre-final packed test in an owned temporary non-Desktop profile compared all **37 packed files** byte-for-byte and exercised real Gateway `settings/describe` and Desktop welcome `llm/listConfigurableProviders`, plugin list/detail/check/remove/restore with filesystem/fingerprint checks, a real Host restart while the plugin remained installed, dependency/selection/composition/plugin-route absence after uninstall, and both Gateway methods after another startup. Every owned CLI process closed and every recorded group returned `ESRCH` before canonical owner/UID-root removal and explicit `ENOENT`. The target UI was verified in a real DSH Web page (owned temporary non-Desktop profile, real Chrome/CDP): the left rail carries **no** skills entry, the Settings sidebar shows the **Skills** row with its own glyph and opens the manager page, a search hit's "Review & install" resolves the repository and shows the full review in one step, and two off/on cycles of the bundle restored the Settings row and page with a clean console. The previous build's plugin-RPC-only checks are not this version's compatibility proof.

The shipped [compatibility record](<compatibility.json>) references only this version's [passed pre-final mount evidence](<docs/verification/pre-final-mount-0.3.0-gateway.json>). After adding compatibility metadata, repack and reinstall the **exact final file**; every packed file, SHA256, Gateway/plugin checks and cleanup outcome are recorded in the external [final mount report](<docs/verification/isolated-mount-0.3.0.json>), [log](<docs/verification/isolated-mount-0.3.0.log>) and [artifact summary](<docs/verification/final-artifact-0.3.0.json>). The real-UI evidence is the [browser verification report](<docs/verification/browser-hot-reenable-0.3.0.json>). Keeping the exact tarball hash outside the package avoids a self-referential hash.

**Electron Desktop visual/interaction acceptance and the user's daily Desktop restart belong to the user.** A real isolated CLI/Web Host restart, authenticated RPC and Client asset delivery are not Electron-window, theme or interaction acceptance. The 0.3.0 Settings entry, search-to-review flow and hot enable/disable were verified in a real DSH Web page and recorded as the `web-ui-settings-section`, `web-ui-discover-review` and `web-ui-hot-reenable` compatibility checks. The same flow inside the Electron Desktop window remains a user-side visual acceptance.

The route uses a `buffered` body. Its limit belongs to DSH Connection's HTTP carrier `maxRequestBodyBytes` (current default 300 MiB), not an independent adapter/direct `shared.fetch` cap. No new carrier-overflow test is claimed.

Install sources are public GitHub, local archives and well-known `type: archive` catalogs; local archives are untracked (no automatic updates); anonymous/third-party endpoints can rate-limit; a skill installed by another tool has no locally-verifiable fingerprint until the plugin performs its first update (which backs up); batch updates skip undetectable modifications unless overwrite is selected; cross-file-system moves use the copy+backup path; untracked/flat/unsupported-lock skills cannot update automatically; very large skills take longer and depend on network speed. Other DSH versions require fresh tests. No auto-update or skill editor is included; backup cleanup is always an explicit user action. Update job state lives in Host memory only (last 20 jobs): a Host restart clears the history, one job runs at a time, and a cooperative stop only skips not-yet-started skills while the current skill completes its transaction.

## Development verification

```sh
npm install --ignore-scripts
npm run check
npm pack --json --ignore-scripts
DSH_TEST_CLI=/path/to/current/dsh npm run test:integration -- /absolute/path/to/package.tgz
```

The repository commits its built `lib/` output so that Option A Git-URL installs need no build scripts; after changing `src/`, run `npm run build` and commit `lib/` — CI enforces this with `git diff --exit-code -- lib`. Run the runner in a **bounded foreground shell with sufficient time**. It creates a new owned non-Desktop home/profile, installs the packed artifact, inspects composition, exercises authenticated RPC and Client delivery, uninstalls, then waits for actual owned-process closure and verifies group/root absence in `finally`. `EPERM` or uncertain cleanup is a failure, never proof of exit/removal; owner/PID and failure evidence are retained. It must never target a user's profile; source/link deployment is forbidden. Keep the tarball, built files and metadata unchanged during verification; do not repack concurrently.

See [uninstall and recovery](<UNINSTALL.md>). Removing the plugin does not delete user skills or backups.

MIT. The package icon is original project artwork, exported with localized display metadata rather than template resources.
