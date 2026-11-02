# 卸载、回滚与恢复 / Uninstall and recovery

## 卸载插件

由用户在 DSH **Plugins / 插件管理** 中打开「技能管理」并选择关闭或卸载。不要用 CLI 的 `--profile desktop` 代替 Electron 管理界面。

卸载会撤销本插件的精确 `POST /api/skillre-skills-manager/execute` Fetch route、模型工具、Client Slot、语言字典与相关请求；**不移除 DSH API Gateway 的共享 interceptor，不删除用户技能、来源记录或备份**。本轮未在用户日常 profile 安装或代卸载插件。

## 恢复已删除技能 / 回滚技能更新

- 在「备份记录」选择需要的记录并确认恢复。
- 原位置必须没有其他技能；恢复绝不覆盖既有文件或目录。
- 若需回滚更新，先备份/移除当前入口，再恢复对应的「更新前版本」。
- 安装在共享 Agent 目录的技能可能被其他程序使用；操作前停止其他安装器/编辑器。

## 插件版本回滚

只保留没有已知启动故障、且已核验的 tarball 作为回滚候选。**0.1.0 已作废，不能作为安装或回滚目标**；当前无法采用其他已验证版本时，安全退路是关闭/卸载插件，而不是回退 0.1.0。用户在 Plugins 中撤销问题版本，再自行安装安全候选版本；不由 Agent 预装或更改 profile。

若已安装 0.1.0：在 Plugins 先关闭或卸载旧包，确认宿主恢复，再选择 0.1.1。若 Plugins 因启动故障完全不可访问，保留错误日志并寻求维护者协助，另行取得用户授权与可逆恢复计划；不要 CLI `--profile desktop`、重装 DSH 或盲删技能/profile。详见 [启动故障与升级](<README.md>)。

## 锁、事务日志或恢复错误

若操作返回 `recovery-required`、存在未完成事务或强杀后锁残留：

1. 先停止对该技能根的所有写入，必要时在 Plugins 中关闭本插件。
2. 保留整个技能根及其 `.skills-manager` 数据，尤其是 `state.json`、`journal.json`、`write.lock`、`staging/` 与 `backups/`。**不要直接盲删锁或日志**。
3. 根据日志的 action、entry、stageId、backupId 与实际内容确定是否已经提交。优先保存完整内容；任何恢复都要求目标位置空闲。
4. 无法核对一致性时，请人工恢复或寻求维护者帮助，再清除已明确处理的事务标记。不得根据取消/超时响应假定没有写入。

可移植 Node 路径操作不防御同 OS 用户恶意祖先替换，且没有目录 fsync / 经验证的掉电保证。备份不自动过期；元数据上限为 4 MiB，达到上限会拒绝提交而非悄悄丢弃历史。

## 仅开发测试

隔离测试使用独立、自有、非 Desktop 的临时 home/profile 和打包 tarball。结束时停止并等待所有自有进程，卸载并核对依赖/选择/配置缺失，或仅移除已确认归属的整个测试目录，然后验证不存在。

本轮日常 profile 未改动；本版本测试的真实卸载和严格清理以 [0.1.1 实挂证据](<docs/verification/isolated-mount-0.1.1.json>) 为准。历史 0.1.0 报告只保留作诊断记录，不证明 Gateway 共存或新版本兼容。

---

The user disables/removes the bundle in **Plugins**, not through CLI access to the reserved Desktop profile. Uninstall withdraws this plugin's exact Fetch route and other registrations/requests, **preserves Gateway's shared interceptor**, and **retains skills, provenance and backups**.

Restore a deleted/previous skill from Backups only when its original location is free. To roll back an update, first preserve/remove the current entry, then restore the earlier backup. Plugin-version rollback must use an independently verified safe candidate: **0.1.0 is withdrawn and must not be installed or rolled back to**. If no safe candidate is available, disable/uninstall the plugin instead.

Existing 0.1.0 users should disable/uninstall the old bundle in Plugins, confirm Host recovery, then install 0.1.1 and check a real Desktop restart. If Plugins is inaccessible, preserve logs and seek separately authorized reversible recovery; this task does not change the daily profile or use a DSH reinstall/skill deletion as a workaround.

After a strong termination, uncertain rollback, or `recovery-required`, stop all writers and preserve the complete skill root plus `.skills-manager` state, journal, lock, staging and backups. Determine the actual commit phase from evidence; never blindly delete markers or infer no changes from a cancelled response. Seek manual recovery if consistency cannot be established.

The filesystem model fences static paths and cooperating writers, not hostile same-user ancestor swaps or proven power-loss durability. Backups do not expire automatically; oversized metadata fails before commit.

Development installs are temporary and confined to owned non-Desktop profiles. Stop owned processes, remove only confirmed test-created state, and prove absence. No development installation is left in the user's daily profile.
