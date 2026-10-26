# 一幕工程审查与优化

日期：2026-10-23（America/Denver）。证据：`evidence/engineering-review-20261023-r1/`。基线为当前 0.7.39 工作区，不是 Git HEAD；开工已有未提交改动，均保留。

## 结论与范围

按 AGENTS → ENGINEERING-REVIEW 路由审查本地素材管理、文件安全、Electron/后台通信、AI 依赖和打包入口。发现 8 项值得处理的问题，6 项已在源码修复/加固，2 项保留专项验证与设计缺口。不表示完整渗透测试或所有格式兼容验收。

未观察到当前产品的在线账户、租户、收费或云服务后端；企业 SSO/SAML/SCIM、账单税务、多区域、医疗及支付合规不作为本次补功能要求。本地 AI 是固定版本模型推理，本轮不引入 SaaS 的费用限额或提示词审批系统。

## 按风险排序的发现（严重程度为本项目判断）

| 编号 | 严重程度 | 具体触发、影响与代码依据 | 证据与处理状态 |
|---|---|---|---|
| R01 | P1 数据丢失 | `src/trash.cjs:5`：永久删除一个已单独入库的文件时，只保护共享依赖目录，没有检查该文件是否被其他条目用作 cover/preview/cover_override 或 bundle 内的文件；会损坏保留素材。 | 四种关系均在修复前复现；已在移动任何文件前拒绝整次删除，四项回归及重开后字节/索引核对通过。 |
| R02 | P1 执行边界 | `src/main.cjs:103` 原黑名单遗漏 HTA、MSI、COM、SCR、CPL、URL 等系统可执行/关联类型；用户“打开”这类素材可启动额外程序。需要用户触发，不是声称远程自动执行。 | 已改为 `src/safe-open.cjs` 按真实路径扩展名的允许列表；测试覆盖 22 种危险/未知类型及常用文件。真实 IPC 的 HTA 请求被拒且未调用 shell。不是内容杀毒，允许格式仍依赖其阅读器安全性。 |
| R03 | P1 依赖风险 | `package-lock.json` 原 sharp 0.34.5；`src/semantic.cjs:12` 对素材调用 RawImage.read，底层原生解码依赖命中已知漏洞。 | npm 通告命中与调用链确认，未运行恶意利用。通过 transformers 定向 override 升 sharp 0.35.5；固定模型、PNG 解码、推理、索引与离线重开通过。部分通告的 RCE 条件为 glibc Linux，不能据此断言 Windows 可远程执行。 |
| R04 | P2 不可用 | `src/main.cjs:128` 原来只在 error 时清空已有请求，没有 exit 状态；后台正常/异常退出后新请求仍可进入 pending，界面持续等待。postMessage 序列化错误也会留下 pending。 | 新增 `src/worker-requests.cjs` 统一保存失败状态、拒绝当前和后续请求、清除发送失败项。真实 Worker 的退出/崩溃和 Electron 实际后台终止均通过；不自动重放可能已提交的修改。 |
| R05 | P2 发布质量 | `package.json:14` 原打包钩子只构建品牌和模型视图，没有测试门禁；失败测试也不阻断常规 npm 打包入口。测试默认临时目录另导致 FFmpeg 夹具创建失败。 | prepackage/preinstaller 增加 npm test；`scripts/test-core.cjs` 将临时文件隔离到项目内。原回归 81/82，失败为 temp 目录权限；修正后 82/82。直接调用 electron-builder 可绕过 npm 钩子，不声称已建立不可绕过的 CI。 |
| R06 | P2 宿主结果未知 | `src/premiere-bridge.cjs:9`：90 秒无回执后 finally 清除 busy，即使 PR 仍在执行；再次操作获得新请求 ID，可能重复插入或与前次操作重叠。 | 静态确认解锁路径，实际 PR 重复操作尚未复现，故不称实测事故。未修：需要针对“已执行但回执丢失”校准宿主回执、持久未决状态及人工解除方式，不直接加自动重试。 |
| R07 | P2 升级恢复缺口 | `src/library.cjs:28`：启动分条执行多次 ALTER/CREATE，没有集中 schema 版本和升级前快照/整组迁移事务。进程中断或失败可留下部分升级状态，难判应使用哪一版本恢复。 | 静态确认；现有加列检查可重入，已有索引备份/恢复，不能误报“没有备份”或“升级必定丢数据”。未修：需旧 schema 样本和中途故障注入，先定义恢复而非盲加 DROP 回滚。本次不改变 schema。 |
| R08 | P3 潜在依赖风险 | `package-lock.json` 原 yauzl 3.2.0 的 NTFS 时间戳解析存在边界错误。 | 已升 3.2.1 并验证 ZIP 往返/拒绝越界。本项目 `src/archive.cjs` 未调用通告要求的 getLastModDate，当前触发链无法确认，不冒充已发现可利用崩溃。 |

