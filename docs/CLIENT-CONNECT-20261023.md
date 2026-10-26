# 一键客户端配置与真实模型验证

日期：2026-10-23（America/Denver），版本 0.7.47。

## 交付范围

- API 卡片：Anthropic、OpenAI、DeepSeek、Kimi，有自有识别图标；无可复用配置时预填地址与协议，仍需自己的 Key。
- 已有 API：从本机 Claude Code 的标准 settings.json 识别官方地址和 API 凭据；只返回安全元数据，点击导入后由主进程加密保存。不会将 OAuth/订阅登录令牌冒充 API Key。
- 智能体卡片：Codex、Claude Code、Claude Desktop、Cursor、WorkBuddy、Kimi Code、DeepSeek Harness。按照各客户端已存在的配置目录发现，未检测到时不写文件。
- 一键配置：备份旧配置，保留其他服务器，只添加/更新一幕条目；开启一幕本机服务时默认只读，然后执行独立 MCP initialize/status 验证。
- 界面明确区分「已有配置」「接口通过」「客户端待刷新」。不扫描进程后假称已经连接，也不自动重启用户智能体。

## 本机配置方式

| 客户端 | 写入方式 | 边界 |
|---|---|---|
| Codex | 官方 CLI mcp add，之后 get --json 校验 command/args | 当前自动定位 npm 安装的 CLI；自定义安装路径未覆盖 |
| Claude Code | 用户 .claude.json 的 mcpServers | 保留其他字段；需客户端刷新/重启 |
| Claude Desktop | Roaming/Claude/claude_desktop_config.json | 本机未检测到该标准目录，不假称已测 |
| Cursor | .cursor/mcp.json | 保留已有 MCP，实际应用重载未测 |
| WorkBuddy | .workbuddy/mcp.json | 与官网当前用户级路径一致 |
| Kimi Code | .kimi-code/mcp.json，尊重 KIMI_CODE_HOME | 针对新 Kimi Code；不是旧 kimi-cli 或任意桌面配置 |
| DeepSeek Harness | .dsh/cordis.patch.yml，尊重 DSH_HOME | 追加 insert/@deepseek-ai/dsh-mcp-client；含自定义 YAML 脚本时拒绝自动合并 |

JSON/YAML 写入前复核文件未被并发修改，备份保存在原配置旁；冲突的同名服务器拒绝覆盖。Harness 保留原 YAML 文本和注释，新增独立补丁。YAML 解析不执行脚本。

## 真实 API 验证

- 用户明确授权复用本机 API 并真实调用。读取本机 Claude Code 配置发现 DeepSeek 官方 Anthropic 兼容入口和 deepseek-v4-pro；密钥未进入聊天、脚本常量、日志或证据。
- 在 0.7.46 安装版独立库中，通过真实 UI 发送「计算 137 + 286，只输出结果数字。」到 https://api.deepseek.com/anthropic/v1/messages。
- 返回 **423**，界面显示试用通过；耗时 5627 ms。证据：evidence/model-connect-20261023/1792762490881/report.json 与 real-model.png。
- 首次测试脚本的 Electron evaluate 中 require 不可见；改用 mainModule.require 后通过。该次失败发生在请求前，证据保留。
- 上述为真实第三方模型请求，不是本机 HTTP 夹具。只验证短文本调用，不代表任意推理长输出或素材工具调用已通过。

## 源码与工程检查

- 106/106：新增 JSON 保留/冲突拒绝、Harness 合并/脚本拒绝、并发写入、备份、本机凭据脱敏与地址白名单测试。
- 源码 UI run 1792762881069：WorkBuddy、Cursor、Kimi Code、Claude Code、Harness 五种配置点击 → 独立文件 → 一幕 MCP status 全通过；保留无关字段、备份、卡片图标与 API 预填通过。
- API 凭据只从授权的标准来源读取，限制 HTTPS 官方域名，沿用原 Anthropic 协议和地址路径；不猜测中转商凭据属于谁。
- 客户端 MCP 配置不包含 API Key 或本机连接 token；沿用原本地连接文件。没有扩展一幕数据读写权限，没有素材外发、schema 或 Adobe 修改。
- 加入运行依赖 js-yaml 4.3.2。Windows 安装构建使用进程内 work/build-temp，避免上一轮默认 TEMP 问题。

