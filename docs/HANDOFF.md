# YimuCraft 项目主档与 Agent 交接

**2026-10-31 GitHub 源码同步**：本轮按用户要求整理 0.7.57–0.7.63 的未提交功能，更新 README、CHANGELOG 与[源码更新说明](releases/0.7.63-source-update.md)。源码与本机安装均为 0.7.63，119 个 src 文件逐字节一致；本轮核心 133/133、隐藏拖图 10/10、官方 npm 源生产依赖审计 0 项通告。公开下载保留 v0.7.56-dev.1，不新增 Release。本地核验已完成，GitHub 推送回执见本文件末尾；外部拖图与 AE 卡顿边界不变。

**2026-10-30 AE 周期卡顿复查**：用户仍报告拖时间线周期迟滞。当前 AE 直接回执确认 `on-demand-v1`、旧扫描回调为空；13 个被动样本内一幕状态文件无更新，未见上次每秒全工程扫描复发。安装 0.7.62 与源码 0.7.63 的 AE 三模块及部署 Startup 摘要一致。未改代码、重启或保存工程；卡顿完整根因和手感恢复仍未确认，见 [复查记录](AE-LAG-CHECK-20261030.md)。

**2026-10-30 直接拖图修复（0.7.63 已安装，外部接收待用户验收）**：图片本体改为标准 dragstart 直接启动原文件系统拖放，移除窗口边缘/Alt 交接；内落保存位置并自动归组，外落/取消恢复编排，结束/失败清理状态。核心 133/133，源码/安装 ASAR 隐藏拖图各 10 项、源码传图 UI 7、分组 12、手势 9 项通过；119 源文件一致，66,244 素材、四配置、3,091 画布项及 2 连线不变。按用户最新要求，全程无 Computer Use 或桌面输入，也未重新打开可见窗口；实际外部接收由用户测试。后台原生接收端使用替身，不宣称通用兼容。见 [传图记录](CANVAS-TRANSFER-20261030.md)。

**2026-10-30 传图续作：0.7.62 已安装；右键发送 Codex 通过，直接外拖失败**：用户要求减少 Computer Use 占用。粘贴助手改用 SendInput 后，真实 Codex 输入框出现验收图片，未发消息。核心 130、安装 ASAR 隐藏交互 7 项通过，119 源文件一致，原库/配置、3091 画布项和 2 连线保留。用户已明确允许短时原生鼠标测试：native4 到达 Codex 并启动 startDrag，但无附件且源 OLE 未正常返回；已停止隔离进程。native5 对照因起点命中保护而在按下前取消。未完成直接拖放、即梦等验收；详见 [传图测试记录](CANVAS-TRANSFER-20261030.md)。

**2026-10-30 分组与边缘交互（0.7.61 已安装）**：大组边界/四边调整、折叠卡、拖入/拖出自动归组、单边跟随连接点、预览内编辑标签及精简带图标菜单已实现。核心 127/127，安装新流程 12 项、手势 9 项、编辑 11 项通过；116 源文件与安装一致，真实项目 3088 原记录及既有连线、原库/配置保持。已重新打开，无公开发布；见 [项目画布](PROJECT-CANVAS.md)。

**2026-10-30 画布直接手势（0.7.60 已安装）**：按用户反馈移除框选/平移/连线模式按钮；空白左拖框选，中键/右键拖动平移，右键轻点菜单。选中元素四边显示固定屏幕尺寸连接点，支持拖线吸附、空白处就地创建并连接、Esc 取消。核心 122/122，最终目录/安装新手势各 9 项、安装编辑回归 11 项通过；115 源文件与安装一致，正式项目 3084 原记录及原连线保留，库/配置摘要不变。已重新打开，无公开发布；详见 [项目画布](PROJECT-CANVAS.md)。

**2026-10-29 项目画布编辑（0.7.59 已安装）**：本轮八项需求已实现：地址/工作区恢复、导入侧栏、序列播放、图片/视频原比例及悬停信息、右键标签、框选嵌套组、连线、说明文字。核心 121/121，最终目录/安装交互各 11/11；正式项目自动恢复，1068 原记录保留、67 序列、125 视频尺寸；115 源文件与安装 ASAR 一致，原素材库/配置摘要不变。保留 0.7.58 AE 按需联动，不重做 AE 宿主验收，不公开发布。详见 [项目画布](PROJECT-CANVAS.md) 及末尾日志。

**2026-10-28 AE 按需联动（0.7.58 已安装）**：用户实测暂停每秒扫描后卡滞消失，授权改为按需扫描。启动脚本已替换为休眠兼容脚本；刷新走一次性请求，导入只返回轻量摘要。116/116 核心测试、目录版入口/空库通过；本机 0.7.57→0.7.58 安装成功。用户随后明确停止验证，真实 AE 请求/收集与操作手感未继续验收；见末尾日志和 [本轮说明](AE-ON-DEMAND-20261028.md)。

**2026-10-28 项目画布（0.7.57 已安装）**：顶部独立入口，直接关联 Agent 项目目录，自动同步，自由编排/确认，画布删除只隐藏并可恢复。核心112项及源码/目录版/安装版 UI 与重启通过；114源码文件与安装一致。正式画布已关联未知君根目录，扫描1000项/15组；原66,244条素材、2,052分类与配置摘要未变。原生拖放已触发 startDrag，但外部 drop 回执未通过，Codex/即梦不宣称已验。详见 [项目画布](PROJECT-CANVAS.md)。无 GitHub 发布。

**2026-10-25 MIT 与图文主稿**：用户确认原创代码与文档采用 MIT，4551651 已推送 main，GitHub 仓库接口返回 license.spdx_id=MIT。0.7.56 旧标签与安装包未重打包；后续打包白名单纳入许可文件。Obsidian 主稿 yc-intro-20261025 含大纲、正文与五张原图，链接/哈希检查通过，未验客户端与公众号显示，未发布文章。

更新：2026-10-31（America/Denver）。品牌：**一幕 YimuCraft——蒋啊讲出品**。本文件是持续维护的交接入口；下方带日期的旧结论按历史记录阅读，当前基线以上方最新记录及第 4 节为准。

## 1. 当前结论和任务状态

**2026-10-25 GitHub 版本同步**：用户授权将最新安装版及源码同步 GitHub，并要求 Computer Use 实机功能截图。当前源码/安装/目录版均为 **0.7.56**；发布目标 `v0.7.56-dev.1`，保留开发者预览标记。核心 108/108、全部 106 个 src 字节比对、安装/目录 ASAR 一致、隔离空库启动通过；生产依赖审计 0 通告。源码已推送 main，v0.7.56-dev.1 已公开发布为 Pre-release；首页、版本说明、使用说明与五张功能截图均已上线，远端回执见末尾日志。以下“未发布”均为当时历史状态，不代表本轮最终结果。

**2026-10-23 软件标识与三维格式（America/Denver，0.7.56 已安装）**：补Final Cut/Resolve/剪映/CapCut/Blender/C4D/Ai/Au共8标识，软件组共11项；新增8个三维/格式图标，模型卡片显示3D与扩展名。超过既有64 MB门槛直接提示不加载，不进入缩略图队列/详情查看器。108/108、源码/目录/安装图标流程通过；安装版OBJ/STL/GLB/FBX真实几何、OBJ旋转、封面与重启通过。106源文件匹配，66,244素材全字段、四配置、原7条文件夹偏好不变。大模型复杂度预算仅讨论未新增；详见 [SOFTWARE-FORMATS-20261023.md](SOFTWARE-FORMATS-20261023.md)。未发布。

**2026-10-23 自媒体平台文件夹图标（America/Denver，0.7.55 已安装）**：新增17个平台单色矢量标识，独立“自媒体平台”分组，含用户指定的抖音/TikTok/快手/小红书/公众号/Instagram/YouTube/Facebook；可重复分配、改色与重启保留。108/108，源码/目录/安装逐项UI通过，105源文件匹配；66,244素材全字段、四项配置及原7条文件夹偏好不变。当前可见65,585项；旧验收硬编码65,586导致一次失败，改为与本轮已验证全字段摘要的hidden=0记录比较后通过，未修改素材。详见 [PLATFORM-ICONS-20261023.md](PLATFORM-ICONS-20261023.md)。未发布。

**2026-10-23 文件夹图标丰富与改色（America/Denver，0.7.54 已安装）**：新增 27 个图标（Pr/Ae/Ps 可重复软件标识、8 特效、8 MG、8 音乐调性），分组选择；原基础与 Emoji 保留。修复专用类型覆盖用户颜色，新增取色器/HEX、实时预览。108/108、源码/目录/安装 UI 与重启通过；104 文件匹配，66,244 素材记录、用户四配置及原 3 条文件夹偏好不变。仅提供选择，不替用户批量换图标；审美待用户确认。详见 [FOLDER-ICONS-20261023.md](FOLDER-ICONS-20261023.md)。未发布。

**2026-10-23 统一智能体接入（America/Denver，0.7.53 已安装）**：10 个入口统一三步流程；7 款保留一键配置，Kimi Work/千问办公/百度搭子增加“填写配置”、7 个独立字段及逐项复制，完整配置同时保留。手动可就地开启连接且保持已有权限。108/108，源码/目录/安装 UI 通过；104 源码文件与安装一致，66,244 素材记录及模型/偏好/库/权限配置不变。按用户要求不逐个安装或实测外部客户端；百度本地 STDIO 前提保留。见 [CONNECTIONS-UNIFIED-20261023.md](CONNECTIONS-UNIFIED-20261023.md)。未发布。

**2026-10-23 桌面接入范围收敛（America/Denver）**：用户后续明确跳过 Kimi Work、千问办公、百度搭子的安装/登录/实机验收，以 WorkBuddy 流程为基准；三个入口保留，不据此推断全部兼容。当前 0.7.52 不变。本轮 WorkBuddy 官方自带引擎重新实际调用 yimu_search，正式库 Logo 命中 265 项；MCP 配置字节不变。证据 `evidence/workbuddy-recheck-1792807918067/report.json`，桌面鼠标输入未验。新增可复用定向复核脚本，未修改产品源码或打包。

**2026-10-23 国内 API 与智能体设置（America/Denver，0.7.52 已安装）**：顶部“AI 设置”明确分 API Key 设置/智能体接入；国内 10 家+海外 2 家+自定义共 13 个 API 入口，10 个智能体入口，Kimi 按用户确认仅展示 Work 桌面端。各客户端生成自己的 JSON/TOML/YAML，Qwen Code 新增备份合并；Anthropic 企业图标与 Claude 图标分离，均官方资源。108/108，源码/目录/安装 UI 通过，104 源码文件匹配；真实 65,586 可见素材及全部素材记录、模型密钥/偏好/库/连接权限字节保留。百度搭子本地 STDIO 待确认，Kimi Work/千问办公仅手动配置准备，未宣称实机调用通过。详见 [CONNECTIONS-20261023.md](CONNECTIONS-20261023.md)。未发布。

**2026-10-23 文件夹折叠与状态记忆（America/Denver，0.7.51 已安装）**：标题空白、行缩进和列表空白均可右键“折叠全部文件夹”，不必滚到底部；逐项与批量展开状态按库保存并在启动恢复。107/107，源码/目录版/安装版定向 UI 与完整进程重启通过。真实库 65,586 可见项，2,024 行→5 个顶层入口、302 分支折叠，重启完全保持；93 源码文件与安装一致，66,244 条素材记录全字段摘要未变。详见 [FOLDER-STATE-20261023.md](FOLDER-STATE-20261023.md)。本机已重新打开，未发布。

**2026-10-23 侧边栏空间与模型切换（0.7.50 已安装）**：侧栏移除“未分类 / 类型 / 分类”三个区块，只保留“全部素材”和文件夹，文件夹区获得完整高度；文件夹空白处右键新增“展开全部文件夹 / 折叠全部文件夹”，夹具一次操作 4→2→4 行。顶部模型下拉改为窗口拖拽区之外（`no-drag`），箭头内缩 10px，实际点击可打开原生选择器并切换当前服务商。核心 107/107；源码、打包目录、安装版定向 UI 均通过；安装版真实库 65,586 项。安装时 DSH 的 MCP 子进程占用旧 EXE，首次 NSIS exit 2；在停止后用重命名释放占用再安装，注册版本与 ASAR 一致。真实库索引与模型配置原先只存在 Codex 重定向配置中，现已复制到常规 `%APPDATA%\YimuCraft`，普通启动和 MCP 状态均读到 65,586 项。证据 `evidence/sidebar-ux-20261023/`。详见本轮变更日志。

**2026-10-23 误删子分类恢复与空白页 LOGO**：已安装 **0.7.49**，107/107。按用户纠正，从删除前索引恢复 19 子分类和 523 条原素材关联，改为顶层分类，仅原重复父入口不恢复；全库 2,052 分类、65,586 可见素材，素材全字段摘要不变。安装版 19 分类逐项查询通过、空白页品牌 LOGO 实际加载；证据 `evidence/category-restore-20261023`。此前删除整组分类的处理范围错误，本条更正。

**2026-10-23 正式素材库改连 D 盘**：用户确认 `D:\00-aetodo.library`。0.7.48 直接引用原库，65,586 可见项、2,053 分类；AEP/FFX 封面、音频解码和重启通过，原库主 DB 与 API/偏好哈希不变。C 盘旧 501 项素材副本及缓存已删除；旧目录仍留 4 KB 索引与两个空目录，追加删除被自动审批拦截。原库 32 条路径缺失。详见 [LIBRARY-SWITCH-20261023.md](LIBRARY-SWITCH-20261023.md)。

**2026-10-23 三智能体实调用与三模型切换**：本机 **0.7.48**，107/107。WorkBuddy 官方自带引擎、Kimi Code、DeepSeek Harness 均由真实模型调用一幕搜索，Logo 命中 10 项；桌面鼠标流程未验。正式 DeepSeek V4 Pro/Kimi K3/MiniMax M3 全部真实返回 423，顶部下拉切换与重启保留；5 家服务商/7 款智能体改官方图标。93 文件与安装一致，501 素材及偏好不变。Kimi 默认开放平台配置已复验；原有整理权限保持不变。见 [AGENTS-MODELS-20261023.md](AGENTS-MODELS-20261023.md)。

