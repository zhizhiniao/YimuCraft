# YimuCraft 项目主档与 Agent 交接

更新：2026-10-22（Asia/Shanghai）。品牌：**一幕 YimuCraft——蒋啊讲出品**。本文件是持续维护的交接入口。

## 1. 当前结论和任务状态

**2026-10-22 开发者归档整理（America/Denver）**：用户授权清理测试数据、临时文件与旧安装包，将当前 0.7.34 固定为开发者版并上传 GitHub。仓库采用私有 `zhizhiniao/YimuCraft`，标签计划为 `v0.7.34-dev.1`；发布回执见本文末尾归档日志。产品 src 与安装包不改动，不将归档等同稳定版验收。

当前归档检查：69 个 src 文件与 ASAR 一致，安装版/目录版 ASAR 一致；核心 72/72，独立空库启动和查询 0 项通过。个人运行库有 501 条素材，保留，不上传。清理结果以末尾日志为准；历史已清除夹具不再视为现存证据，旧日志保留仅供追溯。

2026-10-22 用户授权接手三项工作，当前源码与本机运行文件已更新 **0.7.34**，69 个 src 文件一致。已有真实软件，完整 1:1 和用户体验仍未最终验收。

- **AE 内打包回库已闭环**：自有 ScriptUI 面板“窗口→一幕工程打包”，先保存，再打包整个工程/选中合成；操作副本、恢复原工程、完整回执后自动回库。安装版产品内面板安装、默认连接、原工程字节不变、源离线重开零缺失、原生渲染与两项入库通过。
- **波形点播已修复**：复用卡片播放器，移除重复滑块；安装版三次点播约 61–66ms，实际 seek 完成且继续播放。
- **已有库直接连接已实现**：选择原库根目录，独立索引、原媒体只读引用，不需素材包。全库 66,347 条记录、可见独立素材 65,586，32 条路径缺失保留；安装版选择原库入口通过，约 14 秒、2,053 分类。常用界面已移除旧品牌/旧包入口。
- **本机升级已修复**：安装包暂存到本机目录后，正式 NSIS 升级与再次安装均 exit 0；注册版本 0.7.34，新卸载器已部署，偏好文件字节不变。新增双击安装入口；本机 K 盘直接执行的临时文件访问限制未做系统级修改。见 [UPGRADE-20261022.md](UPGRADE-20261022.md)。

- **图标、颜色与联系信息**：分类和文件夹支持直接点图标选 18 种图案、Emoji、9 种颜色及默认色；关联原库也只写独立索引。关于页已加入用户确认的公众号“知鸟PLAN”和微信“aizzn2030”。安装版重启保留与复制处理逻辑通过，见 [APPEARANCE-20261022.md](APPEARANCE-20261022.md)。

此前审核见 [AUDIT-20261022.md](AUDIT-20261022.md)。其 0.7.30 D04 失败为历史事实，已由上述新流程替代；既有直接读取原始工程回库入口不再作为面板流程。

## 2. 已确认要求与边界

- 对照本机 Aetodo 4.33.1 build7 的功能、菜单、默认值、步骤及体验；官网历史功能单列，不混成当前版实测。
- 复制入库、.aetodopack、AE/PR 联动、真实工程依赖迁移必须可用；版本号和阶段演示不是最终交付。
- PR LUT 必须改变真实画面；调节图层、原生拖放、文件同步是用户明确优先事项。
- 音频导入有进度，悬停播放，默认有声；发送 PR/AE 等常用操作放右键，减少常驻控件。
- Claude Code 风格配色；现为暖灰、奶油白、陶土橙。自有 LOGO 不含“幕”字；品牌名称仍是“一幕”。视觉尚未获用户验收。
- 用户已跳过提供原版包，不重复索要；原版反向导出兼容继续列为未验证。
- 保留原 Aetodo 安装、授权、原素材库和用户 Adobe 工程；使用独立小库、自有夹具和副本测试。
- 普通实现选择可自主推进；暂停期间不继续开发。公开发布、收费及课程定位未获确认。

## 3. 文档体系及事实优先级

| 文件 | 责任 |
|---|---|
| 本文件 HANDOFF.md | 唯一交接主档：当前状态、技术路线、缺口、决策、连续变更日志 |
| [PARITY.md](PARITY.md) | 逐项能力、体验差异、验证边界；状态变动同步更新 |
| [OBSERVED-OPERATIONS.md](OBSERVED-OPERATIONS.md) | 原版实机菜单及观察依据；静态观察和运行行为分开 |
| [VALIDATION.md](VALIDATION.md) | 历史验证索引；旧通过不能覆盖最新失败 |
| [USAGE.md](USAGE.md) | 用户操作说明；入口和默认值变化同步修订 |
| evidence/ | 原始 JSON、截图、回执；新运行应保留独立记录 |
| [EXECUTION-RETROSPECTIVE.md](EXECUTION-RETROSPECTIVE.md) | 逆向开发消耗复盘、预判触发条件和重试/验证约束 |
| docs/history/ | 重整前快照，只作追溯，不作当前状态 |

用户最新要求优先。状态判断依据当前源码、对应构建及最新可复现证据。失败复测将该项退回待定位/待复验；提出过的方案不自动成为用户决定。README 和 CURRENT-STATUS 仅作入口，避免多处维护版本状态。

## 4. 版本、安装与工作树基线

**当前运行文件（2026-10-22）**：0.7.34；69 个 src 文件一致；ASAR `c95d28a66c87d129ebf8eca0849d9121c3ea7988fa791c6984c09b2f48245653`。旧安装目录已备份；本轮已通过正式 NSIS 升级及再次安装，系统注册版本与运行文件均为 0.7.34。下表为 0.7.28 历史基线，不能当作当前安装结论。

| 项目 | 核对结果 |
|---|---|
| 主工作区 | `K:/Codex/YimuCraft` |
| 源码版本 | package.json 为 **0.7.28**（本轮由 0.7.27 升版以便源码与安装版可区分） |
| 最近安装记录 | evidence/installed-build.json：0.7.28，58 个源文件哈希一致，`containsWorkFiles=false` |
| 安装包 | release/0.7.28/YimuCraft Setup 0.7.28.exe；本机未签名 NSIS |
| 安装位置（本轮） | **真实安装位置已升级到 0.7.28**：`C:/Users/Administrator/AppData/Local/Programs/YimuCraft/YimuCraft.exe`，安装后 asar 与打包一致、58 个源文件一致。另有一份独立副本 `work/installed-0.7.28` 用于对比 |
| ASAR SHA-256 | `0112f297354872a9450d1a6e3e2e23e06a2b7089fa8f22b97343b8cc320a2f8a`（0.7.28，与源码 51 文件逐一一致） |
| 安装包 SHA-256 | `78a5462ce780db8c5bd80f7f57c5eaf4f7863dd843c701e789e4b6578a2ae41c` |
| 未安装源码 | 无（OBJ/MTL 贴图与同步锁调整已随 0.7.28 进入安装版并实测） |
| 测试基线 | 核心 **66/66**；OBJ 贴图（源码+安装版）、文件同步（源码+安装版）、并发扫描竞态（源码+安装版）、拖放双向（源码 3+2 次、安装版双向各 1 次）本轮通过 |
| Git | 基线 **7785411**；D01 提交 **edcf7a2**；本轮 D02/0.7.28 改动另提交 |
| 测试环境修复 | 61 处 Playwright 启动改用 scripts/test-app.cjs（补 `--no-sandbox`）；`powershell -File` 补 `-ExecutionPolicy Bypass`；子进程 TEMP 须指向工作区。详见第 8 节 |
| 交接快照 | evidence/handoff-20261022/ 保存选定最新回执、源码 SHA-256 清单 |

跨机器交接须带源码、lockfile、文档、必要证据。work/ 与 release/ 被 Git 忽略，必要 Adobe 夹具和安装包需选择性转移；不要误带原版专有资源、个人素材库或凭据。

## 5. 技术路线与模块地图

### 桌面、界面与数据库

**Electron 45 + 原生 HTML/CSS/JavaScript + Node.js CommonJS**。没有 React/Vue，也没有云端业务后端。main 管窗口、原生菜单、文件及宿主桥，preload 暴露受限 IPC，renderer 管界面。窗口启用 contextIsolation 和 sandbox，关闭 nodeIntegration。

worker_threads 承担数据工作，使用 Node 内置 node:sqlite 与 WAL。命令串行，取消单独处理；同步扫描异步执行，应用前核对库实例和修改版本，避免旧扫描覆盖新导入。