本轮无 P0 结论。R01–R05、R08 为源码已处理；R06、R07 不因其他测试通过而关闭。

## 验证与限制

- `shared-before.tap`：四种共享关系修复前失败，真实独立文件受影响；`targeted.tap`：14/14 通过（删除、后台、打开、ZIP）。
- `regression.tap`：81/82，FFmpeg 写系统短名临时路径被拒；`regression-workspace-temp.tap`：修正测试目录后 82/82。原失败保留。
- `source-ui-attempt1.json`：测试注入使用不可用 require 失败；改用 Node 内建模块入口后 `source-ui.json` 通过。不是产品失败，也没有通过改延时掩盖。
- `ai-local.json`：真实本地 Chinese-CLIP、真实 PNG、索引保存、源目录离线、关闭重开通过；仅一个颜色样本，不代替语义质量评估与格式矩阵。
- npm 镜像 audit 端点不支持已保留错误，随后显式使用官方 registry。`npm-audit-final.json` 为 0 个已知漏洞；不是无未知漏洞或所有二进制安全的保证。
- 目录版打包与原生依赖验收见本报告末尾最终记录；测试 helper 在本机使用 `--no-sandbox`，不证明生产 OS 沙箱通过。
- 正式安装、干净机器、Adobe 操作、全量旧版本升级、所有字体/媒体格式、权限与网络渗透未测。未修改用户素材库，未发布 GitHub，未替换现用安装。

## 已存在且保留的保护

主窗口 contextIsolation、nodeIntegration:false、sandbox:true；IPC 主窗口主 frame 校验、命令允许表、导航和新窗口禁止；SQL 值参数化、ZIP 真实路径与数量/大小限制、软删除及删除恢复日志、索引备份恢复；本地 AI 固定模型 revision。存在不代表所有边界已完整验证。

## 依赖证据

- [sharp / libvips 通告](https://github.com/advisories/GHSA-f88m-g3jw-g9cj)：不可信输入的解码依赖风险。
- [sharp / libheif 通告](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)、[librsvg 通告](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)：保留各自平台和触发条件，不把 Linux 条件直接套到 Windows。
- [yauzl 通告](https://github.com/advisories/GHSA-gmq8-994r-jv83)：3.2.1 修复；当前模块未发现 getLastModDate 调用。

## 规则落地与回退

AGENTS 中保存触发入口，ENGINEERING-REVIEW 保存任务路由，ENGINEERING-CHECKLIST 保留完整原始条目。普通任务只检查相关主题；本轮明确要求工程审查才扩大检查。不安装额外技能，不修改全局记忆。

回退时仅撤销本轮改动，参考 evidence 中 before 备份和本报告文件清单；不能 git reset 丢弃开工已有未提交功能。依赖回退需同步 package/lock 和 npm 安装；会重新引入已知风险。本轮无 schema 变更，无需数据降级。

## 经验候选（未升级为通用已验证经验）

行动：构造共享文件关系及后台退出故障，再写回归。结果：查出直接文件引用遗漏与死后台请求悬挂。原因：原测试覆盖独占删除和正常响应，未覆盖共享与退出边界。验收：修复前失败、修复后真实文件/重开与 IPC 通过。反例：仅检索是否存在“回收站”“error handler”。边界：本机样本，不证明完整破坏恢复或全部格式安全。

## 最终目录版记录
- npm run package -- --config.directories.output=work/engineering-review-package-r1 成功；最终依赖下 82/82 测试通过，日志 package.log。
- packaged-ui.json 通过：实际 IPC 拒绝 HTA、真实后台终止后的当前/后续请求拒绝、打包原生 sharp + 本地 Chinese-CLIP 推理检索通过。
- 目录版路径 work/engineering-review-package-r1/win-unpacked/YimuCraft.exe；版本号保持 0.7.39，仅作隔离验收，不替代现用安装或声称已交付正式升级。
- 目录版一致性：72 个 src 文件哈希全部一致；运行入口、版本、依赖元数据一致。ASAR SHA-256 为 6a4b0503ba6101cfa09831446b2fc82ef289fb46eb70308ac0f695b94c0c3cea，见 package-consistency.json。
- 校验脚本首轮误用正斜杠访问 Windows ASAR 条目，改用原生分隔符后通过；package.json 被打包器正常移除开发字段，字节不一致，已改为核对运行元数据。未把校验器错误当作产品缺文件。

## 后续关闭记录（0.7.40）
R06/R07 已于本轮恢复专项修复并更新本机安装。此前“未修/未安装”段落保留为历史记录；当前事实见 RECOVERY-20261023.md。90/90、真实 PR 延迟回执仅执行一次、数据库故障注入/恢复及安装版 IPC 通过；正式库 501 项字段和偏好不变。此前六项一并安装，未发布 GitHub。
