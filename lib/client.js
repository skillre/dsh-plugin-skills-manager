window.__ModuleLoader__.load({
  id: "@skillre/dsh-plugin-skills-manager",
  factory(require) {
"use strict";
var SkillreSkillsManagerClient = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name2 in all)
      __defProp(target, name2, { get: all[name2], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/client/index.tsx
  var index_exports = {};
  __export(index_exports, {
    SkillsPage: () => SkillsPage,
    apply: () => apply,
    inject: () => inject,
    name: () => name
  });
  var import_react5 = __toESM(__require("react"), 1);

  // src/types.ts
  var ENDPOINT = "skillre-skills-manager/execute";
  var PANEL_ID = "skillre-skills-manager";
  var LOCALE_NAMESPACE = "skillreSkillsManager";

  // src/client/contracts.ts
  var ActionError = class extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
      this.name = "ActionError";
    }
    code;
  };
  function createApi(ctx, lifetime) {
    return {
      async call(request, signal) {
        const result = await ctx.connection.rpc.call("/api", ENDPOINT, request, AbortSignal.any([lifetime, ...signal ? [signal] : []]));
        if (!result || typeof result !== "object" || !("ok" in result)) throw new ActionError("invalid-response", "The Host returned an invalid skill-manager response.");
        if (!result.ok) throw new ActionError(result.error.code, result.error.message);
        return result.value;
      }
    };
  }

  // src/client/messages.ts
  var en = {
    nav: "Skills Manager",
    title: "Skills Manager",
    subtitle: "Discover, install and keep your DSH skills in sync.",
    local: "Installed",
    discover: "Discover",
    updates: "Updates",
    backups: "Backups & restore",
    refresh: "Refresh",
    rescan: "Rescan local",
    jobs: "Update jobs",
    jobsEmpty: "No update jobs yet",
    jobsEmptyBody: "Updates you start run in the background. Progress and results stay here while the Host is running.",
    jobSingle: "Update {name}",
    jobBatch: "Update {count} skills",
    jobProgress: "{percent}%",
    jobCounts: "{updated} updated \xB7 {failed} failed \xB7 {skipped} skipped \xB7 {cancelled} cancelled",
    jobStatusRunning: "Running",
    jobStatusCompleted: "Completed",
    jobStatusFailed: "Finished with failures",
    jobStatusCancelled: "Cancelled",
    jobCancel: "Stop remaining",
    jobCancelRequested: "Stopping after the current skill\u2026",
    jobRetry: "Retry failed",
    jobStarted: "Update started in the background. Follow it in Update jobs.",
    jobItemPending: "Not started",
    jobItemRunning: "Updating",
    jobItemUpdated: "Updated",
    jobItemFailed: "Failed",
    jobItemSkipped: "Skipped",
    jobItemCancelled: "Cancelled",
    jobSkillGone: "This skill is no longer installed.",
    phaseQueued: "Queued",
    phaseResolve: "Resolving source",
    phaseDownload: "Downloading",
    phaseVerify: "Verifying files",
    phaseBackup: "Backing up previous version",
    phaseInstall: "Installing new version",
    phaseDone: "Done",
    jobBackup: "Backup {id}",
    jobStartedAt: "Started {time}",
    jobFinishedAt: "Finished {time}",
    jobViewSkill: "View skill",
    jobActiveNotice: "An update job is running; wait for it to finish before starting another update.",
    rescanHint: "Re-reads local skill directories only and does not contact remote sources. Use Check updates to compare with upstream.",
    check: "Check updates",
    checking: "Checking sources\u2026",
    install: "Install skill",
    fromRepo: "Install from repository",
    overview: "Skills overview",
    clearFilter: "Clear filter",
    noMatchesBody: "Clear the filter, choose another location, or show all skills.",
    found: "Discovered skills",
    available: "Updates available",
    readonly: "Read-only",
    unchecked: "Not checked",
    scope: "Workspace scope",
    global: "Global skills",
    allRoots: "All locations",
    location: "Location",
    filter: "Filter installed skills\u2026",
    search: "Search skills",
    searchPlaceholder: "What should your agent be able to do?",
    searchHint: "Search the public skills.sh directory, or inspect a GitHub repository directly.",
    searchButton: "Search",
    searchEmpty: "No skills matched this search.",
    searchPrompt: "Find your next capability",
    searchPromptBody: "Search by task or technology. You review the source before anything is installed.",
    popular: "Example searches",
    downloads: "{count} installs",
    inspectInstall: "Review & install",
    repository: "Repository",
    source: "Source",
    branch: "Branch or tag (optional)",
    refHint: "Defaults to the repository\u2019s HEAD. Installs use an immutable commit.",
    inspect: "Inspect repository",
    inspecting: "Inspecting repository\u2026",
    repoPlaceholder: "owner/repo or https://github.com/owner/repo",
    chooseSkill: "Choose a skill",
    noRepoSkills: "No valid DSH skills were found in this repository.",
    revision: "Revision",
    resources: "Resources",
    files: "{count} files",
    trust: "I have reviewed this third-party skill and trust its instructions and resources.",
    trustHint: "Installing does not execute scripts, but an agent may use them when this skill is loaded.",
    target: "Install location",
    installing: "Installing skill\u2026",
    selectLocation: "Choose a writable location",
    back: "Back",
    close: "Close",
    cancel: "Cancel",
    continue: "Continue",
    installed: "Installed {name}.",
    updated: "Updated {name}; the previous version is backed up and can be restored or deleted in Backups & restore.",
    removed: "Removed {name} from DSH. A restorable backup is retained.",
    restored: "Restored {name}.",
    checkingDone: "Check complete: {updates} updates, {latest} up to date, {untracked} untracked and {errors} source errors.",
    empty: "No local skills here yet",
    emptyBody: "Install from a reviewed repository, or choose another workspace.",
    updatesEmpty: "No confirmed updates",
    updatesEmptyBody: "Check sources to see available updates. Untracked skills are not treated as up to date.",
    loading: "Loading skills\u2026",
    noMatches: "No installed skills match this filter.",
    valid: "Valid",
    invalid: "Invalid skill",
    protected: "Read-only",
    tracked: "Tracked source",
    untracked: "Untracked source",
    latest: "Up to date",
    update: "Update available",
    checkError: "Check failed",
    localOnly: "Local skill",
    details: "Skill details",
    viewDetails: "View details",
    copyPath: "Copy path",
    pathCopied: "Path copied",
    copyFailed: "Could not copy the path to the clipboard.",
    updateStatus: "Update status",
    instructions: "Instructions",
    metadata: "Details",
    model: "Model invocation",
    user: "User invocation",
    enabled: "Enabled",
    disabled: "Disabled",
    modified: "Local modifications detected",
    modifiedBody: "Files differ from the recorded source. Updating requires your explicit choice and preserves a backup.",
    overwrite: "Back up and replace my local modifications.",
    remove: "Remove",
    updateButton: "Update",
    removeTitle: "Remove this skill?",
    removeBody: "The entry will stop appearing in DSH. Its complete files are moved to a backup, not permanently deleted.",
    updateTitle: "Update this skill?",
    updateBody: "The reviewed revision replaces this skill only after a complete local-file check. The previous entry is moved to this skill location's .skills-manager/backups before replacement; restore or delete it later in Backups & restore.",
    confirmRemove: "Remove & back up",
    confirmUpdate: "Update & back up",
    confirmRestore: "Restore backup",
    restoreTitle: "Restore this backup?",
    restoreBody: "Restores this entry at its original location. An existing skill is never overwritten.",
    restoring: "Restoring\u2026",
    removing: "Removing\u2026",
    updating: "Updating\u2026",
    noSource: "No update source is recorded; this skill was installed manually or by another tool. You can view or remove it, but automatic update checks are unavailable.",
    externalSource: "External source",
    externalSourceBody: "Source recorded by another tool: {source}. This plugin can view and remove the skill, but cannot check or update its remote version.",
    sourceSite: "Source site",
    digest: "Digest",
    linked: "Managed elsewhere",
    backupEmpty: "No backups yet",
    backupEmptyBody: "Updates and removal preserve previous entries here. Restoring never overwrites an existing skill.",
    backupActionUpdate: "Before update",
    backupActionRemove: "Removed skill",
    restore: "Restore",
    preserved: "Backups are retained under each skill location's .skills-manager/backups until you explicitly delete them.",
    backupHint: "Every update and removal first moves the complete previous entry into the skill location's .skills-manager/backups/<id>/content. Restore puts it back without overwriting an existing skill; the trash button deletes a backup permanently. Nothing is auto-deleted.",
    deleteBackup: "Delete backup",
    warningTitle: "Some sources need attention",
    truncated: "This list reached its configured limit. Narrow the scope or increase maxSkills.",
    noWritable: "This configuration has no writable skill locations.",
    readOnlyMode: "Read-only mode: installation, update, removal and restore are disabled.",
    bytes: "{count} bytes",
    checkedAt: "Checked {time}",
    cliImported: "Imported Skills CLI provenance",
    safeNote: "No automatic updates \xB7 Downloads are never executed \xB7 Removal is recoverable",
    sourceLink: "Open source on GitHub",
    externalDirectory: "Public directory",
    requestFailed: "The operation failed.",
    retry: "Retry",
    "root.user-agents": "User \xB7 Shared agents",
    "root.user-dsh": "User \xB7 DSH",
    "root.project-agents": "Project \xB7 Shared agents",
    "root.project-dsh": "Project \xB7 DSH",
    "root.custom": "Custom \xB7 Read-only",
    "root.bundled": "Bundled \xB7 Read-only",
    "root.runtime": "DSH registry \xB7 Read-only",
    fromLocal: "Local archive",
    fromWellKnown: "Well-known source",
    updateAll: "Update all",
    batchTitle: "Update all checked skills?",
    batchBody: "Each skill is re-verified against its recorded source and its previous version is kept as a backup. Skills with local modifications are skipped unless you explicitly allow replacement.",
    batchOverwrite: "Also update skills with local modifications (after backup).",
    batchRunning: "Updating skills\u2026",
    batchResult: "Batch update: {updated} updated, {skipped} skipped, {failed} failed.",
    batchFailedNames: "Failed: {names}",
    batchNone: "No checked skill is currently updatable. Run Check updates first.",
    diffTitle: "File changes",
    diffAdded: "Added",
    diffRemoved: "Removed",
    diffChanged: "Changed",
    diffUnchanged: "Unchanged",
    diffFailed: "File comparison was unavailable",
    diffEmpty: "No file changes were found.",
    moveTitle: "Move or rename this skill",
    moveBody: "Move the skill to another writable location or rename its directory. Cross-location moves copy the verified files first and keep the previous entry as a backup.",
    moveRoot: "Target location",
    moveName: "Directory name",
    moveButton: "Move / rename",
    moving: "Moving\u2026",
    moved: "Moved {name}.",
    permanentDelete: "Also permanently delete the backup (cannot be undone)",
    permanentWarning: "Permanent deletion removes the skill files immediately and keeps no restorable backup.",
    localTitle: "Install from a local archive",
    localBody: "Review an archive you already trust. Only .tar.gz, .tgz or .zip bundles with SKILL.md at the archive root are accepted; the selected archive is parsed in memory and scripts are never executed.",
    localPath: "Absolute archive path",
    localPlaceholder: "/Users/you/Downloads/skill.tar.gz",
    localTrust: "I have reviewed this archive and trust its instructions and resources.",
    localButton: "Install archive",
    localInstalled: "Installed {name} from a local archive.",
    localHint: "Local archives are untracked: they can be viewed, moved and removed, but not updated automatically.",
    purgeTitle: "Delete this backup?",
    purgeBody: "The backup files are removed permanently. The installed skill is not affected.",
    purgeAllTitle: "Clean up backups",
    purgeAllBody: "Remove older backups from this location. The newest {keep} are kept; nothing outside the backup store is touched.",
    purgeKeep: "Backups to keep",
    purgeButton: "Delete backups",
    purged: "Removed {count} backups ({bytes}).",
    restoreTarget: "Restore location",
    restoreName: "Restore as",
    restoreToBody: "Restore this backup into the selected writable location. An existing entry is never overwritten; moving the backup to another location removes it from the original location after the copy succeeds.",
    wellKnownTitle: "Install from a well-known source",
    wellKnownBody: "Enter the public HTTPS base URL of a skills catalog. The plugin reads its .well-known/agent-skills/index.json, verifies artifact digests and parses archives in memory.",
    wellKnownPlaceholder: "https://open.feishu.cn/lark-cli/skills/regular",
    wellKnownInspect: "Inspect source",
    wellKnownSkills: "Skills in this source",
    wellKnownUnsupported: "Not installable (unsupported artifact type)",
    wellKnownInstall: "Install skill",
    wellKnownDone: "Installed {name} from a well-known source.",
    wellKnownHint: "Only archive entries with a sha256 digest can be installed; scripts are never executed.",
    nameTakenByOther: "\u201C{name}\u201D is already declared by the skill installed at {source}. DSH resolves one skill per name, so remove or update that entry first.",
    openInstalled: "Open the installed skill",
    entryCollision: "The directory \u201C{entry}\u201D is already used in this location.",
    stepSource: "Source",
    stepChoose: "Choose a skill",
    stepReview: "Review & install",
    autoInspecting: "Reading the repository\u2026",
    searchSkillsInRepo: "Filter skills in this repository\u2026",
    preferredMissing: "This repository does not contain \u201C{name}\u201D. Pick one of the skills it does contain below.",
    inspectRetry: "Try again",
    sameSourceInstalled: "\u201C{name}\u201D is already installed from this exact source. Update it instead of installing a duplicate.",
    updateInstead: "Update installed version",
    alreadyOtherSource: "\u201C{name}\u201D already exists at this location from another source. Installation never overwrites it.",
    duplicateHint: "Choose another location, or install under a different directory name.",
    renameInstall: "Install under a different directory name",
    entryName: "Directory name",
    entryHint: "The skill keeps the name declared in its SKILL.md; only the directory changes.",
    installStepHint: "Nothing is written to disk until you confirm in the last step and the files are verified.",
    searchUnavailable: "Skill search is unavailable right now. Inspect a GitHub repository directly instead.",
    resultOpen: "Open on skills.sh",
    settingsIntro: "Manage every skill DSH can see without leaving Settings.",
    showInstalled: "Show in Installed"
  };
  var zh = {
    nav: "\u6280\u80FD\u7BA1\u7406",
    title: "\u6280\u80FD\u7BA1\u7406",
    subtitle: "\u53D1\u73B0\u3001\u5B89\u88C5\u5E76\u4FDD\u6301\u4F60\u7684 DSH \u6280\u80FD\u66F4\u65B0\u3002",
    local: "\u672C\u5730\u6280\u80FD",
    discover: "\u6280\u80FD\u68C0\u7D22",
    updates: "\u53EF\u7528\u66F4\u65B0",
    backups: "\u5907\u4EFD\u4E0E\u6062\u590D",
    refresh: "\u5237\u65B0",
    rescan: "\u91CD\u65B0\u626B\u63CF\u672C\u5730",
    jobs: "\u66F4\u65B0\u4EFB\u52A1",
    jobsEmpty: "\u6682\u65E0\u66F4\u65B0\u4EFB\u52A1",
    jobsEmptyBody: "\u4F60\u53D1\u8D77\u7684\u66F4\u65B0\u4F1A\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\u8FDB\u5EA6\u548C\u7ED3\u679C\u4FDD\u7559\u5728\u8FD9\u91CC\uFF08Host \u8FD0\u884C\u671F\u95F4\uFF09\u3002",
    jobSingle: "\u66F4\u65B0 {name}",
    jobBatch: "\u66F4\u65B0 {count} \u4E2A\u6280\u80FD",
    jobProgress: "{percent}%",
    jobCounts: "\u6210\u529F {updated} \xB7 \u5931\u8D25 {failed} \xB7 \u8DF3\u8FC7 {skipped} \xB7 \u53D6\u6D88 {cancelled}",
    jobStatusRunning: "\u6B63\u5728\u66F4\u65B0",
    jobStatusCompleted: "\u5DF2\u5B8C\u6210",
    jobStatusFailed: "\u5B8C\u6210\u4F46\u6709\u5931\u8D25",
    jobStatusCancelled: "\u5DF2\u53D6\u6D88",
    jobCancel: "\u505C\u6B62\u5269\u4F59\u66F4\u65B0",
    jobCancelRequested: "\u5F53\u524D\u6280\u80FD\u5B8C\u6210\u540E\u505C\u6B62\u2026",
    jobRetry: "\u91CD\u8BD5\u5931\u8D25\u9879",
    jobStarted: "\u5DF2\u8F6C\u5165\u540E\u53F0\u66F4\u65B0\uFF0C\u53EF\u5728\u300C\u66F4\u65B0\u4EFB\u52A1\u300D\u4E2D\u67E5\u770B\u8FDB\u5EA6\u3002",
    jobItemPending: "\u672A\u66F4\u65B0",
    jobItemRunning: "\u6B63\u5728\u66F4\u65B0",
    jobItemUpdated: "\u66F4\u65B0\u5B8C\u6210",
    jobItemFailed: "\u66F4\u65B0\u5931\u8D25",
    jobItemSkipped: "\u5DF2\u8DF3\u8FC7",
    jobItemCancelled: "\u5DF2\u53D6\u6D88",
    jobSkillGone: "\u8BE5\u6280\u80FD\u5DF2\u4E0D\u5728\u672C\u5730\u5217\u8868\u4E2D\u3002",
    phaseQueued: "\u6392\u961F\u4E2D",
    phaseResolve: "\u89E3\u6790\u6765\u6E90",
    phaseDownload: "\u4E0B\u8F7D\u6587\u4EF6",
    phaseVerify: "\u6821\u9A8C\u6587\u4EF6",
    phaseBackup: "\u5907\u4EFD\u65E7\u7248\u672C",
    phaseInstall: "\u5B89\u88C5\u65B0\u7248\u672C",
    phaseDone: "\u5DF2\u5B8C\u6210",
    jobBackup: "\u5907\u4EFD {id}",
    jobStartedAt: "\u5F00\u59CB\u4E8E {time}",
    jobFinishedAt: "\u7ED3\u675F\u4E8E {time}",
    jobViewSkill: "\u67E5\u770B\u6280\u80FD",
    jobActiveNotice: "\u5DF2\u6709\u66F4\u65B0\u4EFB\u52A1\u5728\u8FD0\u884C\uFF0C\u8BF7\u7B49\u5F85\u5B8C\u6210\u540E\u518D\u53D1\u8D77\u65B0\u7684\u66F4\u65B0\u3002",
    rescanHint: "\u4EC5\u91CD\u65B0\u8BFB\u53D6\u672C\u5730\u6280\u80FD\u76EE\u5F55\uFF0C\u4E0D\u8BBF\u95EE\u8FDC\u7AEF\u6765\u6E90\uFF1B\u8981\u5BF9\u6BD4\u4E0A\u6E38\u66F4\u65B0\u8BF7\u4F7F\u7528\u300C\u68C0\u67E5\u66F4\u65B0\u300D\u3002",
    check: "\u68C0\u67E5\u66F4\u65B0",
    checking: "\u6B63\u5728\u68C0\u67E5\u6765\u6E90\u2026",
    install: "\u5B89\u88C5\u6280\u80FD",
    fromRepo: "\u4ECE\u4ED3\u5E93\u5B89\u88C5",
    overview: "\u6280\u80FD\u6982\u89C8",
    clearFilter: "\u6E05\u9664\u7B5B\u9009",
    noMatchesBody: "\u6E05\u9664\u7B5B\u9009\u3001\u5207\u6362\u4F4D\u7F6E\uFF0C\u6216\u67E5\u770B\u5168\u90E8\u6280\u80FD\u3002",
    found: "\u5DF2\u53D1\u73B0\u6280\u80FD",
    available: "\u53EF\u7528\u66F4\u65B0",
    readonly: "\u53EA\u8BFB\u6280\u80FD",
    unchecked: "\u5C1A\u672A\u68C0\u67E5",
    scope: "\u5DE5\u4F5C\u533A\u8303\u56F4",
    global: "\u5168\u5C40\u6280\u80FD",
    allRoots: "\u5168\u90E8\u4F4D\u7F6E",
    location: "\u4F4D\u7F6E",
    filter: "\u7B5B\u9009\u672C\u5730\u6280\u80FD\u2026",
    search: "\u68C0\u7D22\u6280\u80FD",
    searchPlaceholder: "\u5E0C\u671B Agent \u5177\u5907\u4EC0\u4E48\u80FD\u529B\uFF1F",
    searchHint: "\u68C0\u7D22\u516C\u5171 skills.sh \u76EE\u5F55\uFF0C\u4E5F\u53EF\u76F4\u63A5\u68C0\u67E5 GitHub \u4ED3\u5E93\u3002",
    searchButton: "\u641C\u7D22",
    searchEmpty: "\u6CA1\u6709\u627E\u5230\u5339\u914D\u7684\u6280\u80FD\u3002",
    searchPrompt: "\u53D1\u73B0\u4E0B\u4E00\u9879\u80FD\u529B",
    searchPromptBody: "\u6309\u4EFB\u52A1\u6216\u6280\u672F\u641C\u7D22\u3002\u5B89\u88C5\u524D\uFF0C\u5148\u67E5\u770B\u6765\u6E90\u548C\u6280\u80FD\u5185\u5BB9\u3002",
    popular: "\u8BD5\u8BD5\u8FD9\u4E9B\u5173\u952E\u8BCD",
    downloads: "{count} \u6B21\u5B89\u88C5",
    inspectInstall: "\u67E5\u770B\u5E76\u5B89\u88C5",
    repository: "\u6280\u80FD\u4ED3\u5E93",
    source: "\u6765\u6E90",
    branch: "\u5206\u652F\u6216\u6807\u7B7E\uFF08\u9009\u586B\uFF09",
    refHint: "\u9ED8\u8BA4\u4F7F\u7528\u4ED3\u5E93 HEAD\uFF1B\u5B89\u88C5\u56FA\u5B9A\u5230\u5DF2\u67E5\u770B\u7684\u63D0\u4EA4\u3002",
    inspect: "\u68C0\u67E5\u4ED3\u5E93",
    inspecting: "\u6B63\u5728\u68C0\u67E5\u4ED3\u5E93\u2026",
    repoPlaceholder: "owner/repo \u6216 https://github.com/owner/repo",
    chooseSkill: "\u9009\u62E9\u6280\u80FD",
    noRepoSkills: "\u8BE5\u4ED3\u5E93\u4E2D\u6CA1\u6709\u627E\u5230\u683C\u5F0F\u6709\u6548\u7684 DSH \u6280\u80FD\u3002",
    revision: "\u63D0\u4EA4\u7248\u672C",
    resources: "\u8D44\u6E90\u6587\u4EF6",
    files: "{count} \u4E2A\u6587\u4EF6",
    trust: "\u6211\u5DF2\u67E5\u770B\u5E76\u4FE1\u4EFB\u8BE5\u7B2C\u4E09\u65B9\u6280\u80FD\u7684\u6307\u4EE4\u4E0E\u8D44\u6E90\u3002",
    trustHint: "\u5B89\u88C5\u4E0D\u4F1A\u6267\u884C\u811A\u672C\uFF0C\u4F46 Agent \u52A0\u8F7D\u6B64\u6280\u80FD\u540E\u53EF\u80FD\u4F7F\u7528\u8FD9\u4E9B\u8D44\u6E90\u3002",
    target: "\u5B89\u88C5\u4F4D\u7F6E",
    installing: "\u6B63\u5728\u5B89\u88C5\u6280\u80FD\u2026",
    selectLocation: "\u9009\u62E9\u53EF\u5199\u4F4D\u7F6E",
    back: "\u8FD4\u56DE",
    close: "\u5173\u95ED",
    cancel: "\u53D6\u6D88",
    continue: "\u7EE7\u7EED",
    installed: "\u5DF2\u5B89\u88C5 {name}\u3002",
    updated: "\u5DF2\u66F4\u65B0 {name}\uFF0C\u65E7\u7248\u672C\u5DF2\u5907\u4EFD\uFF0C\u53EF\u5728\u300C\u5907\u4EFD\u4E0E\u6062\u590D\u300D\u4E2D\u6062\u590D\u6216\u5220\u9664\u3002",
    removed: "\u5DF2\u4ECE DSH \u79FB\u9664 {name}\uFF0C\u53EF\u4ECE\u5907\u4EFD\u6062\u590D\u3002",
    restored: "\u5DF2\u6062\u590D {name}\u3002",
    checkingDone: "\u68C0\u67E5\u5B8C\u6210\uFF1A{updates} \u9879\u53EF\u66F4\u65B0\uFF0C{latest} \u9879\u5DF2\u662F\u6700\u65B0\uFF0C{untracked} \u9879\u65E0\u6765\u6E90\uFF0C{errors} \u9879\u68C0\u67E5\u5931\u8D25\u3002",
    empty: "\u8FD9\u91CC\u8FD8\u6CA1\u6709\u672C\u5730\u6280\u80FD",
    emptyBody: "\u4ECE\u5DF2\u67E5\u770B\u7684\u4ED3\u5E93\u5B89\u88C5\u6280\u80FD\uFF0C\u6216\u9009\u62E9\u5176\u4ED6\u5DE5\u4F5C\u533A\u3002",
    updatesEmpty: "\u6682\u65E0\u5DF2\u786E\u8BA4\u7684\u66F4\u65B0",
    updatesEmptyBody: "\u68C0\u67E5\u6765\u6E90\u540E\u53EF\u67E5\u770B\u66F4\u65B0\u3002\u6CA1\u6709\u6765\u6E90\u8BB0\u5F55\u7684\u6280\u80FD\u4E0D\u4F1A\u88AB\u5F53\u4F5C\u201C\u5DF2\u662F\u6700\u65B0\u201D\u3002",
    loading: "\u6B63\u5728\u52A0\u8F7D\u6280\u80FD\u2026",
    noMatches: "\u6CA1\u6709\u5339\u914D\u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u7684\u672C\u5730\u6280\u80FD\u3002",
    valid: "\u683C\u5F0F\u6709\u6548",
    invalid: "\u6280\u80FD\u683C\u5F0F\u65E0\u6548",
    protected: "\u53EA\u8BFB",
    tracked: "\u5DF2\u8FFD\u8E2A\u6765\u6E90",
    untracked: "\u65E0\u6765\u6E90\u8BB0\u5F55",
    latest: "\u5DF2\u662F\u6700\u65B0",
    update: "\u53EF\u66F4\u65B0",
    checkError: "\u68C0\u67E5\u5931\u8D25",
    localOnly: "\u672C\u5730\u6280\u80FD",
    details: "\u6280\u80FD\u8BE6\u60C5",
    viewDetails: "\u67E5\u770B\u8BE6\u60C5",
    copyPath: "\u590D\u5236\u8DEF\u5F84",
    pathCopied: "\u5DF2\u590D\u5236\u8DEF\u5F84",
    copyFailed: "\u65E0\u6CD5\u5C06\u8DEF\u5F84\u590D\u5236\u5230\u526A\u8D34\u677F\u3002",
    updateStatus: "\u66F4\u65B0\u72B6\u6001",
    instructions: "\u6280\u80FD\u6307\u4EE4",
    metadata: "\u8BE6\u7EC6\u4FE1\u606F",
    model: "\u6A21\u578B\u8C03\u7528",
    user: "\u7528\u6237\u8C03\u7528",
    enabled: "\u5141\u8BB8",
    disabled: "\u7981\u6B62",
    modified: "\u68C0\u6D4B\u5230\u672C\u5730\u4FEE\u6539",
    modifiedBody: "\u6587\u4EF6\u4E0E\u8BB0\u5F55\u7684\u6765\u6E90\u7248\u672C\u4E0D\u540C\u3002\u66F4\u65B0\u9700\u8981\u660E\u786E\u786E\u8BA4\uFF0C\u5E76\u4F1A\u4FDD\u7559\u5B8C\u6574\u5907\u4EFD\u3002",
    overwrite: "\u5907\u4EFD\u5E76\u66FF\u6362\u6211\u7684\u672C\u5730\u4FEE\u6539\u3002",
    remove: "\u5220\u9664",
    updateButton: "\u66F4\u65B0",
    removeTitle: "\u786E\u8BA4\u5220\u9664\u6B64\u6280\u80FD\uFF1F",
    removeBody: "\u8BE5\u5165\u53E3\u5C06\u4E0D\u518D\u51FA\u73B0\u5728 DSH \u4E2D\u3002\u5B8C\u6574\u6587\u4EF6\u4F1A\u79FB\u5165\u5907\u4EFD\uFF0C\u4E0D\u4F1A\u6C38\u4E45\u5220\u9664\u3002",
    updateTitle: "\u786E\u8BA4\u66F4\u65B0\u6B64\u6280\u80FD\uFF1F",
    updateBody: "\u68C0\u67E5\u672C\u5730\u6587\u4EF6\u672A\u53D8\u5316\u540E\uFF0C\u518D\u66FF\u6362\u4E3A\u5DF2\u67E5\u770B\u7684\u63D0\u4EA4\u7248\u672C\u3002\u539F\u6709\u6280\u80FD\u4F1A\u5B8C\u6574\u79FB\u5165\u8BE5\u6280\u80FD\u76EE\u5F55\u4E0B\u7684 .skills-manager/backups\uFF1B\u4E4B\u540E\u53EF\u5728\u300C\u5907\u4EFD\u4E0E\u6062\u590D\u300D\u4E2D\u6062\u590D\u6216\u5220\u9664\u3002",
    confirmRemove: "\u5220\u9664\u5E76\u5907\u4EFD",
    confirmUpdate: "\u66F4\u65B0\u5E76\u5907\u4EFD",
    confirmRestore: "\u6062\u590D\u5907\u4EFD",
    restoreTitle: "\u786E\u8BA4\u6062\u590D\u6B64\u5907\u4EFD\uFF1F",
    restoreBody: "\u6062\u590D\u81F3\u539F\u5B89\u88C5\u4F4D\u7F6E\uFF0C\u4E0D\u4F1A\u8986\u76D6\u5DF2\u5B58\u5728\u7684\u6280\u80FD\u3002",
    restoring: "\u6B63\u5728\u6062\u590D\u2026",
    removing: "\u6B63\u5728\u5220\u9664\u2026",
    updating: "\u6B63\u5728\u66F4\u65B0\u2026",
    noSource: "\u6CA1\u6709\u66F4\u65B0\u6765\u6E90\u8BB0\u5F55\uFF1A\u8BE5\u6280\u80FD\u53EF\u80FD\u7531\u624B\u5DE5\u62F7\u8D1D\u6216\u5176\u4ED6\u5DE5\u5177\u5B89\u88C5\u3002\u53EF\u4EE5\u67E5\u770B\u6216\u5220\u9664\uFF0C\u4F46\u65E0\u6CD5\u81EA\u52A8\u68C0\u67E5\u66F4\u65B0\u3002",
    externalSource: "\u5916\u90E8\u6765\u6E90",
    externalSourceBody: "\u6765\u6E90\u7531\u5176\u4ED6\u5DE5\u5177\u8BB0\u5F55\uFF1A{source}\u3002\u672C\u63D2\u4EF6\u53EF\u4EE5\u67E5\u770B\u548C\u5220\u9664\u8BE5\u6280\u80FD\uFF0C\u4F46\u65E0\u6CD5\u81EA\u52A8\u68C0\u67E5\u6216\u66F4\u65B0\u5176\u8FDC\u7AEF\u7248\u672C\u3002",
    sourceSite: "\u6765\u6E90\u7AD9\u70B9",
    digest: "\u5185\u5BB9\u6458\u8981",
    linked: "\u5916\u90E8\u7BA1\u7406",
    backupEmpty: "\u6682\u65E0\u5907\u4EFD\u8BB0\u5F55",
    backupEmptyBody: "\u6280\u80FD\u66F4\u65B0\u548C\u5220\u9664\u524D\u7684\u5185\u5BB9\u4F1A\u4FDD\u7559\u5728\u8FD9\u91CC\uFF0C\u6062\u590D\u4E0D\u4F1A\u8986\u76D6\u73B0\u6709\u6280\u80FD\u3002",
    backupActionUpdate: "\u66F4\u65B0\u524D\u7248\u672C",
    backupActionRemove: "\u5DF2\u79FB\u9664\u6280\u80FD",
    restore: "\u6062\u590D",
    preserved: "\u5907\u4EFD\u4FDD\u5B58\u5728\u5404\u6280\u80FD\u76EE\u5F55\u4E0B\u7684 .skills-manager/backups \u4E2D\uFF0C\u76F4\u5230\u4F60\u660E\u786E\u5220\u9664\u3002",
    backupHint: "\u66F4\u65B0\u548C\u5220\u9664\u524D\u4F1A\u628A\u5B8C\u6574\u65E7\u7248\u672C\u79FB\u5165\u8BE5\u6280\u80FD\u76EE\u5F55\u7684 .skills-manager/backups/<id>/content\u3002\u6062\u590D\u4E0D\u4F1A\u8986\u76D6\u5DF2\u5B58\u5728\u7684\u6280\u80FD\uFF1B\u5783\u573E\u6876\u6309\u94AE\u4F1A\u6C38\u4E45\u5220\u9664\u5907\u4EFD\u3002\u5907\u4EFD\u4E0D\u4F1A\u81EA\u52A8\u6E05\u7406\u3002",
    deleteBackup: "\u5220\u9664\u5907\u4EFD",
    warningTitle: "\u90E8\u5206\u6765\u6E90\u9700\u8981\u5904\u7406",
    truncated: "\u5217\u8868\u8FBE\u5230\u914D\u7F6E\u4E0A\u9650\uFF0C\u8BF7\u7F29\u5C0F\u8303\u56F4\u6216\u8C03\u9AD8 maxSkills\u3002",
    noWritable: "\u5F53\u524D\u914D\u7F6E\u6CA1\u6709\u53EF\u5199\u7684\u6280\u80FD\u4F4D\u7F6E\u3002",
    readOnlyMode: "\u53EA\u8BFB\u6A21\u5F0F\uFF1A\u5B89\u88C5\u3001\u66F4\u65B0\u3001\u5220\u9664\u548C\u6062\u590D\u5DF2\u7981\u7528\u3002",
    bytes: "{count} \u5B57\u8282",
    checkedAt: "\u68C0\u67E5\u4E8E {time}",
    cliImported: "\u8BFB\u53D6\u81EA Skills CLI \u7684\u6765\u6E90\u8BB0\u5F55",
    safeNote: "\u4E0D\u81EA\u52A8\u66F4\u65B0 \xB7 \u4E0D\u6267\u884C\u4E0B\u8F7D\u5185\u5BB9 \xB7 \u5220\u9664\u53EF\u6062\u590D",
    sourceLink: "\u5728 GitHub \u67E5\u770B\u6765\u6E90",
    externalDirectory: "\u516C\u5171\u6280\u80FD\u76EE\u5F55",
    requestFailed: "\u64CD\u4F5C\u5931\u8D25\u3002",
    retry: "\u91CD\u8BD5",
    "root.user-agents": "\u7528\u6237 \xB7 \u5171\u4EAB\u6280\u80FD",
    "root.user-dsh": "\u7528\u6237 \xB7 DSH",
    "root.project-agents": "\u9879\u76EE \xB7 \u5171\u4EAB\u6280\u80FD",
    "root.project-dsh": "\u9879\u76EE \xB7 DSH",
    "root.custom": "\u81EA\u5B9A\u4E49 \xB7 \u53EA\u8BFB",
    "root.bundled": "\u5185\u7F6E\u76EE\u5F55 \xB7 \u53EA\u8BFB",
    "root.runtime": "DSH \u6280\u80FD\u76EE\u5F55 \xB7 \u53EA\u8BFB",
    fromLocal: "\u672C\u5730\u5F52\u6863",
    fromWellKnown: "well-known \u6765\u6E90",
    updateAll: "\u5168\u90E8\u66F4\u65B0",
    batchTitle: "\u66F4\u65B0\u5168\u90E8\u5DF2\u68C0\u67E5\u7684\u6280\u80FD\uFF1F",
    batchBody: "\u6BCF\u4E2A\u6280\u80FD\u90FD\u4F1A\u91CD\u65B0\u5BF9\u7167\u5DF2\u8BB0\u5F55\u7684\u6765\u6E90\u6821\u9A8C\uFF0C\u65E7\u7248\u672C\u4FDD\u7559\u4E3A\u5907\u4EFD\u3002\u5B58\u5728\u672C\u5730\u4FEE\u6539\u7684\u6280\u80FD\u9ED8\u8BA4\u8DF3\u8FC7\uFF0C\u9664\u975E\u4F60\u660E\u786E\u5141\u8BB8\u66FF\u6362\u3002",
    batchOverwrite: "\u540C\u65F6\u66F4\u65B0\u5B58\u5728\u672C\u5730\u4FEE\u6539\u7684\u6280\u80FD\uFF08\u4F1A\u5148\u5907\u4EFD\uFF09\u3002",
    batchRunning: "\u6B63\u5728\u6279\u91CF\u66F4\u65B0\u2026",
    batchResult: "\u6279\u91CF\u66F4\u65B0\uFF1A\u6210\u529F {updated} \u9879\uFF0C\u8DF3\u8FC7 {skipped} \u9879\uFF0C\u5931\u8D25 {failed} \u9879\u3002",
    batchFailedNames: "\u5931\u8D25\u9879\uFF1A{names}",
    batchNone: "\u5F53\u524D\u6CA1\u6709\u53EF\u66F4\u65B0\u7684\u5DF2\u68C0\u67E5\u6280\u80FD\uFF0C\u8BF7\u5148\u6267\u884C\u68C0\u67E5\u66F4\u65B0\u3002",
    diffTitle: "\u6587\u4EF6\u53D8\u66F4",
    diffAdded: "\u65B0\u589E",
    diffRemoved: "\u5220\u9664",
    diffChanged: "\u4FEE\u6539",
    diffUnchanged: "\u672A\u53D8",
    diffFailed: "\u65E0\u6CD5\u83B7\u53D6\u6587\u4EF6\u5BF9\u6BD4",
    diffEmpty: "\u6CA1\u6709\u53D1\u73B0\u6587\u4EF6\u53D8\u66F4\u3002",
    moveTitle: "\u79FB\u52A8\u6216\u91CD\u547D\u540D\u6B64\u6280\u80FD",
    moveBody: "\u5C06\u6280\u80FD\u79FB\u5230\u53E6\u4E00\u4E2A\u53EF\u5199\u4F4D\u7F6E\uFF0C\u6216\u4FEE\u6539\u5176\u76EE\u5F55\u540D\u3002\u8DE8\u4F4D\u7F6E\u79FB\u52A8\u4F1A\u5148\u590D\u5236\u7ECF\u8FC7\u6821\u9A8C\u7684\u6587\u4EF6\uFF0C\u65E7\u5165\u53E3\u4FDD\u7559\u4E3A\u5907\u4EFD\u3002",
    moveRoot: "\u76EE\u6807\u4F4D\u7F6E",
    moveName: "\u76EE\u5F55\u540D",
    moveButton: "\u79FB\u52A8 / \u91CD\u547D\u540D",
    moving: "\u6B63\u5728\u79FB\u52A8\u2026",
    moved: "\u5DF2\u79FB\u52A8 {name}\u3002",
    permanentDelete: "\u540C\u65F6\u6C38\u4E45\u5220\u9664\u5907\u4EFD\uFF08\u4E0D\u53EF\u6062\u590D\uFF09",
    permanentWarning: "\u6C38\u4E45\u5220\u9664\u4F1A\u7ACB\u5373\u79FB\u9664\u6280\u80FD\u6587\u4EF6\uFF0C\u4E0D\u4FDD\u7559\u53EF\u6062\u590D\u7684\u5907\u4EFD\u3002",
    localTitle: "\u4ECE\u672C\u5730\u5F52\u6863\u5B89\u88C5",
    localBody: "\u67E5\u770B\u4F60\u5DF2\u4FE1\u4EFB\u7684\u5F52\u6863\u3002\u53EA\u63A5\u53D7\u6839\u76EE\u5F55\u542B SKILL.md \u7684 .tar.gz\u3001.tgz \u6216 .zip\uFF1B\u5F52\u6863\u5728\u5185\u5B58\u4E2D\u89E3\u6790\uFF0C\u4E0D\u4F1A\u6267\u884C\u811A\u672C\u3002",
    localPath: "\u5F52\u6863\u7EDD\u5BF9\u8DEF\u5F84",
    localPlaceholder: "/Users/you/Downloads/skill.tar.gz",
    localTrust: "\u6211\u5DF2\u67E5\u770B\u8BE5\u5F52\u6863\u5E76\u4FE1\u4EFB\u5176\u6307\u4EE4\u4E0E\u8D44\u6E90\u3002",
    localButton: "\u5B89\u88C5\u5F52\u6863",
    localInstalled: "\u5DF2\u4ECE\u672C\u5730\u5F52\u6863\u5B89\u88C5 {name}\u3002",
    localHint: "\u672C\u5730\u5F52\u6863\u6CA1\u6709\u6765\u6E90\u8BB0\u5F55\uFF1A\u53EF\u4EE5\u67E5\u770B\u3001\u79FB\u52A8\u548C\u5220\u9664\uFF0C\u4F46\u65E0\u6CD5\u81EA\u52A8\u66F4\u65B0\u3002",
    purgeTitle: "\u5220\u9664\u6B64\u5907\u4EFD\uFF1F",
    purgeBody: "\u5907\u4EFD\u6587\u4EF6\u4F1A\u88AB\u6C38\u4E45\u5220\u9664\uFF0C\u5DF2\u5B89\u88C5\u7684\u6280\u80FD\u4E0D\u53D7\u5F71\u54CD\u3002",
    purgeAllTitle: "\u6E05\u7406\u5907\u4EFD",
    purgeAllBody: "\u6E05\u7406\u6B64\u4F4D\u7F6E\u4E2D\u8F83\u65E7\u7684\u5907\u4EFD\uFF0C\u4FDD\u7559\u6700\u65B0 {keep} \u4EFD\uFF1B\u4E0D\u4F1A\u89E6\u78B0\u5907\u4EFD\u5B58\u50A8\u4E4B\u5916\u7684\u4EFB\u4F55\u5185\u5BB9\u3002",
    purgeKeep: "\u4FDD\u7559\u5907\u4EFD\u6570",
    purgeButton: "\u5220\u9664\u5907\u4EFD",
    purged: "\u5DF2\u6E05\u7406 {count} \u4EFD\u5907\u4EFD\uFF08{bytes}\uFF09\u3002",
    restoreTarget: "\u6062\u590D\u4F4D\u7F6E",
    restoreName: "\u6062\u590D\u4E3A",
    restoreToBody: "\u628A\u6B64\u5907\u4EFD\u6062\u590D\u5230\u6240\u9009\u7684\u53EF\u5199\u4F4D\u7F6E\u3002\u4E0D\u4F1A\u8986\u76D6\u5DF2\u5B58\u5728\u7684\u5165\u53E3\uFF1B\u6062\u590D\u5230\u5176\u4ED6\u4F4D\u7F6E\u65F6\uFF0C\u590D\u5236\u6210\u529F\u540E\u4F1A\u4ECE\u539F\u4F4D\u7F6E\u79FB\u9664\u8BE5\u5907\u4EFD\u3002",
    wellKnownTitle: "\u4ECE well-known \u6765\u6E90\u5B89\u88C5",
    wellKnownBody: "\u8F93\u5165\u516C\u5171 HTTPS \u6280\u80FD\u76EE\u5F55\u7684\u57FA\u5740\u3002\u63D2\u4EF6\u4F1A\u8BFB\u53D6\u5176 .well-known/agent-skills/index.json\uFF0C\u6821\u9A8C\u5F52\u6863\u6458\u8981\u5E76\u5728\u5185\u5B58\u4E2D\u89E3\u6790\u3002",
    wellKnownPlaceholder: "https://open.feishu.cn/lark-cli/skills/regular",
    wellKnownInspect: "\u68C0\u67E5\u6765\u6E90",
    wellKnownSkills: "\u6B64\u6765\u6E90\u4E2D\u7684\u6280\u80FD",
    wellKnownUnsupported: "\u4E0D\u53EF\u5B89\u88C5\uFF08\u5F52\u6863\u7C7B\u578B\u4E0D\u652F\u6301\uFF09",
    wellKnownInstall: "\u5B89\u88C5\u6280\u80FD",
    wellKnownDone: "\u5DF2\u4ECE well-known \u6765\u6E90\u5B89\u88C5 {name}\u3002",
    wellKnownHint: "\u4EC5\u652F\u6301\u5E26 sha256 \u6458\u8981\u7684 archive \u6761\u76EE\uFF1B\u4E0D\u4F1A\u6267\u884C\u811A\u672C\u3002",
    nameTakenByOther: "\u300C{name}\u300D\u5DF2\u88AB\u6B64\u4F4D\u7F6E\u6765\u81EA {source} \u7684\u6280\u80FD\u5360\u7528\u3002DSH \u5BF9\u540C\u540D\u6280\u80FD\u53EA\u4F1A\u751F\u6548\u4E00\u4E2A\uFF0C\u8BF7\u5148\u5220\u9664\u6216\u66F4\u65B0\u8BE5\u6280\u80FD\u3002",
    openInstalled: "\u67E5\u770B\u5DF2\u5B89\u88C5\u6280\u80FD",
    entryCollision: "\u76EE\u5F55\u540D\u300C{entry}\u300D\u5728\u6B64\u4F4D\u7F6E\u5DF2\u88AB\u5360\u7528\u3002",
    stepSource: "\u9009\u62E9\u6765\u6E90",
    stepChoose: "\u9009\u62E9\u6280\u80FD",
    stepReview: "\u67E5\u770B\u5E76\u5B89\u88C5",
    autoInspecting: "\u6B63\u5728\u8BFB\u53D6\u4ED3\u5E93\u5185\u5BB9\u2026",
    searchSkillsInRepo: "\u7B5B\u9009\u6B64\u4ED3\u5E93\u4E2D\u7684\u6280\u80FD\u2026",
    preferredMissing: "\u6B64\u4ED3\u5E93\u4E2D\u6CA1\u6709\u300C{name}\u300D\uFF0C\u53EF\u5728\u4E0B\u65B9\u4ECE\u4ED3\u5E93\u5DF2\u6709\u6280\u80FD\u4E2D\u6311\u9009\u3002",
    inspectRetry: "\u91CD\u8BD5",
    sameSourceInstalled: "\u300C{name}\u300D\u5DF2\u4ECE\u6B64\u6765\u6E90\u5B89\u88C5\uFF0C\u5EFA\u8BAE\u76F4\u63A5\u66F4\u65B0\uFF0C\u907F\u514D\u91CD\u590D\u5B89\u88C5\u3002",
    updateInstead: "\u66F4\u65B0\u5DF2\u5B89\u88C5\u7248\u672C",
    alreadyOtherSource: "\u300C{name}\u300D\u5728\u6B64\u4F4D\u7F6E\u5DF2\u5B58\u5728\uFF08\u6765\u6E90\u4E0D\u540C\uFF09\uFF0C\u5B89\u88C5\u4E0D\u4F1A\u8986\u76D6\u5B83\u3002",
    duplicateHint: "\u53EF\u4EE5\u6362\u4E00\u4E2A\u5B89\u88C5\u4F4D\u7F6E\uFF0C\u6216\u6362\u4E00\u4E2A\u76EE\u5F55\u540D\u5B89\u88C5\u3002",
    renameInstall: "\u6362\u4E00\u4E2A\u76EE\u5F55\u540D\u5B89\u88C5",
    entryName: "\u76EE\u5F55\u540D",
    entryHint: "\u6280\u80FD\u4ECD\u4F7F\u7528 SKILL.md \u4E2D\u58F0\u660E\u7684\u540D\u79F0\uFF0C\u53EA\u6539\u53D8\u76EE\u5F55\u540D\u3002",
    installStepHint: "\u5728\u6700\u540E\u4E00\u6B65\u786E\u8BA4\u5E76\u901A\u8FC7\u6587\u4EF6\u6821\u9A8C\u524D\uFF0C\u4E0D\u4F1A\u5411\u78C1\u76D8\u5199\u5165\u4EFB\u4F55\u5185\u5BB9\u3002",
    searchUnavailable: "\u6280\u80FD\u68C0\u7D22\u670D\u52A1\u5F53\u524D\u4E0D\u53EF\u7528\uFF0C\u53EF\u76F4\u63A5\u68C0\u67E5 GitHub \u4ED3\u5E93\u3002",
    resultOpen: "\u5728 skills.sh \u6253\u5F00",
    settingsIntro: "\u5728\u8BBE\u7F6E\u4E2D\u7BA1\u7406 DSH \u80FD\u8BC6\u522B\u7684\u5168\u90E8\u6280\u80FD\u3002",
    showInstalled: "\u5728\u300C\u672C\u5730\u6280\u80FD\u300D\u4E2D\u67E5\u770B"
  };

  // src/client/components.tsx
  var import_react = __toESM(__require("react"), 1);
  function Icon({ name: name2 = "book", size = 18, spin = false }) {
    const paths = {
      book: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 6.5C9.5 4.8 6.5 4.3 3 5v14c3.5-.7 6.5-.2 9 1.5C14.5 18.8 17.5 18.3 21 19V5c-3.5-.7-6.5-.2-9 1.5Z" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 6.5v14M6 9h3M6 12h3M15 9h3M15 12h3" })),
      refresh: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M20 7v5h-5M4 17v-5h5" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M6.1 7a7 7 0 0 1 11.8-1L20 9M4 15l2.1 3A7 7 0 0 0 18 17" })),
      search: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "10.5", cy: "10.5", r: "6.5" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "m15.5 15.5 5 5" })),
      plus: /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 5v14M5 12h14" }),
      down: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" })),
      up: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 17V3m-5 5 5-5 5 5M4 17v4h16v-4" })),
      trash: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6" })),
      lock: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "5", y: "10", width: "14", height: "11", rx: "2" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M8 10V7a4 4 0 0 1 8 0v3M12 14v3" })),
      close: /* @__PURE__ */ import_react.default.createElement("path", { d: "m6 6 12 12M18 6 6 18" }),
      check: /* @__PURE__ */ import_react.default.createElement("path", { d: "m5 12 4 4L19 6" }),
      warning: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "m12 3 10 18H2L12 3Z" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 9v5M12 17h.01" })),
      arrow: /* @__PURE__ */ import_react.default.createElement("path", { d: "m9 5 7 7-7 7" }),
      back: /* @__PURE__ */ import_react.default.createElement("path", { d: "m15 5-7 7 7 7" }),
      archive: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M4 8h16v13H4V8Z" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 3h18v5H3V3ZM9 12h6" })),
      info: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 11v5M12 8h.01" })),
      copy: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("rect", { x: "9", y: "9", width: "11", height: "11", rx: "2" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M5 15V5a2 2 0 0 1 2-2h10" })),
      restore: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 4v6h6" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 10a9 9 0 1 1 1 8M12 7v5l3 2" })),
      link: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "m10 14 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0", transform: "translate(2 0) scale(.85)" })),
      move: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" })),
      list: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M8 6h13M8 12h13M8 18h13" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 6h.01M3 12h.01M3 18h.01" }))
    };
    return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", className: spin ? "skm-spinner" : void 0 }, paths[name2] ?? paths.book);
  }
  function Loader({ text }) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-loader", role: "status" }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: "refresh", spin: true }), text);
  }
  function Empty({ title, body, children }) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-empty" }, /* @__PURE__ */ import_react.default.createElement("p", { className: "skm-empty-title" }, title), /* @__PURE__ */ import_react.default.createElement("p", { className: "skm-empty-body" }, body), children);
  }
  function Notice({ text, kind = "info", onClose }) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: `skm-notice skm-notice-${kind}`, role: kind === "error" ? "alert" : "status" }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: kind === "success" ? "check" : kind === "error" || kind === "warning" ? "warning" : "lock", size: 16 }), /* @__PURE__ */ import_react.default.createElement("span", { className: "skm-notice-message" }, text), onClose && /* @__PURE__ */ import_react.default.createElement("button", { className: "skm-close", type: "button", "aria-label": "\xD7", onClick: onClose }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: "close", size: 14 })));
  }
  function Steps({ steps, active }) {
    return /* @__PURE__ */ import_react.default.createElement("ol", { className: "skm-steps", "aria-label": steps.join(" \xB7 ") }, steps.map((label, index) => /* @__PURE__ */ import_react.default.createElement("li", { key: `${index}-${label}`, className: `skm-step${index === active ? " skm-step-active" : index < active ? " skm-step-done" : ""}`, "aria-current": index === active ? "step" : void 0 }, /* @__PURE__ */ import_react.default.createElement("span", { className: "skm-step-index" }, index < active ? /* @__PURE__ */ import_react.default.createElement(Icon, { name: "check", size: 11 }) : index + 1), /* @__PURE__ */ import_react.default.createElement("span", { className: "skm-step-label" }, label))));
  }
  function StatusBadge({ skill, t }) {
    const status = !skill.valid ? "invalid" : !skill.writable ? "protected" : skill.check?.status ?? (skill.source ? "unchecked" : "untracked");
    const labels = { invalid: "invalid", protected: "protected", update: "update", latest: "latest", error: "checkError", untracked: "untracked", unchecked: "unchecked" };
    return /* @__PURE__ */ import_react.default.createElement("span", { className: `skm-badge ${status === "update" ? "skm-badge-update" : status === "latest" ? "skm-badge-success" : status === "error" || status === "invalid" ? "skm-badge-error" : ""}` }, status === "protected" && /* @__PURE__ */ import_react.default.createElement(Icon, { name: "lock", size: 10 }), " ", t(labels[status] ?? "unchecked"));
  }
  function ProgressBar({ value, label }) {
    const percent = Math.max(0, Math.min(100, Math.round(value)));
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-progress", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent, "aria-label": label }, /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-progress-bar", style: { width: `${percent}%` } }));
  }
  function rootLabel(root, t) {
    return root ? t(`root.${root.source}`) : "";
  }
  function bytes(value) {
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }
  function time(value, locale) {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }
  function errorText(error) {
    return error instanceof Error ? error.message : String(error);
  }
  function Dialog({ title, t, children, footer, onClose, small = false, alert = false }) {
    const ref = (0, import_react.useRef)(null);
    const titleId = (0, import_react.useId)();
    (0, import_react.useEffect)(() => {
      const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const root = ref.current;
      const body = root?.querySelector(".skm-modal-body");
      const first = body?.querySelector("[data-autofocus], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled)") ?? root?.querySelector("[data-autofocus]");
      (first ?? root)?.focus();
      return () => {
        if (previous?.isConnected) previous.focus();
      };
    }, []);
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-backdrop", onPointerDown: (event) => {
      if (event.target === event.currentTarget) onClose();
    } }, /* @__PURE__ */ import_react.default.createElement("div", { ref, className: `skm-modal ${small ? "skm-modal-small" : ""}`, role: alert ? "alertdialog" : "dialog", "aria-modal": "true", "aria-labelledby": titleId, tabIndex: -1, onKeyDown: (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = Array.from(ref.current?.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]') ?? []);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (!first) {
        event.preventDefault();
        ref.current?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } }, /* @__PURE__ */ import_react.default.createElement("header", { className: "skm-modal-header" }, /* @__PURE__ */ import_react.default.createElement("h2", { id: titleId }, title), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "skm-close", "aria-label": t("close"), onClick: onClose }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: "close" }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-modal-body" }, children), footer && /* @__PURE__ */ import_react.default.createElement("footer", { className: "skm-modal-footer" }, footer)));
  }

  // src/client/panels.tsx
  var import_react2 = __toESM(__require("react"), 1);
  var EXAMPLES = ["browser", "typescript", "design", "testing"];
  function DiscoverPanel({ t, locale, writable, disabled, modalOpen, search, onReview, onWellKnown, onError }) {
    const [query, setQuery] = (0, import_react2.useState)("");
    const [results, setResults] = (0, import_react2.useState)(null);
    const [busy, setBusy] = (0, import_react2.useState)(false);
    const [error, setError] = (0, import_react2.useState)("");
    const alive = (0, import_react2.useRef)(true);
    const life = (0, import_react2.useRef)(new AbortController());
    (0, import_react2.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    const run = (0, import_react2.useCallback)(async (value) => {
      const trimmed = value.trim();
      if (!trimmed || busy) return;
      setQuery(value);
      setBusy(true);
      setError("");
      try {
        const value2 = await search(trimmed);
        if (alive.current) setResults(value2);
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : String(caught);
        if (alive.current) {
          setError(message);
          onError(message);
        }
      } finally {
        if (alive.current) setBusy(false);
      }
    }, [busy, onError, search]);
    const blocked = disabled || modalOpen;
    return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-panel-actions" }, /* @__PURE__ */ import_react2.default.createElement("button", { className: "skm-button", type: "button", disabled: blocked || !writable, onClick: onWellKnown }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "down", size: 15 }), t("fromWellKnown"))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-search-block" }, /* @__PURE__ */ import_react2.default.createElement("form", { className: "skm-search-row", onSubmit: (event) => {
      event.preventDefault();
      void run(query);
    } }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-search skm-search-wide" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "search", size: 16 }), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-search-input", value: query, onChange: (event) => setQuery(event.target.value), placeholder: t("searchPlaceholder"), "aria-label": t("search"), maxLength: 200 })), /* @__PURE__ */ import_react2.default.createElement("button", { type: "submit", className: "skm-button skm-button-primary", disabled: busy || !query.trim() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "search", size: 15, spin: busy }), t("searchButton"))), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("searchHint")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-examples" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-hint" }, t("popular")), EXAMPLES.map((value) => /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-example", key: value, disabled: busy, onClick: () => void run(value) }, value)))), error && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("searchUnavailable"))), busy ? /* @__PURE__ */ import_react2.default.createElement(Loader, { text: `${t("search")}\u2026` }) : results ? results.items.length ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-list" }, results.items.map((hit, index) => /* @__PURE__ */ import_react2.default.createElement("article", { className: "skm-card", key: `${hit.id}-${index}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-body" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-head" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-card-title" }, hit.name)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-meta" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-identity" }, hit.repository), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-meta-text" }, t("downloads", { count: new Intl.NumberFormat(locale).format(hit.installs) })))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-foot" }, /* @__PURE__ */ import_react2.default.createElement("a", { className: "skm-link-button skm-link", href: hit.url, target: "_blank", rel: "noopener noreferrer" }, t("resultOpen"), " \u2197"), /* @__PURE__ */ import_react2.default.createElement("button", { className: "skm-button skm-button-primary skm-button-small", type: "button", disabled: blocked || !writable, onClick: () => onReview({ source: hit.repository, name: hit.name, ...hit.skillId ? { skillId: hit.skillId } : {} }) }, t("inspectInstall"), /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "arrow", size: 13 })))))) : /* @__PURE__ */ import_react2.default.createElement(Empty, { title: t("searchEmpty"), body: t("searchHint") }) : /* @__PURE__ */ import_react2.default.createElement(Empty, { title: t("searchPrompt"), body: t("searchPromptBody") }));
  }
  function SkillCard({ skill, root, t, disabled, jobActive, onOpen }) {
    const open = (action) => {
      if (!disabled) onOpen(action);
    };
    return /* @__PURE__ */ import_react2.default.createElement("article", { className: "skm-card", "data-invalid": skill.valid ? void 0 : "true" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-card-content", disabled, onClick: () => open("detail") }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-card-head" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-card-title" }, skill.name), /* @__PURE__ */ import_react2.default.createElement(StatusBadge, { skill, t })), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-card-desc" }, skill.description || skill.issue), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-card-meta" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-meta-text" }, rootLabel(root, t)), skill.source && /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-identity" }, skill.source.repository), skill.source?.commit && skill.source.commit !== "unknown" && /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-identity" }, skill.source.commit.slice(0, 8)))), skill.check?.status === "error" && /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-card-error skm-card-error-outside", role: "status" }, skill.check.message), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-foot" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-actions" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-link-button", "aria-label": `${t("viewDetails")} ${skill.name}`, disabled, onClick: () => open("detail") }, t("viewDetails")), skill.check?.status === "update" && skill.writable && /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-link-button skm-link-accent", disabled: disabled || jobActive, onClick: () => open("update") }, t("updateButton")), skill.writable && /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-link-button skm-link-danger", "aria-label": `${t("remove")} ${skill.name}`, disabled, onClick: () => open("remove") }, t("remove")))));
  }
  function BackupsPanel({ t, locale, catalog, backups, loading, disabled, modalOpen, onRestore, onPurge }) {
    if (loading) return /* @__PURE__ */ import_react2.default.createElement(Loader, { text: t("loading") });
    if (!backups.length) return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(Empty, { title: t("backupEmpty"), body: t("backupEmptyBody") }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("preserved")));
    const blocked = disabled || modalOpen;
    const singleRoot = new Set(backups.map((backup) => backup.rootId)).size === 1;
    return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, singleRoot && /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-panel-actions" }, /* @__PURE__ */ import_react2.default.createElement("button", { className: "skm-button", type: "button", disabled: blocked, onClick: () => onPurge({ rootId: backups[0].rootId, count: backups.length }) }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "trash", size: 15 }), t("purgeAllTitle"))), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("backupHint")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-list" }, backups.map((backup) => {
      const root = catalog?.roots.find((item) => item.id === backup.rootId);
      const backupPath = root ? `${root.path}/.skills-manager/backups/${backup.id}` : "";
      return /* @__PURE__ */ import_react2.default.createElement("article", { className: "skm-card", key: `${backup.rootId}-${backup.id}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-body" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-head" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-card-title" }, backup.name), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-badge" }, t(backup.action === "update" ? "backupActionUpdate" : "backupActionRemove"))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-meta" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-meta-text" }, time(backup.createdAt, locale)), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-meta-text" }, rootLabel(root, t)), typeof backup.sizeBytes === "number" && /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-meta-text" }, bytes(backup.sizeBytes), " \xB7 ", t("files", { count: backup.fileCount ?? 0 })), backup.source && /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-identity" }, backup.source.repository)), backupPath && /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-card-path skm-mono", title: backupPath }, backupPath)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-foot" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-actions" }, /* @__PURE__ */ import_react2.default.createElement("button", { className: "skm-link-button skm-link-accent", type: "button", disabled: blocked || !root?.writable, onClick: () => onRestore(backup) }, t("restore")), /* @__PURE__ */ import_react2.default.createElement("button", { className: "skm-link-button skm-link-danger", type: "button", "aria-label": `${t("deleteBackup")} ${backup.name}`, disabled: blocked || !root?.writable, onClick: () => onPurge({ rootId: backup.rootId, backup, count: 1 }) }, t("deleteBackup")))));
    })), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("preserved")));
  }

  // src/client/dialogs.tsx
  var import_react3 = __toESM(__require("react"), 1);

  // src/client/choices.ts
  function folderName(skillPath) {
    const parts = skillPath.split("/").filter(Boolean);
    return parts.length > 1 ? parts[parts.length - 2] ?? "" : "";
  }
  function normalise(value) {
    return (value ?? "").trim().toLowerCase();
  }
  function chooseRepositorySkill(skills, hints) {
    if (skills.length === 0) return void 0;
    const wanted = [normalise(hints.skillId), normalise(hints.name)].filter((value) => value.length > 0);
    for (const hint of wanted) {
      const byName = skills.find((skill) => normalise(skill.name) === hint);
      if (byName) return byName;
    }
    for (const hint of wanted) {
      const byFolder = skills.find((skill) => normalise(folderName(skill.skillPath)) === hint);
      if (byFolder) return byFolder;
    }
    for (const hint of wanted) {
      const partial = skills.find((skill) => normalise(skill.name).includes(hint) || normalise(folderName(skill.skillPath)).includes(hint));
      if (partial) return partial;
    }
    return skills.length === 1 ? skills[0] : void 0;
  }
  function installConflict(catalog, rootId, name2, entry, source) {
    if (!catalog || !rootId) return { kind: "none" };
    const wantedEntry = normalise(entry ?? name2);
    const wantedName = normalise(name2);
    const scoped = catalog.skills.filter((skill) => skill.rootId === rootId);
    const entryOwner = scoped.find((skill) => normalise(skill.entry) === wantedEntry);
    const nameOwner = scoped.find((skill) => normalise(skill.name) === wantedName);
    const sameSource = (skill) => !!skill && skill.source?.repository === source.repository && skill.source?.skillPath === source.skillPath;
    const kind = sameSource(entryOwner) || sameSource(nameOwner) ? "same-source" : entryOwner || nameOwner ? "other-source" : "none";
    return { kind, ...entryOwner ? { entryOwner } : {}, ...nameOwner ? { nameOwner } : {} };
  }
  function suggestEntryName(catalog, rootId, name2, repository) {
    const taken = new Set((catalog?.skills ?? []).filter((skill) => skill.rootId === rootId).map((skill) => skill.entry.toLowerCase()));
    if (!taken.has(normalise(name2))) return name2;
    const suffix = (repository.split("/")[1] ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    const base = `${normalise(name2)}${suffix ? `-${suffix}` : ""}`.replace(/^-+|-+$/g, "") || `${normalise(name2)}-2`;
    if (!taken.has(base)) return base;
    for (let index = 2; index < 100; index++) {
      const candidate = `${base}-${index}`;
      if (!taken.has(candidate)) return candidate;
    }
    return base;
  }
  function installStep(state) {
    if (state.preview) return 2;
    if (state.repository) return 1;
    return 0;
  }

  // src/client/dialogs.tsx
  var scope = (workspaceId) => workspaceId ? { workspaceId } : {};
  function SourceLink({ repository, revision, t }) {
    if (!revision) return /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null);
    return /* @__PURE__ */ import_react3.default.createElement("a", { className: "skm-source-link", href: `https://github.com/${repository}/tree/${encodeURIComponent(revision)}`, target: "_blank", rel: "noopener noreferrer" }, t("sourceLink"), " \u2197");
  }
  function InstallDialog({ initialSource, preferredName, preferredSkillId, ...props }) {
    const { api, t, catalog, workspaceId } = props;
    const roots = catalog.roots.filter((root) => root.writable);
    const [source, setSource] = (0, import_react3.useState)(initialSource);
    const [ref, setRef] = (0, import_react3.useState)("");
    const [repository, setRepository] = (0, import_react3.useState)(null);
    const [preview, setPreview] = (0, import_react3.useState)(null);
    const [picked, setPicked] = (0, import_react3.useState)(null);
    const [skillFilter, setSkillFilter] = (0, import_react3.useState)("");
    const [rootId, setRootId] = (0, import_react3.useState)(roots.find((root) => root.source === "user-agents")?.id ?? roots[0]?.id ?? "");
    const [renaming, setRenaming] = (0, import_react3.useState)(false);
    const [entry, setEntry] = (0, import_react3.useState)("");
    const [trusted, setTrusted] = (0, import_react3.useState)(false);
    const [busy, setBusy] = (0, import_react3.useState)("");
    const [error, setError] = (0, import_react3.useState)("");
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    const autoStarted = (0, import_react3.useRef)(false);
    const pending = (0, import_react3.useRef)(null);
    const targetSource = { repository: preview?.repository ?? "", skillPath: preview?.skill.skillPath ?? "" };
    const occupied = preview ? installConflict(catalog, rootId, preview.skill.name, void 0, targetSource) : { kind: "none" };
    const effective = preview ? installConflict(catalog, rootId, preview.skill.name, renaming ? entry.trim() || preview.skill.name : void 0, targetSource) : { kind: "none" };
    const canRename = occupied.kind === "other-source" && !!occupied.entryOwner && !occupied.nameOwner;
    const step = installStep({ source: !!source.trim(), repository: !!repository, preview: !!preview });
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      if (!autoStarted.current && initialSource.trim()) {
        autoStarted.current = true;
        void inspect(initialSource.trim());
      }
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    (0, import_react3.useEffect)(() => {
      const item = pending.current;
      if (!item || busy) return;
      pending.current = null;
      void open(item.info, item.skill);
    }, [repository, busy]);
    function close() {
      life.current.abort();
      props.onClose();
    }
    function back() {
      if (busy) return;
      if (preview) {
        setPreview(null);
        setPicked(null);
        setTrusted(false);
        setRenaming(false);
        setEntry("");
        setError("");
      } else if (repository) {
        setRepository(null);
        setError("");
      } else close();
    }
    async function inspect(value = source.trim()) {
      if (!value || busy) return;
      setBusy("inspecting");
      setError("");
      setTrusted(false);
      setPreview(null);
      setPicked(null);
      setRepository(null);
      setRenaming(false);
      setEntry("");
      try {
        const info = await api.call({ action: "inspect", source: value, ...ref.trim() ? { ref: ref.trim() } : {}, ...scope(workspaceId) }, life.current.signal);
        if (!alive.current) return;
        setRepository(info);
        const matched = chooseRepositorySkill(info.skills, { name: preferredName, skillId: preferredSkillId });
        if (matched) pending.current = { info, skill: matched };
      } catch (error2) {
        if (alive.current) setError(errorText(error2));
      } finally {
        if (alive.current) setBusy("");
      }
    }
    async function open(info, skill) {
      if (busy) return;
      setBusy("loading");
      setError("");
      setTrusted(false);
      setRenaming(false);
      setEntry("");
      try {
        const value = await api.call({ action: "preview", source: info.repository, ref: info.ref, commit: info.commit, skillPath: skill.skillPath, ...scope(workspaceId) }, life.current.signal);
        if (alive.current) {
          setPreview(value);
          setPicked(skill);
        }
      } catch (error2) {
        if (alive.current) setError(errorText(error2));
      } finally {
        if (alive.current) setBusy("");
      }
    }
    async function install() {
      if (!preview || !trusted || !rootId || busy || effective.kind !== "none") return;
      const rename = renaming && entry.trim() && entry.trim() !== preview.skill.name ? { entry: entry.trim() } : {};
      setBusy("installing");
      setError("");
      props.onBusy(true, t("installing"));
      try {
        const result = await api.call({ action: "install", rootId, source: preview.repository, ref: preview.ref, commit: preview.commit, skillPath: preview.skill.skillPath, ...rename, ...scope(workspaceId) }, life.current.signal);
        props.onMutated(result);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy("");
        props.onBusy(false);
        props.onSettled();
      }
    }
    async function updateInstalled(existing) {
      if (!preview || busy) return;
      setBusy("updating");
      setError("");
      props.onBusy(true, t("updating"));
      try {
        const detail = await api.call({ action: "detail", id: existing.id, ...scope(workspaceId) }, life.current.signal);
        if (detail.locallyModified) throw new Error(`${t("modified")} \xB7 ${t("modifiedBody")}`);
        await api.call({ action: "update-start", id: existing.id, expectedFingerprint: detail.fingerprint, commit: preview.commit, ...scope(workspaceId) }, life.current.signal);
        if (alive.current) props.onJobStarted?.();
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy("");
        props.onBusy(false);
      }
    }
    function startRename() {
      if (!preview) return;
      setRenaming(true);
      setEntry(suggestEntryName(catalog, rootId, preview.skill.name, preview.repository));
    }
    const filtered = repository ? repository.skills.filter((skill) => `${skill.name} ${skill.description} ${skill.skillPath}`.toLowerCase().includes(skillFilter.toLowerCase().trim())) : [];
    const missingPreferred = !!repository && !!preferredName && !repository.skills.some((skill) => skill.name.toLowerCase() === preferredName.toLowerCase() || skill.skillPath.split("/").slice(-2)[0]?.toLowerCase() === preferredName.toLowerCase());
    const sameSourceOwner = occupied.kind === "same-source" ? occupied.entryOwner : void 0;
    const primary = preview ? sameSourceOwner && !renaming ? { label: t("updateInstead"), icon: "up", run: () => void updateInstalled(sameSourceOwner), disabled: !!busy } : { label: t(busy === "installing" ? "installing" : "install"), icon: busy === "installing" ? "refresh" : "down", run: () => void install(), disabled: !!busy || !trusted || !rootId || effective.kind !== "none" } : !repository ? { label: t(busy === "inspecting" ? "inspecting" : "inspect"), icon: busy === "inspecting" ? "refresh" : "search", run: () => void inspect(), disabled: !source.trim() || !!busy } : null;
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title: preview ? `${t("install")} \xB7 ${preview.skill.name}` : t("fromRepo"), t, onClose: close, footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: back, disabled: busy === "installing" || busy === "updating" }, preview || repository ? t("back") : t("cancel")), primary && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: occupied.kind === "same-source" && !renaming && preview ? "skm-button skm-button-primary" : "skm-button skm-button-primary", disabled: primary.disabled, onClick: primary.run }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: primary.icon, spin: !!busy }), primary.label)) }, /* @__PURE__ */ import_react3.default.createElement(Steps, { steps: [t("stepSource"), t("stepChoose"), t("stepReview")], active: step }), error && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button", disabled: !!busy, onClick: () => {
      setError("");
      if (repository && picked) void open(repository, picked);
      else void inspect();
    } }, t("inspectRetry"))), !repository && !preview && /* @__PURE__ */ import_react3.default.createElement("form", { className: "skm-form-grid", onSubmit: (event) => {
      event.preventDefault();
      void inspect();
    } }, /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field skm-full" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("repository")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: source, onChange: (event) => setSource(event.target.value), placeholder: t("repoPlaceholder"), autoComplete: "off", spellCheck: false, disabled: !!busy, "data-autofocus": true, maxLength: 400 })), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field skm-full" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("branch")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: ref, onChange: (event) => setRef(event.target.value), placeholder: "HEAD", autoComplete: "off", spellCheck: false, disabled: !!busy, maxLength: 200 }), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, t("refHint"))), /* @__PURE__ */ import_react3.default.createElement("button", { type: "submit", hidden: true })), repository && !preview && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, repository.repository), /* @__PURE__ */ import_react3.default.createElement("span", null, repository.ref), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, repository.commit.slice(0, 12))), busy ? /* @__PURE__ */ import_react3.default.createElement(Loader, { text: t(busy === "loading" ? "loading" : "autoInspecting") }) : /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, missingPreferred && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("preferredMissing", { name: preferredName }) }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-section-title" }, t("chooseSkill"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-count" }, repository.skills.length)), repository.skills.length > 5 && /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: skillFilter, onChange: (event) => setSkillFilter(event.target.value), placeholder: t("searchSkillsInRepo"), "aria-label": t("searchSkillsInRepo"), disabled: !!busy, maxLength: 120 }), !busy && /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-skill-options" }, filtered.map((skill) => /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-skill-option", key: skill.skillPath, disabled: !!busy, onClick: () => void open(repository, skill) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "book" }), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-skill-option-main" }, /* @__PURE__ */ import_react3.default.createElement("strong", null, skill.name), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-description" }, skill.description), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono skm-hint" }, skill.skillPath)), /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "arrow", size: 16 })))), !repository.skills.length && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("noRepoSkills"), kind: "warning" }), repository.truncated && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("truncated"), kind: "warning" }), repository.warnings.length > 0 && /* @__PURE__ */ import_react3.default.createElement("details", { className: "skm-hint" }, /* @__PURE__ */ import_react3.default.createElement("summary", null, t("warningTitle")), /* @__PURE__ */ import_react3.default.createElement("ul", { className: "skm-warning-list" }, repository.warnings.map((item, index) => /* @__PURE__ */ import_react3.default.createElement("li", { key: index }, item)))))), preview && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text skm-summary-clamp" }, preview.skill.description), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, preview.repository), /* @__PURE__ */ import_react3.default.createElement("span", null, preview.ref), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, preview.commit.slice(0, 12)), /* @__PURE__ */ import_react3.default.createElement(SourceLink, { repository: preview.repository, revision: preview.commit, t })), occupied.kind === "same-source" && occupied.entryOwner && !renaming && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("sameSourceInstalled", { name: preview.skill.name }) }), occupied.kind === "other-source" && occupied.nameOwner && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("nameTakenByOther", { name: preview.skill.name, source: occupied.nameOwner.source?.repository ?? t("externalSource") }), kind: "warning" }), props.onOpenInstalled && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button", onClick: () => props.onOpenInstalled?.(occupied.nameOwner), disabled: !!busy }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "info", size: 14 }), t("openInstalled"))), occupied.kind === "other-source" && occupied.entryOwner && !occupied.nameOwner && !renaming && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("entryCollision", { entry: occupied.entryOwner.entry }), kind: "warning" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("duplicateHint"))), canRename && !renaming && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button", onClick: startRename, disabled: !!busy }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "move", size: 14 }), t("renameInstall")), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field", style: { marginTop: 15 } }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("target")), /* @__PURE__ */ import_react3.default.createElement("select", { className: "skm-select", value: rootId, onChange: (event) => {
      setRootId(event.target.value);
      setRenaming(false);
      setEntry("");
    }, disabled: !!busy }, !roots.length && /* @__PURE__ */ import_react3.default.createElement("option", { value: "" }, t("selectLocation")), roots.map((root) => /* @__PURE__ */ import_react3.default.createElement("option", { value: root.id, key: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), !roots.length && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("noWritable"), kind: "warning" }), renaming && /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("entryName")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: entry, onChange: (event) => setEntry(event.target.value), disabled: !!busy, maxLength: 200 }), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, t("entryHint"))), renaming && effective.kind !== "none" && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("entryCollision", { entry: entry.trim() || preview.skill.name }), kind: "warning" }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-section-title" }, t("instructions")), /* @__PURE__ */ import_react3.default.createElement("pre", { className: "skm-code" }, preview.content), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-section-title" }, t("resources"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, t("files", { count: preview.files.length }), " \xB7 ", bytes(preview.totalBytes))), /* @__PURE__ */ import_react3.default.createElement("ul", { className: "skm-file-list" }, preview.files.map((file) => /* @__PURE__ */ import_react3.default.createElement("li", { key: file.path }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, file.path), /* @__PURE__ */ import_react3.default.createElement("span", null, bytes(file.bytes))))), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react3.default.createElement("input", { type: "checkbox", checked: trusted, onChange: (event) => setTrusted(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react3.default.createElement("span", null, t("trust"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-checkbox-hint" }, t("trustHint"))))), !preview && /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("installStepHint")));
  }
  function SkillDialog({ skill, initialAction, onMove, ...props }) {
    const { api, t, locale, workspaceId } = props;
    const [detail, setDetail] = (0, import_react3.useState)(null);
    const [mode, setMode] = (0, import_react3.useState)(initialAction === "update" ? "detail" : initialAction);
    const [busy, setBusy] = (0, import_react3.useState)("loading");
    const [error, setError] = (0, import_react3.useState)("");
    const [overwrite, setOverwrite] = (0, import_react3.useState)(false);
    const [permanent, setPermanent] = (0, import_react3.useState)(false);
    const [diff, setDiff] = (0, import_react3.useState)(null);
    const [diffError, setDiffError] = (0, import_react3.useState)("");
    const [copied, setCopied] = (0, import_react3.useState)(false);
    const copyTimer = (0, import_react3.useRef)(void 0);
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    const initialized = (0, import_react3.useRef)(false);
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      void load(initialAction === "update");
      return () => {
        alive.current = false;
        life.current.abort();
        if (copyTimer.current) clearTimeout(copyTimer.current);
      };
    }, [skill.id]);
    function close() {
      life.current.abort();
      props.onClose();
    }
    async function load(update = false) {
      setBusy("loading");
      setError("");
      setOverwrite(false);
      setPermanent(false);
      setDiff(null);
      setDiffError("");
      setCopied(false);
      try {
        let value = await api.call({ action: "detail", id: skill.id, ...scope(workspaceId) }, life.current.signal);
        if (update && value.skill.source && value.skill.writable) {
          const checks = await api.call({ action: "check", id: skill.id, ...scope(workspaceId) }, life.current.signal);
          const checked = checks[0];
          if (!checked || checked.status === "error" || checked.status === "untracked" || checked.status === "protected") throw new Error(checked?.message ?? t("noSource"));
          value = { ...value, skill: { ...value.skill, check: checked } };
          if (checked.status === "update") {
            try {
              const comparison = await api.call({ action: "diff", id: skill.id, ...scope(workspaceId) }, life.current.signal);
              if (alive.current) setDiff(comparison);
            } catch (error2) {
              if (alive.current) setDiffError(errorText(error2));
            }
          }
        }
        if (alive.current) {
          setDetail(value);
          if (update) setMode("update");
          initialized.current = true;
        }
      } catch (error2) {
        if (alive.current) setError(errorText(error2));
      } finally {
        if (alive.current) setBusy("");
      }
    }
    async function checkUpdate() {
      if (!busy) await load(true);
    }
    async function copyPath() {
      const path = detail?.skill.path;
      if (!path || !navigator.clipboard) return;
      try {
        await navigator.clipboard.writeText(path);
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => {
          if (alive.current) setCopied(false);
        }, 1600);
      } catch {
        if (alive.current) setError(t("copyFailed"));
      }
    }
    async function mutate() {
      if (!detail || !detail.skill.writable || busy || mode === "detail" || mode === "update" && detail.locallyModified && !overwrite) return;
      setBusy(mode === "update" ? "updating" : "removing");
      setError("");
      props.onBusy(true, t(mode === "update" ? "updating" : "removing"));
      try {
        if (mode === "update") {
          await api.call({ action: "update-start", id: skill.id, expectedFingerprint: detail.fingerprint, ...detail.skill.check?.latestCommit ? { commit: detail.skill.check.latestCommit } : {}, ...overwrite ? { overwriteModified: true } : {}, ...scope(workspaceId) }, life.current.signal);
          if (alive.current) props.onJobStarted?.();
          return;
        }
        const result = await api.call({ action: "remove", id: skill.id, expectedFingerprint: detail.fingerprint, ...permanent ? { permanent: true } : {}, ...scope(workspaceId) }, life.current.signal);
        props.onMutated(result);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy("");
        props.onBusy(false);
        props.onSettled();
      }
    }
    const title = mode === "remove" ? t("removeTitle") : mode === "update" ? t("updateTitle") : `${t("details")} \xB7 ${skill.name}`;
    const canUpdate = !!detail?.skill.source && detail.skill.writable && detail.skill.format === "directory";
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title, t, onClose: close, alert: mode !== "detail", footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, mode !== "detail" ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: () => {
      if (!busy) {
        setMode("detail");
        setOverwrite(false);
        setError("");
      } else close();
    } }, t("cancel")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: `skm-button ${mode === "remove" ? "skm-button-danger" : "skm-button-primary"}`, disabled: !detail || !detail.skill.writable || !!busy || mode === "update" && !!props.jobActive || mode === "update" && !!detail.locallyModified && !overwrite || mode === "update" && detail.skill.check?.status === "latest" && !detail.locallyModified, onClick: () => void mutate() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : mode === "remove" ? "trash" : "up", spin: !!busy }), busy ? t(busy) : t(mode === "remove" ? "confirmRemove" : "confirmUpdate"))) : /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", onClick: close }, t("close")), detail?.skill.writable && detail.skill.format !== "registry" && onMove && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button", onClick: () => onMove(detail.skill), disabled: !!busy }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "move", size: 15 }), t("moveButton")), detail?.skill.writable && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-danger", onClick: () => {
      setMode("remove");
      setError("");
    }, disabled: !!busy }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "trash", size: 15 }), t("remove")), canUpdate && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", onClick: () => void checkUpdate(), disabled: !!busy }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : detail.skill.check?.status === "update" ? "up" : "refresh", spin: !!busy }), busy ? t(busy) : detail.skill.check?.status === "update" ? t("updateButton") : t("check")))) }, error && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button", onClick: () => {
      setMode("detail");
      void load();
    }, disabled: !!busy }, t("retry"))), busy === "loading" && /* @__PURE__ */ import_react3.default.createElement(Loader, { text: t("loading") }), detail && mode !== "detail" && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, t(mode === "remove" ? "removeBody" : "updateBody")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card skm-card-row" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-mark" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "book" })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react3.default.createElement("strong", { className: "skm-result-name" }, detail.skill.name), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-description" }, detail.skill.description), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react3.default.createElement("span", null, t("files", { count: detail.files.length })), /* @__PURE__ */ import_react3.default.createElement("span", null, bytes(detail.totalBytes))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-hint skm-mono" }, detail.skill.path))), mode === "update" && (detail.skill.check?.latestCommit || detail.skill.check?.latestDigest) && /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-grid" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-label" }, t("source")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-value skm-mono" }, detail.skill.source?.repository)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-label" }, t("revision")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-value skm-mono" }, detail.skill.check?.latestCommit ? detail.skill.check.latestCommit.slice(0, 12) : detail.skill.check?.latestDigest?.slice(7, 19) ?? ""))), mode === "update" && props.jobActive && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("jobActiveNotice"), kind: "warning" }), mode === "update" && detail.skill.check?.status === "latest" && !detail.locallyModified && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("latest"), kind: "success" }), mode === "update" && detail.locallyModified && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(Notice, { text: `${t("modified")} \xB7 ${t("modifiedBody")}`, kind: "warning" }), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react3.default.createElement("input", { type: "checkbox", checked: overwrite, onChange: (event) => setOverwrite(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react3.default.createElement("span", null, t("overwrite")))), mode === "update" && diff && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-section-title" }, t("diffTitle"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, t("diffAdded"), " ", diff.added, " \xB7 ", t("diffRemoved"), " ", diff.removed, " \xB7 ", t("diffChanged"), " ", diff.changed, " \xB7 ", t("diffUnchanged"), " ", diff.unchanged)), diff.added + diff.removed + diff.changed === 0 ? /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("diffEmpty")) : /* @__PURE__ */ import_react3.default.createElement("ul", { className: "skm-file-list" }, diff.files.filter((file) => file.status !== "unchanged").slice(0, 200).map((file) => /* @__PURE__ */ import_react3.default.createElement("li", { key: file.path }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, file.path), /* @__PURE__ */ import_react3.default.createElement("span", null, t(file.status === "added" ? "diffAdded" : file.status === "removed" ? "diffRemoved" : "diffChanged")))))), mode === "update" && diffError && /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("diffFailed"), ": ", diffError), mode === "remove" && /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react3.default.createElement("input", { type: "checkbox", checked: permanent, onChange: (event) => setPermanent(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react3.default.createElement("span", null, t("permanentDelete"))), mode === "remove" && permanent && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("permanentWarning"), kind: "warning" })), detail && mode === "detail" && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, detail.skill.description), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-grid" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-label" }, t("location")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-value" }, rootLabel(props.catalog.roots.find((root) => root.id === detail.skill.rootId), t))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-label" }, t("revision")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-value skm-mono" }, detail.skill.source?.kind === "well-known" ? detail.skill.source.digest ? `${t("digest")} ${detail.skill.source.digest.slice(7, 19)}` : t("localOnly") : detail.skill.source?.commit && detail.skill.source.commit !== "unknown" ? detail.skill.source.commit.slice(0, 12) : detail.skill.source?.imported ? t("cliImported") : t("localOnly"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-label" }, t("updateStatus")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-value skm-status-cell" }, /* @__PURE__ */ import_react3.default.createElement(StatusBadge, { skill: detail.skill, t }), detail.skill.check?.checkedAt && /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, time(detail.skill.check.checkedAt, locale)))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-label" }, t("model")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-value" }, t(detail.skill.modelInvocable ? "enabled" : "disabled"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-label" }, t("user")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-detail-value" }, t(detail.skill.userInvocable ? "enabled" : "disabled")))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-path-row" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint skm-mono" }, detail.skill.path), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet skm-copy-button", onClick: () => void copyPath(), "aria-label": t("copyPath"), title: t("copyPath") }, copied ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "check", size: 13 }), t("pathCopied")) : /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "copy", size: 14 }))), detail.skill.source?.kind === "well-known" && /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta", style: { marginTop: 9 } }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, detail.skill.source.repository), detail.skill.source.sourceBaseUrl && /* @__PURE__ */ import_react3.default.createElement("a", { className: "skm-source-link", href: detail.skill.source.sourceBaseUrl, target: "_blank", rel: "noopener noreferrer" }, t("sourceSite"), " \u2197")), detail.skill.source && detail.skill.source.kind !== "well-known" && /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta", style: { marginTop: 9 } }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, detail.skill.source.repository), detail.skill.source.ref && /* @__PURE__ */ import_react3.default.createElement("span", null, detail.skill.source.ref), /* @__PURE__ */ import_react3.default.createElement(SourceLink, { repository: detail.skill.source.repository, revision: detail.skill.source.commit && detail.skill.source.commit !== "unknown" ? detail.skill.source.commit : detail.skill.source.ref, t })), detail.locallyModified && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: `${t("modified")} \xB7 ${t("modifiedBody")}`, kind: "warning" }), !detail.skill.source && detail.skill.origin && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("externalSourceBody", { source: detail.skill.origin.label }) }), !detail.skill.source && !detail.skill.origin && detail.skill.writable && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("noSource") }), detail.skill.issue && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: detail.skill.issue, kind: "warning" }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-section-title" }, t("instructions")), /* @__PURE__ */ import_react3.default.createElement("pre", { className: "skm-code" }, detail.content), detail.files.length > 0 && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-section-title" }, t("resources"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, t("files", { count: detail.files.length }), " \xB7 ", bytes(detail.totalBytes))), /* @__PURE__ */ import_react3.default.createElement("ul", { className: "skm-file-list" }, detail.files.map((file) => /* @__PURE__ */ import_react3.default.createElement("li", { key: file.path }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, file.path), /* @__PURE__ */ import_react3.default.createElement("span", null, bytes(file.bytes))))))));
  }
  function RestoreDialog({ backup, ...props }) {
    const { t } = props;
    const writableRoots = props.catalog.roots.filter((root) => root.writable);
    const originalWritable = props.catalog.roots.find((root) => root.id === backup.rootId)?.writable ?? false;
    const [target, setTarget] = (0, import_react3.useState)(originalWritable ? backup.rootId : writableRoots[0]?.id ?? backup.rootId);
    const [entry, setEntry] = (0, import_react3.useState)(backup.entry);
    const [busy, setBusy] = (0, import_react3.useState)(false);
    const [error, setError] = (0, import_react3.useState)("");
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    const sameRoot = target === backup.rootId;
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    function close() {
      life.current.abort();
      props.onClose();
    }
    async function restore() {
      if (busy) return;
      setBusy(true);
      setError("");
      props.onBusy(true, t("restoring"));
      try {
        const name2 = entry.trim();
        const result = await props.api.call(sameRoot ? { action: "restore", rootId: backup.rootId, backupId: backup.id, ...scope(props.workspaceId) } : { action: "restore-to", fromRootId: backup.rootId, backupId: backup.id, toRootId: target, ...name2 && name2 !== backup.entry ? { entry: name2 } : {}, ...scope(props.workspaceId) }, life.current.signal);
        props.onMutated(result);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy(false);
        props.onBusy(false);
        props.onSettled();
      }
    }
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title: t("restoreTitle"), t, alert: true, onClose: close, footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || !target, onClick: () => void restore() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : "restore", spin: busy }), t(busy ? "restoring" : "confirmRestore"))) }, error && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, sameRoot ? t("restoreBody") : t("restoreToBody")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card skm-card-row" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-mark skm-backup-icon" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "archive" })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react3.default.createElement("strong", null, backup.name), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-hint" }, time(backup.createdAt, props.locale)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-hint" }, rootLabel(props.catalog.roots.find((root) => root.id === backup.rootId), t)))), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("restoreTarget")), /* @__PURE__ */ import_react3.default.createElement("select", { className: "skm-select", value: target, onChange: (event) => setTarget(event.target.value), disabled: busy }, writableRoots.map((root) => /* @__PURE__ */ import_react3.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), !sameRoot && /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("restoreName")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: entry, onChange: (event) => setEntry(event.target.value), disabled: busy, maxLength: 200 })));
  }
  function MoveDialog({ skill, ...props }) {
    const { t } = props;
    const roots = props.catalog.roots.filter((root) => root.writable);
    const [target, setTarget] = (0, import_react3.useState)(roots[0]?.id ?? skill.rootId);
    const [entry, setEntry] = (0, import_react3.useState)(skill.entry);
    const [busy, setBusy] = (0, import_react3.useState)(false);
    const [error, setError] = (0, import_react3.useState)("");
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    function close() {
      life.current.abort();
      props.onClose();
    }
    async function move() {
      if (busy || !target) return;
      setBusy(true);
      setError("");
      props.onBusy(true, t("moving"));
      try {
        const name2 = entry.trim();
        const result = await props.api.call({ action: "move", id: skill.id, rootId: target, ...name2 && name2 !== skill.entry ? { entry: name2 } : {}, ...scope(props.workspaceId) }, life.current.signal);
        props.onMutated(result);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy(false);
        props.onBusy(false);
        props.onSettled();
      }
    }
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title: t("moveTitle"), t, onClose: close, footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || !target, onClick: () => void move() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : "move", spin: busy }), t(busy ? "moving" : "moveButton"))) }, error && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, t("moveBody")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-hint skm-mono" }, skill.path), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("moveRoot")), /* @__PURE__ */ import_react3.default.createElement("select", { className: "skm-select", value: target, onChange: (event) => setTarget(event.target.value), disabled: busy }, roots.map((root) => /* @__PURE__ */ import_react3.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("moveName")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: entry, onChange: (event) => setEntry(event.target.value), disabled: busy, maxLength: 200 })));
  }
  function BatchUpdateDialog({ skills, ...props }) {
    const { t } = props;
    const [overwrite, setOverwrite] = (0, import_react3.useState)(false);
    const [busy, setBusy] = (0, import_react3.useState)(false);
    const [error, setError] = (0, import_react3.useState)("");
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    function close() {
      life.current.abort();
      props.onClose();
    }
    async function run() {
      if (busy) return;
      setBusy(true);
      setError("");
      props.onBusy(true, t("batchRunning"));
      try {
        await props.api.call({ action: "update-batch-start", ids: skills.map((skill) => skill.id), ...overwrite ? { overwriteModified: true } : {}, ...scope(props.workspaceId) }, life.current.signal);
        if (alive.current) props.onJobStarted?.();
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy(false);
        props.onBusy(false);
      }
    }
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title: t("batchTitle"), t, alert: true, onClose: close, footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || skills.length === 0 || !!props.jobActive, onClick: () => void run() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : "up", spin: busy }), t(busy ? "batchRunning" : "confirmUpdate"))) }, error && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), props.jobActive && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("jobActiveNotice"), kind: "warning" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, t("batchBody")), /* @__PURE__ */ import_react3.default.createElement("ul", { className: "skm-file-list" }, skills.map((skill) => /* @__PURE__ */ import_react3.default.createElement("li", { key: skill.id }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, skill.name), /* @__PURE__ */ import_react3.default.createElement("span", null, rootLabel(props.catalog.roots.find((root) => root.id === skill.rootId), t))))), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react3.default.createElement("input", { type: "checkbox", checked: overwrite, onChange: (event) => setOverwrite(event.target.checked), disabled: busy }), /* @__PURE__ */ import_react3.default.createElement("span", null, t("batchOverwrite"))));
  }
  function PurgeDialog({ rootId, backup, count, onPurged, ...props }) {
    const { t } = props;
    const [keep, setKeep] = (0, import_react3.useState)(0);
    const [busy, setBusy] = (0, import_react3.useState)(false);
    const [error, setError] = (0, import_react3.useState)("");
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    function close() {
      life.current.abort();
      props.onClose();
    }
    async function purge() {
      if (busy) return;
      setBusy(true);
      setError("");
      props.onBusy(true, t("purgeButton"));
      try {
        const result = await props.api.call(backup ? { action: "purge-backup", rootId, backupId: backup.id, ...scope(props.workspaceId) } : { action: "purge-backups", rootId, keep, ...scope(props.workspaceId) }, life.current.signal);
        onPurged(result.removed, result.freedBytes);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy(false);
        props.onBusy(false);
      }
    }
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title: backup ? t("purgeTitle") : t("purgeAllTitle"), t, alert: true, onClose: close, footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: `skm-button ${backup ? "skm-button-danger" : "skm-button-primary"}`, disabled: busy, onClick: () => void purge() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : "trash", spin: busy }), t(busy ? "purgeButton" : "purgeButton"))) }, error && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, backup ? t("purgeBody") : t("purgeAllBody", { keep })), backup ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card skm-card-row" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-mark skm-backup-icon" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "archive" })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react3.default.createElement("strong", null, backup.name), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-hint" }, time(backup.createdAt, props.locale), " \xB7 ", rootLabel(props.catalog.roots.find((root) => root.id === backup.rootId), t)))) : /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("backupEmptyBody")), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("purgeKeep")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", type: "number", min: 0, max: 1e4, value: keep, onChange: (event) => setKeep(Math.max(0, Math.min(1e4, Number(event.target.value) || 0))), disabled: busy }))));
  }
  function LocalInstallDialog({ ...props }) {
    const { t } = props;
    const roots = props.catalog.roots.filter((root) => root.writable);
    const [path, setPath] = (0, import_react3.useState)("");
    const [rootId, setRootId] = (0, import_react3.useState)(roots[0]?.id ?? "");
    const [trusted, setTrusted] = (0, import_react3.useState)(false);
    const [busy, setBusy] = (0, import_react3.useState)(false);
    const [error, setError] = (0, import_react3.useState)("");
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    function close() {
      life.current.abort();
      props.onClose();
    }
    async function install() {
      if (busy || !path.trim() || !rootId || !trusted) return;
      setBusy(true);
      setError("");
      props.onBusy(true, t("installing"));
      try {
        const result = await props.api.call({ action: "install-local", rootId, path: path.trim(), ...scope(props.workspaceId) }, life.current.signal);
        props.onMutated(result);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy(false);
        props.onBusy(false);
        props.onSettled();
      }
    }
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title: t("localTitle"), t, onClose: close, footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || !path.trim() || !rootId || !trusted, onClick: () => void install() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : "down", spin: busy }), t(busy ? "installing" : "localButton"))) }, error && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, t("localBody")), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("localPath")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: path, onChange: (event) => setPath(event.target.value), placeholder: t("localPlaceholder"), autoComplete: "off", spellCheck: false, disabled: busy, maxLength: 4096 })), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("target")), /* @__PURE__ */ import_react3.default.createElement("select", { className: "skm-select", value: rootId, onChange: (event) => setRootId(event.target.value), disabled: busy }, roots.map((root) => /* @__PURE__ */ import_react3.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react3.default.createElement("input", { type: "checkbox", checked: trusted, onChange: (event) => setTrusted(event.target.checked), disabled: busy }), /* @__PURE__ */ import_react3.default.createElement("span", null, t("localTrust"))), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("localHint")));
  }
  function WellKnownInstallDialog({ ...props }) {
    const { t } = props;
    const roots = props.catalog.roots.filter((root) => root.writable);
    const [source, setSource] = (0, import_react3.useState)("");
    const [inspect, setInspect] = (0, import_react3.useState)(null);
    const [picked, setPicked] = (0, import_react3.useState)(null);
    const [rootId, setRootId] = (0, import_react3.useState)(roots[0]?.id ?? "");
    const [trusted, setTrusted] = (0, import_react3.useState)(false);
    const [busy, setBusy] = (0, import_react3.useState)("");
    const [error, setError] = (0, import_react3.useState)("");
    const life = (0, import_react3.useRef)(new AbortController());
    const alive = (0, import_react3.useRef)(true);
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      return () => {
        alive.current = false;
        life.current.abort();
      };
    }, []);
    function close() {
      life.current.abort();
      props.onClose();
    }
    function reset() {
      setPicked(null);
      setTrusted(false);
      setError("");
    }
    async function readSource() {
      if (busy || !source.trim()) return;
      setBusy("inspect");
      setError("");
      setInspect(null);
      reset();
      try {
        const value = await props.api.call({ action: "well-known-inspect", source: source.trim(), ...scope(props.workspaceId) }, life.current.signal);
        if (alive.current) setInspect(value);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy("");
      }
    }
    async function install() {
      if (busy || !inspect || !picked || !rootId || !trusted) return;
      setBusy("install");
      setError("");
      props.onBusy(true, t("installing"));
      try {
        const result = await props.api.call({ action: "well-known-install", rootId, source: inspect.baseUrl, name: picked.name, ...scope(props.workspaceId) }, life.current.signal);
        props.onMutated(result);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy("");
        props.onBusy(false);
        props.onSettled();
      }
    }
    return /* @__PURE__ */ import_react3.default.createElement(Dialog, { title: t("wellKnownTitle"), t, onClose: close, footer: /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: () => {
      if (picked) reset();
      else close();
    }, disabled: busy === "install" }, picked ? t("back") : t("cancel")), !inspect ? /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: !!busy || !source.trim(), onClick: () => void readSource() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy === "inspect" ? "refresh" : "search", spin: busy === "inspect" }), t("wellKnownInspect")) : /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: !!busy || !picked || !rootId || !trusted || picked.type !== "archive", onClick: () => void install() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy === "install" ? "refresh" : "down", spin: busy === "install" }), t("wellKnownInstall"))) }, error && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-plain-text" }, t("wellKnownBody")), !inspect ? /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("source")), /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: source, onChange: (event) => setSource(event.target.value), placeholder: t("wellKnownPlaceholder"), autoComplete: "off", spellCheck: false, disabled: !!busy, maxLength: 400 })) : !picked ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, inspect.warnings.map((warning, index) => /* @__PURE__ */ import_react3.default.createElement(Notice, { key: index, text: warning, kind: "warning" })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-section-title" }, t("wellKnownSkills"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-count" }, inspect.skills.length)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-skill-options" }, inspect.skills.map((entry) => /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-skill-option", key: entry.name, disabled: entry.type !== "archive", onClick: () => setPicked(entry) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: entry.type === "archive" ? "book" : "lock" }), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-skill-option-main" }, /* @__PURE__ */ import_react3.default.createElement("strong", null, entry.name), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-description" }, entry.description ?? ""), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono skm-hint" }, entry.type === "archive" ? entry.digest.slice(7, 19) : t("wellKnownUnsupported"))), /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "arrow", size: 16 }))))) : /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card skm-card-row" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-mark" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "book" })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react3.default.createElement("strong", null, picked.name), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-description" }, picked.description ?? ""), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, inspect.label), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, picked.digest.slice(7, 19))))), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-field-label" }, t("target")), /* @__PURE__ */ import_react3.default.createElement("select", { className: "skm-select", value: rootId, onChange: (event) => setRootId(event.target.value), disabled: !!busy }, roots.map((root) => /* @__PURE__ */ import_react3.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), /* @__PURE__ */ import_react3.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react3.default.createElement("input", { type: "checkbox", checked: trusted, onChange: (event) => setTrusted(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react3.default.createElement("span", null, t("trust"))), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("wellKnownHint"))));
  }

  // src/client/jobs.tsx
  var import_react4 = __toESM(__require("react"), 1);
  var jobStatusKey = { running: "jobStatusRunning", completed: "jobStatusCompleted", failed: "jobStatusFailed", cancelled: "jobStatusCancelled" };
  var itemStatusKey = { pending: "jobItemPending", running: "jobItemRunning", updated: "jobItemUpdated", failed: "jobItemFailed", skipped: "jobItemSkipped", cancelled: "jobItemCancelled" };
  var phaseKey = { queued: "phaseQueued", resolve: "phaseResolve", download: "phaseDownload", verify: "phaseVerify", backup: "phaseBackup", install: "phaseInstall", done: "phaseDone" };
  function itemTone(status) {
    return status === "updated" ? " skm-badge-success" : status === "failed" ? " skm-badge-error" : status === "running" ? " skm-badge-update" : "";
  }
  function jobTone(status) {
    return status === "running" ? " skm-badge-update" : status === "completed" ? " skm-badge-success" : status === "failed" ? " skm-badge-error" : "";
  }
  function JobsPanel({ jobs, roots, t, locale, onCancel, onRetry, onOpenSkill }) {
    if (jobs.length === 0) return /* @__PURE__ */ import_react4.default.createElement(Empty, { title: t("jobsEmpty"), body: t("jobsEmptyBody") });
    return /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-list" }, jobs.map((job) => {
      const running = job.status === "running";
      return /* @__PURE__ */ import_react4.default.createElement("article", { className: "skm-card", key: job.id, "data-job-status": job.status }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-card-body" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-card-head" }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-card-title" }, job.kind === "update" ? t("jobSingle", { name: job.items[0]?.name ?? "" }) : t("jobBatch", { count: job.total })), /* @__PURE__ */ import_react4.default.createElement("span", { className: `skm-badge${jobTone(job.status)}` }, t(jobStatusKey[job.status])), running && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text skm-job-percent" }, t("jobProgress", { percent: job.progress }))), /* @__PURE__ */ import_react4.default.createElement(ProgressBar, { value: job.progress, label: t("jobProgress", { percent: job.progress }) }), /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-card-meta" }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text" }, t("jobCounts", { updated: job.succeeded, failed: job.failed, skipped: job.skipped, cancelled: job.cancelled })), job.startedAt && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text" }, t("jobStartedAt", { time: time(job.startedAt, locale) })), job.finishedAt && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text" }, t("jobFinishedAt", { time: time(job.finishedAt, locale) }))), /* @__PURE__ */ import_react4.default.createElement("ul", { className: "skm-job-items" }, job.items.map((item) => /* @__PURE__ */ import_react4.default.createElement("li", { className: "skm-job-item", key: item.id, "data-status": item.status }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-job-item-head" }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-job-name" }, item.name), /* @__PURE__ */ import_react4.default.createElement("span", { className: `skm-badge${itemTone(item.status)}` }, t(itemStatusKey[item.status])), item.status === "running" && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text" }, t("jobProgress", { percent: item.progress }), " \xB7 ", t(phaseKey[item.phase ?? "queued"] ?? "phaseQueued")), item.status !== "running" && item.status !== "pending" && item.message && !item.error && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text" }, item.message), /* @__PURE__ */ import_react4.default.createElement("button", { className: "skm-link-button skm-job-open", type: "button", "aria-label": `${t("jobViewSkill")} ${item.name}`, title: t("jobViewSkill"), onClick: () => onOpenSkill(item.id) }, t("jobViewSkill"))), item.status === "running" && /* @__PURE__ */ import_react4.default.createElement(ProgressBar, { value: item.progress, label: `${item.name} ${t("jobProgress", { percent: item.progress })}` }), item.error && /* @__PURE__ */ import_react4.default.createElement("p", { className: "skm-card-error", role: "status" }, item.error), /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-card-meta" }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-identity" }, item.entry), rootLabel(roots.find((root) => root.id === item.rootId), t) && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-identity" }, rootLabel(roots.find((root) => root.id === item.rootId), t)), item.backupId && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text" }, t("jobBackup", { id: item.backupId.slice(0, 8) })), item.commit && /* @__PURE__ */ import_react4.default.createElement("span", { className: "skm-meta-text" }, item.commit.slice(0, 8))))))), (running || !running && job.failed > 0) && /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-card-foot" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "skm-card-actions" }, running && /* @__PURE__ */ import_react4.default.createElement("button", { className: "skm-link-button", type: "button", disabled: !!job.cancelRequested, onClick: () => onCancel(job.id) }, job.cancelRequested ? t("jobCancelRequested") : t("jobCancel")), !running && job.failed > 0 && /* @__PURE__ */ import_react4.default.createElement("button", { className: "skm-link-button skm-link-accent", type: "button", onClick: () => onRetry(job) }, t("jobRetry")))));
    }));
  }

  // src/client/styles.css
  var styles_default = `/* Skills manager surface.
   The page renders inside the Settings content column, so it owns no viewport
   scroll of its own. Every value below is taken from the running DSH build's
   own Settings design language (settings cards, underline tabs, native
   buttons/inputs, focus ring, radius scale) so this section never introduces a
   second visual system next to the shell it is rendered in. Tokens carry
   fallbacks: a future build that renames one still renders a sane surface. */
.skm-page{color:var(--dsw-alias-label-primary);font:inherit;max-width:760px;min-width:0}
.skm-page *,.skm-modal *{box-sizing:border-box}
.skm-wrap{display:flex;flex-direction:column;gap:12px;min-width:0;padding:0 0 8px}

/* Header: one heading that matches the Settings navigation label. */
.skm-header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px 12px;flex-wrap:wrap;margin:0}
.skm-heading{flex:1 1 240px;min-width:0}
.skm-title{margin:0;color:var(--dsw-alias-label-primary);font-size:18px;line-height:26px;font-weight:600}
.skm-intro{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.skm-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}

/* Native buttons. */
.skm-button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 14px;border:none;border-radius:var(--dsw-radius-md,8px);background:transparent;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;cursor:pointer;white-space:nowrap}
.skm-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.skm-button:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}
.skm-button:disabled{opacity:.4;cursor:default}
.skm-button-primary{background:var(--dsw-alias-button-primary-fill);box-shadow:none;color:var(--dsw-alias-label-primary-foreground)}
.skm-button-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.skm-button-small{height:28px;padding:0 10px;border-radius:var(--dsw-radius-sm);font-size:12px;line-height:18px}
.skm-button-quiet{box-shadow:none;color:var(--dsw-alias-label-secondary)}
.skm-button-quiet:hover:not(:disabled){color:var(--dsw-alias-label-primary)}
.skm-button-danger{box-shadow:inset 0 0 0 .5px color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);color:var(--dsw-alias-state-error-primary)}
.skm-button-danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}
.skm-icon-button{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.skm-icon-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.skm-icon-button:disabled{opacity:.4;cursor:default}
.skm-link-button{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 10px;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;line-height:18px;text-decoration:none;cursor:pointer;white-space:nowrap}
.skm-link-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
.skm-link-button:disabled{opacity:.4;cursor:default}
.skm-link-accent{color:var(--dsw-alias-state-business-primary)}
.skm-link-danger{color:var(--dsw-alias-state-error-primary)}
.skm-link-danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}

/* Overview: the number cards are the primary filter, so they are buttons. */
.skm-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.skm-tile{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0;padding:10px 12px;border:.5px solid var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l4));border-radius:var(--dsw-radius-xl,12px);background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
.skm-tile:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.skm-tile:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}
.skm-tile:disabled{cursor:default;opacity:.6}
.skm-tile-active{border-color:var(--dsw-static-neutral-bluish-400,var(--dsw-alias-border-l3));background:var(--dsw-alias-bg-module-platform)}
.skm-tile-value{font-size:20px;line-height:26px;font-weight:600;font-variant-numeric:tabular-nums}
.skm-tile-accent{color:var(--dsw-alias-state-business-primary)}
.skm-tile-label{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}

/* Underline tabs, exactly like the built-in Settings sections. */
.skm-tabs{display:flex;align-items:flex-end;gap:22px;margin:0;border-bottom:.5px solid var(--dsw-alias-border-l2);overflow-x:auto;scrollbar-width:none}
.skm-tabs::-webkit-scrollbar{display:none}
.skm-tab{position:relative;display:inline-flex;align-items:center;gap:6px;padding:7px 1px 9px;border:0;background:none;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:13px;line-height:20px;white-space:nowrap;cursor:pointer}
.skm-tab:hover{color:var(--dsw-alias-label-primary)}
.skm-tab[aria-selected=true]{color:var(--dsw-alias-label-primary)}
.skm-tab[aria-selected=true]::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;border-radius:2px 2px 0 0;background:var(--dsw-alias-label-primary)}
.skm-tab-meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}
.skm-panel{display:flex;flex-direction:column;gap:10px;min-width:0;padding-top:2px}
.skm-status{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.skm-status-text{flex:none;font-variant-numeric:tabular-nums}
.skm-status .skm-progress{flex:1 1 120px;max-width:220px;margin:0}

/* Toolbar controls. */
.skm-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.skm-search{position:relative;display:flex;align-items:center;flex:1 1 180px;min-width:140px;color:var(--dsw-alias-label-tertiary)}
.skm-search>svg{position:absolute;left:11px;pointer-events:none}
.skm-search-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px 0 33px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;outline:none}
.skm-search-input::placeholder{color:var(--dsw-alias-label-tertiary)}
.skm-search-input:focus-visible{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary)) 18%,transparent)}
.skm-search-wide{flex:1 1 200px}
.skm-select{box-sizing:border-box;height:32px;padding:0 30px 0 10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md,8px);appearance:none;background-color:var(--dsw-alias-bg-layer-1);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-position:right 9px center;background-repeat:no-repeat;background-size:12px 12px;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;cursor:pointer;min-width:0}
.skm-select:focus-visible{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline:none}
.skm-select:disabled{opacity:.5;cursor:default}
.skm-location,.skm-scope{flex:0 1 150px;max-width:190px}
.skm-toolbar-primary{margin-left:auto}
.skm-toolbar-refresh{margin-left:auto}
.skm-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 8px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:16px;cursor:pointer}
.skm-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.skm-panel-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:0}

/* Settings cards: one clickable content block, one quiet action footer. */
.skm-list{display:flex;flex-direction:column;gap:10px;min-width:0}
.skm-card{display:flex;flex-direction:column;min-width:0;border:.5px solid var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l4));border-radius:var(--dsw-radius-xl,12px);background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-2));overflow:hidden}
.skm-card-content{display:flex;flex-direction:column;gap:4px;width:100%;min-width:0;padding:12px 14px;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.skm-card-content:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.skm-card-content:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}
.skm-card-content:disabled{cursor:default;opacity:.72}
.skm-page .skm-card-content:focus-visible{outline-offset:-2px}
.skm-card-body{display:flex;flex-direction:column;gap:4px;min-width:0;padding:12px 14px}
.skm-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.skm-card-title{min-width:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px;font-weight:500;overflow-wrap:anywhere}
.skm-card-desc{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-card-meta{display:flex;align-items:center;gap:4px 8px;flex-wrap:wrap;min-width:0;margin-top:2px}
.skm-identity{display:inline-block;box-sizing:border-box;max-width:100%;padding:1px 6px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-meta-text{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-card-error-outside{padding:0 14px 8px}
.skm-card-error{margin:2px 0 0;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-card-path{margin:2px 0 0;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.skm-card-foot{display:flex;align-items:center;justify-content:space-between;gap:4px 8px;flex-wrap:wrap;padding:5px 14px 7px;border-top:.5px solid var(--dsw-alias-border-l2)}
.skm-card-actions{display:flex;align-items:center;gap:2px;flex-wrap:wrap;margin-left:-10px}
.skm-card-row{flex-direction:row;align-items:flex-start;gap:10px;padding:12px 14px}
.skm-card-row .skm-card-main{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.skm-card-mark{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary)}
.skm-backup-icon{color:var(--dsw-alias-state-business-primary)}
.skm-result-name{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px;font-weight:500;overflow-wrap:anywhere}

/* Status tags. */
.skm-badge{display:inline-flex;align-items:center;gap:4px;flex:none;padding:1px 6px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-xs,4px);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;white-space:nowrap}
.skm-badge-update{color:var(--dsw-alias-state-business-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 45%,transparent)}
.skm-badge-success{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 45%,transparent)}
.skm-badge-error{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent)}
.skm-status-cell{display:flex;align-items:center;gap:6px;flex-wrap:wrap}

/* Empty and hint surfaces. */
.skm-empty{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px 0;min-width:0}
.skm-empty-title{margin:0;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}
.skm-empty-body{margin:0;max-width:520px;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
.skm-empty>.skm-button,.skm-empty>.skm-add-button{margin-top:10px}
.skm-add-button{display:inline-flex;align-items:center;justify-content:center;gap:6px;align-self:stretch;width:100%;min-width:180px;height:44px;padding:0 14px;border:1px dashed var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg,10px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;cursor:pointer}
.skm-add-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.skm-add-button:disabled{opacity:.4;cursor:default}
.skm-hint{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-safety{padding-top:2px}

/* Notices. */
.skm-notice{display:flex;align-items:flex-start;gap:8px;margin:0;padding:8px 10px;border:0;border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-notice-error{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent)}
.skm-notice-success{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 8%,transparent)}
.skm-notice-warning{color:var(--dsw-alias-state-warn-label,var(--dsw-alias-state-warn-primary));background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent)}
.skm-notice-message{flex:1;min-width:0}
.skm-close{display:grid;place-items:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.skm-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.skm-warning-list{margin:6px 0 0;padding-left:18px}
.skm-warning-list li{margin:4px 0;overflow-wrap:anywhere}
details.skm-notice{display:block}
details.skm-notice summary{cursor:pointer}

/* Discover. */
.skm-search-block{display:flex;flex-direction:column;gap:6px;min-width:0}
.skm-search-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.skm-search-row>.skm-button{flex:none}
.skm-examples{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.skm-example{height:28px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.skm-example:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.skm-example:disabled{opacity:.4;cursor:default}
.skm-source-link{color:var(--dsw-alias-state-business-primary);font-size:12px;line-height:18px;text-decoration:none;white-space:nowrap}
.skm-link{color:var(--dsw-alias-state-business-primary);padding:0 4px}
.skm-link:hover:not(:disabled){color:var(--dsw-alias-state-business-primary);text-decoration:underline;background:transparent}
.skm-source-link:hover{text-decoration:underline}

/* Jobs. */
.skm-job-items{display:flex;flex-direction:column;gap:8px;margin:6px 0 0;padding:0;list-style:none}
.skm-job-item{display:flex;flex-direction:column;gap:2px;min-width:0;padding:8px 10px;border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-alias-bg-module-platform)}
.skm-job-item-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
.skm-job-name{min-width:0;color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;font-weight:500;overflow-wrap:anywhere}
.skm-job-open{flex:none;margin-left:auto}
.skm-job-percent{flex:none}
.skm-job-item .skm-progress{margin-top:4px}

/* Progress and loading. */
.skm-progress{height:4px;border-radius:999px;background:var(--dsw-alias-bg-module-platform);overflow:hidden;margin:4px 0 0}
.skm-progress-bar{height:100%;border-radius:inherit;background:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));transition:width .25s ease}
.skm-loader{display:flex;align-items:center;justify-content:center;gap:8px;min-height:120px;color:var(--dsw-alias-label-tertiary);font-size:13px}
.skm-spinner{animation:skm-spin .8s linear infinite}
@keyframes skm-spin{to{transform:rotate(360deg)}}

/* Forms. */
.skm-field{display:flex;flex-direction:column;gap:6px;min-width:0;margin-bottom:12px}
.skm-field-label{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;font-weight:500}
.skm-input{box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;outline:none}
.skm-input::placeholder{color:var(--dsw-alias-label-tertiary)}
.skm-input:focus-visible{border-color:var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary)) 18%,transparent)}
.skm-input:disabled{opacity:.5}
.skm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.skm-full{grid-column:1/-1}
.skm-checkbox{display:flex;align-items:flex-start;gap:8px;margin-top:12px;color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;cursor:pointer}
.skm-checkbox input{flex:none;margin:2px 0 0;accent-color:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary))}
.skm-checkbox-hint{display:block;margin-top:2px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.skm-count{display:inline-flex;align-items:center;padding:1px 6px;border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}

/* Dialog content pieces reused from earlier versions. */
.skm-meta{display:flex;align-items:center;gap:4px 8px;flex-wrap:wrap;min-width:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
.skm-mono{font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-path-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.skm-copy-button{flex:none;height:24px;padding:0 8px;font-size:11px}
.skm-section-title{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:14px 0 7px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:20px;font-weight:500}
.skm-plain-text{margin:0 0 12px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;overflow-wrap:anywhere;white-space:pre-wrap}
.skm-summary-clamp{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.skm-code{max-height:255px;margin:7px 0 14px;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,10px);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:12px/1.7 var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,monospace);white-space:pre-wrap;overflow-wrap:anywhere;overflow:auto}
.skm-file-list{margin:0;padding:0;list-style:none;max-height:160px;overflow:auto}
.skm-file-list li{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.skm-file-list li:last-child{border-bottom:0}
.skm-file-list li span:first-child{min-width:0;overflow-wrap:anywhere}
.skm-file-list li span:last-child{flex:none;white-space:nowrap}
.skm-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.skm-detail-item{min-width:0}
.skm-detail-label{margin-bottom:4px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
.skm-detail-value{color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
.skm-skill-options{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.skm-skill-option{display:flex;align-items:center;gap:10px;width:100%;min-width:0;padding:10px 12px;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg,10px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
.skm-skill-option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.skm-skill-option:disabled{opacity:.5;cursor:default}
.skm-skill-option-main{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
.skm-skill-option strong{font-size:13px;line-height:20px;font-weight:500}
.skm-steps{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 14px;padding:0;list-style:none}
.skm-step{display:inline-flex;align-items:center;gap:5px;padding:2px 8px 2px 2px;border:.5px solid var(--dsw-alias-border-l3);border-radius:999px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.skm-step-index{display:grid;place-items:center;width:16px;height:16px;border-radius:999px;background:var(--dsw-alias-bg-module-platform);font-size:10px;font-variant-numeric:tabular-nums}
.skm-step-active{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary)}
.skm-step-active .skm-step-index{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base))}
.skm-step-done .skm-step-index{background:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base))}
.skm-step-label{min-width:0;overflow-wrap:anywhere}

/* Dialogs follow the host dialog contract: no border, panel radius, layer-2
   surface, prominent elevation, 16px/500 title, 24px body gutters. */
.skm-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,.4));backdrop-filter:var(--dsw-mask-blur,none)}
.skm-modal{position:relative;z-index:1;display:flex;flex-direction:column;width:min(680px,100%);max-height:calc(100dvh - 48px);border:0;border-radius:var(--dsw-radius-panel,16px);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;box-shadow:var(--dsw-elevation-prominent,0 20px 70px rgba(0,0,0,.35));overflow:hidden}
.skm-modal-small{width:min(470px,100%)}
.skm-modal-header{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:none;padding:22px 14px 12px 24px}
.skm-modal-header h2{margin:0;color:var(--dsw-alias-label-primary);font-size:16px;line-height:24px;font-weight:500;overflow-wrap:anywhere}
.skm-modal-body{display:flex;flex-direction:column;min-height:0;padding:12px 24px 20px;overflow:auto}
.skm-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;flex:none;padding:12px 24px 20px}

/* Focus ring: the host ring, so keyboard users see one consistent outline. */
.skm-button:focus-visible,.skm-icon-button:focus-visible,.skm-link-button:focus-visible,.skm-tab:focus-visible,.skm-tile:focus-visible,.skm-search-input:focus-visible,.skm-select:focus-visible,.skm-chip:focus-visible,.skm-add-button:focus-visible,.skm-example:focus-visible,.skm-close:focus-visible,.skm-skill-option:focus-visible,.skm-input:focus-visible,.skm-page button:focus-visible,.skm-page a:focus-visible,.skm-modal button:focus-visible,.skm-modal a:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}

@media(max-width:640px){
  .skm-actions{width:100%}
  .skm-overview{grid-template-columns:1fr}
  .skm-location,.skm-scope{flex:1 1 120px;max-width:none}
  .skm-search{flex:1 1 100%}
  .skm-card{min-width:0}
  .skm-backdrop{padding:12px}
  .skm-modal{max-height:calc(100dvh - 24px)}
  .skm-modal-body{padding:10px 16px 16px}
  .skm-modal-header{padding:18px 10px 10px 16px}
  .skm-modal-footer{padding:10px 16px 16px}
  .skm-form-grid{grid-template-columns:1fr}
  .skm-detail-grid{grid-template-columns:1fr}
}
`;

  // src/client/index.tsx
  var name = "skillre-skills-manager-client";
  var inject = ["slots", "locale", "connection"];
  var TABS = ["local", "discover", "updates", "jobs", "backups"];
  function SkillsPage({ api, localeService, t }) {
    const localeState = (0, import_react5.useSyncExternalStore)((listener) => localeService.subscribe(listener), () => localeService.getSnapshot(), () => localeService.getSnapshot());
    const locale = localeState.active;
    const [catalog, setCatalog] = (0, import_react5.useState)(null);
    const [tab, setTab] = (0, import_react5.useState)("local");
    const [overview, setOverview] = (0, import_react5.useState)("all");
    const [workspaceId, setWorkspaceId] = (0, import_react5.useState)("");
    const [location, setLocation] = (0, import_react5.useState)("all");
    const [filter, setFilter] = (0, import_react5.useState)("");
    const [backups, setBackups] = (0, import_react5.useState)([]);
    const [jobs, setJobs] = (0, import_react5.useState)([]);
    const [loading, setLoading] = (0, import_react5.useState)(true);
    const [backupLoading, setBackupLoading] = (0, import_react5.useState)(false);
    const [busy, setBusy] = (0, import_react5.useState)("");
    const [notice, setNotice] = (0, import_react5.useState)(null);
    const [install, setInstall] = (0, import_react5.useState)(null);
    const [selected, setSelected] = (0, import_react5.useState)(null);
    const [restore, setRestore] = (0, import_react5.useState)(null);
    const [move, setMove] = (0, import_react5.useState)(null);
    const [pendingBatch, setPendingBatch] = (0, import_react5.useState)(null);
    const [purge, setPurge] = (0, import_react5.useState)(null);
    const [local, setLocal] = (0, import_react5.useState)(false);
    const [wellKnown, setWellKnown] = (0, import_react5.useState)(false);
    const alive = (0, import_react5.useRef)(true);
    const life = (0, import_react5.useRef)(new AbortController());
    const sequence = (0, import_react5.useRef)(0);
    const backupSequence = (0, import_react5.useRef)(0);
    const jobsRef = (0, import_react5.useRef)([]);
    const wasRunning = (0, import_react5.useRef)(false);
    const tabRefs = (0, import_react5.useRef)([]);
    const readonlyOnly = overview === "readonly";
    const scope2 = workspaceId ? { workspaceId } : {};
    const readBackups = (0, import_react5.useCallback)(async () => {
      const seq = ++backupSequence.current;
      setBackupLoading(true);
      try {
        const value = await api.call({ action: "backups", ...workspaceId ? { workspaceId } : {} }, life.current.signal);
        if (alive.current && seq === backupSequence.current) setBackups(value);
      } catch (error) {
        if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: "error" });
      } finally {
        if (alive.current && seq === backupSequence.current) setBackupLoading(false);
      }
    }, [api, workspaceId]);
    const reload = (0, import_react5.useCallback)(async () => {
      const seq = ++sequence.current;
      setLoading(true);
      try {
        const value = await api.call({ action: "list", ...workspaceId ? { workspaceId } : {} }, life.current.signal);
        if (alive.current && seq === sequence.current) setCatalog(value);
      } catch (error) {
        if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: "error" });
      } finally {
        if (alive.current && seq === sequence.current) setLoading(false);
      }
    }, [api, workspaceId]);
    const loadJobs = (0, import_react5.useCallback)(async () => {
      try {
        const value = await api.call({ action: "job-list" }, life.current.signal);
        if (alive.current) setJobs(value);
      } catch {
      }
    }, [api]);
    (0, import_react5.useEffect)(() => {
      alive.current = true;
      life.current = new AbortController();
      setLocation("all");
      setBackups([]);
      void reload();
      void loadJobs();
      return () => {
        alive.current = false;
        life.current.abort();
        sequence.current++;
        backupSequence.current++;
      };
    }, [reload, loadJobs]);
    (0, import_react5.useEffect)(() => {
      jobsRef.current = jobs;
    }, [jobs]);
    (0, import_react5.useEffect)(() => {
      const timer = setInterval(() => {
        if (alive.current && jobsRef.current.some((job) => job.status === "running")) void loadJobs();
      }, 700);
      return () => clearInterval(timer);
    }, [loadJobs]);
    (0, import_react5.useEffect)(() => {
      const running = jobs.some((job) => job.status === "running");
      if (wasRunning.current && !running) {
        void reload();
        const finished = jobs.find((job) => job.status !== "running" && job.finishedAt);
        if (finished && alive.current) {
          const title = finished.kind === "update" ? finished.items[0]?.name ?? t("jobs") : t("jobBatch", { count: finished.total });
          setNotice({ text: `${title} \xB7 ${t("jobCounts", { updated: finished.succeeded, failed: finished.failed, skipped: finished.skipped, cancelled: finished.cancelled })}`, kind: finished.failed > 0 ? "warning" : "success" });
        }
      }
      wasRunning.current = running;
    }, [jobs, reload, t]);
    (0, import_react5.useEffect)(() => {
      if (tab === "jobs") void loadJobs();
    }, [tab, loadJobs]);
    (0, import_react5.useEffect)(() => {
      if (tab === "backups") void readBackups();
    }, [tab, readBackups]);
    const disabled = !!busy || loading;
    const modalOpen = !!install || !!selected || !!restore;
    const writable = !!catalog?.roots.some((root) => root.writable);
    const updates = catalog?.skills.filter((skill) => skill.check?.status === "update") ?? [];
    const anyChecked = catalog?.skills.some((skill) => !!skill.check) ?? false;
    const readOnlyCount = catalog ? catalog.skills.filter((skill) => !skill.writable).length : 0;
    const runningJob = jobs.find((job) => job.status === "running");
    const jobActive = !!runningJob;
    const visible = (catalog?.skills ?? []).filter((skill) => (tab !== "updates" || skill.check?.status === "update") && (!readonlyOnly || !skill.writable) && (location === "all" || skill.rootId === location) && `${skill.name} ${skill.description} ${skill.source?.repository ?? ""}`.toLowerCase().includes(filter.toLowerCase().trim()));
    const filtered = !!filter.trim() || location !== "all" || readonlyOnly;
    function resetView() {
      setFilter("");
      setLocation("all");
      setOverview("all");
    }
    function showOverview(next) {
      if (!catalog) return;
      if (next === "updates") {
        setOverview("all");
        setFilter("");
        setLocation("all");
        setTab("updates");
        return;
      }
      if (next === "readonly") {
        setOverview("readonly");
        setFilter("");
        setLocation("all");
        setTab("local");
        return;
      }
      resetView();
      setTab("local");
    }
    function selectTab(next) {
      if (next !== "local") setOverview("all");
      setTab(next);
    }
    function onTabKeyDown(event, index) {
      let nextIndex;
      switch (event.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % TABS.length;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + TABS.length) % TABS.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = TABS.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      const next = TABS[nextIndex];
      selectTab(next);
      tabRefs.current[nextIndex]?.focus();
    }
    async function checkUpdates() {
      if (busy || loading || jobActive) return;
      setBusy(t("checking"));
      setNotice(null);
      try {
        const checks = await api.call({ action: "check", ...scope2 }, life.current.signal);
        if (alive.current) setNotice({ text: t("checkingDone", { updates: checks.filter((item) => item.status === "update").length, latest: checks.filter((item) => item.status === "latest").length, untracked: checks.filter((item) => item.status === "untracked").length, errors: checks.filter((item) => item.status === "error").length }), kind: checks.some((item) => item.status === "error") ? "warning" : "success" });
        await reload();
      } catch (error) {
        if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: "error" });
      } finally {
        if (alive.current) setBusy("");
      }
    }
    const search = (0, import_react5.useCallback)((query) => api.call({ action: "search", query, limit: 24 }, life.current.signal), [api]);
    function revealSkill(name2) {
      setTab("local");
      setOverview("all");
      setFilter(name2);
      setLocation("all");
    }
    function mutated(result) {
      if (!alive.current) return;
      setInstall(null);
      setSelected(null);
      setRestore(null);
      setMove(null);
      setLocal(false);
      setPendingBatch(null);
      setPurge(null);
      setWellKnown(false);
      const labels = { install: "installed", update: "updated", remove: "removed", restore: "restored", "restore-to": "restored", move: "moved", "install-local": "localInstalled", "well-known-install": "wellKnownDone" };
      setNotice(result.warning ? { text: `${t(labels[result.action], { name: result.name })} ${result.warning}`, kind: "warning" } : { text: t(labels[result.action], { name: result.name }), kind: "success" });
      if (result.action === "install" || result.action === "install-local" || result.action === "well-known-install") revealSkill(result.name);
      else void reload();
    }
    function jobStarted() {
      if (!alive.current) return;
      setSelected(null);
      setPendingBatch(null);
      setTab("jobs");
      setNotice({ text: t("jobStarted"), kind: "success" });
      void loadJobs();
    }
    async function cancelJob(jobId) {
      try {
        await api.call({ action: "job-cancel", id: jobId }, life.current.signal);
        await loadJobs();
      } catch (error) {
        if (alive.current) setNotice({ text: errorText(error), kind: "error" });
      }
    }
    async function retryJob(job) {
      const ids = job.items.filter((item) => item.status === "failed").map((item) => item.id);
      if (!ids.length) return;
      try {
        await api.call({ action: "update-batch-start", ids }, life.current.signal);
        jobStarted();
      } catch (error) {
        if (alive.current) setNotice({ text: errorText(error), kind: "error" });
      }
    }
    function openJobSkill(id) {
      const skill = catalog?.skills.find((item) => item.id === id);
      if (skill) setSelected({ skill, action: "detail" });
      else setNotice({ text: t("jobSkillGone"), kind: "warning" });
    }
    function purged(removed, freedBytes) {
      if (!alive.current) return;
      setPurge(null);
      setNotice({ text: t("purged", { count: removed, bytes: bytes(freedBytes) }), kind: "success" });
      void readBackups();
    }
    function settled() {
      if (alive.current) {
        void reload();
        if (tab === "backups") void readBackups();
      }
    }
    const common = catalog ? { api, t, locale, catalog, workspaceId, jobActive, onJobStarted: jobStarted, onBusy: (value, label) => {
      if (alive.current) setBusy(value ? label ?? t("loading") : "");
    }, onMutated: mutated, onError: (text) => {
      if (alive.current) setNotice({ text, kind: "error" });
    }, onSettled: settled } : null;
    const checking = busy === t("checking");
    return /* @__PURE__ */ import_react5.default.createElement("section", { className: "skm-page", "aria-label": t("title") }, /* @__PURE__ */ import_react5.default.createElement("style", null, styles_default), /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-wrap" }, /* @__PURE__ */ import_react5.default.createElement("header", { className: "skm-header" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-heading" }, /* @__PURE__ */ import_react5.default.createElement("h2", { className: "skm-title" }, t("title")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "skm-intro" }, t("settingsIntro"))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-actions" }, /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || modalOpen || !catalog || jobActive, onClick: () => void checkUpdates() }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "refresh", size: 15, spin: checking }), checking ? t("checking") : t("check")), /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || modalOpen || !writable, onClick: () => setLocal(true) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "down", size: 15 }), t("fromLocal")), /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-button skm-button-primary", type: "button", disabled: disabled || modalOpen || !writable, onClick: () => setInstall({ source: "", name: "" }) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "plus", size: 15 }), t("fromRepo")))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-overview", role: "group", "aria-label": t("overview") }, /* @__PURE__ */ import_react5.default.createElement("button", { className: `skm-tile${tab === "local" && !readonlyOnly ? " skm-tile-active" : ""}`, type: "button", "aria-pressed": tab === "local" && !readonlyOnly, disabled: !catalog, onClick: () => showOverview("all") }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "skm-tile-value" }, catalog ? catalog.skills.length : "\u2014"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "skm-tile-label" }, t("found"))), /* @__PURE__ */ import_react5.default.createElement("button", { className: `skm-tile${tab === "updates" ? " skm-tile-active" : ""}`, type: "button", "aria-pressed": tab === "updates", disabled: !catalog, onClick: () => showOverview("updates") }, /* @__PURE__ */ import_react5.default.createElement("span", { className: `skm-tile-value${updates.length && anyChecked ? " skm-tile-accent" : ""}` }, anyChecked ? updates.length : "\u2014"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "skm-tile-label" }, t("available"))), /* @__PURE__ */ import_react5.default.createElement("button", { className: `skm-tile${tab === "local" && readonlyOnly ? " skm-tile-active" : ""}`, type: "button", "aria-pressed": tab === "local" && readonlyOnly, disabled: !catalog, onClick: () => showOverview("readonly") }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "skm-tile-value" }, catalog ? readOnlyCount : "\u2014"), /* @__PURE__ */ import_react5.default.createElement("span", { className: "skm-tile-label" }, t("readonly")))), runningJob && /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-status", role: "status" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "refresh", size: 14, spin: true }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "skm-status-text" }, t("jobStatusRunning"), " \xB7 ", t("jobProgress", { percent: runningJob.progress })), /* @__PURE__ */ import_react5.default.createElement(ProgressBar, { value: runningJob.progress, label: t("jobProgress", { percent: runningJob.progress }) })), /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-tabs", role: "tablist", "aria-label": t("title") }, TABS.map((item, index) => /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "skm-tab", id: `skm-tab-${item}`, key: item, role: "tab", "aria-selected": tab === item, "aria-controls": "skm-panel", tabIndex: tab === item ? 0 : -1, ref: (element) => {
      tabRefs.current[index] = element;
    }, onClick: () => selectTab(item), onKeyDown: (event) => onTabKeyDown(event, index) }, t(item), item === "jobs" && runningJob && /* @__PURE__ */ import_react5.default.createElement("span", { className: "skm-tab-meta" }, t("jobProgress", { percent: runningJob.progress }))))), notice && /* @__PURE__ */ import_react5.default.createElement(Notice, { text: notice.text, kind: notice.kind, onClose: () => setNotice(null) }), catalog && !catalog.mutationsAllowed && /* @__PURE__ */ import_react5.default.createElement(Notice, { text: t("readOnlyMode") }), catalog?.warnings.length ? /* @__PURE__ */ import_react5.default.createElement("details", { className: "skm-notice skm-notice-warning" }, /* @__PURE__ */ import_react5.default.createElement("summary", null, t("warningTitle"), " \xB7 ", catalog.warnings.length), /* @__PURE__ */ import_react5.default.createElement("ul", { className: "skm-warning-list" }, catalog.warnings.map((warning, index) => /* @__PURE__ */ import_react5.default.createElement("li", { key: index }, warning)))) : null, catalog?.truncated && /* @__PURE__ */ import_react5.default.createElement(Notice, { text: t("truncated"), kind: "warning" }), /* @__PURE__ */ import_react5.default.createElement("div", { role: "tabpanel", id: "skm-panel", "aria-labelledby": `skm-tab-${tab}`, className: "skm-panel" }, (tab === "local" || tab === "updates" || tab === "backups") && /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-toolbar" }, tab !== "backups" && /* @__PURE__ */ import_react5.default.createElement("label", { className: "skm-search" }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "search", size: 16 }), /* @__PURE__ */ import_react5.default.createElement("input", { className: "skm-search-input", value: filter, onChange: (event) => setFilter(event.target.value), placeholder: t("filter"), "aria-label": t("filter") })), tab !== "backups" && /* @__PURE__ */ import_react5.default.createElement("select", { className: "skm-select skm-location", value: location, onChange: (event) => setLocation(event.target.value), "aria-label": t("location") }, /* @__PURE__ */ import_react5.default.createElement("option", { value: "all" }, t("allRoots")), catalog?.roots.map((root) => /* @__PURE__ */ import_react5.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t)))), /* @__PURE__ */ import_react5.default.createElement("select", { className: "skm-select skm-scope", value: workspaceId, onChange: (event) => setWorkspaceId(event.target.value), disabled: !!busy || modalOpen || loading, "aria-label": t("scope") }, /* @__PURE__ */ import_react5.default.createElement("option", { value: "" }, t("global")), catalog?.workspaces.map((workspace) => /* @__PURE__ */ import_react5.default.createElement("option", { key: workspace.id, value: workspace.id }, workspace.title))), readonlyOnly && tab === "local" && /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "skm-chip", onClick: () => setOverview("all"), "aria-label": `${t("clearFilter")}: ${t("readonly")}` }, t("readonly"), /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "close", size: 11 })), tab === "updates" && updates.length > 0 && /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-button skm-button-primary skm-toolbar-primary", type: "button", disabled: disabled || modalOpen || !writable || jobActive, onClick: () => setPendingBatch(updates) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "up", size: 14 }), t("updateAll"), " (", updates.length, ")"), /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-icon-button skm-toolbar-refresh", type: "button", "aria-label": t("rescan"), title: t("rescanHint"), disabled: disabled || modalOpen, onClick: () => {
      if (tab === "backups") void readBackups();
      else void reload();
    } }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "refresh", size: 16 }))), (tab === "local" || tab === "updates") && /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, loading && !catalog ? /* @__PURE__ */ import_react5.default.createElement(Loader, { text: t("loading") }) : !catalog ? /* @__PURE__ */ import_react5.default.createElement(Empty, { title: t("requestFailed"), body: t("retry") }, /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-button", type: "button", onClick: () => void reload() }, t("retry"))) : visible.length ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-list", "aria-busy": loading || !!busy }, visible.map((skill) => /* @__PURE__ */ import_react5.default.createElement(SkillCard, { key: skill.id, skill, root: catalog.roots.find((root) => root.id === skill.rootId), t, disabled: disabled || modalOpen, jobActive, onOpen: (action) => setSelected({ skill, action }) }))) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "skm-empty" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "skm-empty-title" }, t(filtered ? "noMatches" : tab === "updates" ? "updatesEmpty" : "empty")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "skm-empty-body" }, t(filtered ? "noMatchesBody" : tab === "updates" ? "updatesEmptyBody" : "emptyBody")), tab === "local" && writable && !filter && location === "all" && !readonlyOnly && /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-add-button", type: "button", onClick: () => setInstall({ source: "", name: "" }) }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "plus", size: 16 }), t("fromRepo")), tab === "updates" && /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || modalOpen || jobActive, onClick: () => void checkUpdates() }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "refresh", size: 15, spin: checking }), t("check")), readonlyOnly && /* @__PURE__ */ import_react5.default.createElement("button", { className: "skm-button", type: "button", onClick: () => setOverview("all") }, t("clearFilter")))), tab === "discover" && /* @__PURE__ */ import_react5.default.createElement(DiscoverPanel, { t, locale, writable, disabled, modalOpen, search, onReview: (hit) => setInstall(hit), onWellKnown: () => setWellKnown(true), onError: (text) => setNotice({ text, kind: "error" }) }), tab === "jobs" && /* @__PURE__ */ import_react5.default.createElement(JobsPanel, { jobs, roots: catalog?.roots ?? [], t, locale, onCancel: (id) => void cancelJob(id), onRetry: (job) => void retryJob(job), onOpenSkill: openJobSkill }), tab === "backups" && /* @__PURE__ */ import_react5.default.createElement(BackupsPanel, { t, locale, catalog, backups, loading: backupLoading, disabled, modalOpen, onRestore: (backup) => setRestore(backup), onPurge: (value) => setPurge(value) })), /* @__PURE__ */ import_react5.default.createElement("p", { className: "skm-hint skm-safety" }, t("safeNote"))), install && common && /* @__PURE__ */ import_react5.default.createElement(InstallDialog, { ...common, initialSource: install.source, preferredName: install.name, preferredSkillId: install.skillId, onOpenInstalled: (skill) => {
      setInstall(null);
      setSelected({ skill, action: "detail" });
    }, onClose: () => setInstall(null) }), selected && common && /* @__PURE__ */ import_react5.default.createElement(SkillDialog, { ...common, skill: selected.skill, initialAction: selected.action, onClose: () => setSelected(null), onMove: (skill) => {
      setSelected(null);
      setMove(skill);
    } }), restore && common && /* @__PURE__ */ import_react5.default.createElement(RestoreDialog, { ...common, backup: restore, onClose: () => setRestore(null) }), move && common && /* @__PURE__ */ import_react5.default.createElement(MoveDialog, { ...common, skill: move, onClose: () => setMove(null) }), pendingBatch && common && /* @__PURE__ */ import_react5.default.createElement(BatchUpdateDialog, { ...common, skills: pendingBatch, onClose: () => setPendingBatch(null) }), purge && common && /* @__PURE__ */ import_react5.default.createElement(PurgeDialog, { ...common, rootId: purge.rootId, backup: purge.backup, count: purge.count, onPurged: purged, onClose: () => setPurge(null) }), local && common && /* @__PURE__ */ import_react5.default.createElement(LocalInstallDialog, { ...common, onClose: () => setLocal(false) }), wellKnown && common && /* @__PURE__ */ import_react5.default.createElement(WellKnownInstallDialog, { ...common, onClose: () => setWellKnown(false) }));
  }
  function apply(rawContext) {
    const ctx = rawContext;
    const lifetime = new AbortController();
    ctx.effect(() => () => lifetime.abort());
    ctx.effect(() => ctx.locale.register(LOCALE_NAMESPACE, { en, zh }), "skillre-skills-manager client dictionaries");
    const t = ctx.locale.bind(LOCALE_NAMESPACE);
    const api = createApi(ctx, lifetime.signal);
    ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({ name: "settings.section", id: PANEL_ID, order: 25, label: () => t("nav") }, () => /* @__PURE__ */ import_react5.default.createElement(SkillsPage, { api, localeService: ctx.locale, t }))), "skillre-skills-manager settings section");
    ctx.effect(() => ctx.slots.inject("settings.section.icon", () => ctx.slots.register({ name: "settings.section.icon", id: PANEL_ID, order: 25 }, ({ size }) => /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "book", size }))), "skillre-skills-manager settings icon");
  }
  return __toCommonJS(index_exports);
})();

    return SkillreSkillsManagerClient;
  },
});