| 源文件 | 职责及关键约束 |
|---|---|
| main.cjs / preload.cjs / renderer.js | 主进程、隔离桥、界面交互；改入口须同步菜单和文档 |
| library.cjs / worker.cjs | SQLite、查询、资料、分类、包接口、schema 增量初始化、命令队列 |
| managed-import.cjs | 默认复制、真实进度、SHA-256、重复策略、工程与模型依赖 |
| file-sync.cjs | managed/packages 的身份匹配、改名、缺失恢复；不追随外部复制来源 |
| folders.cjs / file-move.cjs | 实体目录移动、依赖与索引更新、失败回滚 |
| trash.cjs | 索引回收站、受管文件永久删除、日志及中断恢复 |
| archive.cjs / aetodopack.cjs | ZIP 和独立实现的 Aetodo 包子集；路径及文件校验 |
| virtual-pages.js / marquee.js | 虚拟分页与框选；不是全部卡片同时挂载 DOM |
| asset-menu.cjs / style.css | 素材右键、主题和布局 |

库中有 library.sqlite、managed/、packages/ 等。索引备份不等于媒体备份。默认库在 Electron userData 下，也可切库；YIMU_DATA_DIR 指向独立测试库及 app-profile。偏好、library-config 和模型目录以 main.cjs 为准，不硬编码正式用户库。

### 媒体与本地 AI

- FFmpeg static 做兼容音视频预览；流式波形分析；PCM64 等兼容音频转 Opus，保留原始文件。
- Canvas、PDF.js、fontkit 做像素/封面、PDF 兼容文档、字体；PSD/PSB、RAW 内嵌图有专用模块，不等于完整显影/编辑器。
- Three.js 0.186.1 经 esbuild 生成 model-view.js；入口为 model-view-entry.js。改入口后运行 npm run build:model，不能只修改生成文件。
- OBJ/STL/glTF/GLB/FBX 已支持部分能力；glTF/GLB 外部资源安装版验证通过，OBJ/MTL 新增仅源码通过。资源限制在模型目录内的相对路径。
- semantic.cjs 用 Transformers.js 3.8.1、固定修订 Chinese-CLIP、本地量化推理和 SQLite 向量；首次下载模型，非云端生成式标签系统。
- visual-features.cjs 的颜色/相似图是像素特征，不能与 AI 语义搜索或原版算法等同。

### Adobe 联动

**AE**：adobe-bridge.cjs 调 AfterFX -r 执行自有 adobe-host.jsx，以 ID 匹配 JSON 回执；收集/验证/夹具采用隔离实例参数。依赖通过 AE 原生能力处理，不能仅复制 .aep 就称工程可迁移。

**PR**：premiere-bridge.cjs 与 src/premiere-panel/ 自有 CEP 面板使用本地请求/响应文件及心跳，宿主脚本调用 ExtendScript/QE。默认桥目录在用户 Documents/YimuCraft/premiere-bridge，可由 YIMU_PR_BRIDGE_DIR 指定。面板须打开；90 秒等待超时不代表宿主已停止。

LUT 使用自有 assets/adjustment.prproj 和遮罩素材生成真实调节层，插入前检查空轨区间，设置 Lumetri 后验原生导出像素及重开结果。模板不是原版专有项目。

PR 原生 ProjectManager 收集后，由 premiere-paths.cjs 修复自有副本 FilePath/RelativePath/ActualMediaFilePath。只有 portable_pr / premiereCollected 标记的自有收集副本在包迁移时重建路径，不重写任意用户工程。

### 构建

electron-builder 26.15.3 生成 Windows 目录版、ASAR 和 NSIS；FFmpeg、ONNX、原生依赖按配置解包。生产包范围为自有 src、package.json 及必要依赖，不应包含 work/private-analysis/reference/evidence。

## 6. 关键链路现状和边界

| 能力 | 已有结果 | 尚不能宣称 |
|---|---|---|
| 复制入库 | 实体复制、字节进度、重复跳过/保留、源离线使用 | 所有原版导入规则和边界均相同 |
| 组织与资料 | 标签评分收藏注释、分类搜索、重启持久化 | 全部组合/默认行为逐项对照完毕 |
| 音频 | 六格式播放/波形/定位、有声悬停；PCM64 兼容预览迁移 | 实际听感验收、所有编码变体 |
| PR 调节层/LUT | 安装版真调节层、原剪辑 ID/区间保留、导出变色、保存重开 | 所有帧率/尺寸与原版完整手感 |
| PR 工程迁移 | 原生收集→ZIP→aetodopack；源及中间库离线后五引用在目标库、像素一致 | 所有动态链接/代理/编码；任意未收集 PRPROJ 自动完整搬家 |
| AE 迁移 | 同名依赖、序列、代理和真实宿主零缺失 | 实时活动工程发现已完整验证、所有 AE 版本 |
| 文件同步 | managed/packages 改名/缺失/恢复、资料保留、并发扫描作废、滚动锚点 | 原版全部策略、最新 OBJ 修改后的全量性能 |
| 包格式 | ZIP；aetodopack v2/v3/v4 single 子集；历史 PNG 单向原版互通 | 原版反向包、新扩展字段原版回归、任意包兼容 |
| 模型 | 几何旋转封面重启；glTF 安装版、OBJ 源码真实贴图离线迁移 | C4D、FBX 外部贴图、全部材质语法 |
| 大库 | 65,588 文件/2,047 目录的有效编码重复内容夹具 | 6.5 万独立生产素材、长期内存显存稳定性 |

证据：evidence/pr-adjustment-ui.json、pr-adjustment-reopen.json、pr-folder-move-open.json、pr-collect-ui.json、audio-formats-ui.json、audio-compatible-ui.json、package-sync-ui.json、model-texture-ui.json、model-obj-texture-ui.json。须读 executable、fixture、passed、error，不按文件名认定通过。

## 7. 未完成和未对齐清单

优先级是建议接续顺序，不缩减最终范围。全部条目见 [PARITY.md](PARITY.md)。目前没有可靠的完成百分比。

| ID / 优先级 | 差异与现状 | 下一步及通过条件 |
|---|---|---|
| D01 / P0 | 拖出与反向入库通过（源码+安装版，含反向双文件与重启）。**PR 改为右键导入**（按用户指示放弃拖拽模拟）：0.7.28 真实安装版右键「发送到 Premiere Pro」→ PR 工程条目 6→7、7→8，连续通过 | 补 AE 侧同等验证；用户并排验收 |
| D03 / P1 | **右键发送 PR/AE 单条与批量均已实测**（0.7.28 真实安装版）：PR 单条 6→7/7→8、批量 8→10；AE 单条 1 项、批量 2 项，缺失引用 0，回执含真实素材名 | 继续补 PR 占用轨/失败回滚、面板重开、新机器部署、AE 活动工程发现（D04） |
| D02 / P0 | **已闭环**：OBJ/MTL 贴图与同步锁调整已进入 0.7.28；核心 66/66；asar 51 文件与源码一致；安装后 asar 哈希与打包一致；安装版 OBJ 贴图迁移、文件同步、并发竞态均通过 | 后续小改动沿用同一流程，不为单点改动重复发版 |
| D03 / P1 | PR 宿主组合和部署不足 | 多尺寸帧率、占用轨、失败回滚、长项目超时、面板重开、新机器部署 |
| D04 / P0 | AE 内面板打包与回库在 0.7.31 本机闭环；整个工程/选中合成、副本处理、原工程恢复、离线重开和自动回库通过 | 用户实际点按钮/停靠验收；更多格式与干净机器；通用隔离文件收集仍不等于所有宿主组合通过 |
| D05 / P1 | 原版反向包、新扩展字段未验 | 原版自有小库导出→一幕；最新一幕包→原版；标签评分分类预览依赖重启逐项比对 |
| D06 / P1 | 全菜单右键快捷键默认值、界面密度未完全对齐 | 同输入/同步骤并排比较点击数、焦点、选择、弹窗、进度、取消、错误恢复；不能仅截图相似 |
| D07 / P1 | 目录/导入/同步/批量操作完整语义待对照 | 重复策略、同名封面样片、混合选择、日期排序、最近使用、回收站与目录操作组合 |
| D08 / P2 | C4D、非 PDF AI、FBX 外部贴图等缺口 | 确认本机原版行为和自有样本，实现并测；RAW 内嵌图不能称显影 |
| D09 / P2 | AI 质量、历史橡皮擦、网页搜图边界 | 橡皮擦未实现，当前版入口待核实；网页搜图只有静态助手观察，不据此做空按钮或断言原版不可用 |
| D10 / P2 | 大库及长期可靠性不足 | 独立真实混合素材、长期滚动预览检索、扫描并发、磁盘权限/中断恢复、内存显存测量 |
| D11 / P2 | 干净机器、发行验证不足 | 新 Windows 环境安装、原生依赖、Adobe、模型下载失败恢复、升级卸载保留库；发布另需授权 |
| D12 / 持续 | 文档漂移、固定回执覆盖、Git 无提交 | 已建立基线提交 7785411；本轮改动待提交。持续日志 |

### D01 现场：拖放（2026-10-22 本轮，双向通过）

