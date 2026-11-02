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
  var import_react3 = __toESM(__require("react"), 1);

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
    nav: "Skills",
    title: "Skills Manager",
    subtitle: "Discover, install and keep your DSH skills in sync.",
    local: "Installed",
    discover: "Discover",
    updates: "Updates",
    backups: "Backups",
    refresh: "Refresh",
    check: "Check updates",
    checking: "Checking sources\u2026",
    install: "Install skill",
    fromRepo: "Install from repository",
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
    updated: "Updated {name}; the previous version is backed up.",
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
    updateBody: "The reviewed revision replaces this skill only after a complete local-file check. The previous entry is kept as a backup.",
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
    preserved: "Backups are retained until you explicitly manage their storage.",
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
    wellKnownHint: "Only archive entries with a sha256 digest can be installed; scripts are never executed."
  };
  var zh = {
    nav: "\u6280\u80FD",
    title: "\u6280\u80FD\u7BA1\u7406",
    subtitle: "\u53D1\u73B0\u3001\u5B89\u88C5\u5E76\u4FDD\u6301\u4F60\u7684 DSH \u6280\u80FD\u66F4\u65B0\u3002",
    local: "\u672C\u5730\u6280\u80FD",
    discover: "\u6280\u80FD\u68C0\u7D22",
    updates: "\u53EF\u7528\u66F4\u65B0",
    backups: "\u5907\u4EFD\u8BB0\u5F55",
    refresh: "\u5237\u65B0",
    check: "\u68C0\u67E5\u66F4\u65B0",
    checking: "\u6B63\u5728\u68C0\u67E5\u6765\u6E90\u2026",
    install: "\u5B89\u88C5\u6280\u80FD",
    fromRepo: "\u4ECE\u4ED3\u5E93\u5B89\u88C5",
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
    updated: "\u5DF2\u66F4\u65B0 {name}\uFF0C\u65E7\u7248\u672C\u5DF2\u5907\u4EFD\u3002",
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
    updateBody: "\u68C0\u67E5\u672C\u5730\u6587\u4EF6\u672A\u53D8\u5316\u540E\uFF0C\u518D\u66FF\u6362\u4E3A\u5DF2\u67E5\u770B\u7684\u63D0\u4EA4\u7248\u672C\u3002\u539F\u6709\u6280\u80FD\u4F1A\u4FDD\u7559\u4E3A\u5907\u4EFD\u3002",
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
    preserved: "\u5907\u4EFD\u4F1A\u6301\u7EED\u4FDD\u7559\uFF0C\u76F4\u5230\u4F60\u660E\u786E\u5904\u7406\u5176\u5B58\u50A8\u3002",
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
    wellKnownHint: "\u4EC5\u652F\u6301\u5E26 sha256 \u6458\u8981\u7684 archive \u6761\u76EE\uFF1B\u4E0D\u4F1A\u6267\u884C\u811A\u672C\u3002"
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
      restore: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 4v6h6" }), /* @__PURE__ */ import_react.default.createElement("path", { d: "M3 10a9 9 0 1 1 1 8M12 7v5l3 2" })),
      link: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "m10 14 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0", transform: "translate(2 0) scale(.85)" })),
      move: /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("path", { d: "M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" }))
    };
    return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", className: spin ? "skm-spinner" : void 0 }, paths[name2] ?? paths.book);
  }
  function Loader({ text }) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-loader", role: "status" }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: "refresh", spin: true }), text);
  }
  function Empty({ title, body, icon = "book", children }) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-empty" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "skm-empty-mark" }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: icon, size: 27 })), /* @__PURE__ */ import_react.default.createElement("h2", null, title), /* @__PURE__ */ import_react.default.createElement("p", null, body), children);
  }
  function Notice({ text, kind = "info", onClose }) {
    return /* @__PURE__ */ import_react.default.createElement("div", { className: `skm-notice skm-notice-${kind}`, role: kind === "error" ? "alert" : "status" }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: kind === "success" ? "check" : kind === "error" || kind === "warning" ? "warning" : "lock", size: 16 }), /* @__PURE__ */ import_react.default.createElement("span", { className: "skm-notice-message" }, text), onClose && /* @__PURE__ */ import_react.default.createElement("button", { className: "skm-close", type: "button", "aria-label": "\xD7", onClick: onClose }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: "close", size: 14 })));
  }
  function StatusBadge({ skill, t }) {
    const status = !skill.valid ? "invalid" : !skill.writable ? "protected" : skill.check?.status ?? (skill.source ? "unchecked" : "untracked");
    const labels = { invalid: "invalid", protected: "protected", update: "update", latest: "latest", error: "checkError", untracked: "untracked", unchecked: "unchecked" };
    return /* @__PURE__ */ import_react.default.createElement("span", { className: `skm-badge ${status === "update" ? "skm-badge-update" : status === "latest" ? "skm-badge-success" : status === "error" || status === "invalid" ? "skm-badge-error" : ""}` }, status === "protected" && /* @__PURE__ */ import_react.default.createElement(Icon, { name: "lock", size: 10 }), " ", t(labels[status] ?? "unchecked"));
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
      const first = root?.querySelector("[data-autofocus], input:not(:disabled), button:not(:disabled)");
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

  // src/client/dialogs.tsx
  var import_react2 = __toESM(__require("react"), 1);
  var scope = (workspaceId) => workspaceId ? { workspaceId } : {};
  function SourceLink({ repository, revision, t }) {
    if (!revision) return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null);
    return /* @__PURE__ */ import_react2.default.createElement("a", { className: "skm-source-link", href: `https://github.com/${repository}/tree/${encodeURIComponent(revision)}`, target: "_blank", rel: "noopener noreferrer" }, t("sourceLink"), " \u2197");
  }
  function InstallDialog({ initialSource, preferredName, ...props }) {
    const { api, t, catalog, workspaceId } = props;
    const [source, setSource] = (0, import_react2.useState)(initialSource);
    const [ref, setRef] = (0, import_react2.useState)("");
    const [repository, setRepository] = (0, import_react2.useState)(null);
    const [preview, setPreview] = (0, import_react2.useState)(null);
    const roots = catalog.roots.filter((root) => root.writable);
    const [rootId, setRootId] = (0, import_react2.useState)(roots.find((root) => root.source === "user-agents")?.id ?? roots[0]?.id ?? "");
    const [trusted, setTrusted] = (0, import_react2.useState)(false);
    const [busy, setBusy] = (0, import_react2.useState)("");
    const [error, setError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    (0, import_react2.useEffect)(() => {
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
    async function inspect() {
      if (!source.trim() || busy) return;
      setBusy("inspecting");
      setError("");
      setTrusted(false);
      setPreview(null);
      try {
        const value = await api.call({ action: "inspect", source: source.trim(), ...ref.trim() ? { ref: ref.trim() } : {}, ...scope(workspaceId) }, life.current.signal);
        if (alive.current) setRepository(value);
      } catch (error2) {
        if (alive.current) setError(errorText(error2));
      } finally {
        if (alive.current) setBusy("");
      }
    }
    async function select(skill) {
      if (!repository || busy) return;
      setBusy("loading");
      setError("");
      setTrusted(false);
      try {
        const value = await api.call({ action: "preview", source: repository.repository, ref: repository.ref, commit: repository.commit, skillPath: skill.skillPath, ...scope(workspaceId) }, life.current.signal);
        if (alive.current) setPreview(value);
      } catch (error2) {
        if (alive.current) setError(errorText(error2));
      } finally {
        if (alive.current) setBusy("");
      }
    }
    async function install() {
      if (!preview || !trusted || !rootId || busy) return;
      setBusy("installing");
      setError("");
      props.onBusy(true, t("installing"));
      try {
        const result = await api.call({ action: "install", rootId, source: preview.repository, ref: preview.ref, commit: preview.commit, skillPath: preview.skill.skillPath, ...scope(workspaceId) }, life.current.signal);
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
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title: preview ? `${t("install")} \xB7 ${preview.skill.name}` : t("fromRepo"), t, onClose: close, footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", onClick: () => {
      if (preview && !busy) {
        setPreview(null);
        setTrusted(false);
      } else if (repository && !busy) setRepository(null);
      else close();
    } }, preview || repository ? t("back") : t("cancel")), preview ? /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", onClick: () => void install(), disabled: !trusted || !rootId || !!busy }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy === "installing" ? "refresh" : "down", spin: busy === "installing" }), busy === "installing" ? t("installing") : t("install")) : !repository ? /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", onClick: () => void inspect(), disabled: !source.trim() || !!busy }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "search", spin: !!busy }), busy ? t("inspecting") : t("inspect")) : null) }, error && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), !repository && !preview && /* @__PURE__ */ import_react2.default.createElement("form", { className: "skm-form-grid", onSubmit: (event) => {
      event.preventDefault();
      void inspect();
    } }, /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field skm-full" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("repository")), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-input", value: source, onChange: (event) => setSource(event.target.value), placeholder: t("repoPlaceholder"), autoComplete: "off", spellCheck: false, disabled: !!busy, "data-autofocus": true, maxLength: 400 })), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field skm-full" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("branch")), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-input", value: ref, onChange: (event) => setRef(event.target.value), placeholder: "HEAD", autoComplete: "off", spellCheck: false, disabled: !!busy, maxLength: 200 }), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-hint" }, t("refHint"))), /* @__PURE__ */ import_react2.default.createElement("button", { type: "submit", hidden: true })), repository && !preview && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, repository.repository), /* @__PURE__ */ import_react2.default.createElement("span", null, repository.ref), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, repository.commit.slice(0, 12))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-section-title" }, t("chooseSkill"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-count" }, repository.skills.length)), busy && /* @__PURE__ */ import_react2.default.createElement(Loader, { text: t("loading") }), !busy && /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-skill-options" }, [...repository.skills].sort((a, b) => Number(b.name === preferredName) - Number(a.name === preferredName)).map((skill) => /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-skill-option", key: skill.skillPath, disabled: !!busy, onClick: () => void select(skill) }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "book" }), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-skill-option-main" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, skill.name), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-description" }, skill.description), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono skm-hint" }, skill.skillPath)), /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "arrow", size: 16 })))), !repository.skills.length && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: t("noRepoSkills"), kind: "warning" }), repository.truncated && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: t("truncated"), kind: "warning" }), repository.warnings.length > 0 && /* @__PURE__ */ import_react2.default.createElement("details", { className: "skm-hint" }, /* @__PURE__ */ import_react2.default.createElement("summary", null, t("warningTitle")), /* @__PURE__ */ import_react2.default.createElement("ul", { className: "skm-warning-list" }, repository.warnings.map((item, index) => /* @__PURE__ */ import_react2.default.createElement("li", { key: index }, item))))), preview && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, preview.skill.description), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, preview.repository), /* @__PURE__ */ import_react2.default.createElement("span", null, preview.ref), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, preview.commit.slice(0, 12)), /* @__PURE__ */ import_react2.default.createElement(SourceLink, { repository: preview.repository, revision: preview.commit, t })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-section-title" }, t("instructions")), /* @__PURE__ */ import_react2.default.createElement("pre", { className: "skm-code" }, preview.content), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-section-title" }, t("resources"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-hint" }, t("files", { count: preview.files.length }), " \xB7 ", bytes(preview.totalBytes))), /* @__PURE__ */ import_react2.default.createElement("ul", { className: "skm-file-list" }, preview.files.map((file) => /* @__PURE__ */ import_react2.default.createElement("li", { key: file.path }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, file.path), /* @__PURE__ */ import_react2.default.createElement("span", null, bytes(file.bytes))))), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field", style: { marginTop: 18 } }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("target")), /* @__PURE__ */ import_react2.default.createElement("select", { className: "skm-select", value: rootId, onChange: (event) => setRootId(event.target.value), disabled: !!busy }, !roots.length && /* @__PURE__ */ import_react2.default.createElement("option", { value: "" }, t("selectLocation")), roots.map((root) => /* @__PURE__ */ import_react2.default.createElement("option", { value: root.id, key: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), !roots.length && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: t("noWritable"), kind: "warning" }), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: trusted, onChange: (event) => setTrusted(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react2.default.createElement("span", null, t("trust"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-checkbox-hint" }, t("trustHint"))))));
  }
  function SkillDialog({ skill, initialAction, onMove, ...props }) {
    const { api, t, locale, workspaceId } = props;
    const [detail, setDetail] = (0, import_react2.useState)(null);
    const [mode, setMode] = (0, import_react2.useState)(initialAction === "update" ? "detail" : initialAction);
    const [busy, setBusy] = (0, import_react2.useState)("loading");
    const [error, setError] = (0, import_react2.useState)("");
    const [overwrite, setOverwrite] = (0, import_react2.useState)(false);
    const [permanent, setPermanent] = (0, import_react2.useState)(false);
    const [diff, setDiff] = (0, import_react2.useState)(null);
    const [diffError, setDiffError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    const initialized = (0, import_react2.useRef)(false);
    (0, import_react2.useEffect)(() => {
      alive.current = true;
      if (life.current.signal.aborted) life.current = new AbortController();
      void load(initialAction === "update");
      return () => {
        alive.current = false;
        life.current.abort();
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
    async function mutate() {
      if (!detail || !detail.skill.writable || busy || mode === "detail" || mode === "update" && detail.locallyModified && !overwrite) return;
      setBusy(mode === "update" ? "updating" : "removing");
      setError("");
      props.onBusy(true, t(mode === "update" ? "updating" : "removing"));
      try {
        const result = await api.call(mode === "remove" ? { action: "remove", id: skill.id, expectedFingerprint: detail.fingerprint, ...permanent ? { permanent: true } : {}, ...scope(workspaceId) } : { action: "update", id: skill.id, expectedFingerprint: detail.fingerprint, ...detail.skill.check?.latestCommit ? { commit: detail.skill.check.latestCommit } : {}, overwriteModified: overwrite, ...scope(workspaceId) }, life.current.signal);
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
    const title = mode === "remove" ? t("removeTitle") : mode === "update" ? t("updateTitle") : skill.name;
    const canUpdate = !!detail?.skill.source && detail.skill.writable && detail.skill.format === "directory";
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title, t, onClose: close, alert: mode !== "detail", footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, mode !== "detail" ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: () => {
      if (!busy) {
        setMode("detail");
        setOverwrite(false);
        setError("");
      } else close();
    } }, t("cancel")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: `skm-button ${mode === "remove" ? "skm-button-danger" : "skm-button-primary"}`, disabled: !detail || !detail.skill.writable || !!busy || mode === "update" && !!detail.locallyModified && !overwrite || mode === "update" && detail.skill.check?.status === "latest" && !detail.locallyModified, onClick: () => void mutate() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : mode === "remove" ? "trash" : "up", spin: !!busy }), busy ? t(busy) : t(mode === "remove" ? "confirmRemove" : "confirmUpdate"))) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", onClick: close }, t("close")), detail?.skill.writable && detail.skill.format !== "registry" && onMove && /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button", onClick: () => onMove(detail.skill), disabled: !!busy }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "move", size: 15 }), t("moveButton")), detail?.skill.writable && /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-danger", onClick: () => {
      setMode("remove");
      setError("");
    }, disabled: !!busy }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "trash", size: 15 }), t("remove")), canUpdate && /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", onClick: () => void checkUpdate(), disabled: !!busy }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "up", spin: !!busy }), t("updateButton")))) }, error && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button", onClick: () => {
      setMode("detail");
      void load();
    }, disabled: !!busy }, t("retry"))), busy === "loading" && /* @__PURE__ */ import_react2.default.createElement(Loader, { text: t("loading") }), detail && mode !== "detail" && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, t(mode === "remove" ? "removeBody" : "updateBody")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-mark" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "book" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react2.default.createElement("strong", { className: "skm-result-name" }, detail.skill.name), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-description" }, detail.skill.description), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react2.default.createElement("span", null, t("files", { count: detail.files.length })), /* @__PURE__ */ import_react2.default.createElement("span", null, bytes(detail.totalBytes))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-hint skm-mono" }, detail.skill.path))), mode === "update" && (detail.skill.check?.latestCommit || detail.skill.check?.latestDigest) && /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-grid" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-label" }, t("source")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-value skm-mono" }, detail.skill.source?.repository)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-label" }, t("revision")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-value skm-mono" }, detail.skill.check?.latestCommit ? detail.skill.check.latestCommit.slice(0, 12) : detail.skill.check?.latestDigest?.slice(7, 19) ?? ""))), mode === "update" && detail.skill.check?.status === "latest" && !detail.locallyModified && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: t("latest"), kind: "success" }), mode === "update" && detail.locallyModified && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(Notice, { text: `${t("modified")} \xB7 ${t("modifiedBody")}`, kind: "warning" }), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: overwrite, onChange: (event) => setOverwrite(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react2.default.createElement("span", null, t("overwrite")))), mode === "update" && diff && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-section-title" }, t("diffTitle"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-hint" }, t("diffAdded"), " ", diff.added, " \xB7 ", t("diffRemoved"), " ", diff.removed, " \xB7 ", t("diffChanged"), " ", diff.changed, " \xB7 ", t("diffUnchanged"), " ", diff.unchanged)), diff.added + diff.removed + diff.changed === 0 ? /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("diffEmpty")) : /* @__PURE__ */ import_react2.default.createElement("ul", { className: "skm-file-list" }, diff.files.filter((file) => file.status !== "unchanged").slice(0, 200).map((file) => /* @__PURE__ */ import_react2.default.createElement("li", { key: file.path }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, file.path), /* @__PURE__ */ import_react2.default.createElement("span", null, t(file.status === "added" ? "diffAdded" : file.status === "removed" ? "diffRemoved" : "diffChanged")))))), mode === "update" && diffError && /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("diffFailed"), ": ", diffError), mode === "remove" && /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: permanent, onChange: (event) => setPermanent(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react2.default.createElement("span", null, t("permanentDelete"))), mode === "remove" && permanent && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: t("permanentWarning"), kind: "warning" })), detail && mode === "detail" && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, detail.skill.description), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-grid" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-label" }, t("location")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-value" }, rootLabel(props.catalog.roots.find((root) => root.id === detail.skill.rootId), t))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-label" }, t("revision")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-value skm-mono" }, detail.skill.source?.kind === "well-known" ? detail.skill.source.digest ? `${t("digest")} ${detail.skill.source.digest.slice(7, 19)}` : t("localOnly") : detail.skill.source?.commit && detail.skill.source.commit !== "unknown" ? detail.skill.source.commit.slice(0, 12) : detail.skill.source?.imported ? t("cliImported") : t("localOnly"))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-label" }, t("model")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-value" }, t(detail.skill.modelInvocable ? "enabled" : "disabled"))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-item" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-label" }, t("user")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-detail-value" }, t(detail.skill.userInvocable ? "enabled" : "disabled")))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-hint skm-mono" }, detail.skill.path), detail.skill.source?.kind === "well-known" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-meta", style: { marginTop: 9 } }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, detail.skill.source.repository), detail.skill.source.sourceBaseUrl && /* @__PURE__ */ import_react2.default.createElement("a", { className: "skm-source-link", href: detail.skill.source.sourceBaseUrl, target: "_blank", rel: "noopener noreferrer" }, t("sourceSite"), " \u2197")), detail.skill.source && detail.skill.source.kind !== "well-known" && /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-meta", style: { marginTop: 9 } }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, detail.skill.source.repository), detail.skill.source.ref && /* @__PURE__ */ import_react2.default.createElement("span", null, detail.skill.source.ref), /* @__PURE__ */ import_react2.default.createElement(SourceLink, { repository: detail.skill.source.repository, revision: detail.skill.source.commit && detail.skill.source.commit !== "unknown" ? detail.skill.source.commit : detail.skill.source.ref, t })), detail.skill.check?.checkedAt && /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("checkedAt", { time: time(detail.skill.check.checkedAt, locale) })), detail.locallyModified && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: `${t("modified")} \xB7 ${t("modifiedBody")}`, kind: "warning" }), !detail.skill.source && detail.skill.origin && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: t("externalSourceBody", { source: detail.skill.origin.label }) }), !detail.skill.source && !detail.skill.origin && detail.skill.writable && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: t("noSource") }), detail.skill.issue && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: detail.skill.issue, kind: "warning" }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-section-title" }, t("instructions")), /* @__PURE__ */ import_react2.default.createElement("pre", { className: "skm-code" }, detail.content), detail.files.length > 0 && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-section-title" }, t("resources"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-hint" }, t("files", { count: detail.files.length }), " \xB7 ", bytes(detail.totalBytes))), /* @__PURE__ */ import_react2.default.createElement("ul", { className: "skm-file-list" }, detail.files.map((file) => /* @__PURE__ */ import_react2.default.createElement("li", { key: file.path }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, file.path), /* @__PURE__ */ import_react2.default.createElement("span", null, bytes(file.bytes))))))));
  }
  function RestoreDialog({ backup, ...props }) {
    const { t } = props;
    const writableRoots = props.catalog.roots.filter((root) => root.writable);
    const originalWritable = props.catalog.roots.find((root) => root.id === backup.rootId)?.writable ?? false;
    const [target, setTarget] = (0, import_react2.useState)(originalWritable ? backup.rootId : writableRoots[0]?.id ?? backup.rootId);
    const [entry, setEntry] = (0, import_react2.useState)(backup.entry);
    const [busy, setBusy] = (0, import_react2.useState)(false);
    const [error, setError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    const sameRoot = target === backup.rootId;
    (0, import_react2.useEffect)(() => {
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
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title: t("restoreTitle"), t, alert: true, onClose: close, footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || !target, onClick: () => void restore() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "restore", spin: busy }), t(busy ? "restoring" : "confirmRestore"))) }, error && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, sameRoot ? t("restoreBody") : t("restoreToBody")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-mark skm-backup-icon" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "archive" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, backup.name), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-hint" }, time(backup.createdAt, props.locale)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-hint" }, rootLabel(props.catalog.roots.find((root) => root.id === backup.rootId), t)))), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("restoreTarget")), /* @__PURE__ */ import_react2.default.createElement("select", { className: "skm-select", value: target, onChange: (event) => setTarget(event.target.value), disabled: busy }, writableRoots.map((root) => /* @__PURE__ */ import_react2.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), !sameRoot && /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("restoreName")), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-input", value: entry, onChange: (event) => setEntry(event.target.value), disabled: busy, maxLength: 200 })));
  }
  function MoveDialog({ skill, ...props }) {
    const { t } = props;
    const roots = props.catalog.roots.filter((root) => root.writable);
    const [target, setTarget] = (0, import_react2.useState)(roots[0]?.id ?? skill.rootId);
    const [entry, setEntry] = (0, import_react2.useState)(skill.entry);
    const [busy, setBusy] = (0, import_react2.useState)(false);
    const [error, setError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    (0, import_react2.useEffect)(() => {
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
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title: t("moveTitle"), t, onClose: close, footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || !target, onClick: () => void move() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "move", spin: busy }), t(busy ? "moving" : "moveButton"))) }, error && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, t("moveBody")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-hint skm-mono" }, skill.path), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("moveRoot")), /* @__PURE__ */ import_react2.default.createElement("select", { className: "skm-select", value: target, onChange: (event) => setTarget(event.target.value), disabled: busy }, roots.map((root) => /* @__PURE__ */ import_react2.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("moveName")), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-input", value: entry, onChange: (event) => setEntry(event.target.value), disabled: busy, maxLength: 200 })));
  }
  function BatchUpdateDialog({ skills, onBatch, ...props }) {
    const { t } = props;
    const [overwrite, setOverwrite] = (0, import_react2.useState)(false);
    const [busy, setBusy] = (0, import_react2.useState)(false);
    const [error, setError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    (0, import_react2.useEffect)(() => {
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
        const result = await props.api.call({ action: "update-batch", ids: skills.map((skill) => skill.id), ...overwrite ? { overwriteModified: true } : {}, ...scope(props.workspaceId) }, life.current.signal);
        onBatch(result);
      } catch (error2) {
        const message = errorText(error2);
        if (alive.current) setError(message);
        props.onError(message);
      } finally {
        if (alive.current) setBusy(false);
        props.onBusy(false);
      }
    }
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title: t("batchTitle"), t, alert: true, onClose: close, footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || skills.length === 0, onClick: () => void run() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "up", spin: busy }), t(busy ? "batchRunning" : "confirmUpdate"))) }, error && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, t("batchBody")), /* @__PURE__ */ import_react2.default.createElement("ul", { className: "skm-file-list" }, skills.map((skill) => /* @__PURE__ */ import_react2.default.createElement("li", { key: skill.id }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, skill.name), /* @__PURE__ */ import_react2.default.createElement("span", null, rootLabel(props.catalog.roots.find((root) => root.id === skill.rootId), t))))), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: overwrite, onChange: (event) => setOverwrite(event.target.checked), disabled: busy }), /* @__PURE__ */ import_react2.default.createElement("span", null, t("batchOverwrite"))));
  }
  function PurgeDialog({ rootId, backup, count, onPurged, ...props }) {
    const { t } = props;
    const [keep, setKeep] = (0, import_react2.useState)(0);
    const [busy, setBusy] = (0, import_react2.useState)(false);
    const [error, setError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    (0, import_react2.useEffect)(() => {
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
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title: backup ? t("purgeTitle") : t("purgeAllTitle"), t, alert: true, onClose: close, footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: `skm-button ${backup ? "skm-button-danger" : "skm-button-primary"}`, disabled: busy, onClick: () => void purge() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "trash", spin: busy }), t(busy ? "purgeButton" : "purgeButton"))) }, error && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, backup ? t("purgeBody") : t("purgeAllBody", { keep })), backup ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-mark skm-backup-icon" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "archive" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, backup.name), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-hint" }, time(backup.createdAt, props.locale), " \xB7 ", rootLabel(props.catalog.roots.find((root) => root.id === backup.rootId), t)))) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("backupEmptyBody")), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("purgeKeep")), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-input", type: "number", min: 0, max: 1e4, value: keep, onChange: (event) => setKeep(Math.max(0, Math.min(1e4, Number(event.target.value) || 0))), disabled: busy }))));
  }
  function LocalInstallDialog({ ...props }) {
    const { t } = props;
    const roots = props.catalog.roots.filter((root) => root.writable);
    const [path, setPath] = (0, import_react2.useState)("");
    const [rootId, setRootId] = (0, import_react2.useState)(roots[0]?.id ?? "");
    const [trusted, setTrusted] = (0, import_react2.useState)(false);
    const [busy, setBusy] = (0, import_react2.useState)(false);
    const [error, setError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    (0, import_react2.useEffect)(() => {
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
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title: t("localTitle"), t, onClose: close, footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: close }, t("cancel")), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: busy || !path.trim() || !rootId || !trusted, onClick: () => void install() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy ? "refresh" : "down", spin: busy }), t(busy ? "installing" : "localButton"))) }, error && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, t("localBody")), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("localPath")), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-input", value: path, onChange: (event) => setPath(event.target.value), placeholder: t("localPlaceholder"), autoComplete: "off", spellCheck: false, disabled: busy, maxLength: 4096 })), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("target")), /* @__PURE__ */ import_react2.default.createElement("select", { className: "skm-select", value: rootId, onChange: (event) => setRootId(event.target.value), disabled: busy }, roots.map((root) => /* @__PURE__ */ import_react2.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: trusted, onChange: (event) => setTrusted(event.target.checked), disabled: busy }), /* @__PURE__ */ import_react2.default.createElement("span", null, t("localTrust"))), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("localHint")));
  }
  function WellKnownInstallDialog({ ...props }) {
    const { t } = props;
    const roots = props.catalog.roots.filter((root) => root.writable);
    const [source, setSource] = (0, import_react2.useState)("");
    const [inspect, setInspect] = (0, import_react2.useState)(null);
    const [picked, setPicked] = (0, import_react2.useState)(null);
    const [rootId, setRootId] = (0, import_react2.useState)(roots[0]?.id ?? "");
    const [trusted, setTrusted] = (0, import_react2.useState)(false);
    const [busy, setBusy] = (0, import_react2.useState)("");
    const [error, setError] = (0, import_react2.useState)("");
    const life = (0, import_react2.useRef)(new AbortController());
    const alive = (0, import_react2.useRef)(true);
    (0, import_react2.useEffect)(() => {
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
    return /* @__PURE__ */ import_react2.default.createElement(Dialog, { title: t("wellKnownTitle"), t, onClose: close, footer: /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet", "data-autofocus": true, onClick: () => {
      if (picked) reset();
      else close();
    }, disabled: busy === "install" }, picked ? t("back") : t("cancel")), !inspect ? /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: !!busy || !source.trim(), onClick: () => void readSource() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy === "inspect" ? "refresh" : "search", spin: busy === "inspect" }), t("wellKnownInspect")) : /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-button skm-button-primary", disabled: !!busy || !picked || !rootId || !trusted || picked.type !== "archive", onClick: () => void install() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: busy === "install" ? "refresh" : "down", spin: busy === "install" }), t("wellKnownInstall"))) }, error && /* @__PURE__ */ import_react2.default.createElement(Notice, { text: error, kind: "error" }), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-plain-text" }, t("wellKnownBody")), !inspect ? /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("source")), /* @__PURE__ */ import_react2.default.createElement("input", { className: "skm-input", value: source, onChange: (event) => setSource(event.target.value), placeholder: t("wellKnownPlaceholder"), autoComplete: "off", spellCheck: false, disabled: !!busy, maxLength: 400 })) : !picked ? /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, inspect.warnings.map((warning, index) => /* @__PURE__ */ import_react2.default.createElement(Notice, { key: index, text: warning, kind: "warning" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-section-title" }, t("wellKnownSkills"), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-count" }, inspect.skills.length)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-skill-options" }, inspect.skills.map((entry) => /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "skm-skill-option", key: entry.name, disabled: entry.type !== "archive", onClick: () => setPicked(entry) }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: entry.type === "archive" ? "book" : "lock" }), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-skill-option-main" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, entry.name), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-description" }, entry.description ?? ""), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono skm-hint" }, entry.type === "archive" ? entry.digest.slice(7, 19) : t("wellKnownUnsupported"))), /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "arrow", size: 16 }))))) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-mark" }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "book" })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react2.default.createElement("strong", null, picked.name), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-description" }, picked.description ?? ""), /* @__PURE__ */ import_react2.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, inspect.label), /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-mono" }, picked.digest.slice(7, 19))))), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-field" }, /* @__PURE__ */ import_react2.default.createElement("span", { className: "skm-field-label" }, t("target")), /* @__PURE__ */ import_react2.default.createElement("select", { className: "skm-select", value: rootId, onChange: (event) => setRootId(event.target.value), disabled: !!busy }, roots.map((root) => /* @__PURE__ */ import_react2.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t), " \xB7 ", root.path)))), /* @__PURE__ */ import_react2.default.createElement("label", { className: "skm-checkbox" }, /* @__PURE__ */ import_react2.default.createElement("input", { type: "checkbox", checked: trusted, onChange: (event) => setTrusted(event.target.checked), disabled: !!busy }), /* @__PURE__ */ import_react2.default.createElement("span", null, t("trust"))), /* @__PURE__ */ import_react2.default.createElement("p", { className: "skm-hint" }, t("wellKnownHint"))));
  }

  // src/client/styles.css
  var styles_default = ".skm-page{height:100%;overflow:auto;box-sizing:border-box;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}.skm-page *,.skm-modal *{box-sizing:border-box}.skm-wrap{max-width:1120px;margin:0 auto;padding:38px 36px 28px}.skm-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:26px}.skm-title-row{display:flex;align-items:center;gap:12px}.skm-title-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-brand-primary)}.skm-title{margin:0;font-size:24px;line-height:1.35;font-weight:650;letter-spacing:-.5px}.skm-subtitle{margin:6px 0 0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.6}.skm-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.skm-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:34px;padding:7px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-weight:550;cursor:pointer;white-space:nowrap}.skm-button:disabled{opacity:.48;cursor:not-allowed}.skm-button-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}.skm-button-danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-border-l2)}.skm-button-quiet{background:transparent;border-color:transparent}.skm-button:not(:disabled):active{transform:scale(.98)}.skm-button:focus-visible,.skm-tab:focus-visible,.skm-link-button:focus-visible,.skm-example:focus-visible,.skm-input:focus-visible,.skm-select:focus-visible,.skm-close:focus-visible,.skm-skill-option:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}.skm-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:24px}.skm-stat{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}.skm-stat-label{font-size:12px;color:var(--dsw-alias-label-secondary)}.skm-stat-value{font-size:24px;font-weight:600;font-variant-numeric:tabular-nums;letter-spacing:-.6px}.skm-stat-accent .skm-stat-value{color:var(--dsw-alias-brand-primary)}.skm-tabs{display:flex;gap:22px;border-bottom:1px solid var(--dsw-alias-border-l1);margin-bottom:20px}.skm-tab{display:inline-flex;align-items:center;gap:7px;padding:10px 0 12px;border:0;border-bottom:2px solid transparent;background:none;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}.skm-tab[aria-selected=true]{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary);font-weight:600}.skm-count{padding:1px 6px;border-radius:6px;font-size:10px;font-variant-numeric:tabular-nums;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}.skm-toolbar{display:flex;gap:10px;align-items:center;margin:0 0 16px;flex-wrap:wrap}.skm-field{display:flex;flex-direction:column;gap:7px;min-width:0}.skm-field-label{font-size:12px;font-weight:550}.skm-input,.skm-select{min-height:37px;padding:8px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}.skm-input::placeholder{color:var(--dsw-alias-label-secondary)}.skm-filter{flex:1;min-width:170px}.skm-scope{max-width:250px}.skm-location{max-width:230px}.skm-list{display:flex;flex-direction:column;gap:10px}.skm-card{display:flex;gap:13px;align-items:flex-start;padding:17px 18px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}.skm-card-mark{display:grid;place-items:center;flex-shrink:0;width:34px;height:34px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);margin-top:1px}.skm-card-main{flex:1;min-width:0}.skm-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:22px}.skm-link-button{padding:0;background:none;border:0;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:600;line-height:1.5;text-align:left;cursor:pointer;overflow-wrap:anywhere}.skm-description{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.7;margin:4px 0 7px;overflow-wrap:anywhere}.skm-meta{display:flex;align-items:center;gap:7px 10px;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.5}.skm-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere;font-size:11px}.skm-card-actions{display:flex;align-items:center;gap:4px;flex-shrink:0;padding-top:2px}.skm-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:5px;font-size:10px;line-height:1.4;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2)}.skm-badge-update{color:var(--dsw-alias-brand-primary)}.skm-badge-error{color:var(--dsw-alias-state-error-primary)}.skm-badge-success{color:var(--dsw-alias-state-success-primary)}.skm-notice{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);font-size:12px;line-height:1.6;margin-bottom:15px;overflow-wrap:anywhere}.skm-notice-error{color:var(--dsw-alias-state-error-primary)}.skm-notice-success{color:var(--dsw-alias-state-success-primary)}.skm-notice-warning{color:var(--dsw-alias-state-warn-primary)}.skm-notice-message{flex:1;min-width:0}.skm-close{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex-shrink:0}.skm-warning-list{margin:7px 0 0;padding-left:18px}.skm-warning-list li{margin:4px 0;overflow-wrap:anywhere}.skm-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:250px;padding:35px 25px;border:1px dashed var(--dsw-alias-border-l1);border-radius:12px}.skm-empty-mark{display:grid;place-items:center;width:54px;height:54px;border-radius:15px;color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);margin-bottom:15px}.skm-empty h2{margin:0 0 8px;font-size:16px;font-weight:600}.skm-empty p{margin:0;max-width:420px;font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.8}.skm-empty .skm-button{margin-top:18px}.skm-footer{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:10px;margin-top:22px}.skm-search-area{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:22px;background:var(--dsw-alias-bg-layer-1);margin-bottom:16px}.skm-search-form{display:flex;gap:9px}.skm-search-form .skm-input{flex:1;min-width:0;font-size:13px;min-height:42px}.skm-search-form .skm-button{min-height:42px;padding-inline:18px}.skm-hint{font-size:11px;line-height:1.7;color:var(--dsw-alias-label-secondary);margin:8px 0 0}.skm-examples{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:14px}.skm-example{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);border-radius:7px;padding:5px 9px;font:inherit;font-size:11px;color:var(--dsw-alias-label-secondary);cursor:pointer}.skm-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.skm-result{display:flex;flex-direction:column;gap:12px;padding:17px 18px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);min-width:0}.skm-result-name{font-size:13px;font-weight:600;overflow-wrap:anywhere}.skm-result-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:auto}.skm-loader{display:flex;gap:8px;align-items:center;justify-content:center;min-height:170px;font-size:12px;color:var(--dsw-alias-label-secondary)}.skm-spinner{animation:skm-spin .8s linear infinite}.skm-backdrop{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:24px;background:color-mix(in srgb,var(--dsw-alias-label-primary) 24%,transparent)}.skm-modal{display:flex;flex-direction:column;max-height:calc(100dvh - 48px);width:min(720px,100%);border:1px solid var(--dsw-alias-border-l2);border-radius:15px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font:inherit;box-shadow:0 20px 70px color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent)}.skm-modal-small{width:min(470px,100%)}.skm-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding:21px 23px 15px;flex-shrink:0;border-bottom:1px solid var(--dsw-alias-border-l1)}.skm-modal-header h2{font-size:17px;line-height:1.5;font-weight:600;margin:0;overflow-wrap:anywhere}.skm-modal-body{padding:21px 23px;overflow:auto;min-height:0}.skm-modal-footer{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;padding:15px 23px 19px;border-top:1px solid var(--dsw-alias-border-l1);flex-shrink:0}.skm-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px}.skm-full{grid-column:1/-1}.skm-skill-options{display:flex;flex-direction:column;gap:9px;margin-top:15px}.skm-skill-option{display:flex;gap:12px;align-items:center;width:100%;padding:13px 14px;text-align:left;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:9px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer}.skm-skill-option-main{flex:1;min-width:0}.skm-skill-option strong{font-size:12px}.skm-plain-text{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:12px;line-height:1.8;color:var(--dsw-alias-label-secondary);margin:0 0 14px}.skm-code{white-space:pre-wrap;overflow-wrap:anywhere;max-height:285px;overflow:auto;padding:14px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:11px/1.8 ui-monospace,SFMono-Regular,Menlo,monospace;margin:9px 0 17px}.skm-section-title{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:18px 0 8px;font-size:12px;font-weight:600}.skm-checkbox{display:flex;gap:9px;align-items:flex-start;font-size:12px;line-height:1.7;margin-top:16px;cursor:pointer}.skm-checkbox input{margin:4px 0 0;accent-color:var(--dsw-alias-brand-primary);flex-shrink:0}.skm-checkbox-hint{display:block;font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:3px}.skm-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}.skm-detail-item{min-width:0}.skm-detail-label{font-size:10px;color:var(--dsw-alias-label-secondary);margin-bottom:5px}.skm-detail-value{font-size:12px;line-height:1.6;overflow-wrap:anywhere}.skm-source-link{font-size:11px;color:var(--dsw-alias-brand-primary);text-decoration:none}.skm-source-link:hover{text-decoration:underline}.skm-file-list{margin:0;padding:0;list-style:none;max-height:150px;overflow:auto}.skm-file-list li{display:flex;justify-content:space-between;gap:12px;font-size:10px;color:var(--dsw-alias-label-secondary);padding:5px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}.skm-file-list li span:first-child{overflow-wrap:anywhere;min-width:0}.skm-file-list li span:last-child{white-space:nowrap;flex-shrink:0}.skm-backup-icon{color:var(--dsw-alias-brand-primary)}\n@media(hover:hover) and (pointer:fine){.skm-button:not(:disabled):not(.skm-button-primary):hover,.skm-close:hover{background:var(--dsw-alias-bg-layer-2)}.skm-button-primary:not(:disabled):hover{opacity:.9}.skm-skill-option:hover{border-color:var(--dsw-alias-brand-primary)}.skm-link-button:hover{color:var(--dsw-alias-brand-primary)}.skm-example:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}}\n@keyframes skm-spin{to{transform:rotate(360deg)}}\n@media(prefers-reduced-motion:reduce){.skm-spinner{animation:none}.skm-button:not(:disabled):active{transform:none}}\n@media(max-width:720px){.skm-wrap{padding:22px 18px}.skm-header{margin-bottom:19px}.skm-actions{width:100%}.skm-stats{gap:8px}.skm-stat{padding:12px;flex-direction:column;align-items:flex-start}.skm-stat-value{font-size:21px}.skm-tabs{gap:17px}.skm-results{grid-template-columns:1fr}.skm-card{padding:14px;gap:10px;flex-wrap:wrap}.skm-card-actions{margin-left:44px}.skm-scope,.skm-location{max-width:none;flex:1}.skm-search-area{padding:15px}.skm-backdrop{padding:12px}.skm-modal{max-height:calc(100dvh - 24px)}.skm-modal-body{padding:17px}.skm-modal-header{padding:17px}.skm-modal-footer{padding:13px 17px}.skm-form-grid{grid-template-columns:1fr}.skm-detail-grid{grid-template-columns:1fr 1fr}.skm-title{font-size:22px}}\n";

  // src/client/index.tsx
  var name = "skillre-skills-manager-client";
  var inject = ["slots", "locale", "connection"];
  function SkillsPage({ api, localeService, t }) {
    const localeState = (0, import_react3.useSyncExternalStore)((listener) => localeService.subscribe(listener), () => localeService.getSnapshot(), () => localeService.getSnapshot());
    const locale = localeState.active;
    const [catalog, setCatalog] = (0, import_react3.useState)(null);
    const [tab, setTab] = (0, import_react3.useState)("local");
    const [workspaceId, setWorkspaceId] = (0, import_react3.useState)("");
    const [location, setLocation] = (0, import_react3.useState)("all");
    const [filter, setFilter] = (0, import_react3.useState)("");
    const [query, setQuery] = (0, import_react3.useState)("");
    const [searchResults, setSearchResults] = (0, import_react3.useState)(null);
    const [backups, setBackups] = (0, import_react3.useState)([]);
    const [loading, setLoading] = (0, import_react3.useState)(true);
    const [backupLoading, setBackupLoading] = (0, import_react3.useState)(false);
    const [busy, setBusy] = (0, import_react3.useState)("");
    const [notice, setNotice] = (0, import_react3.useState)(null);
    const [install, setInstall] = (0, import_react3.useState)(null);
    const [selected, setSelected] = (0, import_react3.useState)(null);
    const [restore, setRestore] = (0, import_react3.useState)(null);
    const [move, setMove] = (0, import_react3.useState)(null);
    const [pendingBatch, setPendingBatch] = (0, import_react3.useState)(null);
    const [purge, setPurge] = (0, import_react3.useState)(null);
    const [local, setLocal] = (0, import_react3.useState)(false);
    const [wellKnown, setWellKnown] = (0, import_react3.useState)(false);
    const alive = (0, import_react3.useRef)(true);
    const life = (0, import_react3.useRef)(new AbortController());
    const sequence = (0, import_react3.useRef)(0);
    const backupSequence = (0, import_react3.useRef)(0);
    const scope2 = workspaceId ? { workspaceId } : {};
    const readBackups = (0, import_react3.useCallback)(async () => {
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
    const reload = (0, import_react3.useCallback)(async () => {
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
    (0, import_react3.useEffect)(() => {
      alive.current = true;
      life.current = new AbortController();
      setLocation("all");
      setBackups([]);
      void reload();
      return () => {
        alive.current = false;
        life.current.abort();
        sequence.current++;
        backupSequence.current++;
      };
    }, [reload]);
    (0, import_react3.useEffect)(() => {
      if (tab === "backups") void readBackups();
    }, [tab, readBackups]);
    async function checkUpdates() {
      if (busy || loading) return;
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
    async function search(value = query) {
      if (!value.trim() || busy) return;
      setQuery(value);
      setBusy(t("search"));
      setNotice(null);
      try {
        const results = await api.call({ action: "search", query: value.trim(), limit: 24 }, life.current.signal);
        if (alive.current) setSearchResults(results);
      } catch (error) {
        if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: "error" });
      } finally {
        if (alive.current) setBusy("");
      }
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
    }
    function batchDone(result) {
      if (!alive.current) return;
      setPendingBatch(null);
      setNotice({ text: t("batchResult", { updated: result.updated, skipped: result.skipped, failed: result.failed }), kind: result.failed ? "warning" : "success" });
      void reload();
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
    const modalOpen = !!install || !!selected || !!restore;
    const disabled = !!busy || loading;
    const writable = !!catalog?.roots.some((root) => root.writable);
    const updates = catalog?.skills.filter((skill) => skill.check?.status === "update") ?? [];
    const anyChecked = catalog?.skills.some((skill) => !!skill.check) ?? false;
    const visible = (catalog?.skills ?? []).filter((skill) => (tab !== "updates" || skill.check?.status === "update") && (location === "all" || skill.rootId === location) && `${skill.name} ${skill.description} ${skill.source?.repository ?? ""}`.toLowerCase().includes(filter.toLowerCase().trim()));
    const common = catalog ? { api, t, locale, catalog, workspaceId, onBusy: (value, label) => {
      if (alive.current) setBusy(value ? label ?? t("loading") : "");
    }, onMutated: mutated, onError: (text) => {
      if (alive.current) setNotice({ text, kind: "error" });
    }, onSettled: settled } : null;
    return /* @__PURE__ */ import_react3.default.createElement("section", { className: "skm-page", "aria-label": t("title") }, /* @__PURE__ */ import_react3.default.createElement("style", null, styles_default), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-wrap" }, /* @__PURE__ */ import_react3.default.createElement("header", { className: "skm-header" }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-title-row" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-title-mark" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "book", size: 24 })), /* @__PURE__ */ import_react3.default.createElement("h1", { className: "skm-title" }, t("title"))), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-subtitle" }, t("subtitle"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-actions" }, /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button skm-button-quiet", type: "button", "aria-label": t("refresh"), title: t("refresh"), disabled: disabled || modalOpen, onClick: () => {
      void reload();
      if (tab === "backups") void readBackups();
    } }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "refresh" })), /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || modalOpen || !catalog, onClick: () => void checkUpdates() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "refresh", spin: !!busy && busy === t("checking") }), busy === t("checking") ? t("checking") : t("check")), /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || modalOpen || !writable, onClick: () => setLocal(true) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "down", size: 16 }), t("fromLocal")), /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button skm-button-primary", type: "button", disabled: disabled || modalOpen || !writable, onClick: () => setInstall({ source: "", name: "" }) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "plus", size: 16 }), t("fromRepo")))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-stats", "aria-label": t("metadata") }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-stat" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-stat-label" }, t("found")), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-stat-value" }, catalog ? catalog.skills.length : "\u2014")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-stat skm-stat-accent" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-stat-label" }, t("available")), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-stat-value" }, anyChecked ? updates.length : "\u2014")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-stat" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-stat-label" }, t("readonly")), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-stat-value" }, catalog ? catalog.skills.filter((skill) => !skill.writable).length : "\u2014"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-tabs", role: "tablist", "aria-label": t("title") }, ["local", "discover", "updates", "backups"].map((item) => /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-tab", id: `skm-tab-${item}`, key: item, role: "tab", "aria-selected": tab === item, "aria-controls": `skm-panel-${item}`, onClick: () => setTab(item) }, t(item), item === "updates" && updates.length > 0 && /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-count" }, updates.length)))), notice && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: notice.text, kind: notice.kind, onClose: () => setNotice(null) }), catalog && !catalog.mutationsAllowed && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("readOnlyMode") }), catalog?.warnings.length ? /* @__PURE__ */ import_react3.default.createElement("details", { className: "skm-notice skm-notice-warning" }, /* @__PURE__ */ import_react3.default.createElement("summary", null, t("warningTitle"), " \xB7 ", catalog.warnings.length), /* @__PURE__ */ import_react3.default.createElement("ul", { className: "skm-warning-list" }, catalog.warnings.map((warning, index) => /* @__PURE__ */ import_react3.default.createElement("li", { key: index }, warning)))) : null, catalog?.truncated && /* @__PURE__ */ import_react3.default.createElement(Notice, { text: t("truncated"), kind: "warning" }), /* @__PURE__ */ import_react3.default.createElement("div", { role: "tabpanel", id: `skm-panel-${tab}`, "aria-labelledby": `skm-tab-${tab}` }, (tab === "local" || tab === "updates" || tab === "backups") && /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-toolbar" }, tab !== "backups" && /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input skm-filter", value: filter, onChange: (event) => setFilter(event.target.value), placeholder: t("filter"), "aria-label": t("filter") }), /* @__PURE__ */ import_react3.default.createElement("select", { className: "skm-select skm-scope", value: workspaceId, onChange: (event) => setWorkspaceId(event.target.value), disabled: !!busy || modalOpen || loading, "aria-label": t("scope") }, /* @__PURE__ */ import_react3.default.createElement("option", { value: "" }, t("global")), catalog?.workspaces.map((workspace) => /* @__PURE__ */ import_react3.default.createElement("option", { key: workspace.id, value: workspace.id }, workspace.title))), tab !== "backups" && /* @__PURE__ */ import_react3.default.createElement("select", { className: "skm-select skm-location", value: location, onChange: (event) => setLocation(event.target.value), "aria-label": t("location") }, /* @__PURE__ */ import_react3.default.createElement("option", { value: "all" }, t("allRoots")), catalog?.roots.map((root) => /* @__PURE__ */ import_react3.default.createElement("option", { key: root.id, value: root.id }, rootLabel(root, t))))), (tab === "local" || tab === "updates") && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, loading && !catalog ? /* @__PURE__ */ import_react3.default.createElement(Loader, { text: t("loading") }) : !catalog ? /* @__PURE__ */ import_react3.default.createElement(Empty, { title: t("requestFailed"), body: t("retry") }, /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button", onClick: () => void reload() }, t("retry"))) : visible.length ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-list", "aria-busy": loading || !!busy }, visible.map((skill) => /* @__PURE__ */ import_react3.default.createElement("article", { className: "skm-card", key: skill.id }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-mark" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: skill.writable ? "book" : "lock", size: 17 })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-head" }, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-link-button", disabled: disabled || modalOpen, onClick: () => setSelected({ skill, action: "detail" }) }, skill.name), /* @__PURE__ */ import_react3.default.createElement(StatusBadge, { skill, t })), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-description" }, skill.description || skill.issue), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta" }, /* @__PURE__ */ import_react3.default.createElement("span", null, rootLabel(catalog.roots.find((root) => root.id === skill.rootId), t)), skill.source && /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, skill.source.repository), skill.source?.commit && skill.source.commit !== "unknown" && /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, skill.source.commit.slice(0, 8))), skill.check?.status === "error" && /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint", role: "status" }, skill.check.message)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-actions" }, skill.check?.status === "update" && skill.writable && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button", disabled: disabled || modalOpen, onClick: () => setSelected({ skill, action: "update" }) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "up", size: 13 }), t("updateButton")), skill.writable && /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-button skm-button-quiet skm-button-danger", "aria-label": `${t("remove")} ${skill.name}`, title: `${t("remove")} ${skill.name}`, disabled: disabled || modalOpen, onClick: () => setSelected({ skill, action: "remove" }) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "trash", size: 15 })))))) : /* @__PURE__ */ import_react3.default.createElement(Empty, { title: filter || location !== "all" ? t("noMatches") : t(tab === "updates" ? "updatesEmpty" : "empty"), body: t(tab === "updates" ? "updatesEmptyBody" : "emptyBody"), icon: tab === "updates" ? "refresh" : "book" }, writable && tab === "local" && !filter && /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button skm-button-primary", onClick: () => setInstall({ source: "", name: "" }) }, t("install")))), tab === "discover" && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-toolbar" }, /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || modalOpen || !writable, onClick: () => setWellKnown(true) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "down", size: 15 }), t("fromWellKnown"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-search-area" }, /* @__PURE__ */ import_react3.default.createElement("form", { className: "skm-search-form", onSubmit: (event) => {
      event.preventDefault();
      void search();
    } }, /* @__PURE__ */ import_react3.default.createElement("input", { className: "skm-input", value: query, onChange: (event) => setQuery(event.target.value), placeholder: t("searchPlaceholder"), "aria-label": t("search"), maxLength: 200 }), /* @__PURE__ */ import_react3.default.createElement("button", { type: "submit", className: "skm-button skm-button-primary", disabled: !!busy || !query.trim() }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: busy ? "refresh" : "search", spin: !!busy }), t("searchButton"))), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("searchHint")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-examples" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, t("popular")), ["browser", "typescript", "design", "testing"].map((value) => /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "skm-example", key: value, disabled: !!busy, onClick: () => void search(value) }, value)))), busy ? /* @__PURE__ */ import_react3.default.createElement(Loader, { text: `${t("search")}\u2026` }) : searchResults ? searchResults.items.length ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-results" }, searchResults.items.map((hit, index) => /* @__PURE__ */ import_react3.default.createElement("article", { className: "skm-result", key: `${hit.id}-${index}` }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-head" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "book", size: 17 }), /* @__PURE__ */ import_react3.default.createElement("strong", { className: "skm-result-name" }, hit.name)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta skm-mono" }, hit.repository), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-result-foot" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-hint" }, t("downloads", { count: new Intl.NumberFormat(locale).format(hit.installs) })), /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || !writable || modalOpen, onClick: () => setInstall({ source: hit.repository, name: hit.name }) }, t("inspectInstall"), /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "arrow", size: 13 })))))) : /* @__PURE__ */ import_react3.default.createElement(Empty, { title: t("searchEmpty"), body: t("searchHint"), icon: "search" }) : /* @__PURE__ */ import_react3.default.createElement(Empty, { title: t("searchPrompt"), body: t("searchPromptBody"), icon: "search" })), tab === "backups" && /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, backupLoading ? /* @__PURE__ */ import_react3.default.createElement(Loader, { text: t("loading") }) : backups.length ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, new Set(backups.map((backup) => backup.rootId)).size === 1 && /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-toolbar" }, /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || modalOpen, onClick: () => setPurge({ rootId: backups[0].rootId, count: backups.length }) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "trash", size: 15 }), t("purgeAllTitle"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-list" }, backups.map((backup) => /* @__PURE__ */ import_react3.default.createElement("article", { className: "skm-card", key: `${backup.rootId}-${backup.id}` }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-mark skm-backup-icon" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "archive" })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-main" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-card-head" }, /* @__PURE__ */ import_react3.default.createElement("strong", { className: "skm-result-name" }, backup.name), /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-badge" }, t(backup.action === "update" ? "backupActionUpdate" : "backupActionRemove"))), /* @__PURE__ */ import_react3.default.createElement("div", { className: "skm-meta", style: { marginTop: 7 } }, /* @__PURE__ */ import_react3.default.createElement("span", null, time(backup.createdAt, locale)), /* @__PURE__ */ import_react3.default.createElement("span", null, rootLabel(catalog?.roots.find((root) => root.id === backup.rootId), t)), typeof backup.sizeBytes === "number" && /* @__PURE__ */ import_react3.default.createElement("span", null, bytes(backup.sizeBytes), " \xB7 ", backup.fileCount ?? 0), backup.source && /* @__PURE__ */ import_react3.default.createElement("span", { className: "skm-mono" }, backup.source.repository))), /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button", type: "button", disabled: disabled || !catalog?.roots.find((root) => root.id === backup.rootId)?.writable || modalOpen, onClick: () => setRestore(backup) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "restore", size: 15 }), t("restore")), /* @__PURE__ */ import_react3.default.createElement("button", { className: "skm-button skm-button-quiet skm-button-danger", type: "button", "aria-label": `${t("purgeTitle")} ${backup.name}`, title: t("purgeTitle"), disabled: disabled || modalOpen || !catalog?.roots.some((root) => root.id === backup.rootId && root.writable), onClick: () => setPurge({ rootId: backup.rootId, backup, count: 1 }) }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "trash", size: 15 })))))) : /* @__PURE__ */ import_react3.default.createElement(Empty, { title: t("backupEmpty"), body: t("backupEmptyBody"), icon: "archive" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "skm-hint" }, t("preserved")))), /* @__PURE__ */ import_react3.default.createElement("footer", { className: "skm-footer" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "lock", size: 12 }), /* @__PURE__ */ import_react3.default.createElement("span", null, t("safeNote")))), install && common && /* @__PURE__ */ import_react3.default.createElement(InstallDialog, { ...common, initialSource: install.source, preferredName: install.name, onClose: () => setInstall(null) }), selected && common && /* @__PURE__ */ import_react3.default.createElement(SkillDialog, { ...common, skill: selected.skill, initialAction: selected.action, onClose: () => setSelected(null), onMove: (skill) => {
      setSelected(null);
      setMove(skill);
    } }), restore && common && /* @__PURE__ */ import_react3.default.createElement(RestoreDialog, { ...common, backup: restore, onClose: () => setRestore(null) }), move && common && /* @__PURE__ */ import_react3.default.createElement(MoveDialog, { ...common, skill: move, onClose: () => setMove(null) }), pendingBatch && common && /* @__PURE__ */ import_react3.default.createElement(BatchUpdateDialog, { ...common, skills: pendingBatch, onBatch: batchDone, onClose: () => setPendingBatch(null) }), purge && common && /* @__PURE__ */ import_react3.default.createElement(PurgeDialog, { ...common, rootId: purge.rootId, backup: purge.backup, count: purge.count, onPurged: purged, onClose: () => setPurge(null) }), local && common && /* @__PURE__ */ import_react3.default.createElement(LocalInstallDialog, { ...common, onClose: () => setLocal(false) }), wellKnown && common && /* @__PURE__ */ import_react3.default.createElement(WellKnownInstallDialog, { ...common, onClose: () => setWellKnown(false) }));
  }
  function apply(rawContext) {
    const ctx = rawContext;
    const lifetime = new AbortController();
    ctx.effect(() => () => lifetime.abort());
    ctx.locale.register(LOCALE_NAMESPACE, "en", en);
    ctx.locale.register(LOCALE_NAMESPACE, "zh", zh);
    const t = ctx.locale.bind(LOCALE_NAMESPACE);
    const api = createApi(ctx, lifetime.signal);
    ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: PANEL_ID, order: 24, label: () => t("nav") }, ({ size }) => /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "book", size })));
    ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: PANEL_ID }, () => /* @__PURE__ */ import_react3.default.createElement(SkillsPage, { api, localeService: ctx.locale, t })));
  }
  return __toCommonJS(index_exports);
})();

    return SkillreSkillsManagerClient;
  },
});