**2026-10-23 客户端一键配置与真实模型**：本机 **0.7.47**，106/106。4 家 API 卡片、7 款智能体卡片、一键配置与本机 API 导入；正式一幕已保存 DeepSeek V4 Pro，真实官方调用 137+286 返回 423（4158 ms），重启保留。Codex/Claude Code/WorkBuddy/Kimi Code/Harness 已写入并通过接口验证，Claude Code 自身 Connected；其余宿主加载/模型工具调用未验。最终 83 源码文件与安装一致，501 项素材/偏好不变，长名称换行已修复。见 [CLIENT-CONNECT-20261023.md](CLIENT-CONNECT-20261023.md)。

**2026-10-23 AI 模型入口与 API 接入**：本机已升级 **0.7.46**。顶部常驻 AI 模型，支持多服务商、加密 Key、获取列表/手填 ID、OpenAI 兼容与 Anthropic 文字试用；可直达本地 AI 和智能体接入。101/101，源码/目录版/安装版 HTTP 夹具与重启验证通过，81 源码文件与安装一致，501 项素材及偏好不变。真实服务商与用户体验未验，未发布。见 [MODEL-API-20261023.md](MODEL-API-20261023.md)。

**2026-10-23 智能体开放接口**：本机已升级 **0.7.45**；新增 MCP stdio 与本地鉴权 API，6 项搜索/读取/整理/界面定位能力。96/96，源码及安装版真实 PNG → MCP → UI、重启和撤销通过；79 个源码文件与安装一致，501 项素材与既有偏好不变。本机 Codex 已注册、Claude Code Connected，正式连接为只读；模型对话层、Workbody 和其他客户端未测。见 [AGENT-API-20261023.md](AGENT-API-20261023.md)。

**2026-10-23 类型图标居中**：本机已升级 **0.7.44**；Pr/Ae/Ps 按字形可见轮廓居中，选择器、放大预览和新建文件夹两种尺寸实测通过。94/94，75 个源码文件与安装一致，501 项正式素材及偏好不变。剪映仅讨论，未实现或宣称拖入兼容。见 [ICON-ALIGN-20261023.md](ICON-ALIGN-20261023.md)。

**2026-10-23 类型文件夹纠正**：本机已升级 **0.7.43**；固定快捷入口已去掉，“类型”留空，类型成为新建/已有文件夹的图标选项，每类每库唯一。94/94、源码/目录版/安装版 UI 和重启通过，75 源码文件与安装一致、501 项素材与偏好不变；此前快捷入口解释被本轮用户要求替代。见 [TYPE-FOLDERS-20261023.md](TYPE-FOLDERS-20261023.md)。

**2026-10-23 文件夹与媒体预览**：本机已升级 **0.7.42**。自定义目录入口、暗色透明棋盘、WAV/FLAC 真实文件和自动兼容回退均已通过源码及安装版验证；91/91，75 个源码文件与安装一致，501 项正式素材字段与偏好不变。详情见 [FOLDER-MEDIA-20261023.md](FOLDER-MEDIA-20261023.md)。

**2026-10-23 播放与分类优化**：本机已升级 **0.7.41**；移除底栏播放/静音按钮，按用户确认开启悬停播放、音频默认有声；增加 Pr/Ae/Ps/声音内置类型视图及 AI 用法说明。90/90、源码/目录版/安装版定向 UI 与重启通过，501 项素材字段不变、73 个 src 文件与安装一致。AE 真实回执通过；PR 当前无面板心跳，不能宣称本次连接通过。剪映仍为讨论，未实现发送入口。详见 [USABILITY-20261023.md](USABILITY-20261023.md)。未发布 GitHub。

**2026-10-23 恢复专项完成**：本机已升级 **0.7.40**；PR 持久未决锁和人工核对恢复、SQLite 版本化事务迁移与升级前快照已交付。90/90、真实 PR 延迟回执仅导入一次、目录版/安装版恢复入口通过；正式库 501 项字段与偏好不变，73 个源码文件与安装一致。未发布 GitHub。详见 [RECOVERY-20261023.md](RECOVERY-20261023.md)。

**2026-10-23 工程审查优化（America/Denver）**：AGENTS 已加入按任务读取规则，完整原始清单 160 条保留。当前 0.7.39 源码新增共享文件删除保护、系统打开允许列表、后台退出处理、测试门禁，并更新 sharp/yauzl；与现用安装内容不再相同。最终打包门禁 82/82、隔离目录版 IPC/本地 AI 推理通过；未安装、未发布。8 项发现中 6 项处理，PR 超时未决和 schema 升级恢复仍未解决，详见 [ENGINEERING-AUDIT-20261023.md](ENGINEERING-AUDIT-20261023.md)。

**2026-10-23 AE 效果卡片**：本机 **0.7.39**，四个 Logo 最终合成样片已关联正式库；悬停/定位/续播、安装版生成预览、右键导入、收集后源副本离线重开（9 引用/0 缺失）通过。正式库重启后四卡可播；未有样片的 AEP 进入“待补预览”。开发目录宿主启动超时及 AE 测试崩溃恢复失败保留，不当成全部兼容。见 [AE-EFFECTS-20261023.md](AE-EFFECTS-20261023.md)。

**2026-10-23 关于弹窗主题统一**：本机 **0.7.38** 将原生关于对话框改为内置主题弹窗，深浅配色跟随一幕。源码/安装版菜单入口、主题切换、复制按钮与关闭行为通过；GitHub 仍为 0.7.34，未上传本次更改。

**2026-10-23 MOV 黑底显示**：本机已升级 **0.7.37**，MOV 缩略图、悬停视频及详情使用纯黑背景。源码/安装版显示和播放检查通过，安装文件一致；原件与预览编码不变。GitHub 下载仍为 0.7.34，未上传本次更新。

**2026-10-23 MOV 预览修复（America/Denver）**：本机已升级 **0.7.36**。用户 PNG/RGBA MOV 已通过自动兼容预览、悬停播放、无按键横向定位、停止移动后续播、移开停止；透明帧、源副本离线重启和缓存复用通过。详见 MOV-PREVIEW-20261023.md。GitHub 已公开，但下载仍是 0.7.34，本轮未上传。

**2026-10-22 图标更新（America/Denver）**：本机已升级 0.7.35，采用用户选定 D 精修稿左下橙底米白光束图标。源码、打包、正式 NSIS 升级、安装版界面与 EXE 图标通过；源码全文件一致性见 evidence/brand-20261022/。GitHub 仍为 0.7.34 开发者归档，未上传本次更新。

**2026-10-22 开发者归档（America/Denver）**：用户授权清理测试数据、临时文件与旧安装包，将当前 0.7.34 固定为开发者版并上传 GitHub。仓库为私有 `zhizhiniao/YimuCraft`，归档标签 `v0.7.34-dev.1`；清理及上传回执见本文末尾日志。产品 src 与安装包不改动，不将归档等同稳定版验收。

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
- Claude Code 风格配色；现为暖灰、奶油白、陶土橙。自有 LOGO 不含“幕”字；品牌名称仍是“一幕”。整体视觉仍待用户验收；Logo 已于 2026-10-22 选定 D 光束橙底米白方案并授权落地。
- 用户已跳过提供原版包，不重复索要；原版反向导出兼容继续列为未验证。
- 保留原 Aetodo 安装、授权、原素材库和用户 Adobe 工程；使用独立小库、自有夹具和副本测试。
- 普通实现选择可自主推进；暂停期间不继续开发。2026-10-25 已授权本次 GitHub 开发者预览更新；收费、稳定版承诺及课程定位仍未确认。

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

**当前文件基线（2026-10-31 复核）**：源码 package.json 与安装 ASAR 均为 **0.7.63**；安装目录 `C:\Users\Administrator\AppData\Local\Programs\YimuCraft`。`check-canvas-build.cjs` 核对 119 个 src 文件，差异 0；本轮未启动真实安装窗口、未重新打包安装。公开下载仍为 **v0.7.56-dev.1**。0.7.56 发布核验保留于 `evidence/release-20261025/archive-run.json`；下表为 0.7.28 历史基线，不能当作当前安装结论。

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
| 侧边栏 / 顶部模型 | sidebar-ux-ui.cjs；源码、目录版或安装版（YIMU_TEST_EXE）均可用 |
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
13. **DSH 注入 `ELECTRON_RUN_AS_NODE=1`**：从本会话命令行启动 `YimuCraft.exe` 会按 Node 运行并立即退出（无输出、exit 0；带 Electron 参数时报 `bad option`、exit 9）。启动安装版前先 `Remove-Item Env:ELECTRON_RUN_AS_NODE`；`scripts/test-app.cjs` 已显式删除。
14. **DSH 的 yimucraft MCP 子进程占用安装目录**：宿主以 `YimuCraft.exe app.asar\src\agent-mcp.cjs --connection ...` 常驻并在被杀后立即重连，会锁住 `YimuCraft.exe` 与 `app.asar`，此时 NSIS 静默安装 exit 2。不得把它当主程序强杀后反复安装；本次处理是停止后在同一个循环内重命名 `YimuCraft.exe`，安装 exit 0 后再删除旧名。安装后宿主会用新 EXE 重新拉起 MCP。
15. **Codex 重定向 profile**：Codex 启动的安装版会把真实库和模型配置写到 `%LOCALAPPDATA%\Packages\OpenAI.Codex_*\LocalCache\Roaming\YimuCraft`，而桌面快捷方式用 `%APPDATA%\YimuCraft`。判断真实库时先看 `library-config.json` 和 `linked-libraries`，不要只看 `%APPDATA%`；跨环境迁移后配置必须用无 BOM UTF-8 写入，否则 `JSON.parse` 失败并静默回退空库。


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
- 发布：私有 zhizhiniao/YimuCraft 已接收独立 main 源码快照及安装包。GitHub 安装包为 YimuCraft.Setup.0.7.34.exe，193,061,239 字节；服务端 SHA256 与本地 fa293bcf64731ed692a9d45f3fb1bcb2121f7a03700ef96b1687d41d27d50d1f 一致。随包校验文件使用 GitHub 规范化后的文件名。
- 下一步：后续开发从 main 另开分支，不覆盖归档标签。公开仓库和开源许可尚未选择；本机旧 master 历史不推送。远端发布最终状态留存于 evidence/developer-archive-20261022/remote-release.json。


### 2026-10-22 — 光束正式图标与本机升级，0.7.35 / Codex
- 原因：用户选定 D 精修稿左下橙底米白方案，明确要求做成正式图标并替换软件。
- 前后行为：括号播放符号改为自有画框/光束矢量；保留 #d97757 / #faf9f5，生成界面 SVG、托盘 PNG、Windows 多尺寸 ICO；打包前自动生成图标以防不同步。
- 文件：src/brand.svg、tray.png、app.ico；package/lock；scripts/brand-ui.cjs；docs/brand/lightbeam、USAGE/PARITY/HANDOFF。
- 验证：源码与安装版 0.7.35 实际加载图标并留截图；EXE 提取图标检查；NSIS 0.7.34→0.7.35 exit 0，注册版本与 ASAR 一致；全 src 文件哈希及偏好文件核对见 evidence/brand-20261022/。
- 边界：无功能/schema 修改，未重跑 Adobe 等无关链路。Windows 桌面/任务栏缓存的人工观感未验收；GitHub 归档仍是 0.7.34，未提交上传。
- 回退：保留 release/0.7.34 安装包；本轮在 codex/lightbeam-icon 分支，旧资源在 Git 基线；不需迁移数据库。
- 下一步：用户查看本机新版的最终显示；若调整造型，以 src/brand.svg 为唯一生产源重新生成。
- 收尾核对：69 个 src 文件与安装 ASAR 一致；preferences.json 哈希不变。ae-library.json 为运行时连接回执，updated 字段会刷新，不宣称该文件字节不变。默认用户配置下新版窗口已打开且 Responding=true。

### 2026-10-22 — GitHub 首页 Logo 与个人微信联系入口
- 原因：用户要求将已选 Logo 和本人提供的微信二维码放到 GitHub 介绍，群二维码暂不处理。
- 变更：README 顶部展示橙底米白光束 Logo；联系作者区新增个人二维码及咨询、反馈、申请进群说明。
- 文件：README.md、docs/images/yimucraft-logo.png、docs/images/wechat-contact.png、docs/HANDOFF.md。
- 验证：发布前核对图片路径、原二维码文件字节和 Git 提交仅包含上述四个文件；发布后读取远端 README 与图片 blob 核对。
- 边界：不修改软件 Logo 或发布新安装包，不改变仓库私有状态；二维码可解码不等于实际加好友验收。
- 回退：撤销本次介绍提交即可；不涉及运行库。下一步按用户反馈调整介绍。
- 远端结果：main 已更新至 3a8cc4bffe4a461f4da7bd8d9eca3e6eea5dd16c，仅四个介绍相关文件；远端 README 图片引用和两张图片已读取核对。当前仍为私有仓库，普通访客无权查看；未变更可见性。

### 2026-10-22 — 仓库公开与本机快捷方式图标统一
- 原因：用户明确要求公开仓库，让访客查看介绍及下载安装包，同时统一快捷方式图标。
- 变更：README 改为公开仓库说明；保留未选开源许可证的边界。桌面与开始菜单两处快捷方式明确使用同一份橙底米白 ICO，并通知 Shell 刷新。
- 验证：Release 非草稿且包含安装包与校验文件；快捷方式读回目标与图标路径一致。公开后另做匿名首页和下载入口核验。
- 边界：远端仍为 0.7.34 开发者预览版，本机 0.7.35 未发布；公开可见不等于授予开源许可证，不推送旧 master 或本地未发布源码。
- 回退：可将仓库改回私有（不能撤回他人已获取内容）；快捷方式备份在本地 evidence/public-20261022/shortcut-backup。
- 下一步：用户查看公开首页与快捷方式实际显示。
- 完成回执：GitHub 返回 PUBLIC；匿名（无登录凭据）首页 HTTP 200，安装包 HEAD HTTP 200，首页包含 Logo 与个人二维码引用。桌面/开始菜单两处快捷方式读回一致，ICO SHA256 与正式 src/app.ico 相同；已通知 Shell 刷新，未重启资源管理器。实际桌面缓存显示仍由用户查看。远端文档提交 e134be0bbeecb20ab6600a6260396cbfa22941e7。