- **本轮结果（2026-10-22，development 构建）**：
  | 用例 | 入口 | 结果 | 证据 |
  |---|---|---|---|
  | 卡片拖出，2 个中文名（含空格） | `node scripts/native-card-drag.cjs` | 通过，连续 3 次 | evidence/d01-drag-20261022/outbound-pass.json |
  | 反向原生拖入 + 重启持久化 | `node scripts/native-reverse-drag.cjs` | 通过，连续 2 次 | evidence/d01-drag-20261022/reverse-pass.json |
- **完整链路**：真实指针 `mousedown` → renderer 可信 `dragstart`（`prevented=true`）→ IPC → main `startDrag(2 files)` → Windows OLE → 独立进程 `dragenter/dragover/drop` → 收到库内中文路径、字节一致。反向为独立进程 `startDrag` → 一幕窗口 `drop` → `webUtils.getPathForFile` 返回真实路径（**经证实可用，此前怀疑不成立**）→ 复制进 managed 库 → 重启后仍可读。
- **仍然成立的环境事实**（换机器需重验）：
  1. workspace 沙箱无法创建进程（0xC0000142）；本会话已切完全权限。
  2. `powershell.exe` 5.1 的 `-File` 需 `-ExecutionPolicy Bypass`。
  3. 相对 `mouse_event` 位移失效；必须用绝对 `SetCursorPos`，且**首次定位可能失真**，需回读校验（`work/pointer-travel*.json`）。
  4. 混合 DPI 多屏：主屏 1080×1920 @200%（物理 2160×3744），副屏 1920×1080 于 DIP (-1920,0)；坐标必须经目标窗口 `GetDpiForWindow` + `ClientToScreen`。
  5. 全屏 ChatGPT 窗口覆盖主屏并抢激活：合成点击不可用于激活；改由应用自身 `focus()` 抢前台。
  6. OLE 只在指针移动时重新命中落点：拖拽期间若只移动窗口不动指针，drop 会落到旧目标（反向用例曾因此失败）。
- **未验**：PR/AE 实际落点、反向多文件、安装版复测、用户并排验收。
- 旧工具 `ole-card-input.ps1` / `ole-buttons.ps1` 保留为历史诊断，不得当作验收基线；历史 PID/句柄/坐标一律不重用。

## 8. 接手续测及环境注意事项

开发 npm ci → npm start；核心 npm test；普通桌面 npm run test:ui；模型构建 npm run build:model；打包 npm run package / npm run installer。安装输出路径需随版本同步。

桌面脚本通常支持 YIMU_TEST_EXE 指向安装 EXE，否则测源码；YIMU_DATA_DIR 指向独立库。脚本运行前先读具体环境约定。源码通过不等于安装版通过。

| 范围 | scripts 下入口 |
|---|---|
| 同步 | file-sync-ui.cjs、package-sync-ui.cjs、sync-mutation-race.cjs、sync-query-latency.cjs |
| 音频 | audio-experience-ui.cjs、audio-formats-ui.cjs、audio-compatible-ui.cjs |
| 模型 | model-ui.cjs、model-texture-ui.cjs；OBJ 模式 YIMU_MODEL_OBJ=1 |
| PR | pr-adjustment-ui.cjs、pr-collect-ui.cjs、pr-collect-migrated-open.cjs、pr-folder-move-ui.cjs |
| AE | ae-integration.cjs、ae-edge-cases.cjs、ae-collect-menu.cjs、installed-migration.cjs |
| 安装 | installed-build.cjs；先核对脚本当前版本及路径 |

Adobe 脚本须先读工程路径、离线改名和 finally 恢复逻辑，不能一股脑批量运行。GUI/宿主测试串行，避免抢焦点和工程。

### 本机测试环境校准（2026-10-22 实测，换机器需重验）

1. **Electron 启动必须带 `--no-sandbox`**：本机 `electron.exe` 在启用 Chromium 沙箱时立即退出且无输出，Playwright 只报 `Process failed to launch!`。61 处启动已统一走 `scripts/test-app.cjs`（导出包装后的 `electron.launch`，自动补 `--no-sandbox`）。设 `YIMU_TEST_SANDBOX=1` 可在正常机器上保留沙箱。新建脚本请 `require('./test-app.cjs')`，不要直接 `require('playwright')`。
2. **`powershell.exe -File` 必须带 `-ExecutionPolicy Bypass`**：本机 5.1 对任何脚本都报 `AuthorizationManager check failed`。`-EncodedCommand` 调用不受影响。
3. **相对鼠标输入不可用**：禁止用 `mouse_event` 相对位移做拖放；用绝对 `SetCursorPos` 逐步移动（`work/mouse-move.json` 有对照数据）。
4. **坐标换算**：显示器为混合 DPI，主屏 1080×1920 @200%（物理 2160×3744），副屏 1920×1080 在 DIP (-1920,0)。必须用窗口 DPI + `ClientToScreen` 换算，不能假设原点 (0,0) 或单一缩放。
5. **桌面被全屏窗口占用**：ChatGPT(Codex) 窗口覆盖整个主屏并会抢激活。做真实指针测试前先确认目标点是自有窗口（`WindowFromPoint` 校验）并避开被遮挡区域。
6. 拖放测试启动前先跑 `scripts/pointer-reset.ps1` 清除上一轮残留按键/进程。
7. **子进程只能写工作区**：本会话即使标为完全权限，`ffmpeg-static`、NSIS 安装器等子进程写 `C:\Users\...`（含 TEMP、LOCALAPPDATA）一律 `Permission denied`。跑核心测试与安装前设置 `TEMP`/`TMP` 到 `work\tmp`，否则 audio-waveform 等用例会假失败。
8. **安装版校验要指明目录**：`scripts/installed-build.cjs` 支持 `YIMU_INSTALL_DIR`（默认 `%LOCALAPPDATA%\Programs\YimuCraft`）；`scripts/file-sync-ui.cjs` 现记录 `launchMode` 与 `execPath`，用于证明跑的是安装版而非源码。
9. NSIS 静默安装需带工作区 TEMP 与 ` /D=<目标目录>`（`/D` 必须是最后一个参数且不加引号）。
11. **从 K: 工作区启动的程序被禁止写用户目录**：实测 `node_modules\electron\dist\electron.exe`、`work\installed-0.7.28\YimuCraft.exe` 写 `C:\Users\Administrator\**`（含 TEMP、APPDATA、Documents）一律 `EPERM`，而真实安装位置的 `C:\Users\...\Programs\YimuCraft\YimuCraft.exe` 与 `node.exe` 可以写。本机装有腾讯电脑管家系统防护。**涉及用户目录或 PR 桥目录的验证必须用真实安装位置的 EXE**；从 K: 跑的副本只能用于 YIMU_DATA_DIR 指向工作区的场景。
12. **PR 导入依赖 CEP 面板在线**：桥目录 `Documents\YimuCraft\premiere-bridge\heartbeat.json` 超过 ~15 秒未更新时，任何 Pr 操作都会报「请在 PR 的窗口→扩展中打开一幕 YimuCraft 面板」。面板由 manifest `AutoVisible` 在 PR 启动时自动打开；PR 是 Qt 应用，UIA/脚本点不了菜单，只能由用户点开或重启 PR。
10. **本机桌面可能被并发使用**：空转实测指针会自行漂移（700ms 内漂移 268 px）。指针测试因此改为「连续两次读数一致才算到位」并允许 10 次重试；偶发失败先怀疑外部干扰，不要直接判为产品缺陷。


本机曾测 AE 26.0x67 / PR 26.0.0。Codex 直接启动 PR 曾出现 PlugPlugSetup 和扩展不加载，Explorer 打开自有 .prproj 曾恢复；这不是已验证的干净机器部署方案。

自有 work/YimuCraft_PR_Test.prproj 已有 V4/V5 调节层，历史导出为蓝色；再次反相须读当前基线。不得当空工程或关闭用户其他工程。

CEP 0.5.0 修复刷新遗留 Node 轮询；旧混合上下文 Page.reload 可能仍执行旧代码。临时 .debug 曾移除，后续检查实际面板版本，调试后清理。历史 18817 端口、菜单号、PID 不稳定。

PR 媒体可能关工程仍占用；EPERM 移动失败已验证保留源目录与索引并回滚。不能为通过测试强杀不明 PR，路径重建只处理自有收集副本。

## 9. 每次修改的记录规则

1. 开工读本文件当前状态、待办和最近日志，说明目标及关联 D 编号；复核会变化的事实，不重复从头调研。
2. 代码、配置、依赖、schema、包格式、UI 默认值、测试方法、范围决定变化后，更新现状并在本文件末尾追加日志。纯文档改动也记录。
3. 一次连续工作可合并一个条目；暂停、交接、向用户回报或切换 Agent 前必须写入，不等发布版本才记。
4. 写清原因、前后行为、文件、验证结果、未测边界、影响/回退及下一步；未运行写“未测”，失败保留真实错误与定位程度。
5. 区分源码、打包、安装、宿主、原版对照、用户验收；只对对应构建和实际操作标记通过。
6. 证据按日期/用例/run ID 独立保存；固定输出脚本重跑前归档旧回执，日志链接新旧结果。
7. 状态变化同步 PARITY，操作入口变化同步 USAGE；README/CURRENT-STATUS 只作导航，不复制维护完整现状。
8. 不删除历史日志；纠错追加并指出替代结论；重整先归档，不建立多个“最终版”。