## 官方参考

- [DeepSeek API 及 Anthropic 兼容](https://api-docs.deepseek.com/guides/anthropic_api/)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [WorkBuddy 用户级 MCP](https://staging.codebuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/MCP-Guide)
- [Kimi Code 配置](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files)
- [Harness 补丁位置与示例](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/mcp-memory.md)
- [Cursor 用户级 MCP](https://prod.cursor.com/help/customization/mcp)
- Codex 命令通过本机 CLI help 核对。DeepSeek 旧 Harness 文档域名返回 404，已改查官方 GitHub。

## 经验候选（待确认）

行动：先用已有 API 在真实安装版跑一条短文本，再实现客户端一键配置。结果：DeepSeek 返回 423，五种配置和 MCP 握手通过。原因：模型推理、配置写入、接口可用、宿主加载是不同环节。验收：真实回复/耗时、配置保留、回读参数、MCP status、客户端状态。反例：仅用本地夹具或发现进程就宣称连接成功。边界：各客户端实际模型调用仍需分别验收，不将本轮结果升级为所有宿主兼容。


## 正式安装与真实配置结果

- 0.7.46→0.7.47 正式 NSIS 升级成功；首次升级回执 upgrade-20261023-074402-264/install.json。
- 正式用户界面点击 DeepSeek「导入本机配置」→ 加密保存 → 发送同一算术问题 → 4158 ms 返回 423。重启保留；没有输出或存储明文密钥到证据。
- live-0.7.47/report-1792763126368.json：Codex、Claude Code、WorkBuddy、Kimi Code、Harness 五个真实配置的一键按钮和独立 MCP status 全通过；83 源码文件与首次安装一致，501 项素材及偏好不变。
- Claude Code 自身 mcp get 回报 Connected，证据 live-0.7.47/claude-client.json。其余客户端运行时热加载和模型使用工具仍未验；配置存在不代表客户端已加载。
- config-preservation.json：Codex TOML、Claude Code JSON、WorkBuddy JSON 排除一幕条目后的全部字段与备份相同；Kimi/Harness 原本无该 MCP 文件，本轮新建。
- 纠正旧记录：此前 Codex 注册虽有效，但旧参数被合成一个字符串，不能当作实际可用证据。本轮用直接 execFile 参数数组写入，官方 get --json 校验三个参数分别正确；不沿用旧结论。
- 长服务商名称实际截图暴露 nowrap 溢出，已增加折行；源码 run 1792763233660 通过长文本布局和既有 API 链路，随后重建相同 0.7.47 修订安装包。没有为纯样式修订重复付费调用。
- Cursor 本轮只在独立配置夹具中验证，未替用户写入正式 Cursor 配置；Claude Desktop 标准目录未检测到。图标为自有识别符号，不是官方商标授权声明。

## 回退

- 软件可回退 0.7.46；原素材库无 schema 变化，新增客户端模块不影响数据格式。
- 客户端配置原文件旁有 .yimu-backup-*，恢复前先核对是否有用户后续修改；也可只移除 yimucraft 条目。不要覆盖后续修改或恢复整份旧凭据。
- Harness 新增补丁 id 为 yimucraft-mcp；Kimi 新增服务器为 yimucraft。撤销时只移除该项，保留其他新增项。


最终样式修订已安装：upgrade-20261023-074931-381/install.json，NSIS exit 0；final-1792763412378/report.json 核对 83 个源码文件一致、长名称不溢出、真实模型验证与密钥保留、501 素材及偏好不变。修订未改变协议请求，未重复进行付费试用。最终截图已查看。