### 2026-10-23 — MOV 兼容预览与视频卡片滑动，0.7.36 / Codex
- 原因：用户的 10.1.mov 为 PNG/RGBA 透明视频，旧 Chromium 播放失败后只显示系统播放器提示；用户要求移动鼠标快速定位、停住正常播放。
- 前后行为：MOV 解码失败自动进入预览队列；VP9 WebM 保留透明像素，原件不改。卡片停留播放、水平移动定位、静止 180ms 后续播、离开/卸载释放播放器；预览回写前校验当前库和素材路径。
- 文件：src/media-preview.cjs、renderer.js、main.cjs；package/lock；scripts/mov-ui.cjs、mov-restart-ui.cjs；MOV-PREVIEW-20261023.md、USAGE/PARITY/HANDOFF。
- 验证：用户样本副本复现失败；源码/安装版交互和透明帧通过，副本源离线重启缓存不变仍播放；MP4 逐帧/空格回归通过；真实原 MOV SHA256 不变。NSIS exit 0，69 个 src 文件与安装 ASAR 一致。
- 验证更正：首轮 alpha 检查误要求高不透明度，实测源帧 alpha 最大仅 121，改为同时存在透明与可见像素。补测重复导入触发确认阻塞，改成复用已有测试库，补测已确认 seek 完成且停住续播；没有用扩大延迟掩盖问题。
- 依据与边界：Aetodo 带 FFmpeg/fluent-ffmpeg，但 REA ASAR 解析失败，未证实具体播放器链路；仅本样本通过，不宣称所有 MOV/HDR 兼容。首次转换需要等待。
- 回退：保留 0.7.35 构建，无 schema 变更；证据 evidence/mov-20261022/。GitHub 未上传本次修复。
- 下一步：打开本机新版供用户实际体验；大库多素材和其他 MOV 编码按反馈定向验证，不扩展无关功能。经验候选见专项报告，未升级为通用已验证经验。

### 2026-10-23 — MOV 透明素材黑底显示，0.7.37 / Codex
- 原因：用户反馈透明特效叠加暖灰背景后难辨识，要求纯黑背景。
- 前后行为：MOV 媒体区与详情由主题背景改为 #000；缩略图、悬停和详情统一。仅显示层变化，不修改原件或缓存，无需重新转码。
- 文件：src/renderer.js、style.css、package/lock、USAGE/PARITY/HANDOFF；证据 evidence/mov-black-20261023/。
- 验证：源码和真实安装版使用已有透明 MOV 缓存，卡片/详情计算背景均为 rgb(0,0,0)，实际悬停播放与截图通过；NSIS exit 0，注册 0.7.37，安装 ASAR 与源码核对通过。
- 边界：按 MOV 类型统一背景，不声称自动识别所有透明格式；本轮未改播放逻辑或 Adobe 链路，不重跑无关测试。GitHub 未上传。
- 回退：保留 release/0.7.36；撤销两处展示属性和 CSS 规则即可，无 schema 变更。下一步由用户检查实际清晰度。

### 2026-10-23 — 关于一幕主题统一，0.7.38 / Codex
- 原因：用户指出“关于一幕”原生 Windows 对话框白底蓝标题，与一幕暖灰/奶油白主题不一致。
- 前后行为：帮助菜单发送 about 事件，打开内置 dialog；沿用主题变量、橙色主按钮与正式 Logo，动态读取版本与库路径；复制反馈显示在弹窗内。
- 文件：src/main.cjs、renderer.js、index.html、style.css，package/lock；scripts/about-theme-ui.cjs；USAGE/PARITY/HANDOFF。
- 验证：源码与安装版通过真实菜单回调、深/浅实时切换、无横向溢出、Esc/确定关闭。实际点击复制按钮，拦截主进程 clipboard.writeText 核对两项参数，未覆盖用户剪贴板。NSIS exit 0，注册 0.7.38，安装 ASAR 与源码一致。
- 测试修正：首次安装版测试过早触发菜单，renderer 尚未完成初始化，窗口未打开；改为等待真实版本文字后触发，复测通过。失败记录保留，未修改产品代码或盲增延迟。
- 边界：本轮仅关于弹窗；系统文件选择器与其他原生提示未统一改造。未改素材、MOV 或 Adobe 功能；GitHub 未上传。
- 回退：保留 0.7.37 安装包，或撤销关于 dialog/命令和样式。下一步用户查看实际主题效果。证据 evidence/about-theme-20261023/。


### 2026-10-23 — AE 效果卡片与四个真实 Logo / Codex
- 原因与范围：用户要求浏览效果，悬停播放，右键导入背后工程和素材；本轮以四个 Logo_FP_01–04 为验收对象。
- 前后：原卡片只有 AEP 占位；现在使用 AE 最终合成渲染样片，卡片播放并仍导入原 AEP。默认隐藏未有样片 AEP，可在“待补预览（AE）”生成。
- 文件：adobe-bridge.cjs/adobe-host.jsx、ae-preview.cjs、main.cjs、library.cjs、renderer.js、index.html、asset-menu.cjs、package*.json；tests/ae-preview.test.cjs、scripts/logo-*.cjs；本主档、PARITY、USAGE、AE-EFFECTS-20261023。
- 验证：定向 7 项通过；安装版样片生成/四卡播放/右键导入通过；测试源副本离线重开 9 引用/0 缺失；正式库重启通过；70 个 src 文件与安装 ASAR 一致。证据 evidence/logo-effects-20261023/。
- 失败/边界：开发目录宿主启动超时；测试关闭后 AE 崩溃恢复提示曾阻塞，正常启动后的 final 原生验证通过。外部 Node 初次关联未保留，安装进程关联后二次启动通过，原因未定。详情与所有失败见专项报告。
- 回退：保留四条原关联 JSON 和索引备份，恢复关联或安装 0.7.38；不覆盖后续用户库变更。原 AEP 哈希不变，GitHub 不更新。
- 下一步：用户体验验收；其他工程使用待补预览入口，未宣称全部工程或插件兼容。

### 2026-10-23 — 按任务工程审查与第一批修复 / Codex
- 原因：用户授权保存自动触发规则、完整清单，并审查与优化当前软件；按本地桌面产品风险筛选，未补 SaaS 功能。
- 前后行为：永久删除保护其他素材共享文件；系统打开改允许列表；后台退出拒绝待处理/后续请求而不重放修改；常规打包入口先跑测试。sharp 0.34.5→0.35.5（transformers 定向 override），yauzl 3.2.0→3.2.1。
- 文件：AGENTS、ENGINEERING-REVIEW/CHECKLIST/AUDIT-20261023；main/trash/safe-open/worker-requests；package/lock；test-core、engineering-review-ui/ai 与三组新增测试；HANDOFF/PARITY/USAGE。开工已有改动保留，before 快照在 evidence/engineering-review-20261023-r1/。
- 验证：共享引用修复前 4 项失败，定向 14/14；首轮全测 81/82（系统临时目录 FFmpeg 写入被拒），项目内临时目录后 82/82；最终依赖更新后打包门禁仍 82/82。目录版实际 IPC 拒绝 HTA、后台退出报错、本地 Chinese-CLIP 原生推理/查询通过；源离线重开索引通过。npm 官方 audit 为 0 已知漏洞。
- 失败/边界：镜像 audit 端点不支持；UI 测试首次注入 require 不可用，改 Node 内建模块入口后通过，失败均留存。测试 helper 使用 --no-sandbox，不证明生产 OS 沙箱。源码仍标 0.7.39，现用安装未替换、无 GitHub 发布，目录版不等于 NSIS 安装验收；用户视觉与真实 Adobe 未重测。
- 回退：仅按本轮备份/文件撤销，不重置已有工作树；依赖回退同步 package/lock/npm，风险会回归。本轮无 schema 改动，不回滚用户库。
- 下一步：R06 PR 超时未决需真实回执丢失夹具；R07 迁移恢复需旧 schema 故障注入。正式升级前再安排安装验证；本轮经验候选在审查报告，未宣称通用效果已验证。
- 补充验收：目录版 72 个 src 哈希一致，运行元数据一致，package-consistency.json 保留校验器路径/元数据规范化说明；不以 package.json 原始字节比较误报打包差异。


### 2026-10-23 — PR 超时未决与数据库升级恢复 / Codex
- 原因：继续处理 R06/R07，验证后仅更新本机。前后：超时自动释放改为持久锁与人工确认；零散初始化改为版本、快照、事务迁移；保持每次启动旧分类修复。
- 文件：premiere-bridge.cjs、premiere-panel/panel.js、main.cjs、schema-migration.cjs、library.cjs、package/lock；两组测试、recovery-app/native-r2 脚本；RECOVERY、PARITY、USAGE。
- 验证：完整 90/90；真实 PR 2026 独立工程延迟回调 2→3 项、重试被拒、无重放；目录版/安装版真实 IPC、501 项索引副本恢复通过。NSIS exit 0、注册 0.7.40、ASAR 与构建一致、73 源码文件一致；正式库 schema 1、501 项所有字段与偏好不变，界面就绪。
- 失败：分类回归 89/90 已修复；构建 TEMP 限制使用进程级工作区目录；Electron 子进程查询漏报 PR，新增独立面板心跳与确认后复查。详细失败及未知结果边界见专项报告。
- 边界：--no-sandbox 仅测试；没有可靠回执仍需用户核对并关闭 PR，不能证明上次结果；不自动重发。不证明全部格式/宿主或 1:1。未发布 GitHub。
- 回退：保留升级前索引和偏好、库内快照；恢复到新空目录核对，不直接覆盖现用库或删 WAL。下一步：用户日常使用观察；无本轮已授权未完成项。
- 证据：evidence/recovery-20261023-r2/；evidence/upgrade-20261023-031356-777/install.json。临时 CEP .debug 已移除，已保存的独立 PR 实例已退出，18817 监听关闭，一幕测试调试实例已退出，正常安装版已重开。

### 2026-10-23 — 播放控件、内置类型视图与工具核验 / Codex
- 原因：用户反馈底栏静音对音频无效、工具用途不明，要求默认类型入口，并讨论剪映。用户明确确认移除底栏两个按钮且保留悬停播放。
- 前后：视频专用静音/悬停开关从底栏移入设置；新增音频静音偏好，保留卡片独立控制；新增 Pr/Ae/Ps/声音自动视图（AE 包含无预览工程）；AI 文案说明用途与图片/封面范围。
- 文件：src/index.html、renderer.js、style.css、library.cjs、main.cjs；package/lock；tests/premiere-recovery.test.cjs；scripts/usability-*.cjs 与一次性 refine-ui-20261023.cjs（不得重复运行）；HANDOFF/PARITY/USAGE 与专项报告。
- 验证：90/90；源码、目录版、安装版 WAV 播放/静音、四类筛选、偏好重启通过；本地 AI 搜索/标签/查重样本通过。NSIS exit 0、注册 0.7.41；73 源码哈希一致，501 项正式素材字段不变。正式偏好仅按本轮确认将 autoPlay=false 改为 true，audioMuted=false 保持。
- 失败：首次扩展名夹具错误触发 AE 受管导入、宿主无回执；改为隔离导航索引。首轮门禁 89/90，旧 PR 非超时测试 30ms 在负载下误命中超时；两项改为 5s 等待上限后 90/90，不修改产品超时策略。所有失败留存。
- 宿主/边界：AE 26.0x67 真实 UUID inspect 回执通过；PR 启动独立历史测试工程仍无新心跳，当前连接未验证通过，未盲改扩展或启动策略。AI 纯色样本不代表生产检索质量；分类占位夹具不代表工程解码；人工体验/听感待用户验收。剪映仅讨论，未实现对接，最后代码视频想法待用户补完；未公开发布。
- 回退：evidence/usability-20261023-r1/before 保存本轮源码，安装可退回 0.7.40；用户偏好升级前文件已留存，不覆盖后续库变更。素材/schema 无迁移。证据与经验候选见 USABILITY-20261023.md。
- 下一步：用户日常体验；PR 面板成功打开且出现新心跳后复查真实回执。不要将历史 PR 通过覆盖本次未连接状态。
- 清理：关闭本轮启动且无新心跳的独立 PR 测试进程；用户原有 AE 保留。安装版一幕已正常重开，测试调试进程已退出。

### 2026-10-23 — 自定义文件夹、透明棋盘与音频兼容 / Codex
- 原因：用户澄清四图标是自选目录入口，要求透明图片/MOV 棋盘与真实 WAV/FLAC 测试。
- 前后：按类型筛选改目录绑定；纯黑底改暗棋盘，JPEG MOV 缩略图改透明 PNG；不支持音频自动缓存回退，不改原件。
- 文件：main/renderer/audio-card/style/index/library/worker，新增 folder-shortcuts/audio-preview；package/lock、folder-media-ui、folder-shortcuts 测试及本主档/PARITY/USAGE/专项报告。
- 验证：源码 UI 四组真实旁白编码、透明 MOV、绑定重启、缓存复用与原件哈希通过；91/91。失败记录与测试边界见专项报告。
- 边界：本次无 schema、Adobe 宿主或公网发布；首轮包发现 JPEG 缩略图问题后未安装，修复后二次构建。
- 回退：before 目录保存改动前文件，保留 0.7.41 安装包；不回滚用户索引。下一步安装版专项验收与正式库完整性核对。

- 收尾：最终构建门禁 91/91；源码 run 1792755721934、目录版 run 1792755933824、安装版 run 1792755982267 通过。后两者覆盖 MOV 源副本移出目录后完整重启，缓存继续播放。
- 安装：0.7.41→0.7.42 NSIS exit 0，注册/ASAR 一致；75 个 src 文件逐项哈希一致，正式库 501 项全部字段与偏好不变。见 evidence/folder-media-20261023/installed-user-final.json 和 upgrade-20261023-054548-199/install.json。
- 额外失败留存：离线夹具曾将 .offline 文件留在扫描目录被正确索引，改移出目录后通过；安装核对首次 ASAR 路径斜杠不匹配，改平台分隔符后通过。均未修改产品绕过。
- 工具边界：REA inspect_artifact 两次参数校验拒绝；本轮以本地源码、安装 ASAR 哈希、真实 UI/媒体代替验证，无新增原版行为断言。NAS 实践检索因远端无 rg 未命中，未声称已读经验。
- 下一步：用户自行指定四个入口位置，日常听感与个人目录习惯待验收；测试未替用户绑定正式目录。无本轮已授权未完成项。