### 可复制模板

```markdown
### YYYY-MM-DD HH:mm +08:00 — 标题 / Agent 标识
- 关联：Dxx；需求、问题和原因。
- 变更：之前→现在；必要决定及取舍。
- 文件：源码/配置/文档；提交 SHA 或工作树状态。
- 验证：命令/真实操作、构建环境、结果、证据相对路径。
- 边界：未测、失败、风险；是否影响 schema/媒体/用户工程。
- 回退：可恢复版本/副本/方法；不可逆项如实说明。
- 接续：剩余任务、阻塞、下一步、已更新的对照表行。
```

## 10. 连续变更日志

### 2026-10-22 — 历史开发基线汇总 / Codex
- 范围：0.7.23–0.7.27 的 PR 调节层/像素、原生收集双包迁移、文件同步、回收站、兼容音频、glTF。详见 evidence/continuing-validation-20261022.md，不是本次重新执行。
- 最新源码：OBJ/MTL 依赖与渲染、同步资源扫描锁调整；OBJ 真实像素/包迁移源码通过未安装。完整卡片诊断未过，最新反向 OLE 超时。
- 边界：历史完整核心 65/65 不覆盖后续全部修改；固定名回执曾覆盖旧记录；Git 无提交，不具备提交级回退。
- 接续：用户暂停；D01/D02 为恢复后的首批工作，当前不作最终验收。

### 2026-10-22 — 建立交接主档和持续记录规则 / Codex
- 原因：用户准备交其他 Agent，未来可能交回，需要详细状态和连续历史。
- 变更：本文件集中技术路线、证据边界、D01–D12 和日志模板；AGENTS 增加规则；修正 PARITY 最新失败/源码与安装区别；减少多处重复状态。
- 验证：只读核对源码、package/构建配置、Git 和现有 JSON；本轮不运行软件、不重测功能。文档本地链接全部存在，58 个应用源文件与本次整理前哈希一致；结果见 evidence/handoff-20261022/documentation-check.json。
- 证据：evidence/handoff-20261022/；旧文档 docs/history/2026-10-22-before-handoff-consolidation/。
- 影响/回退：仅文档和证据快照，不改应用源码、数据库或 Adobe 工程。可从快照恢复文档，不应恢复过时状态结论。
- 接续：开发仍暂停，按用户后续开发指令接续；每次变更更新本主档及相关功能行。


### 2026-10-22 — 消耗复盘与经验固化 / Codex
- 原因：用户要求解释巨量 Token 消耗，并形成以后由 Agent 主动识别和预防的规则。
- 变更：新增 docs/EXECUTION-RETROSPECTIVE.md；AGENTS 加入关键流程前置、宿主校准、无信息重试转向、安装合并和输出控制规则；长期记忆写入授权的 ad_hoc 更新说明。
- 验证：只读盘点版本目录、脚本和夹具；evidence/token-retrospective-20261022.json。没有可靠分环节 Token 账单，不虚构占比或收益；本轮未执行产品测试。
- 边界：消耗机制基于已有记录；规则已获用户授权固化，但节省效果待后续验证。没有修改应用源码或恢复开发。
- 回退/接续：规则为文档约束，可依据后续实证修订；恢复任务时先读复盘，继续 D01/D02，不以重试门槛作为停止全部工作的理由。

### 2026-10-22 09:23–09:5x — 恢复开发：Git 基线、测试环境校准、D01 输入层定位（用户中途暂停）/ DSH Agent
- 关联：D01（主）、D02（未开始）、D12（基线）。
- 原因：用户授权恢复开发并要求直接执行 D01/D02；开工核对发现 Git 无提交、测试脚本在本机完全无法启动，需先把测试环境校准到能产出可信证据。
- 变更（之前 → 现在）：
  1. Git 从「无任何提交」→ **基线提交 7785411**（0.7.27 工作树，398 文件；`work/`、`release/`、`private-analysis/` 忽略；未发现密钥类文件）。
  2. Electron 启动从「61 处各自 `require('playwright')`，本机全部 `Process failed to launch!`」→ 统一走新增 `scripts/test-app.cjs`，自动补 `--no-sandbox`（60 个脚本 + 探针脚本已替换，`node --check` 全部通过）。
  3. `powershell.exe -File` 调用从「AuthorizationManager check failed」→ 补 `-ExecutionPolicy Bypass`（native-card-drag.cjs、native-ole.cjs ×2、native-drag.cjs、drag-geometry-probe.cjs）。
  4. `scripts/native-card-drag.cjs` 重写：绝对指针定位、按下/移动/释放三阶段、`startDrag` 记录、失败时输出 renderer 事件与输入计数。
  5. 新增 `scripts/ole-card-pointer.ps1`（CSS→物理经 `ClientToScreen`+`GetDpiForWindow`，含激活点击与前台校验）、`scripts/pointer-reset.ps1`、`scripts/window-layout-probe.ps1`、`scripts/ole-pointer-probe.ps1`、`scripts/drag-geometry-probe.cjs`。
- 验证（源码 + 桌面真实输入；全部本机、development 构建）：
  - 探针 `work/mouse-move.json`：相对位移 +7 mickey 使指针从 (500,2000) 跳到 (14,3166)；绝对步进 6 次准确落点。
  - `work/button-state.json`：注入 LEFTDOWN 能锁存、LEFTUP 能清除；无鼠标捕获；SetCursorPos 生效。
  - `scripts/drag-geometry-probe.cjs`：窗口 contentBounds、显示器 scaleFactor=2、卡片中心 DIP/物理坐标可算；证明旧脚本把「相对偏移」当屏幕绝对坐标，导致光标落在窗口外。
  - `scripts/native-card-drag.cjs` 多次运行：多数轮次 renderer 收到 `mousemove`（最高 43 次）但 `mousedown`=0；一轮收到 `dragstart(trusted, asset)` + `dragstart-bubble(prevented=true)`，且 main 的 `startDrag` 被调用（当时因注入代码在 `app.evaluate` 里使用未定义的 `require` 抛错，未产生 OLE 回执）。
  - `work/layout-now.json`：ChatGPT(Codex) 窗口矩形 (0,0)-(2160,3744) 覆盖主屏，`WindowFromPoint(846,342)` 返回其 pid 31044。
- 证据：evidence/native-card-drag.json（最新失败，含 pointer/diagnostics）、evidence/d01-input-20261022/（mouse-move、button-state、window-layout、drag-geometry、最新失败回执副本）、evidence/archive/native-card-drag-20261022-0903.json、evidence/archive/native-ole-independent-20261022-0901.json。
- 边界与风险：
  - **D01 未通过**：端到端 OLE 落点、中文名、多文件、反向入库、PR/AE 落点、重启均未验证。重写后的 ole-card-pointer.ps1 **尚未运行**。
  - 反向导入（`webUtils.getPathForFile` 经 contextBridge）**仍未定位**，未取得新证据。
  - 未运行核心测试套件，也未构建/安装；OBJ/MTL 与同步锁改动仍未进入安装版。
  - 注入回执与公共 IPC 只能证明对应层次，不能替代真实用户操作验收。
  - `--no-sandbox` 会关闭 Chromium 进程隔离，属本机测试环境妥协；干净机器上应设 `YIMU_TEST_SANDBOX=1` 复核。
- 回退：`git reset --hard 7785411` 可回到本轮所有改动前（会丢失本轮脚本与证据）；`scripts/ole-card-input.ps1`、`scripts/ole-buttons.ps1` 为旧的、未通过的历史工具，保留未删。
- 接续（下一轮第一件事）：运行 `node scripts/native-card-drag.cjs` 验证重写后的指针链路；若仍失败，先看 pointer.json 的 dpi/scale/screen/hitPid 与 renderer 的 mousedown 计数，再判断是激活抢占还是产品链路。之后再做反向导入（先加 renderer drop 事件观测，确认 `e.dataTransfer.files` 与 `api.filePath` 的实际返回），最后转 D02 回归、构建与安装校验。
- 未更新的文档：PARITY 拖放行本轮同步；USAGE 无用户入口/默认值变化，未改；OBSERVED-OPERATIONS 无新的原版观察，未改。


