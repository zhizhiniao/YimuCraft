# API Key 设置与国内智能体接入

2026-10-23（America/Denver），0.7.52。

顶部改为“AI 设置”，分为 API Key 设置与智能体接入。国内 10 家、海外 2 家及自定义 API 共 13 个入口；智能体 10 个入口，按用户最新确认使用 Kimi Work，不再展示 Kimi Code 卡片。原配置不迁移、不清空。

官方图标新来源与 SHA-256 见 [CONNECTION-LOGOS-20261023.md](CONNECTION-LOGOS-20261023.md)，其中 Anthropic/Claude 修订替代 src/logos/SOURCES.md 的旧版来源记录。

## API 模板与官方依据

| 服务商 | 默认基础地址 | 官方说明 |
|---|---|---|
| DeepSeek | https://api.deepseek.com | [官方文档](https://api-docs.deepseek.com/) |
| Kimi · 月之暗面 | https://api.moonshot.cn/v1 | [官方文档](https://platform.kimi.com/docs/get-api-key) |
| 千问 · 阿里云百炼 | https://dashscope.aliyuncs.com/compatible-mode/v1 | [官方文档](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope) |
| 智谱 GLM | https://open.bigmodel.cn/api/paas/v4 | [官方文档](https://docs.bigmodel.cn/cn/guide/develop/openai/introduction) |
| MiniMax | https://api.minimax.cn/v1 | [官方文档](https://platform.minimax.cn/docs/api-reference/text-openai-api) |
| 豆包 · 火山方舟 | https://ark.cn-beijing.volces.com/api/v3 | [官方文档](https://docs.volcengine.com/docs/ark/base-url-and-authentication) |
| 腾讯混元 | https://api.hunyuan.cloud.tencent.com/v1 | [官方文档](https://cloud.tencent.cn/document/product/1729/111007) |
| 百度千帆 | https://qianfan.baidubce.com/v2 | [官方文档](https://cloud.baidu.com/doc/qianfan-docs/s/Fm9l6ocai) |
| 硅基流动 | https://api.siliconflow.cn/v1 | [官方文档](https://api-docs.siliconflow.cn/docs/userguide/quickstart) |
| 讯飞星火 | https://maas-api.cn-huabei-1.xf-yun.com/v2 | [官方文档](https://www.xfyun.cn/doc/spark/Spark-X2.5.html) |
| OpenAI | https://api.openai.com/v1 | [官方文档](https://platform.openai.com/api-keys) |
| Anthropic | https://api.anthropic.com/v1 | [官方文档](https://console.anthropic.com/) |
| 自定义 API | 用户自行填写 | 自行选择协议 |

选择卡片只填表，不自动保存或调用，不自动导入本机密钥。导入为独立按钮。用户填写模型 ID；列表不支持时可手填。调用仍使用现有加密、地址变更清 Key、试用和取消机制。

## 智能体方式与边界

