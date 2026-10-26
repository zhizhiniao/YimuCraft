# 三个智能体与三个模型的实际验收

2026-10-23。用户要求：真实智能体搜索、现有 DeepSeek/Kimi/MiniMax 接通并方便切换、官方 Logo。以下区分模型执行与桌面鼠标流程。

## 已执行的真实搜索

统一输入：`yimu_search({q:"Logo",limit:3})`。三次均返回 total=10，前三项为 350 / Fire Logo Reveal.mp3、368 / Logo Vato.png、355 / Logo_FP_01.aep。连接正式一幕，仅调用只读工具，未上传媒体文件或修改素材。正式库原有 writeEnabled=true（文件时间 07:30:51），本轮保持原设置，不宣称服务级写入已禁用。

| 客户端 | 实际执行与证据 | 边界 |
|---|---|---|
| DeepSeek Harness | 已安装官方 headless 入口、真实 DeepSeek 模型、tool_call/tool_result/final；`evidence/agents-models-20261023/harness-search-key.jsonl` | 本次通过进程环境复用已有 DeepSeek Key；桌面登录授权与 headless Key 不同，不将其写成桌面鼠标流程已验 |
| Kimi Code 0.23.4 | 真实 CLI、Kimi K3、MCP 工具调用与回复；`1792765139567/kimi.jsonl` | 现有 OAuth 失效，Coding Key 返回 403；改用已存 Kimi 开放平台 Key 成功，随后备份用户配置并增加可用的默认 API 模型 |
| WorkBuddy 5.8.3 | 从已安装官方包读取完整自带 CLI 引擎，使用其既有 Kimi K2.6 配置，真实 ToolSearch → DeferExecuteTool → yimu_search；`workbuddy-settings.jsonl` | 引擎运行通过，非 SDK 代调用；桌面输入自动化未通过。测试仅临时允许搜索/调用包装工具，显式禁止写文件、命令、素材修改，不全局跳过权限 |

证据目录均位于 `evidence/agents-models-20261023/`。WorkBuddy 的仅文字 XML“调用”、只配置成功及被权限拒绝的记录均保留，不算成功。

## 一幕中的模型与切换

- 新增顶部常驻下拉框，直接在 DeepSeek V4 Pro、Kimi K3、MiniMax M3 间切换。打开 AI 模型后编辑/试用的是当前选择；重启保留。
- 新增 MiniMax 服务商卡片。复用 Claude Code 的 DeepSeek 配置、Nomi 的 Kimi/MiniMax 配置。只导入官方域名，密钥不返回渲染页面。
- Nomi 与一幕使用不同 Chromium 配置加密密钥；Windows DPAPI 在当前用户下解密 Nomi，再用一幕 safeStorage 重加密。导入需要 PowerShell 7；已保存模型的调用不依赖它。
- 三个 API 均真实回答 137+286=423；源码独立库记录 `models-1792765246941/report.json`。MiniMax 还返回了其 think 标签文本，当前原样显示，不冒充只有最终答案。
- 切换仅控制一幕的大模型选择和文字试用；不自动改动外部智能体的模型，也不替换本地语义搜索模型。

## 官方图标

五家服务商与七款智能体均用官方图标，不再使用自制首字母。品牌来源见 `src/logos/SOURCES.md`；Kimi 官方图标本身包含 K 字形。仅图标进入产品，WorkBuddy 引擎测试副本位于忽略的 work 目录。

## 配置与回退

- Kimi Code 原 config.toml 备份为同目录 `.yimu-backup-1792765824688`，原 OAuth 模型保留；新增 `yimu/kimi-k3` 为默认。凭据使用 Kimi 原生 api_key 字段，未进入项目或证据；临时测试配置中的 Key 已清空。
- 一幕模型 Key 保存在用户数据目录 model-providers.json 的 Windows 加密字段；素材库、MCP 配置均不写 Key。
- 一幕源码回退到 0.7.47 可保留模型配置；需要撤销 Kimi 默认切换时恢复上述备份。未发布。
- 升级首次 exit 2：Harness 桌面持续重启 MCP 子进程，占用旧 YimuCraft.exe。停止本轮打开的空闲 Harness 后继续正式安装；不通过手工覆盖绕过安装器。

## 验收与工程范围

检查联网凭据、官方域名绑定、数据外发边界、真实第三方工具调用、UI 切换/重启、图标加载、安装/源码一致及素材完整性。未扩展登录、多用户、收费或公共发布。

核心 107/107；源码 UI 的加密保存、重启、401、改址清 Key、本地 AI/MCP 入口通过；客户端配置夹具仍通过。

- 正式安装：`evidence/upgrade-20261023-083419-657/install.json`，NSIS exit 0，注册 0.7.48，ASAR `611AB4FD80FAA7647FA895BF8823C35FE290367D9EC753AFA8E850D0DF9301E3`。此前两次占用失败留存。
- 正式三家 API：`models-1792766140248/report.json`，DeepSeek 4648ms、Kimi 12238ms、MiniMax 5864ms，均返回 423。全部官方图标加载成功，三项切换及重启保留，默认回到 DeepSeek。
- 最终一致性：`evidence/model-connect-20261023/final-1792766210411/report.json`，93 文件与安装一致；501 项素材全字段、文件夹偏好、应用偏好哈希相同。
- Kimi 持久配置：`kimi-user-search.jsonl`，使用原用户目录的新默认模型，再次真实返回相同 10 项和前三条，session_7609f9a7-3d58-45a1-9277-4021cd13191f。
- `host-proof.json` 证明 WorkBuddy 测试引擎与安装包文件 SHA-256 相同，保留三方真实调用参数；源码、脚本、测试、专项证据未检出本次使用的明文 API Key。

## 可复用经验候选（待确认）

行动：同一搜索分别保存客户端模型发起、工具结果和最终回答。结果：发现并排除 WorkBuddy 的 XML 伪调用与包装工具权限拒绝。原因：MCP 握手只证明连接，不能证明模型真正执行。验收：三方实际工具结果一致。反例：配置写入、Connected 或模型自称已搜索均不足。边界：本次只验只读搜索；不代表桌面操作、所有工具或以后版本兼容。