### 2026-10-22 10:0x–10:3x — D01 原生拖放双向通过 / DSH Agent
- 关联：D01。承接同日上一轮的输入层定位。
- 原因：上一轮只把失败归因到测试环境，未产出通过的端到端链路；本轮据新观测逐项修复输入工具，直到真实指针能完成双向 OLE。
- 变更（之前 → 现在）：
  1. 指针脚本改为「CSS 像素 + 目标窗口 DPI + ClientToScreen」：`scripts/ole-card-pointer.ps1` 不再假设单一缩放或 (0,0) 原点。
  2. 新增 `Move-Pointer` 回读校验：首次 `SetCursorPos` 可能失真（实测请求 (845,342) 落到 (8,1486)），逐次回读直至命中。
  3. 取消「合成点击激活」：实测激活点击会吃掉后续拖拽按下；改由应用自身 `w.focus()` 抢前台，脚本只等待并校验。
  4. 按下是否真正到达 renderer 由 Node 侧 `mousedown` 计数判定；只有证明没到达才写 `RetryMarker` 重按（最多 3 次），到达则不盲重试。
  5. 反向用例新增落点抖动：OLE 仅在指针移动时重新命中，之前只移动窗口导致 drop 回到旧目标。
  6. `scripts/ole-receiver.cjs` 增加 `dragenter/dragover/dragleave/drop` 计数与 300ms 心跳，用于区分「从未进入」与「进入但拒收」。
  7. 新增 `scripts/native-reverse-drag.cjs`（独立进程原生拖入 + 重启持久化校验）。
- 验证（development 构建，本机）：
  - 拖出：`node scripts/native-card-drag.cjs` 连续 3 次通过；2 个中文名（含空格）文件，`startDrag` 收到 2 个文件，独立进程收到 2 条库内路径且字节一致。
  - 反向：`node scripts/native-reverse-drag.cjs` 连续 2 次通过；`webUtils.getPathForFile` 经 contextBridge 返回真实路径，文件复制进 managed 库，重启后路径与字节不变。
  - 证据：evidence/d01-drag-20261022/outbound-pass.json、reverse-pass.json、pointer-travel-1/2.json；旧失败回执在 evidence/archive/ 与 evidence/d01-input-20261022/。
- 边界与风险：
  - **未验**：PR/AE 实际落点、反向多文件、安装版、用户并排验收。不能据此宣称拖放在所有目标上通过。
  - 结论仅对本机 development 构建和本机 DPI/多屏布局成立；`--no-sandbox` 仍是本机测试妥协。
  - 测试脚本会移动真实鼠标并占用前台，运行期间人机交互会互相干扰。
- 回退：`git revert` 本轮提交或 `git reset --hard 7785411`；产品源码本轮**未改动**，全部改动集中在 scripts/ 与 docs/。
- 接续：D02（源码回归 → 构建 → 安装 → 安装版模型与同步验证），随后补 PR/AE 落点与反向多文件。

### 2026-10-22 10:4x–11:2x — D02 闭环：0.7.28 构建、安装与安装版验证 / DSH Agent
- 关联：D02（主）、D01（安装版复测）。
- 原因：OBJ/MTL 外部贴图与同步资源扫描锁调整此前只存在于源码；同版本号无法证明源码与安装版一致。
- 变更（之前 → 现在）：
  1. `package.json` 版本 0.7.27 → **0.7.28**，installer 输出目录同步 `release/0.7.28`（版本号仅用于区分构建，不作为进度指标）。
  2. 新增 `scripts/verify-asar-sources.cjs`：递归比对 `src/` 51 个文件与 asar 内容并校验包内版本号（发现 `@electron/asar` 在 Windows 上嵌套条目必须用反斜杠且不带前导分隔符）。
  3. `scripts/installed-build.cjs` 支持 `YIMU_INSTALL_DIR`；`scripts/file-sync-ui.cjs` 记录 `launchMode` 与 `execPath`，避免把源码通过误认为安装版通过。
  4. 拖放指针脚本：前台不可达时不再硬失败，改由"mousedown 未到达才重按"的观测驱动重试覆盖（安装版实测第 1 次按下被激活吞掉、第 2 次成功）。
- 验证（本机）：
  - 核心测试：**66/66 通过**（需将 TEMP 指向工作区，否则 ffmpeg-static 写系统 TEMP 被拒）。
  - 定向源码回归：OBJ 贴图红蓝像素 2881/4380 迁移前后一致；file-sync-ui 与 sync-mutation-race 通过。
  - 构建：`npm run installer` 生成 release/0.7.28/YimuCraft Setup 0.7.28.exe，SHA-256 `78a5462c…`。
  - 打包一致性：asar SHA-256 `0112f297…`，51 个源码文件逐一一致，版本 0.7.28。
  - 安装：静默安装到 `work/installed-0.7.28`（沙箱限制，未覆盖用户原 0.7.27 安装）；安装后 asar 哈希与打包一致；`installed-build.cjs` 58 文件一致、`containsWorkFiles=false`。
  - 安装版行为：OBJ 贴图迁移通过；file-sync-ui 通过且 `execPath` 指向安装版；sync-mutation-race 通过；拖放拖出与反向入库各通过一次。
- 证据：evidence/installed-verify-0.7.28.json、evidence/installed-build.json、evidence/model-texture-ui.json、evidence/file-sync-ui.json、evidence/sync-mutation-race.json、evidence/native-card-drag.json、evidence/native-reverse-drag.json。
- 边界与风险：
  - 用户机原安装仍是 0.7.27；**没有覆盖**，也未做升级/卸载保留库验证。安装版证据来自 `work/installed-0.7.28` 的独立安装。
  - 安装包未签名；干净机器部署（D11）仍未验证。
  - 拖放 PR/AE 落点、反向多文件仍未验证。
- 回退：`git revert` 本轮提交；安装版回退即删除 `work/installed-0.7.28`，用户原安装未受影响。
- 接续：D01 余项（PR/AE 落点、反向多文件）→ D03/D04 Adobe 宿主场景。

### 2026-10-22 11:3x — D01 余项：反向多文件 + 指针稳定性 / DSH Agent
- 关联：D01。
- 原因：反向用例此前只覆盖单文件；同时多次出现"指针无法到位"的偶发失败，需要区分产品问题与桌面并发干扰。
- 变更：
  1. `scripts/native-reverse-drag.cjs` 改为两个中文名文件（含空格）一次拖入，逐文件校验 managed 路径与字节，重启后逐个复核。
  2. `scripts/ole-card-pointer.ps1` 的 `Move-Pointer` 改为「连续两次读数一致才算到位」并放宽到 10 次；`scripts/pointer-reset.ps1` 增加 `ClipCursor(NULL)` 清除残留裁剪区。
- 验证：源码构建反向双文件通过；0.7.28 安装版反向双文件通过（同一用例在修复前因指针漂移失败）。
- 证据：evidence/native-reverse-drag.json（最新一次为安装版双文件通过）。
- 边界：本机桌面可被并发使用（实测 700ms 内指针自漂移 268 px），指针类测试仍存在偶发失败风险；失败时先看 pointer.json 的 `cursor`/`cursorVerified` 与外部位移证据。
- 回退：还原上述两个脚本即可；产品源码未改动。
- 接续：PR/AE 落点。

### 2026-10-22 11:5x — D01 余项：PR 落点尝试（未通过，已记录）/ DSH Agent
- 关联：D01。
- 原因：D01 验收要求「拖到 PR/AE 落点」，此前只有独立 Electron 接收进程，没有真实 Adobe 落点。
- 变更：
  1. 新增 `scripts/pr-drop-ui.cjs`：先用 `PremiereBridge.inspect` 确认活动工程是自有 `work/YimuCraft_PR_Test.prproj`（否则不发送输入），生成真实 WAV，从一幕卡片拖到 PR 窗口，再对比工程条目数与活动序列片段数。
  2. `scripts/ole-card-pointer.ps1` 新增 `-TargetFractionX/-TargetFractionY`：按目标窗口自身 DPI 与 `GetWindowRect` 计算窗口内相对落点，用于非自有应用。
- 验证：宿主校准通过（PR 进程存在、CEP 心跳 10:04:32 新鲜、活动工程为自有测试工程）。连续 4 个候选落点 (0.15,0.25)、(0.22,0.32)、(0.5,0.5)、(0.5,0.8) 全部未被接收：items 6→6，clips 0→0。其中一次拖拽未启动（指针被外部干扰打偏 72px）。证据 evidence/pr-drop-ui.json。
- 边界与判断：**不能据此断言一幕拖放对 PR 不可用**，也不能断言 PR 可用——目前只证明"按这些落点未被接收"。活动序列片段为 0，是否真的有活动序列未确认；PR 主窗口句柄与面板布局也未核对。按复盘规则不再盲试落点。
- 下一步（可区分原因）：①人工或脚本从资源管理器把同一文件拖到同一点，若也不接收，则问题在落点/窗口/PR 状态；若接收，则问题在一幕的 OLE 负载或拖拽时序。②记录 PR 窗口矩形与面板布局后再定落点。③AE 落点同法。
- 回退：新增脚本与参数均不影响产品源码；删除 `scripts/pr-drop-ui.cjs` 即恢复。

