import { Config, parseRequest, resolveConfig } from './config.js';
import { SkillsManager } from './manager.js';
import { MUTATING_ACTIONS } from './types.js';
import { fail } from './errors.js';
import { createExecuteRoute } from './transport.js';
export { Config, SkillsManager };
export const name = 'skillre-skills-manager';
export const inject = ['connection'];
function service(ctx, key) { return ctx.get(key); }
export function apply(ctx, rawConfig = {}) {
    const config = resolveConfig(rawConfig);
    const connection = service(ctx, 'connection');
    if (!connection?.fetch?.register)
        throw new Error('Skills Manager requires the current DSH Connection exact Fetch-route registry.');
    const hooks = {
        workspaces: () => (service(ctx, 'workspaceRegistry')?.list() ?? []).map(item => ({ id: item.id, title: item.title, path: item.path })),
        registryList: async (cwd, signal) => service(ctx, 'skills')?.list({ signal, ...(cwd ? { cwd } : {}) }) ?? [],
        registryGet: async (skillName, cwd, signal) => service(ctx, 'skills')?.get(skillName, { signal, ...(cwd ? { cwd } : {}) }),
    };
    const manager = new SkillsManager(config, hooks);
    ctx.provide('skillreSkillsManager', manager);
    ctx.effect(() => () => manager.dispose());
    ctx.effect(() => connection.fetch.register(createExecuteRoute(manager)));
    if (config.enableAgentTool)
        ctx.inject(['tools'], toolCtx => {
            const tools = service(toolCtx, 'tools');
            if (!tools)
                return;
            toolCtx.effect(() => tools.register({
                name: 'skills_manager',
                description: 'List, inspect, search, install (GitHub, local archive or well-known catalog), check, diff, batch-update, move/rename, remove (optionally permanent), restore or purge backups for DSH skills. Mutations require user approval, recheck local files and retain backups unless permanent removal is explicitly selected. Built-in and symlinked skills are read-only; downloaded scripts are never executed.',
                parameters: {
                    type: 'object', additionalProperties: false, required: ['action'],
                    properties: {
                        action: { type: 'string', enum: ['list', 'detail', 'search', 'inspect', 'preview', 'check', 'diff', 'install', 'install-local', 'well-known-inspect', 'well-known-install', 'update', 'update-batch', 'remove', 'backups', 'purge-backup', 'purge-backups', 'restore', 'restore-to', 'move'] },
                        workspaceId: { type: 'string', description: 'Optional registered workspace ID from list; omission selects global skill roots.' },
                        id: { type: 'string', description: 'Exact skill ID from list; required by detail, update and remove. Optional for a single-skill check.' },
                        query: { type: 'string', description: 'Search keyword, required by search; 1–200 characters.' },
                        ids: { type: 'array', items: { type: 'string' }, description: 'Skill IDs to update in one batch; required by update-batch (1–2000 entries).' },
                        permanent: { type: 'boolean', description: 'Remove only: permanently delete the skill files instead of retaining a restorable backup. Requires the same one-time approval.' },
                        keep: { type: 'integer', description: 'Purge-backups only: number of newest backups to keep (0 removes all). Defaults to 0.' },
                        fromRootId: { type: 'string', description: 'Restore-to only: skill root that owns the backup.' },
                        toRootId: { type: 'string', description: 'Restore-to only: writable skill root to restore into.' },
                        entry: { type: 'string', description: 'Move/restore-to only: optional new directory name; defaults to the current or original entry name.' },
                        path: { type: 'string', description: 'Install-local only: absolute path to a local .tar.gz/.tgz/.zip skill archive.' },
                        name: { type: 'string', description: 'Well-known-install only: exact skill name from well-known-inspect.' },
                        limit: { type: 'integer', description: 'Search result limit, 1–50; defaults to 24.' },
                        source: { type: 'string', description: 'Public GitHub owner/repo or HTTPS repository-root URL; required by inspect, preview and install.' },
                        ref: { type: 'string', description: 'Optional GitHub branch or tag; defaults to repository HEAD.' },
                        commit: { type: 'string', description: '40-character commit from inspect/check; required by preview and install. Optional update revision, otherwise latest.' },
                        skillPath: { type: 'string', description: 'Exact repository SKILL.md path from inspect, required by preview and install.' },
                        rootId: { type: 'string', description: 'Writable installation root ID from list; required by install and restore.' },
                        expectedFingerprint: { type: 'string', description: '64-character current fingerprint from detail; required by update and remove.' },
                        overwriteModified: { type: 'boolean', description: 'Update only: explicitly request backup-and-replacement of locally modified files; defaults to false and still requires user approval.' },
                        backupId: { type: 'string', description: 'Backup UUID from backups; required by restore.' },
                    },
                },
                timeoutMs: config.operationTimeoutMs + 10000,
                isConcurrencySafe(raw) { try {
                    return !MUTATING_ACTIONS.has(parseRequest(raw).action);
                }
                catch {
                    return false;
                } },
                output: {
                    schema: { type: 'object', properties: { action: { type: 'string' }, result: {} }, required: ['action', 'result'], additionalProperties: false },
                    render(_args, value) {
                        const text = JSON.stringify(value, null, 2);
                        return [{ type: 'text', text: text.length <= 24000 ? text : `${text.slice(0, 24000)}\n… Output truncated. Use detail with a returned skill ID or the Skills Manager page for complete content.` }];
                    },
                },
                async execute(raw, execution) {
                    const request = parseRequest(raw);
                    if (MUTATING_ACTIONS.has(request.action)) {
                        const approval = service(toolCtx, 'approval');
                        if (!approval || !execution.agent)
                            fail('approval-unavailable', 'A live Agent and user approval channel are required for skill mutations.');
                        const target = 'ids' in request ? request.ids.join(', ') : 'id' in request ? request.id : 'source' in request ? request.source : 'backupId' in request ? request.backupId : request.action;
                        const permanent = request.action === 'remove' && request.permanent ? ' This permanently deletes the skill files without a restorable backup.' : '';
                        const reason = `Manage DSH skill (${request.action}): ${target}. This changes skill files outside the conversation; update/removal retain backups unless permanent removal is selected.${request.action === 'update' && request.overwriteModified ? ' Locally modified files will be replaced after backup.' : ''}${permanent}`;
                        const outcome = await approval.request({ agent: execution.agent, toolName: 'skills_manager', callId: execution.callId, reason, displayReason: { en: reason, zh: `确认技能操作：${request.action}，目标 ${target}。这会修改技能目录；更新/删除默认保留备份，不执行下载的脚本。${permanent ? '本次将永久删除技能文件，不保留可恢复备份。' : ''}${request.action === 'update' && request.overwriteModified ? '将备份并替换本地修改。' : ''}` }, signal: execution.signal });
                        if (outcome !== 'allowed-once')
                            fail('approval-denied', `Skill mutation did not receive user approval (${outcome}).`);
                    }
                    const result = await manager.execute(request, execution.signal);
                    return { action: request.action, result };
                },
            }));
        });
}