### 2026-10-23 — 类型属于真实文件夹，0.7.43 / Codex
- 原因：用户再次澄清图标应是下方文件夹选项，类型区先空，每类仅一个；此前快捷绑定实现不符合意图。
- 前后：移除固定四入口，创建优先选择未占用类型；已有文件夹图标选择器同样受唯一性限制，普通目录不限。
- 文件：appearance/appearance-picker/folders/library/schema-migration/main/renderer/index/style、package/lock；type-folders 测试及 UI 脚本、schema 测试与本主档/PARITY/USAGE/专项报告。
- 验证：核心 94/94，源码 UI run 1792758320874；跨父级、并发唯一索引、失败不留空目录、改名/重启/删除释放通过。真实截图已查看，消除新建弹窗横向溢出。
- 边界：schema 1→2 迁移自动备份；没有移动或自动归类原素材，旧 shortcut 配置不读取但保留。上轮音频/棋盘保持。失败详情见专项报告。
- 回退：保留当前库，将升级前快照恢复至新目录供旧版打开；不可用 0.7.42 直接打开 schema 2。下一步正式安装版与 501 项数据完整性核对。

- 收尾：最终构建门禁 94/94；目录版 run 1792758466343、安装版 run 1792758514820 通过，图标空区/创建/更换/唯一性/重启/删除释放与所有类型用尽覆盖。
- 正式升级：0.7.42→0.7.43 NSIS exit 0，注册及 ASAR 一致，75 个 src 文件逐项一致。用户库 schema 1→2 快照 integrity_check=ok，快照与升级后均保留原 501 项全部字段，folder_preferences 和偏好不变。证据 evidence/type-folders-20261023/installed-user.json。
- 未替用户创建任何类型目录；正常安装版已重新打开。下一步由用户在下方文件夹创建或图标选项使用；无已授权未完成项，未发布 GitHub。


### 2026-10-23 — Pr/Ae/Ps 可见字形居中，0.7.44 / Codex
- 原因：文本行框居中仍有字体基线留白，用户反馈图标字母偏下。
- 前后：文字节点改为本机 Segoe UI Semibold 生成的 SVG 字形路径，按轮廓边界居中；颜色、类型唯一规则和目录行为保持。
- 文件：src/appearance.js、style.css、package/lock；scripts/icon-align-ui.cjs、icon-align-installed.cjs；HANDOFF/PARITY/USAGE/专项报告。
- 验证：构建门禁 94/94；源码 run 1792758793813、安装版 run 1792759031984 的 24/34px 字形水平垂直偏差均小于 0.5px，截图已查看。NSIS exit 0，0.7.43→0.7.44；75 源码文件一致，501 项素材全部字段、folder_preferences 和偏好不变。
- 边界：无 schema、媒体、Adobe 或剪映行为修改；国内剪映真实拖放未测，国际版资料不能替代国内验证，用户视觉验收待反馈；未公开发布。
- 回退：本轮 before 目录与 0.7.43 安装包保留，同为 schema 2，不回滚用户数据。下一步用户日常视觉确认，无本轮已授权未完成项。


### 2026-10-23 — 开放智能体 MCP 与本地 API，0.7.45 / Codex
- 原因：用户要求一幕像糯米一样可供 Codex、Claude Code、Workbody 等智能体调用；本轮实现外部智能体工具接口，不将内置模型供应商管理混为完成。
- 前后：此前只支持应用内 IPC；新增共用功能层、MCP stdio 适配器、鉴权回环 HTTP、工具菜单接入开关和配置复制。默认关闭，新开启默认只读，整理权限只影响标签/评分/收藏/备注。
- 文件：agent-tools/server/mcp/ui 新模块，main/preload/renderer/index/style；package/lock SDK 1.32.1；agent 测试、agent-ui/installed 脚本及 HANDOFF/PARITY/USAGE/专项文档。
- 验证：96/96；源码 run 1792759642692、安装版 run 1792759877490，真实透明 PNG 搜索、详情、目录、整理、重复标签、UI 选中、只读拒绝、重启保留、关闭撤销及原件哈希通过；安装版截图已查看。
- 正式升级：0.7.44→0.7.45 NSIS exit 0，注册/ASAR 一致；79 个源码文件哈希一致，501 项素材全部字段、folder_preferences 与 preferences.json 不变。正式库新建 agent 设置，已开启只读服务。
- 客户端：通过各自 CLI 添加本机用户级 yimucraft 配置，不覆盖其他 MCP；Codex get 注册有效、Claude get Connected；正常启动安装版的真实 MCP status 返回 501 项。当前聊天未热加载新工具，下一次重新连接后可用；未进行付费模型对话验收。
- 工程边界：仅 127.0.0.1，Origin/Host/随机 token、64KB/8 在途上限、严格参数、库标识防错写、操作审计；同 Windows 用户为信任边界，无远端 OAuth/多用户/每客户端授权。官方 npm 生产依赖审计 0 项漏洞。无 schema 迁移、无 Adobe/媒体修改、无公开发布。
- 失败留存：首轮 UI 夹具调用不存在的 importPaths IPC，改用现有 import 后通过；npm 镜像 audit 404 后改官方源；Claude env 变长参数吞掉命令，改用官方 add-json 并以 spawn 参数数组调用后 Connected。未修改产品绕过这些错误。
- 回退：安装可退 0.7.44，同 schema 2；可在界面关闭服务，并用 codex/claude mcp remove yimucraft 移除本轮注册。保留用户素材与已有偏好，不覆盖索引。
- 下一步：用户从新连接的助手使用真实素材检索；Workbody 需按具体客户端能力实测。内置大模型聊天、导入/删除/Adobe 自动操作未包含在本轮接口，不宣称全软件开放。经验候选见专项文档，未升级为已验证经验。


### 2026-10-23｜0.7.46：参考 Nomi 的模型接入与主界面入口

- 原因：用户要求参考 Nomi 大模型 API 接入，并将模型设置从工具深层提到主界面。
- 前后行为：此前仅有本地 Chinese-CLIP 与外部 MCP；现在顶部显示 AI 模型/当前选择，独立管理服务商、加密 Key、模型列表、手填 ID 和文字试用。原本地 AI、MCP 各自保留，可从新入口直达。
- 文件：新增 model-service.cjs、model-ui.js、模型专项测试与 models-ui/models-installed；修改 main/index/style、package/lock；同步本主档、PARITY、USAGE 与专项文档。
- 参考：用户截图、Nomi 实时只读模型列表与本机 AiModelsSection；REA 9222 端点 invalid_endpoint_response，不能宣称运行时完整逆向；未动 Nomi 密钥/设置。
- 验证：101/101；源码 run 1792760907126、目录版 1792761029960、安装版 1792761231411，HTTP 夹具/列表/试用/401/加密/重启/改址/深浅主题/小窗口/本地 AI 与 MCP 入口通过；安装版截图已查看。
- 正式升级：0.7.45→0.7.46，NSIS exit 0，注册与 ASAR 一致；81 源码文件一致，501 素材全字段、folder_preferences、preferences.json 哈希一致，正式用户未配置测试服务商。
- 失败留存：UI 夹具不存在的 isInViewport 和 GBK 编辑失败已纠正；首轮 NSIS 默认 TEMP 卡在生成卸载器，误启动未完成临时 EXE 后注册校验失败。终止构建子进程并以 work/build-temp 重建正式 NSIS 后通过；记录见专项文档及 upgrade-20261023-071320-242。
- 安全/边界：密钥精确绑定地址/协议、Windows 加密、禁重定向、远端 HTTPS、原始错误不回显、单请求/256 tokens/45 秒/2 MB；只发送用户输入文字。未测真实供应商、付费结果、Responses/Gemini 原生或生成视频；没有内置自主素材整理。
- 回退：0.7.45 安装包可回退，无 schema 迁移；新增独立模型配置旧版不使用，保留素材。下一步由用户在主界面添加服务商并试用，结果决定具体协议兼容修订。经验候选见专项文档，尚待确认。


### 2026-10-23｜0.7.47：客户端一键配置与 DeepSeek 真实调用

- 原因：用户要求为 API/智能体提供图标和一键配置，并必须使用本机已有 API 真实验证；已确认 Harness 指 DeepSeek Harness，WorkBuddy 按腾讯客户端。
- 前后：从手填/复制配置改为 4 家 API 预设、官方本机配置导入、7 款客户端发现/备份/写入/握手；只读默认不变。来源和客户端均明确，不把写文件当作宿主加载。
- 文件：client-connect.cjs、model-local.cjs，main/model-ui/agent-ui/style，js-yaml 4.3.2 与 package/lock，5 项新测试、client-connect-ui/model-real/client-live/client-final，以及主档/对照/说明/专项文档。
- 验证：106/106；源码客户端 run 1792762881069，长名称回归 1792763233660；首次真实 API run 1792762490881（5627 ms/423），正式 live run 1792763126368（4158 ms/423），均为 DeepSeek V4 Pro 官方 Anthropic 兼容接口。
- 正式配置：UI 导入本机 Claude Code API，主进程加密保存，Key 不进入日志；Codex/Claude Code/WorkBuddy/Kimi Code/Harness 一键配置及独立 status 全通过；Claude Code CLI Connected。其他客户端实际热加载/模型工具调用未验；Cursor 只做夹具，Claude Desktop 未检测到。
- 纠正：旧 Codex 配置 args 曾合并成一个字符串，旧注册不能等同可用；本轮直接参数数组写入并官方 get 校验。其他 Codex/Claude/WorkBuddy 配置全字段保留，原文件旁有备份。
- 安装：0.7.46→0.7.47，再安装长名称样式修订，均 NSIS exit 0；最终 evidence/upgrade-20261023-074931-381/install.json。final-1792763412378：83 源码文件一致、501 素材全字段/文件夹偏好/应用偏好相同，真实模型验证状态与加密 Key 保留；截图已查看。
- 失败：真实测试脚本首轮 evaluate 中 require 不存在，改 mainModule.require 后通过；官网旧 Harness 文档域名 404 改官方源码；真实长名称发现 nowrap 溢出，修订后专测/重打包，未重复付费测试纯样式。
- 边界：自动发现标准配置目录，不扫描进程或强制重启；本机 API 自动导入目前只支持 Claude Code 标准配置内已识别的官方来源，不读取订阅 OAuth，不承诺全软件凭据扫描。Harness 特殊脚本 YAML 拒绝改写。无公开发布。
- 回退：0.7.46 安装包可退，无 schema 变化；客户端按备份或仅移除 yimucraft/yimucraft-mcp，保留后续用户修改。下一步用户刷新相应客户端查看工具；经验候选及完整范围见专项文档，未升级通用已验证经验。

### 2026-10-23｜0.7.48：真实智能体搜索、三模型切换与官方 Logo

- 原因：用户要求 WorkBuddy/Kimi Code/Harness 实际调用搜索，DeepSeek/Kimi/MiniMax 使用本机已有 Key 接通并方便切换，拒绝自制首字母图标。
- 前后：新增顶部模型下拉、MiniMax 卡片、Nomi 官方配置导入及官方品牌资源；模型选择重启保留，不改变离线推理或其他客户端模型。正式默认 DeepSeek，三模型均可选。
- 文件：model-local.cjs、model-nomi-secret.cjs、model-ui.js、agent-ui.js、index.html、style.css、logos/、package/lock；model-local.test.cjs，agent-host-real/three-models-real/agents-proof/connect-kimi-user 脚本及相关文档。
- 真实宿主：Harness 官方 headless + DeepSeek，Kimi Code 0.23.4 + Kimi K3，WorkBuddy 5.8.3 自带完整 CLI 引擎 + Kimi K2.6，均实际 yimu_search(q=Logo,limit=3)，total=10、id=350/368/355。引擎文件 SHA 一致；桌面鼠标路径未通过，不冒充 GUI 验收。
- 失败与纠正：Kimi OAuth 失效、Coding Key 403，复用现有开放平台 Key 成功；Nomi safeStorage 跨配置目录不能直接解密，改当前用户 DPAPI 解开其配置密钥，再由一幕重加密。WorkBuddy 最初缺完整引擎上下文、XML 伪调用、包装工具权限拒绝均不计成功；补全官方引擎上下文并临时允许只读调用包装工具后取得真实结果，没有全局绕过权限。
- 配置：Kimi 原 config.toml 旁备份 `.yimu-backup-1792765824688`；新增默认 yimu/kimi-k3，原 OAuth 保留。Kimi 原生 api_key 字段留在其用户配置；测试临时 Key 清空，源码/脚本/专项证据秘密扫描无匹配。正式 agent/settings.json 自 07:30:51 已为 writeEnabled=true，本轮未更改；纠正旧“正式只读”描述，测试实际仅搜索。
- 验证：107/107；源码 models UI run 1792765575979、client UI 1792765590541；独立真实三 API 1792765246941、正式三 API 1792766140248 全通过。正式返回均 423（4648/12238/5864ms）；全部图标实际加载，顶部三次切换和重启保留。Kimi 用户配置再次搜索通过，session_7609f9a7-3d58-45a1-9277-4021cd13191f。
- 安装：前两次 exit 2，Harness 桌面自动重启 MCP 子进程占用旧 EXE；停止本轮启动的空闲 Harness 后正式 NSIS exit 0。`upgrade-20261023-083419-657/install.json` 注册 0.7.48，ASAR 611AB4FD80FAA7647FA895BF8823C35FE290367D9EC753AFA8E850D0DF9301E3。
- 最终：final-1792766210411，93 源码文件与安装一致；501 素材全字段、folder_preferences、preferences 哈希不变；三模型加密 Key/验证时间保留。已重开正式一幕；没有发布 GitHub。
- 边界/回退：仅验真实只读搜索及文本模型；桌面鼠标交互、所有其他工具不作通过结论。0.7.47 安装包可回退，无 schema 变化；Kimi 可恢复旁备份。下一步以用户实际操作反馈为准；经验候选见专项文档，未升级通用经验。