### 2026-10-22 12:0x — 纠正方向：PR 用右键导入，不再模拟拖拽 / DSH Agent
- 关联：D01、D03；用户明确纠正：「不要反复弹窗模拟拖拽，能不能用右键直接导入 PR」。
- 原因：我此前把 D01 的「拖到 PR/AE 落点」理解成必须用合成鼠标把卡片拖进 PR 窗口，连续多轮失败，浪费了时间，也没有解决用户真正要的能力。
- 变更：
  1. **停止并删除** `scripts/pr-drop-ui.cjs`（窗口模拟拖拽），保留其失败回执作为教训存档 evidence/pr-drop-ui.json。
  2. 新增 `scripts/pr-import-ui.cjs`：截获原生右键菜单后调用真实菜单项 `id='pr'`，走产品自身的 `command('pr')` → CEP 桥 `import` 路径，再用桥 `inspect` 比对 PR 工程 bin 条目数。
- 验证（Premiere Pro 26.0.0，自有工程 work/YimuCraft_PR_Test.prproj）：
  - 真实安装版 0.7.27：右键「发送到 Premiere Pro」→ PR bin 6→7，通过。
  - 升级后 0.7.28 真实安装版：bin 7→8，通过。证据 evidence/pr-import-ui.json、evidence/d01-drag-20261022/pr-right-click-import-0.7.28.json。
  - 0.7.28 已安装到真实位置 `C:\Users\Administrator\AppData\Local\Programs\YimuCraft`，安装后 asar `0112f297…` 与打包一致，`installed-build.cjs` 58 文件一致。
- 根因记录（换环境先看）：
  - **从 K: 工作区启动的 electron 被禁止写用户目录**（EPERM），真实安装位置的 EXE 和 node.exe 可以写。凡涉及用户目录/PR 桥的验证，必须用真实安装位置的 EXE。
  - **PR 导入依赖 CEP 面板在线**：心跳超过约 15 秒未更新就报「请在 PR 的窗口→扩展中打开一幕面板」。本次面板失效后由用户手动点开恢复；PR 是 Qt 应用，脚本点不了菜单。
- 边界：bin 条目数是桥 `inspect` 的计数，未取导入后的素材名/时长；AE 侧同类验证未做；拖拽到 PR 的能力本身未验证（按用户指示不再作为验收路径）。
- 回退：删除 `scripts/pr-import-ui.cjs` 即恢复；0.7.28 安装可用 release/0.7.27 的安装包回退。
- 接续：AE 右键发送/收集同等验证；D03 其余宿主场景。

### 2026-10-22 12:2x — 安装版冒烟与状态收敛 / DSH Agent
- 关联：D02、D03。
- 变更：无源码改动；补充记录。
- 验证：真实安装版 0.7.28 跑 `scripts/smoke.cjs` 通过（`passed=true`、`errors=[]`）；`installed-build.cjs` 在真实安装路径 58 文件一致、asar `0112f297…` 与打包一致。
- 边界：smoke 只覆盖主界面基本链路，不等于全功能回归；AE 侧未跑。
- 回退：无（无改动）。
- 接续：AE 右键发送/收集验证（需真实安装版 + 启动 AE）；随后 D03 宿主多场景。

### 2026-10-22 12:5x — AE 右键导入实测通过 / DSH Agent
- 关联：D03（宿主导入）、D01 余项。
- 变更：新增 `scripts/ae-import-ui.cjs`：截获原生右键菜单 → 调用真实菜单项 `id='ae'` → 产品 `command('ae')` → AdobeBridge `import`；用「状态文本 + 桥回执」双重断言，并把 AE 实际加入的素材名与库内文件名对齐。
- 验证（AE 26.0x67，0.7.28 真实安装版）：
  - 预热 AE 后通过：状态 `AE 已确认导入 1 项 · 缺失引用 0`；回执 `ok=true`、`added[0].name=发送AE 图像.png`、`project.items=1`。证据 evidence/ae-import-ui.json。
  - 未预热时失败：AE 冷启动约 50 秒，桥 120 秒超时并提示"请求可能仍在执行"。这是环境时序，不是产品缺陷；但真实用户首次发送也可能遇到，需要在产品上核对是否有足够提示（未改）。
- 边界：只测图片单文件；音视频、AEP/AEPX、多选批量未测；AE 工程 dirty/选择未对比。
- 回退：删除 `scripts/ae-import-ui.cjs` 即恢复。
- 接续：多选批量发送 PR/AE；D04 AE 活动工程发现。

### 2026-10-22 13:1x — PR 批量发送通过 / DSH Agent
- 关联：D03。
- 变更：`scripts/pr-import-ui.cjs` 增加 `YIMU_BATCH=1` 分支：导入两个 WAV、Ctrl+A 全选、右键发送，断言 PR bin 恰好增加 2 条。
- 验证（0.7.28 真实安装版，PR 26.0.0，自有工程）：bin 8→10，状态「PR 已确认接收素材」，通过。证据 evidence/pr-import-ui.json（batch:true）。
- 边界：仍以 bin 条目计数为证，未取导入后的素材名；占用轨、失败回滚、面板重开未测。
- 回退：删掉 batch 分支即恢复单条用例。
- 接续：AE 批量；PR 失败路径与面板重开；D04。

### 2026-10-22 13:3x — AE 批量发送通过 / DSH Agent
- 关联：D03。
- 变更：`scripts/ae-import-ui.cjs` 增加 `YIMU_BATCH=1`：两张真实 PNG、Ctrl+A 全选、右键发送；断言状态「AE 已确认导入 2 项」且回执 added 名称集合与库内文件名一致。
- 验证（AE 26.0x67，0.7.28 真实安装版）：状态 `AE 已确认导入 2 项 · 缺失引用 0`，回执 added=2、工程条目 3，通过。
- 边界：仍为图片；音视频/AEP 未测；AE 工程 dirty/选择未对比。
- 回退：去掉 batch 分支即恢复单条。
- 接续：D04 AE 活动工程发现的真实（不注入）验证；PR 失败路径与面板重开。

