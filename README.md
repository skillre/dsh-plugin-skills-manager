# DSH 技能管理 · Skills Manager

> `@skillre/dsh-plugin-skills-manager` · `0.1.3` · experimental

[English](<README.en.md>)

为 DSH 提供一个左侧栏「**技能**」入口，以原生 React 页面管理技能，不使用 iframe 或独立网页。

## 功能

- **本地技能**：查看用户与已登记工作区的技能，按名称、描述、来源和位置筛选；展示有效性、调用策略及指令内容。
- **更新检查**：按已记录的 GitHub 提交或 well-known 市场摘要检查目录版本，区分可更新、已是最新、无来源、只读和检查失败；摘要包含「已是最新」数量，无来源不会被误报为最新。
- **外部来源识别**：识别 Skills CLI 记录的 GitHub 与 well-known（如 `open.feishu.cn`）来源；well-known 技能用其目录摘要检查并更新，其他第三方来源显示真实来源标签但仍标记为不可自动更新。
- **技能更新**：固定到所选提交、验证完整文件哈希；检查本地修改及确认时的文件指纹，更新前保存旧版本。
- **技能检索**：搜索公共 [skills.sh](https://skills.sh) 目录，或直接检查一个公共 GitHub 仓库。
- **技能安装**：先选择和查看技能，再确认信任与安装位置；不会覆盖既有目录，不执行下载的脚本。
- **技能删除与恢复**：将入口移至完整备份，支持恢复；恢复不覆盖已存在的技能。
- **批量操作**：可一次更新全部已检查技能；逐项重新校验来源、保留备份，本地修改默认跳过（可显式允许覆盖），结果按成功/跳过/失败汇总。
- **备份管理**：备份记录显示大小与文件数，支持单条删除，以及「保留最新 N 份」的清理；默认不自动清理。
- **移动与重命名**：可把技能移到另一个可写位置，或修改目录名；跨位置移动先复制校验通过的文件，旧入口保留为备份，已存在同名入口时拒绝。
- **永久删除（可选）**：删除确认框可选择「同时永久删除备份」，二次警告后直接移除文件。
- **更新前文件对比**：更新对话框展示新增/删除/修改/未变的文件列表。
- **扩展安装来源**：支持本地 `.tar.gz`/`.tgz`/`.zip` 归档（内存严格解析、不执行脚本）、well-known HTTPS 目录安装，以及把备份恢复到其他可写位置。
- **模型工具**：提供 `skills_manager`，与界面调用同一核心服务；写操作必须取得本次用户批准，不接受授权布尔参数。
- 中英文文案、DSH 主题颜色、响应式布局、加载与失败状态、对话框焦点管理。

## 0.1.0 启动故障与升级

**0.1.0 已作废：不要新装，也不要作为回滚目标。** 该版本用 `connection.rpc.intercept('/api')` 抢占 DSH API Gateway 唯一的共享 interceptor，可能出现 `already has an interceptor`、Desktop welcome `Webrequest failed` 和 API/页面 404；并非技能文件损坏。

0.1.1 改为 `connection.fetch.register` 注册精确 `POST /api/skillre-skills-manager/execute`，保留 Client 的原 RPC 路径和 JSON 响应。Gateway 继续独占共享 interceptor；认证、owner-only 与 Web/Desktop shell carrier 均由 DSH Connection 承担，不新增服务器。

已有安装的用户：在 **Plugins / 插件** 中先关闭或卸载 0.1.0，确认宿主恢复后，再按下节安装 0.1.2 并重启 Desktop 验证（已是 0.1.1 可原地升级）。技能、来源记录与备份会保留。若故障使 Plugins 完全不可打开，请保留日志并寻求维护者协助；本轮不擅自修改日常 profile，不用 CLI `--profile desktop`、重装 DSH 或删除技能来代替恢复。

## 用户安装

源码托管在 [github.com/skillre/dsh-plugin-skills-manager](https://github.com/skillre/dsh-plugin-skills-manager)。**尚未发布 npm**。DSH Plugins 支持两种安装来源：

**方式 A：Git 仓库地址（跟随默认分支）** —— 在 **Add plugin / 添加插件** 输入框直接输入：

```
https://github.com/skillre/dsh-plugin-skills-manager
```

仓库已提交构建产物（`lib/`），pnpm 不需要执行构建脚本，因此不受 `allowBuilds` 供应链限制；安装后重启 Desktop 即可。该方式跟随 `main` 最新提交，适合持续获取最新版。

**方式 B：Release tarball（固定版本）** —— 从 [GitHub Release v0.1.3](https://github.com/skillre/dsh-plugin-skills-manager/releases/tag/v0.1.3) 下载 [`skillre-dsh-plugin-skills-manager-0.1.3.tgz`](https://github.com/skillre/dsh-plugin-skills-manager/releases/download/v0.1.3/skillre-dsh-plugin-skills-manager-0.1.3.tgz)，在 **Add plugin** 中输入它的**完整本地绝对路径**。

1. 打开 DSH 左侧 **Plugins / 插件**。
2. 选择 **Add plugin / 添加插件**。
3. 粘贴 Git 仓库地址或 tarball 的本地绝对路径，查看信任提示并自行确认安装。
4. 启用后，从左侧栏「**技能 / Skills**」进入。

最终安装由用户发起。不要输入尚未发布的 npm 包名或源码目录；`v0.1.3` tag 的源码树不含构建产物，若要固定版本请使用方式 B 的 Release 资产。

## 使用

- 「本地技能」展示全局目录；选择工作区后额外加入其最近 `.git` 项目根下的技能目录。
- 「检查更新」仅发起检查，不自动更新。完成后摘要分别给出可更新、已是最新、无来源和检查失败的数量；可更新的入口显示更新操作。
- 「技能检索」输入任务或技术关键词；「查看并安装」先检查来源，安装前必须勾选信任确认。
- 「从仓库安装」支持 `owner/repo` 或 `https://github.com/owner/repo`；分支/标签选填，默认 `HEAD`。
- 删除和更新会生成「备份记录」。备份持续保留，不自动清除；恢复时原位置必须空闲。
- DSH 本地技能扫描器观察到文件变化后更新其目录。已有对话里的已加载指令不会被追溯重写；必要时重新加载技能或开启新会话。

## 管理范围

| 来源 | 位置 | 写入 |
|---|---|---|
| 用户共享技能 | `$DSH_AGENTS_HOME/skills`，默认 `~/.agents/skills` | 支持 |
| 用户 DSH 技能 | `$DSH_HOME/skills`，默认 `~/.dsh/skills` | 支持；不处理 `.system` |
| 已登记工作区 | 项目根下 `.agents/skills`、`.dsh/skills` | 支持 |
| 自定义/内置目录、DSH registry-only 技能 | 显式配置或技能目录提供 | 只读 |
| 符号链接或含链接的技能 | 由原安装器管理 | 只读；不跟随链接进行变更 |

技能支持直接子目录的 `SKILL.md` 和根下独立 `.md` 文件。自动更新只支持有可靠来源记录的**目录技能**。

插件记录自己的来源信息，并只读导入 `agentsHome/.skill-lock.json` 中受支持的 Skills CLI v3 来源：GitHub（提交 + 目录树哈希）与 well-known（`sourceBaseUrl` + `sha256` 摘要），两者都要求规范安装目录与技能名匹配。不会改写该第三方锁文件，也不会同步删除其他 Agent 的安装。手写技能、旧锁格式、不支持的来源类型等会显示对应的外部来源标签（若有）或「无来源记录」，并且不会被当作「已是最新」。

## 更新来源与摘要校验

- **GitHub 来源**：固定查看过的提交，比较完整技能目录的 Git tree 哈希；更新时重新校验每个 blob 与目录树。
- **well-known 来源**：读取来源基址下 `/.well-known/agent-skills/index.json`，比较 catalog 的 `sha256` 归档摘要；有变化才下载。归档必须与 catalog 同源 HTTPS，下载后校验摘要，才在内存中严格解析 tar.gz——拒绝链接、设备、路径穿越、重复/大小写冲突路径以及文件数/大小超限。校验通过后才进入正常的备份与替换流程。
- **无来源或外部管理**：只显示已知来源标签与安装位置；可以查看、删除和恢复，但不声称远程版本状态，也不提供一键更新。

## 安装位置：技能文件写到哪里

「安装」写入的始终是一个**可写技能根目录**，而不是插件安装目录：

- 用户共享技能：`$DSH_AGENTS_HOME/skills`，默认 `~/.agents/skills`（你当前 42 个技能大多在这里）。
- 用户 DSH 技能：`$DSH_HOME/skills`，默认 `~/.dsh/skills`（当前 `amap-cli-skill` 在这里）。
- 已登记工作区：选中工作区后，其最近 `.git` 项目根下的 `.agents/skills` 与 `.dsh/skills`。
- 自定义/内置目录、DSH registry-only 技能、符号链接技能：只读，不会作为安装目标。

安装/本地归档/well-known 安装/移动/恢复弹窗都会显示目标根目录的**绝对路径**。插件包本身由 DSH Plugins 管理器安装进 profile（例如 `~/.dsh/profiles/<profile>/node_modules/@skillre/dsh-plugin-skills-manager`），与技能文件互不影响。

## 批量、备份与迁移

- 「可用更新」标签页的「全部更新」会再次校验每一项；存在本地修改的技能默认跳过，勾选后才备份并替换。失败项不会中断其余项。
- 备份记录现在显示大小与文件数；垃圾桶按钮删除单条备份，「清理备份」可按「保留最新 N 份」清理当前位置。删除备份只作用于 `.skills-manager/backups`，不影响已安装技能。
- 「移动 / 重命名」在技能详情中；跨位置移动会先复制并校验，再移除原入口（保留备份），因此失败时不会丢文件。
- 永久删除仍需重新计算完整指纹；不保留可恢复备份，操作前有明确警告。

## 配置

配置写在用户自己的 Cordis 覆盖层，而非编辑安装包。示例：

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
    operationTimeoutMs: 120000
    maxSkills: 500
    maxFileBytes: 2097152
    maxBundleBytes: 26214400
    maxBundleFiles: 300
    maxRepositoryEntries: 30000
    checkConcurrency: 3
```

覆盖 `config` 会整块替换，但本插件 schema 会补齐省略的默认字段。目录必须为绝对路径。

| 参数 | 默认值 | 含义 |
|---|---|---|
| `includeDefaultRoots` | `true` | 启用用户和工作区默认目录；关闭后仅扫描显式只读目录 |
| `dshHome` | `$DSH_HOME` 或 `~/.dsh` | 用户 DSH 根目录 |
| `agentsHome` | `$DSH_AGENTS_HOME` 或 `~/.agents` | 共享 Agent 根目录 |
| `customSkillDirs` | `[]` | 附加只读目录 |
| `readOnlySkillDirs` | `[]` | 内置或其他只读目录 |
| `allowMutations` | `true` | 安装、更新、删除及恢复开关；关闭后所有目录只读 |
| `enableAgentTool` | `true` | 注册模型管理工具（依赖宿主 tools；授权通道缺失时写操作失败闭合） |
| `requestTimeoutMs` | `15000` | 单个网络请求上限 |
| `operationTimeoutMs` | `120000` | 一次操作上限；提交已开始时仍需核对最终状态 |
| `maxSkills` | `500` | 本地及来源目录结果上限 |
| `maxFileBytes` | `2097152` | 单个文件上限，2 MiB |
| `maxBundleBytes` | `26214400` | 技能总大小上限，25 MiB |
| `maxBundleFiles` | `300` | 技能文件数上限 |
| `maxRepositoryEntries` | `30000` | GitHub 完整树条目上限；截断树不用于判定更新 |
| `checkConcurrency` | `3` | 网络检查/下载并发，1–6 |

## 权限、网络与安全

- Host 插件以宿主权限访问配置的技能目录；界面 RPC 仅接受经过 DSH Connection 验证的 live owner，拒绝其他 Peer。
- 只向 `skills.sh`、`api.github.com`、`raw.githubusercontent.com` 以及已记录来源的公共 HTTPS well-known 目录发起请求；well-known 归档必须与 catalog 同源，校验 `sha256` 摘要并在内存中严格解析 tar.gz。不读取 GitHub token、浏览器凭据、Git 登录或执行 `npx`/Git/下载脚本。
- 下载固定到提交，校验每个 Git blob 和完整选中目录的 Git tree；拒绝远程链接、子模块、越界路径、大小写/Unicode 路径冲突及超限资源。
- 变更时重新校验本地指纹，使用每根目录磁盘锁、同文件系统事务日志和备份。状态文件限 4 MiB，无法验证的状态/未完成事务失败闭合。
- **变更期间不要用其他安装器/编辑器修改同一根目录。** 防护覆盖静态链接/路径穿越和合作式并发；可移植 Node I/O 不提供抵御同 OS 用户恶意祖先路径交换的 dirfd 隔离。
- 未对目录执行 fsync，不宣称经过验证的掉电级持久性。强杀或无法安全回滚会保留锁、日志、staging 和备份，必须先保留证据再人工恢复，不可盲删。
- 取消请求可能发生在提交之后；应刷新目录并检查备份，不能把取消响应当作“未发生变更”。

## 验证与限制

已在 **2026-11-02** 重新 Inspect 并实挂当前 DSH **0.2.1-rc.5**。本地类型检查、构建、publint、打包检查和 **63 项自动化测试**通过（含 **20 项真实 ConnectionRegistry 运输层回归**、**7 项 well-known/归档回归**、**8 项批量/备份/移动/安装/对比回归**）。自有临时非 Desktop profile 的预最终包验证了全部 **37 个 packed 文件**的字节、真实 Gateway `settings/describe` 与 Desktop welcome 实际调用 `llm/listConfigurableProviders`、插件 list/detail/check/remove/restore 的实际文件与指纹、仍安装插件时真实 Host 重启后的欢迎方法与 fixture 保留、卸载后依赖/选择/组合/插件路径缺失，以及再次启动后两个 Gateway 方法继续成功。10 个自有 CLI 进程真实关闭并核实组 `ESRCH` 后，确认 owner/UID/规范路径才删除测试 root，最终核实 `ENOENT`。旧版只测插件自身 RPC 的记录不是本版本兼容证明。

安装包中的 [兼容记录](<compatibility.json>) 只引用本版本 [已通过的预最终实挂证据](<docs/verification/pre-final-mount-0.1.3-gateway.json>)。补入文档/兼容元数据后必须重新打包并安装**精确最终文件**；全部 packed payload、SHA256、Gateway/插件检查与清理结果以 [最终实挂记录](<docs/verification/isolated-mount-0.1.3.json>)、[日志](<docs/verification/isolated-mount-0.1.3.log>) 和 [最终文件摘要](<docs/verification/final-artifact-0.1.3.json>) 为准。精确 tarball 哈希保留在外部证据中，避免安装包自引用自己的哈希。

**实际 Web/Electron 视觉与交互、用户日常 Desktop 重启验收尚未完成**：本轮不配置浏览器/扩展，也未安装、关闭或卸载日常 profile 的既有插件。隔离 CLI/Web Host 的真实重启、认证 RPC 与 Client 资源可加载不等于 Electron 窗口、主题或交互验收；发布准备保留 UI 证据门禁。

该路由使用 `buffered` 请求体；上限属于 DSH Connection HTTP 承载层的 `maxRequestBodyBytes`（当前默认 300 MiB），不是本插件 adapter 或直接 `shared.fetch` 的独立 cap。本轮未新增 carrier overflow 测试。

其他限制：安装来源为公共 GitHub、本地归档与 well-known archive；本地归档为无来源技能（不可自动更新）；匿名 API 或第三方站点会限流；well-known 仅 `type: archive` 可安装/更新；由外部工具安装的技能在插件首次成功更新前无法判断本地修改（首次更新会保留备份）；批量更新默认跳过无法判断的本地修改，可用勾选覆盖；移动跨文件系统时会走复制+备份路径；无来源/平面文件/不支持的旧锁无法自动更新；不保证其他 DSH 版本兼容，不自动更新、不永久清除备份、不提供技能编辑器。

## 开发验证

```sh
npm install --ignore-scripts
npm run check
npm pack --json --ignore-scripts
DSH_TEST_CLI=/path/to/current/dsh npm run test:integration -- /absolute/path/to/package.tgz
```

仓库提交了 `lib/` 构建产物，以支持方式 A 的 Git 地址安装；修改 `src/` 后必须执行 `npm run build` 并提交 `lib/`，CI 会通过 `git diff --exit-code -- lib` 校验两者一致。隔离脚本必须在给足时限的**前景有界 shell** 中运行。它创建新的非 Desktop 自有测试 home/profile，验证真实安装、组合、RPC、Client 资源及卸载，最后等待全部自有进程真实关闭并核实进程组与目录缺失。`EPERM` 或其他不明清理状态是失败，不会被当成已退出/已清理；会保留 owner/PID 与失败证据。严禁将测试脚本指向用户 profile，严禁源码 `link:` 部署。检查期间保持同一 tarball、构建文件与元数据不变，不并发重包。

## 卸载与回滚

见 [卸载与恢复说明](<UNINSTALL.md>)。插件卸载不删除用户技能或备份。

MIT。插件图标为本项目原创；安装包资源通过公开导出读取，无默认占位图标。