### 2026-10-23｜正式库切换与旧副本清理
- 原因：用户要求清除 library 素材副本，确认连接 D:\00-aetodo.library，询问预设/AE 工程识别。
- 前后：正式 C 盘 501 项自管素材改为 D 盘原库只读引用；新索引在 linked-libraries，旧 recent 入口移除，AE 路径公告自动更新。
- 文件：3 个专项脚本、LIBRARY-SWITCH-20261023.md、本主档/PARITY/USAGE；无产品源码/依赖/版本更改。
- 验证：原始 66,347 条、合并后 66,244 条、可见 65,586、2,053 分类；32 缺失/0 跳过/0 错误；源主 DB/模型/偏好/权限哈希不变。AEP/FFX 各 5 样本图片实际加载、音频解码、清理后重启通过。
- 删除：旧 501 项均自管，0 外部引用，无重解析点；删除前 671 文件约 733.5 MiB。素材和缓存目录已消失，但仍留 4 KB 索引和两个空目录，不能宣称目录完全删除。
- 失败：首次整页截图超时，改用样本缩小视图通过；首次清理 guard 将 MCP 适配器误判为主程序，明确识别只连 HTTP 的适配器后继续；目录不存在断言失败被保留，追加索引删除被自动审批 blocked by policy 拦截，未绕过。
- 证据：evidence/library-switch-20261023/run-1792767155294 和 run-1792767506133；后者 final.json 为最终验证，首次失败独立留存。
- 边界/回退：不修改 D 盘原件，不删除其他研发夹具；旧媒体无备份不可凭索引恢复。专有包安装/每个 AE 工程执行未验；下一步仅按实际缺文件或宿主问题定位，不扩大兼容承诺。

### 2026-10-23｜移除 526 AE 预设重复分类
- 原因：用户指出“526种AE内置插件效果可视化预设”在分类区常展开、无法收缩，并与下方文件夹重复，要求去掉该入口。
- 定位：existing-library 同时建立分类映射与真实文件夹视图；renderer.js:107 的分类递归没有折叠控件。此次按用户要求移除指定分类，不宣称已补齐通用分类折叠功能。
- 执行：正式 0.7.48 使用现有 deleteCollection IPC，删除本地分类 1696 及其 19 个子分类映射；保留真实文件夹和所有素材。先备份独立索引，未删除 D 盘目录或原库分类。
- 验证：安装版重启后分类区不再显示该组，下方文件夹仍在；65,586 可见素材不变，assets 全字段摘要、D 盘主 DB 哈希前后相同。实际截图已查看。
- 文件/证据：scripts/remove-duplicate-category-20261023.cjs；evidence/category-cleanup-20261023/run-1792768862482/{report.json,index-before.sqlite,after.png}；同步本主档、PARITY、USAGE。无源码或版本变更。
- 回退/边界：可从备份恢复指定分类及关联，勿覆盖后续素材改动；其他分类未改。新建独立连接索引仍会按原库分类重建，此次是当前库数据清理。

### 2026-10-23｜0.7.49：纠正分类误删并替换空白页 LOGO
- 原因：用户明确仅去掉重复父入口，要求恢复此前误删子分类；圈选空白页条纹符号要求改 LOGO。此前对移除入口的解释过宽，属于本次需纠正的操作错误。
- 前后：19 子分类从删除前 index-before.sqlite 精确恢复 523 条素材关联；直接提升到顶层，新 ID 2054–2072，保留名称/图标/颜色。父 1696 不恢复，D 盘原库和真实文件夹不改。
- 安全：恢复前新备份独立索引，事务写入；只补缺失分类及关联，不用旧数据库覆盖当前库。final-audit.json 逐分类 asset ID 集合与旧备份完全相同，所有 assets 字段摘要不变。
- UI：src/index.html 的 ▧ 改为现有 brand.svg，src/style.css 固定 72×72 与间距；package/lock 0.7.49。没有新增图标或改变品牌。
- 验证：107/107；源码空库 ui-1792771313799 及正式安装版 ui-1792771385239 通过。19 个分类均查到原数量，实用工具 14 项实际显示；LOGO 已加载、截图已查看。
- 安装：upgrade-20261023-100233-346，exit 0，注册 0.7.49，正式 ASAR 与构建一致。升级前仅停止一幕及其 MCP 适配器，未退出其他智能体宿主；未公开发布。
- 文件：restore-child-categories-20261023.cjs、restore-logo-ui-20261023.cjs，index/style/package/lock 和本主档/PARITY/USAGE；恢复证据 run-1792771266146。
- 回退/边界：恢复前 before.sqlite 可用于定向对照，不应整库回滚覆盖后续改动；旧版安装包可回退 UI。通用分类折叠逻辑未改，此次只移除指定父入口并恢复子项。
- 经验候选（待确认）：行动是定向恢复关联并提升子节点；结果为 19 类/523 关联精确一致；原因是原删除接口级联删除。验收需逐项集合比较和 UI 查询；反例是只比较素材总数无法发现分类丢失；边界是本次恢复不证明通用删除交互已修复。

### 2026-10-23｜0.7.50：侧边栏空间、文件夹批量展开/折叠、顶部模型可点击
- 原因：用户报告三个侧边栏问题：文件夹只能逐项点击折叠；顶部“未分类 / 类型 / 分类”占空间且不使用；顶部模型下拉有箭头但点击不切换，箭头贴边。
- 变更：
  1. `src/index.html` 删除 `#unclassified`、`#typeShortcuts`、`#collections`、`#addCollection`；侧栏只保留“全部素材”和“文件夹”。分类数据、`assignCollection` 选择器和素材右键“添加到分类”保留，仅侧栏展示/管理入口按用户要求移除。
  2. `src/main.cjs` 的文件夹空白区菜单新增“展开全部文件夹 / 折叠全部文件夹”，原有“新建文件夹”与文件夹行菜单不变；`src/renderer.js` 的 `state.folderParents` 收集全部有子级的路径，`collapseAll` 一次性写入 `state.collapsed`，`expandAll` 清空。
  3. `src/style.css` 给 `#appBar select` 加 `-webkit-app-region:no-drag`，解决拖拽区吞掉点击；`#modelQuickSwitch` 改为 `appearance:none` + 内嵌 SVG 箭头（右侧 10px、右内边距 30px、高 26px），不再依赖原生箭头贴边。
- 文件：`src/index.html`、`src/main.cjs`、`src/renderer.js`、`src/style.css`、`package.json`/`package-lock.json`（0.7.50，installer 输出目录改 `release/0.7.50`）、新增 `scripts/sidebar-ux-ui.cjs`；本主档、PARITY、USAGE。
- 验证：
  - 核心 `npm test` 107/107。
  - 新增 UI 测试：源码 run `sidebar-ux-1792772261364`、打包目录 run `sidebar-ux-1792772569309`、安装版 run `sidebar-ux-1792773147946`，均 `passed=true`。夹具四层文件夹一次折叠 4→2 行、一次展开 2→4 行；空白菜单为“展开 / 折叠 / 新建”，文件夹行菜单逐项保持不变；侧栏只剩 `文件夹` 一个 section，文件夹区高 780px。
  - 模型：计算样式 `-webkit-app-region:no-drag`、箭头 `right 10px center`、`padding-right:30px`；对箭头区域真实鼠标点击 `mousedown=1`、`:open=true`、焦点落在 select；选择第二个服务商后 `modelSelect` 生效。
  - 安装版真实库经 MCP `yimu_status` 读到 `version=0.7.50`、`total=65586`、`writeEnabled=true`；窗口截图 `evidence/sidebar-ux-20261023/installed-real-library-final.png` 显示“全部素材 65586”和文件夹树，无“未分类/类型/分类”。
  - 安装：ASAR `E674A425635554BD7E6C8811BBD4030045E2670B159998A5AACF4B686560B548`，与 `release/0.7.50/win-unpacked` 相同；安装器 SHA-256 `77E250D08712FE03AB01E3275E9C5FB213D8C11A37A242F9237DDDA5ED60F510`；注册版本 0.7.50；`src` 全文件与 ASAR 一致，打包内 `package.json` 仅少 `scripts`/`devDependencies`。
- 安装失败与处理：DSH 的 `yimucraft` MCP 子进程持续以安装目录 EXE 运行并占用 `YimuCraft.exe`/`app.asar`，NSIS 静默安装两次 exit 2。停止子进程会立即被宿主重启，最终用“停止后同一轮重命名 `YimuCraft.exe`”制造一个无 EXE 窗口，安装 exit 0 后恢复；杀掉旧 MCP 后宿主用 0.7.50 重新拉起，MCP 已恢复。该竞态是宿主占用，不是安装包损坏。另：`scripts/install-local.ps1` 在本机 PowerShell 5.1 于 `$start.EnvironmentVariables['TEMP']` 报 `Cannot index into a null array`，未执行安装；本轮改用 staging EXE 直接 `Start-Process /S /currentuser /KEEP_APP_DATA`，exit 0，随后手工核对注册版本与 ASAR。启动安装版还必须清除 DSH 注入的 `ELECTRON_RUN_AS_NODE=1`，否则按 Node 运行立即退出。
- 用户配置迁移：真实库索引和模型配置原先只存在 Codex MSIX 重定向目录 `C:\Users\Administrator\AppData\Local\Packages\OpenAI.Codex_2p2nqsd0c76g0\LocalCache\Roaming\YimuCraft`，普通启动的 `%APPDATA%\YimuCraft` 是空库。已将 `linked-libraries\dd31d32bb401b2dd`（含 `library.sqlite` 68 MB、`linked-source.sqlite` 190 MB，源指向 `D:\00-aetodo.library`）、`model-providers.json`、`agent\settings.json` 复制到常规 profile；`library-config.json` 两次写入中第一次带 UTF-8 BOM 导致 JSON 解析失败并回退空库，改为无 BOM 后通过。原配置备份为 `library-config.json.bak-before-migrate-20261023`（常规）和 `library-config.json.bak-20261023`（Codex 重定向）。此迁移不改 D 盘原库、不覆盖素材和分类数据。
- 边界：真实 65,586 库未逐个点击展开/折叠（夹具已覆盖行为）；侧栏“分类”管理入口随本次移除不再可达，已有分类及“添加到分类”仍保留，若需新建/编辑分类需另加入口；真实服务商未重新发请求，模型切换以夹具和本地服务商配置验证；顶部模型下拉的原生弹层只在测试中实际打开，未在用户窗口手工选择。
- 回退：安装包可回退 0.7.49（同 schema）；侧栏/菜单为纯前后端渲染改动，可回退源码；配置迁移可从两个 `.bak` 恢复，复制出的链接索引可删除；未改 schema、D 盘原库、素材或 Adobe 工程。
- 接续：用户实际点击验证三项；分类管理入口是否恢复由用户决定；发布仍未进行。

### 2026-10-23｜0.7.51：文件夹空白菜单可达与重启状态记忆（America/Denver）

- 原因：用户要求不用滚到底部逐个关闭，并在启动时保留上次展开结构。旧版仅内存 Set，空白右键排除了整行缩进。
- 前后：标题与行缩进接入批量菜单；每次变更将折叠路径按库写 localStorage，首次渲染前恢复；完整树构建后筛选，全部操作不漏隐藏分支；叶节点禁用空开关，父节点增加 aria-expanded。
- 文件：src/renderer.js；package.json/package-lock.json 0.7.51；scripts/folder-state-ui.cjs、folder-state-install.ps1、folder-state-real.cjs；USAGE、PARITY、本主档与 FOLDER-STATE-20261023.md。
- 验证：107/107；源码 run 1792801661706、目录版 1792801869094、安装版 1792801936972；真实库 run real-1792801945882，65,586 可见项，2,024→5 行，302 个分支重启保持。NSIS exit 0、注册 0.7.51、93 源码文件匹配；66,244 条素材全字段 SHA-256 不变。证据 evidence/folder-state-20261023/。
- 失败与修正：首次 UI 夹具选择器匹配两行，改为首行后通过；首次 NSIS 卸载器构建 exit 2，依本机已有经验换本次构建 TEMP 后成功。失败日志保留，未以历史通过覆盖失败。
- 边界：localStorage 属于当前用户 profile，不随索引备份转移；目录改名/移动新路径不继承旧状态。菜单模板截获回调，真实鼠标右键命中已测，人工原生菜单选择待用户体验验收。没有 schema、媒体数据或外部服务改动，未公开发布。
- 回退：可安装 0.7.50，新 UI 状态键会被旧版忽略；旧 EXE 暂存不代表完整回退包，应使用原正式安装器。
- 接续：本机已普通启动并保持折叠，可直接使用；经验候选见专项文档，尚未固化。
- 补充：本聊天旧 MCP 因升级停止适配器而 Transport closed，尚需宿主重连；独立新连接已验证版本 0.7.51、65,586 项和既有权限不变，见 fresh-mcp.json。源码差异检查按 CRLF 配置通过；不为换行误报重写整个文件。

### 2026-10-23｜0.7.52：国内 API 模板、双分区设置与官方 Logo（America/Denver）

