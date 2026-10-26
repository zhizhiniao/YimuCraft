# 桌面智能体接入续验

## 范围与结果

2026-10-23 America/Denver。初始要求继续打通 Kimi Work、千问办公、百度搭子；后续用户明确“跳过”，以 WorkBuddy 流程为基准。保留原三个接入入口，不为未知存储结构盲写配置，不标全部实测通过。

WorkBuddy 官方自带引擎与安装包逐字节哈希一致。使用已有模型设置、仅加载现有 yimucraft MCP 条目，真实调用 ToolSearch → DeferExecuteTool → yimu_search({q:"Logo",limit:3})。正式库返回 total=265：41561 / 2251489 Cosmo Logo 2.mp3；41560 / 2267404 Soft Opening Logo.mp3；41564 / 237828 Sky Logo Intro.mp3。原 MCP 配置字节未变，未修改素材。桌面鼠标输入未验。

复核：`node scripts/workbuddy-recheck.cjs`。证据：`evidence/workbuddy-recheck-1792807918067/report.json` 与 `host.jsonl`。只沿用搜索及包装工具临时允许规则，没有关闭全局权限检查；仅用原有凭据，不复制 Key。

## 调研证据与限制

- 本机 Kimi Work 3.2.7 自带 Daimon 0.5.50，有独立配置与控制服务；不能把 ~/.kimi-code/mcp.json 当作桌面端配置。只读取配置键结构，未输出凭据。
- REA 定向分析 MCP 页面完成；证据 ev_2d159c7a11b8d87ff4b424d91bca492d04b84757833b8e5c555c6ee92fc82fc4。包中 8 个 native 文件完整性元数据与观察字节不一致，使用 record-and-continue 保留限制；静态结构不能证明实际运行。
- 常见安装位置及 HKCU/HKLM 卸载注册表未发现千问办公、百度搭子。官网入口 https://qwenwork.cn/download 与 https://dumate.baidu.com/ 已核对；本轮未下载/安装。
- 包含 Kimi 启动和千问安装包下载的组合命令被自动审批拒绝，仅返回 blocked by policy。未尝试绕过；用户随后明确跳过安装/登录/实机接入。

## 工程与回退

本轮仅新增定向复核脚本并更新 HANDOFF/PARITY/USAGE。安装版本保持 0.7.52，不重打包。脚本保存唯一 run ID 证据，不覆盖旧成功或失败；可直接停止使用脚本，无用户配置需要回退。

经验候选沿用 AGENTS-MODELS-20261023.md：行动为保留真实工具调用/结果；本次结果为正式库命中 265；原因是库切换后旧命中数已不适用；验收为实际 tool_result；反例为仅握手或模型自称成功；边界为本次搜索，不代表所有桌面端兼容。未经确认不升级为通用已验证经验。
