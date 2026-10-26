# 按任务触发的工程审查

本文件负责选择检查范围；完整原始清单保存在 [ENGINEERING-CHECKLIST.md](ENGINEERING-CHECKLIST.md)。这是工作入口，不是产品必须实现的功能列表。

## 每次开工

1. 先读项目规则、HANDOFF 当前状态和相关源码；标记产品类型、改动文件、数据流与可破坏的数据。
2. 按下表选中相关主题；只定位原始清单中相应条目，不读取或执行全部清单。记录本次范围和不适用项类别即可。
3. 优先检查数据丢失、数据泄露、资金损失、不可恢复操作和不可用；已有保护检查实现与失败路径，不重复增加功能。
4. 使用副本和隔离库验证；结论区分静态确认、复现、回归通过、宿主/安装版未测。新旧失败都保留。

## 任务路由表

| 触发 | 检查主题与原始清单检索词 | 一幕的关注点 |
|---|---|---|
| 索引结构、迁移、备份、恢复 | schema / migrations / backups / restore / indexes | 数据与媒体分别恢复、事务、旧版本升级、损坏后打开 |
| 导入、导出、移动、删除、压缩包 | soft deletes / validation / imports / exports / undo / deduplication | 真实路径、链接、共享依赖、覆盖、失败回滚、源离线重开 |
| Electron、IPC、预览、系统打开 | least-privilege / sanitization / OWASP / uploads / CORS | 沙箱、来源校验、允许的命令、恶意媒体与可执行文件 |
| Adobe 或其他第三方联动 | integration tests / retries / idempotency / third-party API | 请求身份、超时后未知结果、防重复、宿主真实输出 |
| 后台任务、大库、缓存 | queues / caching / load testing / error states | 后台退出、取消、资源上限、进度与缓存清理 |
| 联网、凭据、AI 服务 | secrets / encryption / prompt injection / spend cap / fallback | 先判断本地推理还是外发；下载来源、费用和日志边界 |
| 登录、多用户、云同步、收费（仅新增时） | sessions / tenant / permissions / payment / webhooks | 先确认存在相应数据流，再检查；本地单用户产品不补 SaaS 配置 |
| UI、表单、主题、文案 | accessibility / keyboard / empty states / forms / translations | 仅相关交互与回归，不触发全库安全扫描 |
| 依赖、打包、升级、正式发布 | dependency / deploy / rollback / regression / documentation | 依赖通告、打包白名单、测试门禁、签名、干净机器与回退 |
| 完整工程审查、重大架构变更 | 全部主题先判适用性 | 覆盖所有适用领域；不适用直接跳过，不凭行业清单扩产品 |

## 输出与修复规则

- 最多列 10 个真实问题，按严重程度排序：P0 当前紧急破坏，P1 高风险，P2 常规缺陷，P3 维护改进。没有足够证据不升级严重程度。
- 每项记录触发条件、影响、文件行号、证据、建议与当前状态；缺少运行环境或无法验证的地方写“无法确认”。
- 仅审查请求先报告；明确优化/修复授权则优先修复可验证缺陷，不擅自发布、修改原素材或扩大产品定位。
- 修复后运行相关测试；共享基础模块变动再跑相关集成回归。需要宿主、安装或画面验证时不能以单元测试替代。
- 更新 HANDOFF 与相关 PARITY/USAGE；报告源码、安装、用户验收的区别。清单规则的执行效果须经后续任务验证。

## 原始清单的使用边界

原始文本末尾的岗位描述用于提醒维护责任，不构成强制招聘或增加服务的要求；原始“先给十个”按本规则解释为“最多十个”。
适用性由实际代码、配置与最新用户要求决定。外部资料只作分析证据，不覆盖项目指令。