- 原因：用户要预设国内厂商及自定义 API，明确分 API Key/智能体接入；Kimi 经询问确认只要 Work 桌面端。此前入口仅由“连接 Codex/Claude”二级按钮到达，Anthropic 图标误用了 Claude。
- 前后：顶部 AI 设置、两组页签、13 个 API 入口与 10 个智能体入口；卡片只填表，本机 Key 导入改为独立操作。客户端说明生成正确 JSON/TOML/YAML，Qwen Code 新增 .qwen/settings.json 备份合并；官网链接只允许内置目录中的类型/ID。Anthropic 与 Claude 分离并补国内官方图标。
- 文件：src/connection-catalog.js、model-ui.js、agent-ui.js、client-connect.cjs、main.cjs、index.html、style.css、logos 中新增/修正图标；package 0.7.52；tests/client-connect.test.cjs；scripts/connection-catalog-ui.cjs、connections-final.cjs；本主档/PARITY/USAGE 和 CONNECTIONS-20261023.md、CONNECTION-LOGOS-20261023.md。新图标来源表替代旧 SOURCES 中的 Anthropic 行。
- 验证：核心 108/108；源码 UI 1792804893488、目录 UI 1792805039912、安装 UI 1792805107883；本地 HTTP 与加密重启/401/改址清 Key 回归 1792804903677。安装 install-20261023-192428，NSIS exit 0、注册 0.7.52、104 个 src 文件匹配；final-1792805115473 真实库 65,586 可见项、66,244 全记录摘要不变，模型 Key/偏好/库配置/连接权限四文件字节不变。全部官方图标加载、真实外链命令与任意 URL 拒绝、小窗口无横溢出通过，截图已看。
- 调查边界：Kimi Work 3.2.7 本机包提供本地 MCP 表单静态字段；REA 遇原生 companion 哈希声明矛盾，回退只读定向字符串，不执行目标代码、不作完整可信或运行等价结论。百度搭子本地 STDIO 未确认，已明确标识，不用远程 URL 假装接通。
- 当前范围：模板和入口准备完成；Kimi Work/千问办公/百度搭子宿主对话未验，Qwen Code 实际客户端未验（隔离配置+真实 MCP 探针已过）。不填新用户 Key，不向付费服务发请求，不批量改外部客户端真实配置，不公开发布。
- 回退：0.7.51 安装包，模型格式兼容；Qwen 配置有原文件备份，本轮只有隔离夹具改写。安装前释放一幕和旧 MCP EXE 占用，旧聊天连接如断开需宿主重连；新连接探针通过。
- 接续：已普通方式重新打开一幕，用户点击顶部 AI 设置即可使用；经验候选在专项文档，未经确认不固化。

### 2026-10-23 桌面接入续验与用户缩减范围
- 原因：最初要求三客户端实机接通；用户随后明确跳过，沿用 WorkBuddy 流程基准。
- 前后：产品保持 0.7.52，三个准备入口不升级为实测；新增 WorkBuddy 官方引擎定向复核脚本。
- 文件：scripts/workbuddy-recheck.cjs；本主档、PARITY、USAGE、DESKTOP-CONNECTION-RECHECK-20261023.md。
- 验证：run 1792807918067，安装引擎哈希相同、MCP 探针通过、真实模型工具调用返回 Logo 265 项与前三条，原 MCP 配置字节未变。
- 边界：桌面鼠标流程未验；Kimi Work/千问办公/百度搭子未实测。启动/下载安装组合命令被自动审批拒绝，未绕过；详情见专项文档。
- 回退：无产品或外部用户配置变更，停止使用新增复核脚本即可；无需重打包。
- 下一步：本轮按用户收敛后的范围结束；只有后续重新要求具体客户端实测时恢复对应验证。

### 2026-10-23 统一智能体接入流程（0.7.53）
- 原因：用户要求其他智能体按 WorkBuddy 统一流程，支持的自动写入，其余准备填写入口，不再逐个安装实测。
- 前后：10 个入口统一开启/配置/使用；7 款自动适配保留，手动三款有独立字段与复制。步骤页自动按钮复用原配置逻辑；手动开启保持既有权限；配置复制白名单不暴露密钥。
- 文件：src/agent-ui.js、main.cjs、style.css；package 两文件；scripts/connection-catalog-ui.cjs、connections-final.cjs；HANDOFF/PARITY/USAGE/CONNECTIONS-UNIFIED-20261023.md。
- 验证：108/108；源码 UI 1792808611822、目录 UI 1792808701538、安装 UI 1792808741535。安装 exit 0/注册 0.7.53，ASAR 4E2013F24A975C180C6CBC7D37EDE8DFD380DE00DE15E465F713D07570E99AF7。final-1792808749602 通过：104 文件匹配，66,244 记录与四项用户配置不变，65,586 可见项。
- 边界：本轮只验一幕内流程、隔离配置合并及 MCP 探针，不宣称三个手动客户端已运行通过。未发布；无需再次安装其他客户端。
- 回退：使用 0.7.52 安装包，数据格式兼容；本轮没有改写用户外部客户端配置。
- 下一步：用户可在顶部 AI 设置→智能体接入使用新流程；没有新增需固化的经验候选。

### 2026-10-23 文件夹图标与改色（0.7.54）
- 原因：用户明确为文件夹 Icon，需软件参考标识、视频特效、抽象 MG、音乐调性与改色；现有类型图标渲染强制默认色。
- 前后：新增27图标、按组选择、可重复软件标识；专用类型采用用户颜色优先；预设/取色器/HEX实时预览并保存。原Emoji和基础图标保留。
- 文件：src/appearance.js、appearance-picker.js、style.css、package两文件；scripts/folder-icons-ui.cjs；HANDOFF/PARITY/USAGE/FOLDER-ICONS-20261023.md。
- 验证：108/108；源码1792809203571、目录1792809274036、安装1792809331470通过真实颜色与重启。首次选择器歧义失败保留，已修测试。0.7.54安装exit0，ASAR 1C945118EDD916ACB0DC389B21F37024BBFB43294ED66A1351D3948FB2CA9188；final-1792809340223确认104文件一致、66,244素材记录/四配置不变，原3条文件夹偏好不变。
- 边界：软件字母为应用内标签，非新增官方Logo下载；没有批量替换用户文件夹、修改原素材或发布。审美待用户确认。
- 回退：0.7.53；旧版新增ID回退普通文件夹显示，ID保持，新版恢复识别；颜色存储兼容。
- 下一步：用户点击文件夹图标即可选择；可复用经验候选见专项文档，未经确认不固化。

### 2026-10-23 自媒体平台文件夹图标（0.7.55）
- 原因：用户希望按素材适用平台设置文件夹Logo，继续支持改色。
- 前后：新增17项自媒体平台分组与可改色矢量；多个文件夹可重复使用，默认平台识别色，原图标不替换。
- 文件：src/appearance.js、src/logos/PLATFORM-SOURCES.md、package两文件；scripts/platform-icons-ui.cjs、connections-final.cjs；HANDOFF/PARITY/USAGE/PLATFORM-ICONS-20261023.md。
- 验证：108/108；源码1792814047466、目录1792814147281、安装1792814198001通过17项图形/颜色/保存/重启及取消回退。安装exit0/0.7.55，ASAR B7D7B4CABEE6AF38E6132E96AA9FB26CEE04AC9E2D83D241E0578091A77F041C。final-1792814230644通过105文件匹配、66,244素材全字段与四配置不变；原7条文件夹偏好不变。
- 失败更正：final-1792814209080的可见数断言使用历史65586，实际本轮基线已为65585；全字段摘要一致证明未丢记录。改测试按已核验rows.hidden=0计数后通过，不改用户数据，不覆盖失败证据。
- 边界：Simple Icons 13.0.0静态路径，不自称官方授权。公众号用微信标志，抖音/TikTok共用轮廓按标签/颜色区分；视频号尚未新增。仅本地分类图标，未修改平台账户/外部服务，未发布。
- 回退：0.7.54不识别social-*时显示普通文件夹，保留ID；新版恢复识别。无数据迁移。
- 下一步：点击文件夹图标→自媒体平台；本轮无新增需固化的经验候选。

### 2026-10-23 软件标识与模型展示（0.7.56）
- 原因：用户需Final Cut/Resolve/剪映等标识、OBJ等更清晰展示，并讨论轻量单模型预览与排除大模型。
- 前后：新增8软件标识和8格式图标，3D扩展名卡片和几何占位；大于既有64 MB门槛直接提示不加载，不扩容预览。修正USAGE过时的OBJ不支持MTL说法。
- 文件：src/appearance.js、renderer.js、style.css、logos/SOFTWARE-SOURCES.md、package两文件；scripts/software-formats-ui.cjs、model-ui.cjs（改唯一输出目录）；HANDOFF/PARITY/USAGE/SOFTWARE-FORMATS-20261023.md。
- 验证：108/108；源码UI1792814628684，目录1792814730127，安装1792814778650；源码四模型work/model-ui-1792814635695，安装work/model-ui-1792814789641，实际几何像素、OBJ旋转、设封面与完整重启通过。安装exit0/注册0.7.56，ASAR194C8F38DC39E23BA50A140F482EC815A5B0ED800C3F81F9400A644643283D93。final-1792814794097：106文件匹配、66,244素材记录/四配置/7条文件夹偏好不变。
- 边界：Final Cut/剪映为自绘识别图，不称官方原文件；.blend/C4D原生工程、Draco、FBX外部贴图未新增。64 MB/256 MB不是GPU安全保证；面数/纹理预算和按需加载仅讨论，非已实现。
- 回退：0.7.55安装包；无数据迁移，未知图标ID显示普通文件夹，ID保持。未公开发布。
- 下一步：用户可使用软件/三维格式图标；若继续优化大模型策略，先明确按需加载与复杂度预算，不以文件大小作为唯一流畅性承诺。无新增需固化的经验候选。


### 2026-10-25 — GitHub 0.7.56 开发者预览同步 / Codex
- 原因：用户要求同步本地最新版到 GitHub，连同注释说明和页面更新；追加要求用 Computer Use 展示功能截图。关键词：GitHub、版本发布、实机截图、源码一致性、网页 UI。检索项目规则与网页 UI 实践，未开展产品定位或原版逆向。
- 前后：远端下载停在 0.7.34，本机为 0.7.56；准备发布 v0.7.56-dev.1，应用源码和现有安装包保持原样，不重复升级本机。README/CHANGELOG/USAGE/GITHUB-GUIDE/第三方来源及版本说明更新。
- 文件：此前 0.7.35–0.7.56 的 src、tests、scripts 和维护文档一并纳入版本；新增 docs/releases/v0.7.56-dev.1.md/json 和 docs/images/v0.7.56 五张 JPEG。归档验证脚本移除硬编码标签和固定证据目录，注释说明独立 run ID 的原因。
- 验证：npm test 108/108；106 个 src 文件逐字节匹配构建，安装版/目录版 ASAR 一致；独立空库版本和查询通过；npm audit --omit=dev 0 通告。打包白名单无 work/data/evidence/reference；候选文件无数据库、环境密钥文件或大体积媒体，常见令牌模式扫描无命中。文档链接检查无缺失。证据 evidence/release-20261025，完整 run 路径见 archive-run.json。
- 画面：Computer Use 从正式 0.7.56 截取素材库、API 设置、智能体、平台图标和软件图标；未保存图标编辑、未改权限或发送模型请求。截图按用户授权展示现有库，仅发布界面图片，不上传原素材或密钥。首次捕获为窗口重绘过渡帧，刷新后选取稳定画面；最大化后的旧句柄报 bounds changed，重新枚举窗口恢复。
- 边界：独立 GitHub Pages 未配置，页面更新指仓库 README 与 Release 页面；仍为开发者预览，未重做安装、干净机器、Adobe/全部智能体兼容验收。旧宿主失败与未知边界仍保留。远端已有两条首页提交，需合并保留而非强推。
- 回退：旧标签和 Release 保留；本轮文档可通过 Git 撤销，运行库未迁移。不同应用版本回退需相应备份，在独立库验证；不覆盖旧证据或标签。
- 下一步：提交并保留远端历史、上传版本和校验文件，核对服务器摘要、源码版本和页面图片，随后追加回执。
- 经验候选（待确认）：行动=从实际安装版截取功能并绑定版本标签；结果=五图与 106 文件一致性证据配套；原因=避免首页滞后于下载；验收=远端图链/版本/附件摘要同时检查；反例=只改版本号或放旧截图；边界=不能替代干净机器及第三方兼容验收。

- 合并更正：HANDOFF 因换行格式造成整篇冲突；初次校验将额外本地回执误判为不包含远端，Shell 未停止而提交冲突标记。现逐行验证远端两条历史日志全部保留并恢复完整本地记录，移除冲突标记后再建立发布标签；不改产品代码。

- 发布完成：main 已含源码与文档；标签 v0.7.56-dev.1 固定提交 7bd3be11ba6e2472812d8ff741019792f09e56c8。Release ID 423779605，draft=false/prerelease=true，旧 v0.7.34-dev.1 保留。三个附件为安装包、SHA256SUMS.txt 和版本验证清单（GitHub 另提供两项源码压缩包）。
- 远端验收：安装包 199,370,423 字节，服务端 SHA256 cb9b91a94332d7a54e79aab34c70d29dd9c64a11561845df1e133b067d035482，与本地一致；匿名 EXE/校验文件 HEAD 均 200，校验文件内容逐字节相同。公开浏览器首页显示 0.7.56，Release 五张截图 complete=true/naturalWidth=1920，版本和标签链接正确。证据 remote-published.json、anonymous-download.json；仓库简介同步 AI/MCP 能力。
- 收尾：公开页面为 https://github.com/zhizhiniao/YimuCraft/releases/tag/v0.7.56-dev.1 。源码无本轮产品行为修改，无重复安装、用户库迁移或模型付费调用。历史辅助脚本有尾部空行，保留原内容；产品源码字节保持，以免归档与安装版偏离。本轮授权工作完成，用户可直接查看下载与图文说明。

### 2026-10-25 — MIT 许可与 Obsidian 项目介绍
- 原因：用户要求撰写首个 GitHub 项目介绍，并明确选择 MIT，允许商用及闭源修改、保留版权与许可声明。
- 前后：原创代码与文档从未声明许可改为 MIT；新增 LICENSE，package/lock 同步 SPDX，修正文档旧私有/未授权描述。第三方保留原许可，FFmpeg GPLv3 和品牌素材不改授权。
- 文件：LICENSE、package.json、package-lock.json、electron-builder.yml、README、THIRD_PARTY_NOTICES、CONTRIBUTING、docs/GITHUB-GUIDE、本主档；Obsidian 主稿 content_id=yc-intro-20261025，制作入口 K:\02图文公众号\projects\一幕YimuCraft：我的第一个GitHub开源项目\PROJECT.md。
- 验证：执行 JSON/许可/图片相对链接及哈希核查；正文含结构大纲、五张0.7.56原始实机截图、功能边界与下载入口。远端同步结果在下方追加。
- 边界：无 src 行为修改；打包白名单新增许可文件供后续构建使用，本轮不重打包、不改历史标签/安装包，不声称完整第三方分发审计完成。公众号未发布，Obsidian及手机渲染尚未实测。
- 回退：未发布的文案可正常修改，历史安装包不变；公开授权后不能把 Git 撤销当作收回已授予许可。下一步按本人意见修改主稿及后续公众号排版。
- 经验候选：行动=绑定版本截图并分开说明源码许可与第三方许可；结果=主稿与授权声明有可追溯来源；原因=避免把公开源码、整包授权、功能兼容混为一谈；验收=链接/哈希/远端许可识别；反例=仅改标题为开源；边界=非完整法律或客户端验收，待本人确认不入经验库。
- 验证补记：首次 PowerShell ConvertFrom-Json 不支持 lockfile 空键导致验证脚本失败；改用 -AsHashtable 后两处 MIT 元数据、五张图片引用与原图 SHA256、一份主稿均通过。属于验证脚本问题，未修改依赖树。
- 远端回执：4551651 已推送 main；GitHub 仓库只读接口识别为 MIT。LICENSE 内容接口返回正文，误按 JSON 解析报错，未影响文件；许可接口本身不在连接工具允许路径，改查仓库元数据成功。读取远端与打开 Obsidian 的 Shell 组合命令被自动审批拒绝，未执行；未再尝试打开应用。HANDOFF/builder 换行规范化造成表面大 diff，忽略行末差异为九文件43增4删，无源码行为改动。