| 客户端 | 准备方式 | 官方入口 |
|---|---|---|
| WorkBuddy | 一键配置及手动模板 | [官方说明](https://www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Product-Guide) |
| DeepSeek Harness | 一键配置及手动模板 | [官方说明](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/mcp.md) |
| Kimi Work | 本地 MCP 手动步骤与配置 | [官方说明](https://www.kimi.com/help/plugins-and-skills/overview) |
| 千问办公 QwenWork | 本地 MCP 手动步骤与配置 | [官方说明](https://docs.qwenwork.ai/zh/desktop/connectors) |
| 百度搭子 DuMate | 通用配置与说明；本地 STDIO 兼容性待确认 | [官方说明](https://cloud.baidu.com/product-s/dumate_developement_platform.html) |
| Qwen Code | 一键配置及手动模板 | [官方说明](https://github.com/QwenLM/qwen-code/blob/main/docs/developers/tools/mcp-server.md) |
| Codex（本地） | 一键配置及手动模板 | 已有本机配置适配器 |
| Claude Code | 一键配置及手动模板 | 已有本机配置适配器 |
| Claude Desktop | 一键配置及手动模板 | 已有本机配置适配器 |
| Cursor | 一键配置及手动模板 | 已有本机配置适配器 |

- DeepSeek API 与 DeepSeek Harness 分列于两个分区；Work Body 按腾讯正式名称 WorkBuddy 展示。Codex 标明本地，不能将 Windows 命令用于云端。
- Kimi Work：本机 3.2.7 官方包 MCP 页面静态字段确认 STDIO、command、args、env。未操作用户 Kimi Work 配置，未宣称其模型实际调用通过。旧 Kimi Code 后端适配器保留以兼容历史，但用户界面不显示。
- REA 两次受安装包 unpacked 原生模块声明哈希与文件哈希不一致阻断（kimi-file-manager-selection.node），未绕过完整性以宣称可信；回退只读 @electron/asar 提取已定位 MCP 页面字符串，未执行目标代码。Windows ASAR 路径使用原始反斜杠。
- 百度搭子：官方平台确认 MCP，但未确认桌面版本地 STDIO 入口。若仅接受远程 URL，现有本机服务不能直接使用；界面明确标注待确认，不提供假的一键接通按钮。
- 千问办公：官方文档确认扩展/连接器、JSON 和 STDIO；本机未安装宿主，未做真实对话调用。Qwen Code 新增 .qwen/settings.json 备份合并，保留已有设置与服务器；实际宿主调用待验证。

## 验证

- 源码 UI：connections-1792804893488，13 模板、10 智能体说明、三种配置格式、官方图标解码、Qwen Code 隔离配置合并和真实新进程 MCP 探针、双向页签、小窗口无横向溢出通过；截图已查看。
- 原模型回归：evidence/models-20261023/1792804903677，真实本地 HTTP 列表/文字、Windows 加密、重启解密、401 脱敏与改址清密钥全部通过。没有调用付费厂商。
- 工程路由：凭据保护、外链允许列表、第三方配置不覆盖、UI 错误/键盘/布局与安装回归；无多用户、云代理或收费功能扩张。新增 connectionHelp 只接受目录中的类型/ID，不接收任意 URL；clientGuide 仅生成标准配置，无连接密钥。
- 核心 108/108。目录版 UI `connections-1792805039912`、安装版 `connections-1792805107883` 均通过；测试环境使用既有 --no-sandbox 夹具，不作为 OS 沙箱验证。
- NSIS exit 0，注册版本 0.7.52；104 个 src 文件与安装 ASAR 一致，安装 ASAR 与目录版相同。安装器 SHA-256 `17B7C140C61137E51AA88FD95FE5022B04AF05FA502FD976D85BFEE078624D45`；ASAR `1EAB1198885D80EE4F8646D18ABD52DCBD6BAB8BD6C7D4D1F7FC3AC3C5CA0CED`。
- 真实库 `final-1792805115473`：65,586 可见素材；66,244 全部素材记录全字段摘要不变。model-providers.json、preferences.json、library-config.json、agent/settings.json 升级/检查前后字节一致，原三家模型、Key、库与允许整理权限保留。
- 真实安装版双分区、所有 Logo、白名单官方外链调用与任意外链拒绝通过；未填/未保存新 Key，未改用户外部智能体配置，未发送付费请求。最终截图已查看，普通启动恢复供使用。

## 回退

可回装 0.7.51；配置格式不变，用户已有模型与 Key 保留。Qwen Code 配置前保存原文件备份；本轮仅隔离夹具写配置，没有批量改用户智能体配置。

## 经验候选（未固化）

行动：将服务商 API 与客户端 MCP 分区，并为每个客户端使用实际格式模板；结果：避免 Harness YAML 被当成通用 JSON，旧有入口也可直接找到。原因：模型品牌和智能体产品不是同一配置对象。验收：模板解析、真实 IPC/保存/重启及截图；反例：有 Logo 或 API Key 不等于客户端已连通；边界：模板准备与已测本机路径，不推广为所有客户端版本兼容。
