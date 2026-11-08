# DSH 技能管理 · Skills Manager

> `@skillre/dsh-plugin-skills-manager` · `0.5.1` · experimental

[English](<README.en.md>)

在 DSH **设置**侧栏中提供「**技能管理**」页（不再占用左侧栏面板入口），以原生 React 页面管理技能，不使用 iframe 或独立网页。页面与设置页共享同一套设计语言：导航名与页面标题一致、原生卡片/下划线标签页/按钮/输入框/焦点环，对话框也沿用宿主对话框契约。

## 功能

- **本地技能**：查看用户与已登记工作区的技能，按名称、描述、来源和位置筛选；展示有效性、调用策略及指令内容。
- **更新检查**：按已记录的 GitHub 提交或 well-known 市场摘要检查目录版本，区分可更新、已是最新、无来源、只读和检查失败；摘要包含「已是最新」数量，无来源不会被误报为最新。
- **外部来源识别**：识别 Skills CLI 记录的 GitHub 与 well-known（如 `open.feishu.cn`）来源；well-known 技能用其目录摘要检查并更新，其他第三方来源显示真实来源标签但仍标记为不可自动更新。
- **技能更新**：固定到所选提交、验证完整文件哈希；检查本地修改及确认时的文件指纹，更新前保存旧版本。
- **技能检索**：搜索公共 [skills.sh](https://skills.sh) 目录，或直接检查一个公共 GitHub 仓库。检索结果会直接进入来源仓库中对应技能的**完整审阅**（自动定位所选技能、展示 `SKILL.md`、资源清单与安装位置），不需要再手动点一次「检查仓库」。
- **技能安装**：三步流程「选择来源 → 选择技能 → 查看并安装」，安装前必须勾选信任；不会覆盖既有目录，不执行下载的脚本。若该位置已有同名技能：同来源时提示并可直接更新，其他来源时说明 DSH 同名只生效一个并给出已安装技能入口，仅目录名冲突时可换一个目录名安装。安装成功后自动切到「本地技能」并筛选到新技能，装完立刻能看到。
- **检索/安装的抗限流**：GitHub 未认证 API 每小时仅 60 次。发现流程会短期复用仓库解析结果、按 commit 复用不可变树；额度耗尽时直接给出重置时间与配置建议。API 被限流或不可达时，列表改用 `github.com` 引用广告 + codeload 归档重建真实 Git blob/tree 哈希，检索→审阅→安装仍可完成。
- **技能删除与恢复**：将入口移至完整备份，支持恢复；恢复不覆盖已存在的技能。
- **批量操作**：可一次更新全部已检查技能；逐项重新校验来源、保留备份，本地修改默认跳过（可显式允许覆盖），结果按成功/跳过/失败汇总。
- **备份管理**：备份记录显示大小与文件数，支持单条删除，以及「保留最新 N 份」的清理；默认不自动清理。
- **移动与重命名**：可把技能移到另一个可写位置，或修改目录名；跨位置移动先复制校验通过的文件，旧入口保留为备份，已存在同名入口时拒绝。
- **永久删除（可选）**：删除确认框可选择「同时永久删除备份」，二次警告后直接移除文件。
- **更新前文件对比**：更新对话框展示新增/删除/修改/未变的文件列表。
- **扩展安装来源**：支持本地 `.tar.gz`/`.tgz`/`.zip` 归档（内存严格解析、不执行脚本）、well-known HTTPS 目录安装，以及把备份恢复到其他可写位置。
- **模型工具**：提供 `skills_manager`，与界面调用同一核心服务；写操作必须取得本次用户批准，不接受授权布尔参数。
- **热启停**：在 Plugins 中关闭再重新启用插件时，设置侧栏中的「技能管理」条目与其页面随插件 Fiber 正确卸载和重挂载；0.3.0 起不再注册左侧栏面板入口。
- **统一设置页外观**：页面复用宿主 DSH 设置页的设计语言（`--dsw-alias-settings-card-*` 卡片、下划线标签页、原生按钮/输入框/焦点环、宿主对话框外观），导航名「技能管理」与页面标题一致，不再另起一套视觉系统。
- **数量卡片即筛选器**：顶部三个数量卡片是真实按钮，点击分别查看全部技能、可用更新、只读技能；只读筛选会显示可清除的标签，卡片本身用 `aria-pressed` 标出当前视图。
- **详情页是一张图**：插件详情页由中英双语预览图承担（`docs/preview.svg` / `docs/preview.zh.svg`，640×300 横幅），不再把 README 当详情正文；卡片文案（标题 + 一句话描述）来自 `locale/*.json` 的 `meta`，README 继续作为完整开发者文档。
- 中英文文案、DSH 主题颜色、响应式布局、加载与失败状态、对话框焦点管理。

## 展示元数据（卡片与详情页）

DSH 的插件卡片与详情页读取的是包内元数据，不是 README：

| 层级 | 来源 | 本插件内容 |
|---|---|---|
| 卡片标题 | `locale/en.json`、`locale/zh.json` 的 `meta.title` | `Skills Manager` / `技能管理` |
| 卡片描述 | 同上的 `meta.description`（一句话，≤120 字符） | 中英各一句，说明「是什么 + 给你什么」 |
| 详情页 | 同上的 `meta.detail` → `docs/DETAIL.md` / `docs/DETAIL.zh.md` | **只有一行预览图引用**，无任何长文 |
| 详情图 | `docs/preview.svg` / `docs/preview.zh.svg` | 640×300 双语横幅：统一的设置页界面（可点击数量卡片、技能卡片列表）、检索→审阅→安装流程 |
| 图标 | `icon.svg`（包根） | 技能管理图标 |

- 预览图的编辑源约定为飞书画板，仓库里的 SVG 是导出快照；画板登记见 [docs/PREVIEW.md](<docs/PREVIEW.md>)，同步命令为 `node scripts/preview.mjs push|pull --lang zh|en`。当前两张图直接手写维护，画板待建。
- `npm run check` 会先执行 `npm run preview:check`，离线校验两张 SVG 的画幅比例、允许元素、文本可编辑性与 `meta.detail` 指向；图片与 DETAIL 文档都会随包发布（`files` 含 `docs`），否则详情页会空白且无报错。
- 长文、安装、配置、权限、回滚、验证证据仍全部留在 README；详情页只负责“一眼看懂这是什么”。

## 0.1.0 启动故障与升级

**0.1.0 已作废：不要新装，也不要作为回滚目标。** 该版本用 `connection.rpc.intercept('/api')` 抢占 DSH API Gateway 唯一的共享 interceptor，可能出现 `already has an interceptor`、Desktop welcome `Webrequest failed` 和 API/页面 404；并非技能文件损坏。

0.1.1 改为 `connection.fetch.register` 注册精确 `POST /api/skillre-skills-manager/execute`，保留 Client 的原 RPC 路径和 JSON 响应。Gateway 继续独占共享 interceptor；认证、owner-only 与 Web/Desktop shell carrier 均由 DSH Connection 承担，不新增服务器。

已有安装的用户：在 **Plugins / 插件** 中先关闭或卸载 0.1.0，确认宿主恢复后，再按「用户安装」一节安装当前版本并重启 Desktop 验证（0.1.1 及以上可原地升级）。技能、来源记录与备份会保留。若故障使 Plugins 完全不可打开，请保留日志并寻求维护者协助；本轮不擅自修改日常 profile，不用 CLI `--profile desktop`、重装 DSH 或删除技能来代替恢复。

## 用户安装

源码托管在 [github.com/skillre/dsh-plugin-skills-manager](https://github.com/skillre/dsh-plugin-skills-manager)，并已发布到 npm：**`@skillre/dsh-plugin-skills-manager@0.5.1`**。

**方式 A：npm 包名（推荐，可原地升级）** —— 在 **Add plugin / 添加插件** 输入：

```
@skillre/dsh-plugin-skills-manager
```

或固定版本 `@skillre/dsh-plugin-skills-manager@0.5.1`。npm 安装会显示「版本」区块，之后可直接在 Plugins 中升级，也可从 **Discover** 安装（本插件已列入用户自建市场索引，源为 npm）。

**方式 B：Git 仓库地址（跟随默认分支）** —— 在 **Add plugin** 输入：

```
https://github.com/skillre/dsh-plugin-skills-manager
```

仓库已提交构建产物（`lib/`），pnpm 不需要执行构建脚本，因此不受 `allowBuilds` 供应链限制；该方式跟随 `main` 最新提交。注意：**Git 安装没有「版本」区块，只能卸载重装，无法原地升级**。

**方式 C：Release tarball（固定版本）** —— 从 [GitHub Release v0.5.1](https://github.com/skillre/dsh-plugin-skills-manager/releases/tag/v0.5.1) 下载 [`skillre-dsh-plugin-skills-manager-0.5.1.tgz`](https://github.com/skillre/dsh-plugin-skills-manager/releases/download/v0.5.1/skillre-dsh-plugin-skills-manager-0.5.1.tgz)，在 **Add plugin** 中输入它的**完整本地绝对路径**。该文件与 npm 发布内容完全一致（registry integrity 相同）。

1. 打开 DSH 左侧 **Plugins / 插件**。
2. 选择 **Add plugin / 添加插件**。
3. 粘贴 npm 包名、Git 仓库地址或 tarball 的本地绝对路径，查看信任提示并自行确认安装。
4. 启用后，打开 **设置**（左侧栏底部「更多 / More」→ 设置，或快捷键 ⌘,），在设置侧栏中选择「**技能管理 / Skills Manager**」。左侧栏不会新增技能按钮。

从旧的 `github:` 安装升级到 npm 安装：先在 Plugins 中移除旧的 Git 条目，再用方式 A 安装 npm 包名（技能文件、来源记录与备份都在 profile 之外，不受影响）。

最终安装由用户发起。固定版本请使用方式 A 的显式版本号或方式 C 的 Release 资产（同一份已验证内容）。

## 使用

- 「本地技能」展示全局目录；选择工作区后额外加入其最近 `.git` 项目根下的技能目录。
- 「检查更新」仅发起检查，不自动更新。完成后摘要分别给出可更新、已是最新、无来源和检查失败的数量；可更新的入口显示更新操作。更新其中一个技能后，其余技能的更新结果会保留，不需要重新检查。
- 列表工具栏左上角的刷新图标只重新扫描本地技能目录（不访问网络），适合手动改动文件后快速重读；页头的「检查更新」才会访问来源并对比上游。备份标签页中的刷新图标只重读备份记录。
- 点击技能名称、卡片正文或卡片上的「详情」按钮查看完整详情：描述、位置与绝对路径（可一键复制）、来源与提交、更新状态、模型/用户调用权限、完整 `SKILL.md` 指令，以及资源文件清单；只读技能在文件可读取时也会列出资源。
- 「更新」与「全部更新」都会转入后台任务：确认后立即返回，自动切到「更新任务」标签页；页头「更新任务」按钮会显示运行中任务的总体进度，任何时候都能回到进度视图。Host 运行期间任务历史保留（最多 20 条）；Host 重启后任务记录清空，但技能更新事务有日志保护，不会留下半更新状态。
- 单个技能进度按阶段显示：解析来源 → 下载（真实字节/文件比例）→ 校验 → 备份旧版本 → 安装新版本，并给出大致百分比。批量任务额外显示整体进度和每个技能的状态（未更新 / 正在更新 / 更新完成 / 更新失败 / 已跳过 / 已取消）、时间、备份 ID、提交与失败原因。
- 同一时间只允许一个更新任务在运行，期间「检查更新」和更新入口暂时禁用；可「停止剩余更新」（当前技能会完整完成，剩余项标记为已取消），失败项可一键重试。任务结束后自动刷新技能列表与可用更新状态。
- 「技能检索」输入任务或技术关键词；点「查看并安装」会直接检查来源并定位该技能，进入审阅步骤，安装前必须勾选信任确认。「从仓库安装」可手动输入仓库地址与分支/标签，并自行选择仓库中的技能。
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

- 「全部更新」在页面顶部和「可用更新」标签页都可见（需先执行检查更新）；会再次校验每一项，本地修改默认跳过，勾选后才备份并替换。失败项不会中断其余项，结果会列出失败技能名。
- 备份位置：每个技能根目录下的 `.skills-manager/backups/<id>/content`（例如 `~/.agents/skills/.skills-manager/backups/<id>/content`）。更新/删除前会把完整旧版本整体移入，记录里显示大小、文件数、时间、来源和完整路径。
- 为什么更新也要备份：更新是破坏性替换，保留旧版本可在新版本有问题时回滚；备份默认不会自动清理。
- 恢复：「备份与恢复」标签页每条记录右侧「恢复」，把旧版本移回原位置；原位置已有同名技能时拒绝覆盖。
- 删除：每条记录右侧「删除备份」永久删除该份备份；顶部「清理备份」可按「保留最新 N 份」清理当前位置。删除备份只作用于 `.skills-manager/backups`，不影响已安装技能。
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
    operationTimeoutMs: 300000
    maxSkills: 500
    maxFileBytes: 2097152
    maxBundleBytes: 104857600
    maxBundleFiles: 20000
    maxRepositoryEntries: 30000
    checkConcurrency: 3
    githubTokenEnv: ''
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
| `operationTimeoutMs` | `300000` | 一次操作上限；提交已开始时仍需核对最终状态 |
| `maxSkills` | `500` | 本地及来源目录结果上限 |
| `maxFileBytes` | `2097152` | 单个文件上限，2 MiB |
| `maxBundleBytes` | `104857600` | 技能总大小上限，100 MiB |
| `maxBundleFiles` | `20000` | 技能文件数上限；配置上限 50000，适合模板/素材型技能 |
| `maxRepositoryEntries` | `30000` | GitHub 完整树条目上限；截断树不用于判定更新 |
| `checkConcurrency` | `3` | 网络检查/下载并发，1–6 |
| `githubTokenEnv` | `''` | 可选：一个**环境变量名**（如 `GITHUB_TOKEN`），插件仅在请求 `api.github.com` 时读取并附带它，用于提高每小时额度；默认空表示绝不读取任何凭据。填 token 值本身会被拒绝 |

## 权限、网络与安全

- Host 插件以宿主权限访问配置的技能目录；界面 RPC 仅接受经过 DSH Connection 验证的 live owner，拒绝其他 Peer。
- 只向 `skills.sh`、`api.github.com`、`raw.githubusercontent.com`、`codeload.github.com`、`github.com`（Git 引用广告，仅用于 API 限流时的兜底）以及已记录来源的公共 HTTPS well-known 目录发起请求；well-known 归档必须与 catalog 同源，校验 `sha256` 摘要并在内存中严格解析 tar.gz。默认**不读取任何凭据**；只有显式配置 `githubTokenEnv` 时，才会把该环境变量中的 token 仅附加到 `api.github.com` 请求上——不会发往 raw/codeload/skills.sh，也不会写入日志或错误信息。不执行 `npx`/Git/下载脚本。
- 下载固定到提交，校验每个 Git blob 和完整选中目录的 Git tree；拒绝远程链接、子模块、越界路径、大小写/Unicode 路径冲突及超限资源。
- 变更时重新校验本地指纹，使用每根目录磁盘锁、同文件系统事务日志和备份。状态文件限 4 MiB，无法验证的状态/未完成事务失败闭合。
- **变更期间不要用其他安装器/编辑器修改同一根目录。** 防护覆盖静态链接/路径穿越和合作式并发；可移植 Node I/O 不提供抵御同 OS 用户恶意祖先路径交换的 dirfd 隔离。
- 未对目录执行 fsync，不宣称经过验证的掉电级持久性。强杀或无法安全回滚会保留锁、日志、staging 和备份，必须先保留证据再人工恢复，不可盲删。
- 取消请求可能发生在提交之后；应刷新目录并检查备份，不能把取消响应当作“未发生变更”。

## 验证与限制

已在 **2026-11-08** 重新 Inspect 并实挂当前 DSH **0.2.2-rc.1**（cordis 4.1.0），并把设置页统一到宿主设置页设计语言；详情页继续使用「一张图」展示契约。本地类型检查、构建、publint、打包检查和 **88 项自动化测试**通过（含 **20 项真实 ConnectionRegistry 运输层回归**、**14 项 GitHub 来源/限流/归档兜底回归**、**7 项 well-known/归档回归**、**10 项批量/备份/移动/安装/对比回归**、**5 项检索命中与安装冲突决策回归**、**3 项 Client 设置页注册/生命周期回归**等）。自有临时非 Desktop profile 的预最终包逐字节核对了全部 **42 个 packed 文件**，并验证真实 Gateway `settings/describe` 与 Desktop welcome 实际调用 `llm/listConfigurableProviders`、插件 list/detail/check/remove/restore 的实际文件与指纹、仍安装插件时真实 Host 重启后的欢迎方法与 fixture 保留、卸载后依赖/选择/组合/插件路径缺失，以及再次启动后两个 Gateway 方法继续成功；所有自有 CLI 进程真实关闭并核实组 `ESRCH` 后，才按 owner/UID/规范路径删除测试 root 并核实 `ENOENT`。另在真实 DSH Web 页面（自有临时非 Desktop profile + 真实 Chrome/CDP）验证：左侧栏**不存在**技能入口；设置侧栏出现「技能管理」并提供图标与管理页；页面标题与导航名一致、卡片/标签页/标题使用宿主设置页尺寸与圆角、三个数量卡片是可点击按钮且点击后正确筛选（只读筛选带可清除标签）；「技能检索」→「查看并安装」一步进入完整审阅（自动解析仓库、展示 `SKILL.md`、资源与安装位置）；关闭再启用插件两轮后设置条目与页面都恢复，控制台无错误。旧版只测插件自身 RPC 的记录不是本版本兼容证明。

安装包中的 [兼容记录](<compatibility.json>) 只引用本版本[已通过的预最终实挂证据](<docs/verification/pre-final-mount-0.5.1-gateway.json>)。补入兼容元数据后必须重新打包并安装**精确最终文件**；全部 packed payload、SHA256、Gateway/插件检查与清理结果以 [最终实挂记录](<docs/verification/isolated-mount-0.5.1.json>)、[日志](<docs/verification/isolated-mount-0.5.1.log>) 和 [最终文件摘要](<docs/verification/final-artifact-0.5.1.json>) 为准。真实 Web UI 检查的证据在 [浏览器验证记录](<docs/verification/browser-hot-reenable-0.5.1.json>)。精确 tarball 哈希保留在外部证据中，避免安装包自引用自己的哈希。

**Electron Desktop 视觉/交互与用户日常 Desktop 重启验收仍由用户完成**：隔离 CLI/Web Host 的真实重启、认证 RPC 与 Client 资源可加载不等于 Electron 窗口、主题或交互验收。0.5.1 的 Settings 入口、统一设置页外观与可点击数量卡片、检索→审阅流程、热启停与**详情页预览图**已在真实 DSH Web 页面验证，并分别作为 `web-ui-settings-page`、`web-ui-settings-unified`、`web-ui-overview-tiles`、`web-ui-discover-review`、`web-ui-hot-reenable`、`web-ui-detail-preview-image` 记录在兼容证据中（界面截图见 [设置页截图](<docs/verification/settings-ui-0.5.1.png>) 与 [筛选截图](<docs/verification/settings-ui-filter-0.5.1.png>)）。Desktop Electron 窗口内的同流程视觉验收仍待用户完成。

该路由使用 `buffered` 请求体；上限属于 DSH Connection HTTP 承载层的 `maxRequestBodyBytes`（当前默认 300 MiB），不是本插件 adapter 或直接 `shared.fetch` 的独立 cap。本轮未新增 carrier overflow 测试。

其他限制：安装来源为公共 GitHub、本地归档与 well-known archive；本地归档为无来源技能（不可自动更新）；匿名 API 或第三方站点会限流；well-known 仅 `type: archive` 可安装/更新；由外部工具安装的技能在插件首次成功更新前无法判断本地修改（首次更新会保留备份）；批量更新默认跳过无法判断的本地修改，可用勾选覆盖；移动跨文件系统时会走复制+备份路径；无来源/平面文件/不支持的旧锁无法自动更新；不保证其他 DSH 版本兼容，不自动更新、不永久清除备份、不提供技能编辑器。更新任务状态仅保存在 Host 内存（最多 20 条），Host 重启会清空任务历史；同一时间只允许一个更新任务，取消只停止尚未开始的技能，当前技能会完整完成事务。

## 开发验证

```sh
npm install --ignore-scripts
npm run check
npm pack --json --ignore-scripts
DSH_TEST_CLI=/path/to/current/dsh npm run test:integration -- /absolute/path/to/package.tgz
```

仓库提交了 `lib/` 构建产物，以支持方式 B 的 Git 地址安装；修改 `src/` 后必须执行 `npm run build` 并提交 `lib/`，CI 会通过 `git diff --exit-code -- lib` 校验两者一致。隔离脚本必须在给足时限的**前景有界 shell** 中运行。它创建新的非 Desktop 自有测试 home/profile，验证真实安装、组合、RPC、Client 资源及卸载，最后等待全部自有进程真实关闭并核实进程组与目录缺失。`EPERM` 或其他不明清理状态是失败，不会被当成已退出/已清理；会保留 owner/PID 与失败证据。严禁将测试脚本指向用户 profile，严禁源码 `link:` 部署。检查期间保持同一 tarball、构建文件与元数据不变，不并发重包。

## 卸载与回滚

见 [卸载与恢复说明](<UNINSTALL.md>)。插件卸载不删除用户技能或备份。

MIT。插件图标为本项目原创；安装包资源通过公开导出读取，无默认占位图标。