### 2026-10-27 — 公众号标题、开头与封面候选
- 原因：用户选定“做视频，找素材太麻烦？我做了一个工具，还开源了”，要求开头衔接与封面；随后指出品牌信息太小，要求突出个人/产品Logo及产品信息。
- 前后：唯一主稿 H1/title 与开头已更新；保留用户已改正文、GIF与Logo，首节之后逐字比较不变，文件名与 content_id 保持以免破坏引用。
- 文件：Obsidian yc-intro-20261025 主稿；本机制作目录封面-v1-品牌信息过小.png。首版暖白橙色素材整理概念图已生成查看，用户否定品牌尺寸，未嵌入主稿。
- 验证与边界：标题/开头落盘，正文保留通过；未发布公众号。个人标识存在AI知知鸟与蒋啊讲手绘头像两套，已询问等待选择；产品Logo为docs/images/yimucraft-logo.png。
- 回退与下一步：修改同一主稿，不创建重复正文；确认个人标识后生成突出双Logo、产品名及定位的第二版，再入footage/image并挂接封面。无产品源码或GitHub改动，不新增已验证经验。
- 2026-10-27 后续更正：用户明确“我的Logo”指一幕已设计产品Logo；此前“个人Logo/双Logo”是Agent误读，不是用户需求。第二版使用官方一幕Logo参考，放大产品名与“视频创作者的本地素材管理工具”。已生成查看并复制入主稿footage/image/封面-v2-一幕品牌强化.png，cover属性和文内引用已写入，哈希一致；候选待本人审美确认，公众号未发布/未验手机裁切。标题与开头此前更新保留，产品源码和GitHub未改。

### 2026-10-28 — AE 每秒扫描改为按需联动 / Codex
- 原因：用户报告暂停 YimuCraft 定时扫描后 AE 卡滞立即消失，明确授权按需扫描和不用即停。
- 前后：常驻全工程轮询改为显式刷新的一次性请求；启动不扫描，导入仅轻量摘要；打包面板安装同时迁移旧启动脚本。
- 文件：adobe-bridge.cjs、adobe-host.jsx、main.cjs、ae-state.jsx、install-ae-panel.ps1、build-ae-state.cjs、四项回归及本轮说明；保留既有项目画布改动。
- 验证：新四项测试先失败后通过；核心 116/116、0.7.58 目录版菜单/隔离空库通过；AE 部署摘要与备份见 evidence/ae-on-demand-20261028。
- 边界：真实 AE 启动/请求未拿到回执；用户随后明确“可以了，不用验证了”，已停止新增测试和宿主操作验证。旧收集通过记录不等于本轮新请求通道通过。
- 部署：AE 启动脚本及打包组件已更新；NSIS 首次生成失败，正在完成桌面部署，最终状态追加于后。没有 GitHub 提交或发布。
- 回退：旧启动脚本保存在本轮 ae-before，恢复会恢复每秒扫描；用户原工程未修改。下一步仅部署收尾，后续宿主验收等待用户另行要求。
- 经验候选：见 AE-ON-DEMAND-20261028.md；包含行动、结果、原因、验收、反例与边界，不升级为已验证通用经验。
- 部署完成（2026-10-28 22:13 America/Denver）：补齐构建进程 OS/CommonProgramFiles 并使用完整 TEMP 后 NSIS 成功；本机已从 0.7.57 升级 0.7.58，安装退出码 0，安装器内置注册版本/ASAR 摘要检查通过，已按原方式启动桌面软件。
- 安装包 SHA256：1AF0151E6C20A6995EC3ABBC4E042E649ACDFB45E396EF743EE6E50EAAB43E80；安装 ASAR：617CC2C17CB881109025CC0F685046306ADC90CEAEB3489BF4F2E2DCEAC0724E。安装回执 evidence/upgrade-20261028-221240-534/install.json。
- 按用户最新要求未再运行测试、宿主刷新/收集或操作手感验证；停止等待旧只读探针并结束其启动器，没有强制关闭用户 AE 工程。旧后台状态文件不再由新桌面端使用。

### 2026-10-29 — 项目画布编辑与自动恢复 / Codex
- 原因：用户要求地址记忆、导入侧栏、序列整合、原比例、悬停信息、右键标签、框选嵌套分组/连线、说明与文字八项优化；原配置确实保留项目地址，但启动没有恢复画布工作区。
- 前后：v1 记录迁移到 v2，备份原记录；工作区/项目/视图/筛选共同恢复。根目录与手选来源直接引用；新素材自动加入或留在待选列表，不进入原素材库分类。
- 编排：连续补零编号图片按保守规则组合为可逐帧播放的序列；图片/视频读取原尺寸。右键标签/状态/镜头，框选编组、嵌套、拖整组、改框尺寸、加入/分离/解散；SVG 连线与纯文本说明/文字均持久化。
- 文件：新增 canvas-media.cjs，重写 project-canvas.cjs/UI，扩展 canvas IPC/CSS；main 退出等待画布 IPC 队列保存。package/lock 为 0.7.59 并声明已有 sharp；新增核心/交互/真实项目/最终安装探针及本组文档。
- 范围审查：按 ENGINEERING-REVIEW 检查本地数据迁移、导入路径/软删除、IPC、后台监听/缩略图、UI 与升级；未增加账户、云端、付费或服务商调用。原路径 realpath 边界、来源身份检查、纯文本 DOM 和分组循环拒绝保留；未重做无关全库或 AE 宿主验收。
- 基线：REA 定向观察现有自身源码 UI，证据 `work/canvas-v2-20261029-203655/rea-observation.json`；原 canvas 源文件同目录留副本。首次调试端点尚未就绪，重试连接成功；未分析或复制 Aetodo 专有实现。
- 核心验证：最终 121/121，见 `work/canvas-v2-build-video-final.log`；专项 9/9 见 `work/canvas-v2-video-tests.log`。v1 迁移备份、手动大小保留、连续/缺帧/版本排除、外部来源去重、分组循环事务回滚、解散、重启和原件字节保护通过。
- UI 验证：源码 10/10 `work/canvas-editor-ui-1793329600792/report.json`；补竖视频后最终目录版/安装版各 11/11，分别 `work/canvas-editor-ui-1793330582844`、`work/canvas-editor-ui-1793330734571`。真实指针框选/拖组/缩放、播放器、标签/组/说明/连线、完整重启、小窗口均通过。
- 实际项目：隔离副本 `work/canvas-real-v2-1793329579977` 保留 1068 原记录、67 序列、97 竖图；正式用户配置 `work/canvas-v2-live-1793330743779` 自动恢复 E:\20261025未知君AI动画，保留全部既有位置/状态，125 个视频读取尺寸，至少 15 张实际可视缩略图并留截图。
- 更正与失败：最初 UI 拖组测试落在组内空白，改成真实标题命中；早期真实项目只数已解码图片而截图空白，改为可视区域交集验收，修复 Panzoom 禁止手动平移同时阻断程序平移和启动默认视图覆盖。早期 ok 不覆盖后续实际发现，失败/过程证据保留。
- 构建：第一份包因构建期间源码改动未过字节一致性，不安装；冻结 src 后重建。之后补齐竖视频首次导入比例，旧 0.7.59 构建完整移到 `work/canvas-v2-before-video-build`；最终 115 个 src 文件逐字节匹配安装 ASAR，见 `work/canvas-v2-installed-final-source-check.json`。最终源码之后只改测试与文档。
- 安装：本机 0.7.58→0.7.59，最终回执 `evidence/upgrade-20261029-212402-488/install.json`，退出码 0；安装器 SHA256 `AD6179FF3943C2BDEC321E0F17F8C3F39A5B1951F6D6C37435F3B1E0FB99A001`，ASAR `AD0AB455D6F3EEB77AEE09F9FEF9A3A6BEAC117B71D0B0C11D140F977CBA8957`。仅版本号不足区分本轮早期同版本包，应比摘要。
- 数据保护：正式画布原 JSON 留在 `work/canvas-v2-production-backup`；升级前后素材库/配置摘要全等，`work/canvas-v2-user-comparison.json`：66,244 素材、2,052 分类、7 文件夹偏好不变。只更新画布元数据/缩略图，不写 E 盘源媒体。
- 边界：系统文件选择使用真实文件加对话框返回夹具，未宣称系统选择器鼠标验收；序列是原帧播放器，不导出 MP4，解码速度限制实际帧率。特殊格式/旋转元信息视频未全面兼容验证；Codex/即梦外部 drop 保留此前未通过状态，不以本轮通过覆盖。
- 回退：保留 release/0.7.58 安装包；降级前备份 v2 JSON，在关闭一幕后用对应 v1 备份恢复画布元数据，不能把旧版本直接写 v2 当作安全回退。安装 EXE 重命名仅为释放占用，不是完整回退包；新组/说明等 v2 数据需另保留。
- 交付：已启动最终安装版；使用与验证细节以 PROJECT-CANVAS.md 为准，USAGE/PARITY 同步。无 GitHub 提交或发布，未触碰 AE 的按需联动行为或要求用户继续 AE 验收。
- 经验候选：共同保存工作区/路径/视图，并验实际可视与完整重启；行动、结果、原因、验收、反例、边界见 PROJECT-CANVAS.md。未获确认，不写入经验库。下一步仅收集用户实际编排手感反馈，不自动扩张功能。

### 2026-10-30 — 移除画布模式切换，改为直接鼠标手势 / Codex
- 原因：用户明确否定需要先点框选/平移/连线按钮的流程，要求左键框选、中/右键平移和元素旁拖线连接；以前技术通过不代表操作体验已被用户认可。
- 参考：读取 frontend-design 与本地“网页 UI 与排版通用实践”；核对 React Flow 官方设计工具视图控制、连接点和空白处拖线创建节点示例。沿用现有 DOM/Panzoom/interact.js，无新增依赖或整套框架迁移。
- 前后：删除三模式入口；空白左拖框选，图片左拖编排，中/右键和空格左拖平移，右键点击保留菜单。32 屏幕像素连接点随选中元素出现，预览线吸附并高亮目标；空白松手就地选择说明/文字/分组，创建和连接原子保存，Esc/取消无孤立节点。
- 文件：project-canvas-ui.js/CSS、project-canvas.cjs/IPC、package/lock 0.7.60；新增 test-canvas-gestures.cjs、check-canvas-gestures-live.cjs，扩展 canvas-editor.test.cjs；本主档、PROJECT-CANVAS、USAGE、PARITY 同步。画布 schema 保持 v2，旧线端点仍可自动选择。
- 审查范围：UI 指针/键盘、取消和失焦、鼠标动作冲突、原子写入/端点校验、打包升级与回退。文本继续 textContent，来源与原件生命周期不改；不重新审查云、付费、账户或 AE 宿主。
- 核心：122/122，日志 work/canvas-gestures-20261030/build.log；专项测试新增非法起点整事务不写、创建和连线一起保存、源镜头继承、端点方向及重启。
- 交互：源码新手势 9 项 work/canvas-gestures-ui-1793344927052；最终目录版 9 项 work/canvas-gestures-ui-1793345386178；最终安装版 9 项 work/canvas-gestures-ui-1793345496932；安装原编辑 11 项 work/canvas-editor-ui-1793345502811。均有 report.json，保存预览/空白菜单/完成截图，无页面异常。
- 测试更正：第一次平移比较读取了尚未持久化的视图，首次目录版框选又遇夹具后端改位置后 UI 刷新尚未完成；以 DOM 位置和变换矩阵与持久视图一致为基线后通过。保留初次失败，不将夹具竞态报为已证实的用户操作缺陷，也不靠多加延迟掩盖。
- REA：最初未给必填参数被校验拒绝，发现工具描述含 schema 后改为指定 loopback/target；启动端点未就绪时一次失败，进程就绪后成功。最终只读观察 ev_a62bfcd4e4aec92db862213107ad1e1f83a85d34fbf775f78168af5869941b03，记录 work/canvas-gestures-20261030/rea-observation.json；脚本源码未收集，观察不等于手势验收。独立探针进程已结束。
- 构建：首轮下载 Electron 显示 100% 后无输出/无解包子进程，按当前源码检查确认同版本本地 Electron 45.0.0；停止确切构建 PID，归档 partial 输出到 download-stalled，使用 electronDist 本地运行时重打包成功，不改系统环境。最终 src 冻结，115 文件与目录/安装 ASAR 无差异。
- 安装：0.7.59→0.7.60，evidence/upgrade-20261030-013036-832/install.json 退出码 0。包 SHA256 421FE375F9E6CAF93C3F020CF55727D2656695E02F3B31BA8DFA07062CDEC349；ASAR 73BF5F4A57FF322AB0151D689CA4CA2DBEEFB94EB467EAB221C83DA731762589。未公开发布。
- 正式项目：work/canvas-gestures-live-1793345511452/report.json，自动打开 E:\20261025未知君AI动画；3084 既有记录位置/尺寸/状态/标签/层级/文字及既有连线不变，真实图片上四个连接点可见，截图已查看。没有替用户重新编排或增加演示节点。
- 数据与回退：原画布 JSON 备份为 work/canvas-gestures-20261030/projects-before-upgrade.json；原库 66,244 素材/2,052 分类/7 文件夹偏好及配置摘要全等。保留 0.7.59 安装包与本轮修改前 canvas 文件；回退前备份当前 v2 元数据，旧版连接方向会恢复自动选边，不删除源文件。
- 边界与收尾：安装版已普通启动并唤起，无调试端口；触屏多指、跨应用原生 drop、AE 宿主不扩大验收。用户实际使用手感尚待本人反馈。可复用候选含行动/结果/原因/验收/反例/边界，见 PROJECT-CANVAS.md；未写经验库或记忆。