### 2026-10-22 13:5x — 重大发现：AE「当前工程」始终读不到（D04 性质改变）/ DSH Agent
- 关联：D04（升级为 P0）。
- 原因：按用户"不要注入回执"的要求去做真实活动工程收集，结果暴露出产品级缺陷。
- 证据（可复现）：
  - 通过 `src/adobe-bridge.cjs` 连续两次 `inspect`，返回 `project=null, items=0, dirty=false`，同时机器上确实有 1 个正在运行的 AfterFX（空工程）。
  - 用 `fixture` 操作新建并保存工程后，fixture 回执显示 `project=…\Migration_Test.aep, items=6`；紧接着的 `inspect` 又回到 `project=null, items=0`。
  - 原因：桥对每个请求执行 `AfterFX.exe -r <script>`，Adobe 的 `-r` 是"在新实例中运行脚本"，因此永远不会进入用户已打开的那个 AE。
  - 证据文件：evidence/ae-collect-real.json；work/ae-collect-real-*/bridge/*.json 中 fixture 与 inspect 两份回执对比。
- 影响：`从 AE 当前工程回库` / `选中合成回库` 对真实用户工程不可用；历史 `ae-collect-menu` 等用例通过注入 `yimuInspection` 回执"通过"，掩盖了该缺陷。此前 PARITY 的"实测通过"是在注入条件下成立的，需要更正。
- 未做（需要产品改动）：实现活动 AE 实例通道。可行方向：①复用已有 PR CEP 面板，用 BridgeTalk 把脚本转发给正在运行的 AE；②给 AE 也部署一个 CEP 面板（与 PR 同构）；③仅对隔离收集保留 `-r`。以上均未实现，不在本轮声称范围。
- 变更代码：无产品改动；新增 `scripts/ae-collect-real.cjs`（真实 fixture + 自动确认保存对话框，用于暴露该问题）。
- 回退：删除该脚本即可；无产品改动。
- 接续：先实现 AE 活动实例通道，再重跑真实收集；在此之前 PARITY 中 AE 收集相关行改为"注入条件下通过，真实活动工程不可用"。

### 2026-10-22 14:0x–15:0x — D04 修复：AE 活动实例通道（启动脚本方案）/ DSH Agent
- 关联：D04（P0）。
- 原因：上一轮证实 `AfterFX -r` 永远看不到用户正在运行的 AE 工程，导致"从 AE 当前工程回库"实际不可用。
- 方案演进（含失败记录）：
  1. 先做 AE CEP 面板（`src/ae-panel/`，manifest 及面板 JS 已写并部署到 AppData 与 `Program Files (x86)\Common Files\Adobe\CEP\extensions`），但 AE 的 CEP 静默拒绝加载本扩展（PlayerDebugMode 全版本为 1、manifest 结构与可正常加载的 aetodo 面板对齐后仍不加载），**放弃 CEP 路线**。
  2. 改用 AE 官方启动脚本：`Scripts/Startup/YimuCraft AE State.jsx`，由 `scripts/build-ae-state.cjs` 从 `src/adobe-host.jsx` 提取 `projectInfo()` 生成；每秒 `app.scheduleTask` 发布 `Documents/YimuCraft/ae-state.json` 并轮询桥队列 `*.jsx` 就地执行（宿主脚本自己写回执）。
- 变更：
  - 新增 `scripts/build-ae-state.cjs`、`src/ae-panel/ae-state.jsx`（生成物）、`src/ae-panel/{CSXS/manifest.xml,index.html,panel.js,panel.jsx}`（CEP 备用，当前未被 AE 加载）。
  - `src/adobe-bridge.cjs`：新增 `announce()/panelAlive()/liveState()`；`inspect` 优先返回实时状态；非隔离操作在活动实例可用时走队列而不启动新实例；隔离请求改写到 `<bridge>/isolated/` 子目录，避免与活动实例的队列服务抢执行。
- 验证（源码构建）：
  - `inspect` 返回 `source=ae-startup`，能读到活动工程路径/条目/合成数。
  - 活动实例导入：`items 0→1`，素材名 `实时导入.png`。
  - 活动工程收集：`AE 已收集并复制入库 · 9 个依赖文件`，managed 副本存在、原工程哈希未变。
  - 0.7.29 构建：asar `31fe9064…`，与 src 51 文件一致；已安装到真实位置 0.7.29。
- 未完成/风险：
  - 安装版 0.7.29 复跑**未通过**：先遇到"隔离实例与活动实例抢同一请求"（已修复为 isolated 子目录），随后 AE 实例不再发布状态（窗口标题为空、疑似启动中断），复跑未完成。
  - 启动脚本目前由手工部署到 AE 的 Startup 目录，**尚未纳入产品安装流程**；卸载 AE 或换版本会失效。
  - 选中合成（`selectedCompIds`）收集路径未单独验证。
- 回退：删除 `Scripts/Startup/YimuCraft AE State.jsx` 即停止实时通道；代码回退到 `bed7dc3`。
- 接续：干净启动 AE → 重跑 `scripts/ae-collect-live.cjs`（安装版 0.7.29）；把启动脚本部署纳入安装/升级；再验证选中合成与批量。

### 2026-10-22 15:1x — D04 现状校正：AE 启动脚本可用，活动实例收集仍被隔离实例挡住 / DSH Agent
- 关联：D04。
- 重要更正：上一轮"启动脚本导致 AE 打不开"的判断**是错的**。对照实验（移除脚本后 AE 同样起不来）证明是 AE 自身停在一个无标题的 `#32770` 对话框上；`PostMessage WM_CLOSE` 关掉后 AE 正常启动。不要把该现象再归因为启动脚本。
- 现状（可复现）：
  - 启动脚本（发布状态 + 队列服务）部署在 AE `Scripts/Startup`，AE 冷启动约 10 秒后正常出窗口，`Documents/YimuCraft/ae-state.json` 每秒刷新。
  - 活动实例读取（`inspect`）返回 `source=ae-startup` 的真实工程，只读能力可用。
  - 活动工程收集**仍失败**：`collectFile` 属于隔离操作，桥会启动 `AfterFX -m -r`，而该实例实际挂到了运行中的 AE 上，宿主 `openIsolated` 报 `Existing project detected; no changes made`。把请求写进 `isolated/` 子目录会绕开活动实例队列，反而更糟，已回滚该改动。
- 未完成（下一步方向，需改宿主脚本并重新构建）：
  1. 让 `adobe-host.jsx` 的 `openIsolated` 在"请求的工程恰好已经打开"时复用当前工程而不是报错；或
  2. 让活动实例队列承担 `collectFile`，并在收集后**不关闭**用户工程（需确认 `collect()` 的 ownsProject 逻辑，避免误关用户工程）。
- 代码状态：`src/adobe-bridge.cjs` 已回滚到不使用 `isolated/` 子目录；`scripts/build-ae-state.cjs` 生成含队列服务的启动脚本（已验证 AE 可正常启动）。
- 未验证：安装版 0.7.29 的 live collect（被上述隔离冲突挡住）。

### 2026-10-22 15:3x — D04 收集路径仍未闭环，实验性宿主补丁已回滚 / DSH Agent
- 关联：D04。
- 试过的改动：给 `adobe-host.jsx` 的 `openIsolated` 增加"请求工程已打开则复用"，并禁止复用后关闭。结果活动工程收集不再报 `Existing project detected`，但改为**120 秒无回执超时**，未能闭环。
- 处置：已 `git checkout -- src/adobe-host.jsx` 回滚该实验（避免把"报错"变成"挂起"）；启动脚本重新生成并部署，AE 活动实例的**只读状态发布**保持可用。
- 当前确定成立：AE 冷启动约 10 秒、`ae-state.json` 每秒刷新、`inspect` 走 `source=ae-startup` 读到真实活动工程。
- 当前确定不成立：活动工程收集（`collectFile`）在安装版与源码版都未通过——隔离 `-m -r` 实例会挂到运行中的 AE，宿主拒绝替换已有工程；复用补丁则导致超时。
- 下一步（需下轮继续）：
  1. 先确认 `-m -r` 在本机到底是否新实例（用回执里的 `pid`/窗口标题区分），据此决定是"改隔离启动参数"还是"改宿主复用逻辑"。
  2. 若走复用逻辑，需同时保证收集后不关闭用户工程，并在超时路径上补齐可观测日志（当前超时无任何日志线索）。
  3. 收集成功后重跑 `scripts/ae-collect-live.cjs`（源码→安装版），再补选中合成与批量。

### 2026-10-22 16:xx — D04 收集：三组实验与当前最精确的阻塞点 / DSH Agent
- 关联：D04。
- 已验证的事实：
  1. `AfterFX -m -r` 在本机**确实新起实例**（进程数 1→2），但该实例会很快退出且不写回执；同时活动 AE 的启动脚本会执行同一请求 → 出现 `Existing project detected` 或超时。
  2. 源码构建（从 K: 启动）**无法写 `Documents`**，写不了会合文件 `ae-panel.json`，因此活动实例队列只能由**安装版**驱动；用源码构建测这条链路必然失败，不能据此判断功能。
- 本段实验（均未通过，已保留代码）：
  - 隔离请求子目录：更糟（绕开活动队列），已回滚。
  - 启动脚本跳过 `"isolated":true`：活动队列不执行收集 → 超时。
  - 路由所有请求到活动实例 + 宿主 `openIsolated` 复用已打开工程（0.7.30 已包含）：安装版仍报 `Existing project detected`，说明复用分支没有命中。
- 当前最可能的原因与下一步（很具体）：`openIsolated` 里的 `same(app.project.file.fsName, payload.project)` 未匹配。下一步应在 `openIsolated` 把两者写进错误信息或回执（`projectFile`、`requested`），先确认路径差异（大小写/斜杠/短路径/符号链接），再修正比较或用 `File.resolve` 归一化。
- 环境状态：真实安装版已是 **0.7.30**；AE 启动脚本（发布状态 + 队列服务）已部署，AE 正常启动并每秒发布状态；`inspect` 可读活动工程。AE 若出现无标题对话框，用 `scripts/ae-dismiss-dialog.ps1` 关闭后再启动。
- 未验证：安装版 0.7.30 的活动工程收集（仍失败）；选中合成、批量、音视频导入到活动 AE。

### 2026-10-22 — 上一轮代码与安装审核 / Codex
- 关联：D04、D12；纠正阻塞诊断和状态漂移。
- 变更：更新当前摘要、对照表和审核报告；添加独立审核证据。不修改产品源码、不重新安装。
- 文件：docs/AUDIT-20261022.md、HANDOFF.md、PARITY.md；evidence/audit-20261022-01/。
- 验证：REA 识别实际 ASAR；63 文件一致；同路径 VM 复现前置拒绝；默认 TEMP 65/66，工作区 TEMP 66/66。
- 边界：VM 非宿主验收；未操作真实 Adobe 工程，历史成功流程未重跑。0.7.30 收集仍失败；不能直接绕过隔离保护。
- 回退：只撤销本轮文档和新增审核目录即可；无媒体、schema、宿主变更。
- 接续：优先 D04 隔离收集与活动工程保护；随后部署、队列唯一执行和完整流程验收。

### 2026-10-22 — 接手三项需求，0.7.31 / Codex
- 关联：D04、D06、D07、D11、D12。用户要求 AE 内打包、波形点播、直接接旧库并淡化旧包入口。
- 变更：新增自有 AE ScriptUI 面板/安装器/回执接收，副本收集恢复原工程；修卡片点播；新增只读旧库适配与独立索引；调整菜单。详情见 TAKEOVER-20261022.md。
- 文件：src/adobe-host.jsx、adobe-bridge.cjs、ae-pack-panel.jsx、ae-package-inbox.cjs、install-ae-panel.ps1、existing-library.cjs、audio-card.js、renderer.js、main.cjs、worker.cjs、library.cjs、file-sync.cjs、asset-menu.cjs、style.css；package/lock；相关测试及 USAGE/PARITY。
- 验证：核心 67 项与新增 3 项通过；安装版波形、AE 面板安装/打包/离线重开/回库通过；实际库读取 66,347 条、32 缺失保留。证据在 evidence/takeover-20261022/ 及报告内 run 路径。
- 边界：NSIS 升级未通过，旧卸载器 exit 2；本机通过备份后完整目录复制更新。旧库只读快照不双向同步，原素材及原软件未删除。用户点按钮/停靠/听感待验。
- 回退：关闭一幕后从 work/rollback-installed-0.7.30-20261022 恢复程序目录；新索引与原库分离，保留后可切回旧索引；删除自有 AE 面板及 YimuCraft/host.jsx 可卸载面板，不动其他插件。
- 接续：用户三项体验验收；解决旧版卸载器升级问题，补干净机器和复杂工程格式。

- 本轮收尾：目录树使用原库 source 下相对路径，避免显示原库包装名称；最终构建一致性及安装版 65,586 项/2,053 分类/真实波形预览通过，run 1792686270771。AE/音频完整链路证据对应同版本此前构建；本次显示改动未重复宿主测试。

### 2026-10-22 — 安装升级修复并交用户实测 / Codex
- 原因：空 NSIS 程序也在本机 K 盘启动/默认 TEMP 下报临时文件写入错误，不能仅据 exit 2 判定旧卸载器损坏；本机目录暂存后通过。
- 前后行为：此前手工复制运行文件，系统注册仍 0.7.27；现在完整 NSIS 升级和再次安装均通过，注册及运行文件均 0.7.31，新卸载器已部署。
- 文件：scripts/install-local.ps1、根目录安装或升级一幕.cmd、UPGRADE-20261022.md、USAGE/PARITY/HANDOFF；产品源码/安装包字节未改。
- 验证：两次安装 exit 0，67 个 src 文件一致；偏好文件哈希不变，已有索引存在；证据见 evidence/upgrade-20261022-*。
- 边界：脚本仅支持默认按用户安装路径；K 盘直接启动 EXE 的底层系统限制未归因，未修改 ACL/系统 TEMP；干净机器未测。
- 回退：保留 work/rollback-installed-0.7.30-20261022 及旧构建；脚本只新增本机缓存与独立回执，不清理用户库。
- 已打开：真实安装路径 0.7.31，默认用户配置，窗口可响应，AE 连接文件持续更新；证据 opened-window.json。下一步由用户测试 AE 面板、波形点播和连接原库，未自动切换素材库。

### 2026-10-22 — 分类/文件夹外观与联系方式，0.7.32 / Codex
- 原因与前后行为：原目录只有 ▱ 等字符、图标仅限管理目录；改为清晰自有 SVG、图案/Emoji/颜色选择器，关联目录同样可用；关于页新增用户确认的两项联系方式和复制按钮。
- 文件：src/appearance.js、appearance-picker.js、renderer.js、style.css、index.html、library.cjs、folders.cjs、worker.cjs、main.cjs；package/lock、相关测试与 APPEARANCE/USAGE/PARITY。
- 数据结构：folder_preferences 加 color，collections 加 icon/color，自动迁移；旧 setFolderIcon 保留原符号值；移动/重新定位保留颜色。升级前用户索引备份路径见 evidence/appearance-20261022/index-backup.json。
- 验证：定向 5 项通过；完整 72 项首轮 71 过、1 旧接口符号失败，修正后相关 18 项通过。安装版 UI run 1792687971023 验证选择/取消/默认/重启及自定义 Emoji；关于菜单真实回调中截获原生对话框与剪贴板写入参数，未改用户剪贴板。
- 部署：正式 NSIS 0.7.31→0.7.32 exit 0，69 源码文件一致；evidence/upgrade-20261022-105223-206/install.json。无原素材变更，不重跑未改的 AE 打包链路。
- 边界：未支持图片上传图标、跨素材包外观迁移；视觉与用户操作待验收。仅改变一幕内显示，不改变系统目录图标。
- 回退：保留 0.7.31 构建及升级前索引备份；旧版不能完整显示新增图案，先留存新索引再按需恢复备份。
- 下一步：打开最新版供用户试用；继续按用户反馈调整图案与颜色，经验候选见 APPEARANCE-20261022.md，未升级为已确认经验。

### 2026-10-22 — 顶部遗漏图标、slogan 与版本号，0.7.33 / Codex
- 原因：上轮只替换左侧目录图标，遗漏搜索框旁的导入文件夹按钮；用户要求移除顶部出品文字并加 slogan/版本。
- 前后行为：顶部 ▱＋ 换成自有双色文件夹加号 SVG；标题为“一幕 YimuCraft · 让下一幕，随手可得。”，旁边通过 app.getVersion() 显示真实运行版本。出品署名仍保留在关于页。
- 文件：src/index.html、main.cjs、renderer.js、style.css；package/lock；HANDOFF/PARITY/USAGE。slogan 沿用已有空状态文案，本轮作为实施选择，不宣称用户已做品牌终审。
- 验证：源码及安装版实际点击新按钮导入独立文本文件成功；标题/版本断言和 960 宽窗口检查通过。安装升级 exit 0，69 个源码文件一致；evidence/header-20261022/、upgrade-20261022-105812-935/。
- 边界：未改素材、图标偏好数据或 AE 链路，未重跑无关测试；视觉待用户验收。
- 回退：保留 0.7.32 构建，可用旧包回退，数据结构未变。下一步：打开最新版供用户检查顶部。

### 2026-10-22 — 目录右键与排序对齐、英文标题，0.7.34 / Codex
- 原因：文件夹右键直接弹出混杂全部操作的大窗口，排序选择框带下边距且窄栏挤字；用户要求空白区新建入口、顶部去中文和优化 slogan。
- 前后行为：空白区右键新建，文件夹右键 Electron 原生菜单；选新建/重命名后才显示单任务对话框。标题行同高，排序框固定 90px，新建为加号，重复导入入口移除，保留顶部导入。
- 文案：顶部“YimuCraft · 素材随取，灵感成幕。”及真实版本号；空状态同步 slogan。本轮文案为实施选择，仍待用户审美验收。
- 文件：src/main.cjs、renderer.js、index.html、style.css，package/lock，USAGE/PARITY/HANDOFF。数据结构不变，外部原库目录修改操作仍禁用。
- 验证：源码及安装版通过真实右键事件到原生 Menu 的菜单项/回调验证、真实空目录创建和重命名、名称升降序、标题行中心 y 一致。自动化截获 popup 以调用菜单项，未把它称为 A22 原版菜单截图或人工点击验收。
- 部署：正式 NSIS 升级 0.7.33→0.7.34 exit 0，69 文件与源码一致；evidence/folder-menu-20261022/，upgrade-20261022-110528-518/。首次截图发现排序文字挤压后补宽度并重建，旧构建日志留存。
- 边界：现有原版观察档没有完整文件夹右键清单；本轮覆盖用户指定行为，不标完整原版菜单 1:1。关联原库继续只读，不新增删除非空目录能力。
- 回退：保留 0.7.33 包，无 schema 变更；下一步打开新版供用户检查真实右键观感。

### 2026-10-22 — 0.7.34 开发者归档与数据清理 / Codex
- 原因：用户要求清理所有测试数据、临时文件和旧安装包，只保留干净运行归档并上传 GitHub。
- 前后行为：release 仅保留 0.7.34，work 清空；删除 private-analysis、旧参考截图、旧验证截图和本机安装器暂存。1834 个旧目标及本轮 2 个测试目录删除成功；此数字是目标数，不是文件数或容量。
- 保留：源码、测试脚本、依赖、维护文档和小型文本回执；个人运行库 501 条素材、原 Aetodo、外部素材及 Adobe 安装不动。历史截图/夹具链接可能失效，不能再声称可直接重放。
- 文件：README、CONTRIBUTING、CHANGELOG、THIRD_PARTY_NOTICES、GitHub 问题模板、GITHUB-GUIDE、归档校验清单与界面图；.gitignore、启动脚本、清理/验证脚本、HANDOFF/PARITY/USAGE。无 src、schema 或二进制变更。
- 验证：69 个 src 文件与 ASAR 一致；安装版/归档版 ASAR 一致；核心 72/72；独立空库启动完成且实际 query=0；上传候选 253 文件约 2.10 MiB，无运行库/安装包/原版分析文件。首轮校验脚本 Windows 分隔符错误已修复并保留失败回执，最终成功不覆盖历史。
- 边界：开发者预览版不是正式稳定版；不新增功能验收或宣称干净机器通过。既有个人库未重置。文本证据留本地且不上传；旧 Git 历史仅本地保留，GitHub 使用独立 main 快照。
- 回退：可从本地原 Git 分支恢复源码/文档；已删除未跟踪的临时素材和旧安装包不保证恢复。当前安装包 SHA256 见 DEVELOPER-ARCHIVE.json。
- 发布：已创建私有 zhizhiniao/YimuCraft；源码快照和预览 Release 上传中，完成回执另补。
- 下一步：完成上传、核对远端标签/资产大小及 SHA256。公开仓库和开源许可尚未选择。