### 2026-10-30 — 分组折叠、自动归组与精简菜单 / Codex
- 原因：用户截图揭示组框不包围全部素材、边缘难调整、四个连接点拥挤、右键操作过重；本轮以用户指定的鼠标行为作为验收目标。
- 前后：修复 CSS 的 1100 像素上限与高组横向缩放时高度被压成 8000 的问题；四边可调，角手柄优先级修正，适合窗口避开底部操作条。
- 编组：展开几何单独保留，折叠只改变显示框；拖动含后代，入组/分离按松手中心原子更新；深层组优先、防循环。同父成员再编组保持原有嵌套。
- 交互：单个选中元素外侧感应一个连接点，按边跟随、离开消失；连接保存边上比例。右键收敛到编组/解组、路径、文件夹、可恢复删除；放大预览编辑标签，移除确认/手动镜头入口。
- 文件：新增 canvas-geometry.js，共享显示边界、遮蔽与归组判定；修改 canvas Store/IPC/UI/CSS/index 与 package/lock；新增核心/交互/真实项目检查，更新原两套 UI 测试到新入口；USAGE/PARITY/PROJECT-CANVAS 同步。
- 审查：UI 指针优先级、分组循环与原子保存、软删除、纯文本标签及打包升级；沿用 IPC 来源检查和原路径解析，不增加外部服务、依赖或付费调用。
- 观察：REA 自有源码页面基线见 work/canvas-groups-20261030/rea-observation.json；调试端点初次未就绪，连接后成功，未复制目标专有源码。
- 验证：源码新流程 12 项、手势 9 项、编辑 11 项通过；核心 127/127 见本轮 build.log。大组夹具超过 1100 宽和 8000 高，包含真实四边拖动、折叠、入组/分离、预览标签、删除恢复及重启。
- 更正：首轮边缘测试在 Panzoom 动画帧应用前取旧坐标，误点连接点；加两帧同步与持久视图一致检查后通过。随后确实发现底部条挡住高组下沿、边缘覆盖角手柄，两项均修复并保留失败证据。
- 边界：源码与本机构建实测不等于用户手感认可；没有重做 AE 宿主测试，没有扩大 Codex/即梦外部 drop 的兼容结论；旧状态数据保留，外部媒体不写入。
- 回退：保留 0.7.60 安装包和升级前画布 JSON；仍为 schema v2，旧版不理解分组折叠显示，降级前需备份现有元数据并恢复对应快照。安装/正式项目结果随后追加。
- 经验候选：行动=让框选边界、可见尺寸与鼠标命中一起验收；结果=宽/高组、四边、折叠及恢复通过；原因=数据框正确也可能被 CSS 限制或覆盖层挡住；验收=真实按下/移动/松开及重启；反例=只测存储 bbox；边界=本机鼠标且手感待用户确认，不入经验库。

- 安装完成：0.7.61，退出码 0；回执 evidence/upgrade-20261030-034900-223/install.json，安装与目录 ASAR 同 SHA256 AA3262294007B0AD6AB8BA37A164DCE5FC088DA3D951B0C12C1B53C6828A1F2C；116 源文件一致，无构建后 src 改动。
- 最终 UI：目录新流程 12 项（work/canvas-groups-ui-1793353672756），安装新流程 12 项（work/canvas-groups-ui-1793353793993）、手势 9 项（work/canvas-gestures-ui-1793353802880）、编辑 11 项（work/canvas-editor-ui-1793353808777）均通过；安装版截图已查看。
- 正式数据：work/canvas-groups-live-1793354000274 保留 3088 原画布记录及连线，E 盘根目录无需重选；库 66,244 素材、2,052 分类、7 文件夹偏好及四配置摘要前后一致。第一次探针误以为上次工作区为画布，实际为素材库，修正预期后通过；原失败不删除。
- 收尾：已用普通启动打开最终安装版供用户操作；唯一主档与 PARITY/USAGE/PROJECT-CANVAS 已同步，无 GitHub 提交/发布。经验候选待确认，下一步收集本机编排手感反馈。

## 2026-10-30 · 画布通用传图开发，用户停止桌面验收
- 原因/范围：用户最常用流程是直接拖原图给 Codex、即梦等；新增可配置右键发送，去除浮动按钮，缩小信息条。用户澄清 CodexCloud 指 Codex 与 Claude。
- 前后行为/文件：发送端由临时解析改成预备单次令牌；外拖恢复布局；卡片与配置 UI 已改；新增 canvas-transfer.cjs、自有 Windows 小助手、编译及测试入口。详见 CANVAS-TRANSFER-20261030.md。
- 验证：核心 130；新 UI 6、分组 12、手势 9、编辑 11 通过。真实 Codex 仍无附件；即梦/WorkBuddy/Claude/桌面/文件夹未完成。不能把 MSAA 聚焦后「已粘贴」视为送达。
- 边界：用户物理 Esc 停止 Computer Use，已停止；原生鼠标脚本使用询问未回复。未安装/打包/发版，安装仍 0.7.61，当前源码不再与安装一致；正式素材、AE 工程未改。
- 回退/下一步：保留既有未提交画布/AE 改动，仅成对回退本轮 UI/IPC 或新增助手模块；先完成接收校准和真实附件证据，再打包安装。测试夹具与失败日志保留在 work/canvas-transfer-20261030/。

## 2026-10-30 · 传图续作、短时接收与 0.7.62 本机安装
- 原因：用户要求减少 Computer Use 占用并完成传图；先在隐藏窗口区分剪贴板数据与真实按键链路。
- 前后/文件：native/YimuTransfer.cs 将 SendKeys 换为 SendInput，保留前台与输入框校验；新增隐藏剪贴板探针和可选后台 UI 测试装载器，修正隔离夹具不再隐藏源窗口或跨屏铺满。package/lock 更新 0.7.62；详见 CANVAS-TRANSFER-20261030.md。
- 验证：核心 130；源码隐藏交互 6、安装 ASAR 隐藏交互 7；混合/文件剪贴板均收到原图哈希；真实 Codex 输入框可见验收图片，消息未发送。安装 EXE 的 -r 隐藏断言失败保留，后续明确以同版 Electron 加载安装 ASAR 验证，不混称全部隐藏安装 EXE 通过。
- 安装/数据：0.7.62 安装退出 0，119 源文件一致，证据 evidence/upgrade-20261030-062013-063/install.json。66,244 素材、2,052 分类、7 文件夹偏好、四配置、3,091 画布项和 2 连线保留。
- 边界/下一步：跨窗原生鼠标短测询问待回复；未把 Codex 粘贴成功当成图片本体外拖成功。即梦等接收方仍待测；无公开发布，无 AE 操作。用户要求必要时才用 Computer Use，获准短测后立即释放。
- 回退：保留 0.7.61；无 schema 迁移，UI/IPC/preload 成对回退并保留 send-targets 配置；禁止整体回退既有未提交 AE 与画布代码。经验候选已写本轮记录，未升级经验库。

### 同轮追加：短测授权已收到，外拖不能认定完成
- 用户已明确允许原生脚本短测；native4 从图片本体拖至真实 Codex，源 startDrag 与落点 PID 均正确，但目标无附件且源 OLE 未正常返回，已停止隔离源进程。
- native5 名称条对照被起点归属保护在按下前取消；后续不再占鼠标。保留两个失败记录，不能用早先 Codex 粘贴成功覆盖本次原生拖放失败。
- 文件：native-drag.ps1 增加每窗 DPI、源/目标检查和自动释放；prepare-canvas-transfer 修正 PID 并记录开始/返回；test-background 可显式显示已准备的隔离窗口。仅测试脚本，119 源文件仍与 0.7.62 安装一致。
- 下一步：用独立接收器事件回执隔离 OLE/输入交接，再验证实际目标；同假设不连续重试。完整通用外拖尚未完成，现可使用右键发送 Codex；其他目标未验。

## 2026-10-30 · 直接拖图标准入口，0.7.63 后台审核与安装
- 原因/范围：用户要求像文件夹一样从图片直接拖给其他工具，并明确自行实测；本轮停用 Computer Use、桌面输入脚本和外部上传，不再要求用户批准同类测试。
- 前后行为：原先由 interact 内部移动在越界后临时切换，改为图片本体标准 dragstart 立即传原文件；落回画布走现有 move，外落/取消恢复原位。补充源离线、重入、过期与结束清理。
- 文件：project-canvas-ui.js、project-canvas-ipc.cjs、preload.cjs、package/lock；新 lifecycle/隐藏拖图测试；原 transfer/groups 测试适配标准拖动；后台测试入口禁止意外启动 OS 拖动。详见传图记录。
- 验证：核心 133/133；源码拖图 10、传图 UI 7、分组 12、手势 9；同版 Electron 加载安装 ASAR 的隐藏拖图 10/10。dragstart 是可信浏览器事件，原生接收端为替身；不等于真实外部收到文件。
- 安装/数据：evidence/upgrade-20261030-070032-385/install.json，退出 0；0.7.63 注册与 ASAR 一致，119 源文件无差异。原库/四配置、3,091 画布项和 2 连线全量摘要不变；未重开可见主窗口，无 GitHub 提交或发布。
- 边界/下一步：用户测试跨窗接收。0.7.62 native4 失败仍保留为历史，不能据 0.7.63 后台通过反写为成功；接收兼容性按实际应用/版本确认。未操作原媒体、AE/PR 或外部会话。
- 回退：保留 0.7.62 安装包，无 schema 迁移；UI/IPC/preload 必须成对回退，保留来源、布局和发送目标配置，禁止整体 reset 既有改动。
- 经验候选：行动=从标准起拖入口统一内外拖放，并按结束回执恢复状态；结果=后台与安装 ASAR 回归通过；原因=消除中途切换；验收=可信 dragstart、原路径、取消/分组；反例=旧版 startDrag 触发但 Codex 无附件；边界=外部接收待用户确认，未升级为经验。

## 2026-10-30 · AE 周期卡顿复查（未改产品代码）
- 原因/范围：用户怀疑上次每秒同步未修复；只查 AE 联动、后台活动和安装/运行差异。
- 前后行为：无产品行为变更。已从 AE 26.0x67 取得只读回执，on-demand-v1、旧 yimuCraftTick 为空、无保存的任务 ID；旧扫描未见复发，用户当前拖时间线周期迟滞仍未解决。
- 文件：新增 docs/AE-LAG-CHECK-20261030.md 和 evidence/ae-lag-20261030-1793365117622，更新 HANDOFF/PARITY；无入口/默认值变化，不改 USAGE。
- 验证：安装 0.7.62 / 工作区 0.7.63 的 AE 三模块摘要一致，Startup 同摘要；13 个被动样本内状态文件均未更新，一幕桌面/CEP 未运行。REA 缺原生 Frida 绑定，已记录并改用系统取证；一次性宿主回执成功。
- 边界：没有修改、保存、关闭工程，也没有禁用第三方扩展；闲置 CPU 样本不代表拖时间线流畅。没有完成按需刷新/收集或用户性能验收，不把旧修复生效当成当前卡顿根因已查明。
- 回退/下一步：无产品回退需要；保留只读探针及证据。若继续定位，在症状发生的同一窗口观察主线程响应并做逐项可恢复隔离。经验候选随复查记录，未升级知识库。

### 2026-10-31 — 0.7.63 源码与 GitHub 更新说明同步 / Codex
- 原因/范围：用户要求将最近功能更新 GitHub 并简述变化与解决的问题；同步 0.7.57–0.7.63 的现有源码、构建脚本、测试和技术说明，不新增产品功能或安装包发布。
- 前后行为：GitHub 首页此前只介绍 0.7.56；现在分别标明 0.7.63 源码与 0.7.56 下载，摘要覆盖画布、分组手势、AE 按需联动、图片传送及未验收项。旧标签和附件保持。
- 文件：既有未提交 src/scripts/tests/package/lock/builder/THIRD_PARTY_NOTICES；新增 README、CHANGELOG、docs/releases/0.7.63-source-update.md 的对外摘要，并同步 HANDOFF/PARITY/USAGE。
- 审查：按发布、依赖、IPC、外部联动和回归主题核对；确认画布调用有主窗口/主框架校验、命令白名单、一次性拖图令牌、来源路径解析，发送助手为自有源码；未进行完整安全或第三方许可审计。SaaS、多用户和付费流程不适用。
- 验证：核心 133/133（work/sync-20261031-1793431469468/core-test.log）；隐藏拖图 10/10（work/canvas-file-drag-1793431532141/report.json，nativeSink=mock、desktopInput=false）；119 源文件与安装 0.7.63 差异 0（同 run 的 installed-source-check.json）。本轮没有重新编译或改写 src。
- 依赖与仓库：默认 npm 镜像缺审计接口，首轮 404 保留；改用官方 registry.npmjs.org 后生产依赖审计 0 项通告，不改 npm 配置。高置信凭据模式扫描无命中；新增二进制仅自有 YimuTransfer.exe，未纳入素材、测试库、work 或 Obsidian 正文。
- 边界：源码回归不代表真实外部拖图、AE 卡顿和宿主按需流程已验收。本次未操作桌面、发送会话消息、打包安装或新建 Release；Obsidian 只更新既有结构路线图，未迁移或删除笔记。
- 回退/下一步：保留同步前提交 8e34ea9 和旧下载标签；需要回退时使用针对本次提交的 revert，禁止 reset 用户未提交工作。待推送 main 后补远端回执；后续按用户反馈处理实际接收及 AE 体验，不用历史通过覆盖新失败。
- 经验候选：行动=以源码差异、测试、安装字节比对和 GitHub 远端分别核验；结果=本地核验通过，远端待回执；原因=安装版、源码和下载版可能不同步；验收=远端 SHA 与文档相符；反例=只更新版本号就宣称完整发布；边界=本轮仅源码同步，未升级正式经验。
