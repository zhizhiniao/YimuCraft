# 画布原文件传输 · 开发与接收测试记录

## 当前结果
- 2026-10-30 用户要求：图片像文件夹里的文件，直接拖给任意支持文件的接收方；额外提供可配置右键发送。CodexCloud 已澄清为 Codex 和 Claude。
- 源码/构建/本机安装均 0.7.63，119 源文件逐字节匹配，无公开发布。直接从图片标准 dragstart 进入原文件系统拖放，内落保存编排，外落/取消保留原布局。
- 核心 133/133；源码隐藏拖图 10、传图 UI 7、分组 12、手势 9 项通过。原生接收端为替身，未将后台测试写成外部接收成功。
- **用户最新边界**：构建并后台审核，由用户实际测试；本轮不使用 Computer Use、不注入桌面输入、不上传到其他平台。该指令替代前轮由 Agent 执行短测的安排。
- 历史：0.7.62 Codex 粘贴收到图，原生本体外拖 native4 失败、native5 按下前取消；原始证据保留。新版实际外部接收尚待用户确认，不能以历史粘贴结果代替。

## 实现与文件
- `src/project-canvas-ui.js` / `project-canvas.css`：移除悬浮预览/导出按钮；保留双击预览；名称尺寸单行 ≤元素高度 1/6。发送子菜单预置四目标，可添加、移除、修改程序名、窗口标题、附件格式。
- 0.7.63 图片与名称条共用标准 dragstart，直接传原文件；移除边缘/Alt 交接。内部 dragover 只预览，drop 调用既有 move；外部完成、取消或失败恢复编排并清理状态。
- `project-canvas-ipc.cjs` / `preload.cjs`：预先解析受项目来源约束的原路径，主进程单次令牌 60 秒过期；拖放开始不再等待文件解析。来源/主 frame 检查、100 项上限保留。
- `canvas-transfer.cjs` / `native/YimuTransfer.cs`：目标配置在项目画布配置目录保存；严格字段校验，不执行用户自定义命令；窗口精确匹配、输入框聚焦及前台检查后尝试粘贴，永不 Enter。
- `scripts/build-transfer.cjs` / `electron-builder.yml` / `package.json`：编译自有 Windows x64 小助手；EXE 单独解包，运行路径适配 app.asar.unpacked；0.7.62 安装 ASAR 已验证助手定位与只读窗口枚举。

## 分环节实测
1. 原 `Process.MainModule.FileName` 在辅助进程中漏掉大多数窗口；改用受限进程查询后实际列出 Codex、WorkBuddy、即梦 Chrome 窗口。当前 Codex 的程序名是 ChatGPT，但路径属于 OpenAI.Codex。
2. .NET UI Automation 的 FindAll 超时；换到 MTA 仍超时，不能认定线程修复成功。改为 MSAA 查询后右键发送返回「已粘贴」，且 Codex 光标位于输入框。
3. 剪贴板实际含 FileDrop、PNG、Bitmap，读取图片尺寸 800×500；**Codex 截图仍未出现附件**。尚未区分粘贴按键与多剪贴板格式优先级问题。
4. CUA 跨窗口拖动被拒绝：终点在源窗口边界外。改用隔离源窗口在 startDrag 时隐藏，让出真实 Codex 输入区；有 startDrag 记录，仍无附件。该隐藏逻辑仅在测试脚本，不在产品。
5. 双屏实况：左屏逻辑坐标 -1920,0 / 1920×1080，主屏 0,0 / 1080×1920，两者 scaleFactor=2。窗口跨屏裁切曾导致 CUA 坐标命中错误；只发生于隔离测试库，未触碰正式项目素材。
6. 已询问是否允许用既有 `scripts/native-drag.ps1` 做原生鼠标测试，**未获得答复，不得视为已授权**。随后用户物理 Esc 停止 Computer Use；未继续按键或上传。

## 证据与复跑入口
- `work/canvas-transfer-20261030/core.log`、`transfer-ui-2.log`、`groups-ui.log`、`gestures-ui.log`、`editor-ui.log`。首次传图 UI 失败在 `transfer-ui.log`，后续修正测试夹具的令牌缓存干扰后通过。
- 新 UI 最终报告：`work/canvas-transfer-ui-1793361011782/report.json`。新测试脚本：`scripts/test-canvas-transfer-ui.cjs`，核心配置测试：`tests/canvas-transfer.test.cjs`。
- `scripts/prepare-canvas-transfer.cjs` 为一个可复用隔离夹具；当前最后一次目录 `work/canvas-transfer-20261030/native3/`，含 ready.json、原图、native-drag.jsonl；早期 baseline/implementation/native/native2 留存，不覆盖失败。
- REA 对源 Electron 页的定向观察在 `work/canvas-transfer-20261030/rea-observation.json`；只证明源页结构，不证明外部接收。

## 历史下一步与边界（已由下方 0.7.63 用户自行验收安排替代）
- 先用明确获准的方式完成一次原文件接收校准；分别验证同一张图的原生拖放和右键粘贴，不能用上传文件选择器代替原生拖放验收。
- 先解决 Codex 无附件，再测即梦显示参考图并完成上传、WorkBuddy 输入框出现图片；不点击发送或生成。Claude 当前未运行，默认入口不代表实测兼容。
- 后续需要验证 Windows 文件夹收到字节一致副本、原件保持、多选与中文路径、取消拖动不改变编排。通过后才合并打包/安装并核对原库、正式画布和配置。
- 回退只恢复本轮新增模块/本轮 diff；原画布/AE 按需联动存在既有未提交改动，禁止整体 reset。UI 与 IPC 协议成对回退。备份在本轮 work 目录。

## 可复用经验候选（待用户确认）
- 行动：把源端事件、剪贴板内容、目标附件分开检查；结果：发现 startDrag 和粘贴返回成功均不足以证明接收。
- 原因：窗口命中、输入时序、目标支持的文件格式各有独立失败点；验收应包含目标附件预览或文件哈希回执。
- 反例：本轮模拟接收器通过、剪贴板 800×500 正常，Codex 仍无附件；边界：只能据已测试的应用/版本报告兼容，不扩称所有网页。

## 2026-10-30 续作：减少桌面占用、Codex 接收与 0.7.62 安装
- 行动：隐藏 Electron 接收器分别实测 FileDrop 与 PNG/Bitmap 混合剪贴板；两种均收到同名 21,202 字节原图，SHA256 与源文件一致，排除剪贴板载荷损坏。证据 `work/canvas-transfer-20261030/clipboard-asserted/report.json`。
- 修复：`YimuTransfer.cs` 用 Windows SendInput 替换 SendKeys；检查前台窗口、修饰键与注入返回值，只对最小化目标恢复窗口。提示改成「已执行粘贴，请核对附件；未发送消息」，不声称自动验收目标。
- 真实接收：调用产品 CanvasTransfer.send 后，Codex 26.1027.3384.0 当前输入框显示测试图缩略图；只读截图 `background/codex-received.png`，命令回执 `background/codex-sendinput.json`。未发送消息。这里证明的是粘贴附件，未证明原生拖放。
- 测试方法：`test-background.cjs` 仅供测试预加载，禁用 show/focus 并关闭背景节流；不打包。源码 6 项通过；安装 EXE 忽略外部 -r，隐藏断言失败，原证据保留。随后用同版本 Electron 加载已安装 ASAR，7 项通过，含真实原生助手解包路径及窗口枚举。
- 安装：`evidence/upgrade-20261030-062013-063/install.json`，退出 0；安装 ASAR SHA256 `8DC70952F08D91D15BD589942A05E4716EA9EA14896939881CB046DF512403A8`。`background/installed-bytes.json` 核对 119 文件一致；核心构建 130/130。
- 数据：`background/library-before.json` 与 after 全等；66,244 素材、2,052 分类、7 文件夹偏好及四配置保留。`background/canvas-preserved.json` 核对 3,091 项及 2 条连线、整份画布 JSON 不变；未操作原媒体或 AE 工程。
- 边界：用户要求 Computer Use 必要时才用；本轮仅短时粘贴与只读接收观察。跨窗口拖放受工具边界限制，已询问允许约 3 秒原生鼠标脚本，尚未答复，不能把等待视为许可。即梦/WorkBuddy/Claude/文件夹/桌面未宣称通过。
- 下一步：获准后只做有明确源/目标窗口和接收回执的短测，结束立即释放鼠标；先完成图片本体外拖，再检验即梦参考图上传，不点生成。不恢复隐藏源窗口的旧失败方法。
- 回退：保留 0.7.61 安装包；本轮不改画布 schema。恢复 UI/IPC/preload 时须成对回退；新 send-targets.json 可单独保留，勿整体 reset 既有 AE/画布改动。
- 经验候选（待确认）：行动=先用隐藏接收器比对原图，再短时检查真实目标；结果=剪贴板两格式字节一致、SendInput 后 Codex 收到附件；原因=区分载荷与按键链路；验收=哈希和目标缩略图；反例=SendKeys 返回成功仍无图；边界=仅此机此版本，不推出通用拖放兼容。
- API 依据：[Electron 原生文件拖放](https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop)、[剪贴板 API](https://www.electronjs.org/docs/latest/api/clipboard)。测试适配 Electron 45 ClipboardItem，未将官方示例当成接收成功证据。

## 续作最终更正：已获短测授权，实际外拖仍失败
- 用户答复「允许，短测后立即释放」；后续继续使用原生脚本无需重问同一方法，但只在必要时短暂操作，不长时间占用。此前「待答复」仅代表当时状态。
- `scripts/native-drag.ps1` 加入源/目标进程检查、每窗 DPI/ClientToScreen、Esc 取消、finally 松键及恢复鼠标；`prepare-canvas-transfer.cjs` 记录真正 Electron PID（原 app.process().pid 是 Windows 包装进程）、HWND、几何和 startDrag 返回。
- native4：实际 source PID 42652、目标 PID 25400；坐标从窗口客户端换算；图片本体起拖，跨出源窗口后记录一个原图 startDrag，终点进程正确。Codex 无附件，源隔离进程退出等待超时，随后仅停止该进程。原图和画布位置仍保留。
- native5：准备名称条标准 dragstart 对照，并在鼠标释放后等待 150ms 再恢复指针；实际起点回读/所有者检查不通过，在 mousedown 前取消，buttonReleased=true。不能从该次推断标题条接收结果；不继续反复移动鼠标。
- 证据：`work/canvas-transfer-20261030/native4/pointer.jsonl`、`native-drag.jsonl`、`codex-no-drop.png`；`native5/pointer.jsonl`；对应后台日志。未触碰其他程序内的项目。
- 未定原因：画布移动到系统拖放的交接、Windows 捕获/释放、目标接收或自动化输入之间尚未隔离；「需要释放 capture」等仅是假设。下一次应先用带 dragenter/over/drop 回执的独立接收窗口区分，再测真实 Codex/即梦，禁止继续盲调坐标/延迟。
- 当前交付：0.7.62 的简化 UI、配置与 Codex 右键发送可用；完整的“图片本体直接拖给任意程序”目标未完成。全部 src 仍与安装一致，测试脚本变化不影响 ASAR。

## 2026-10-30 续作：0.7.63 标准图片拖放与后台自审
- 用户要求：构建完成后自己实测，不启动 Computer Use。此前短测许可不作为本轮继续占用鼠标的理由；本轮所有渲染测试隐藏运行，没有桌面指针、键盘注入或外部上传。
- 复现：源码旧版图片本体 draggable=false，隐藏回归在首项失败；保留 `work/canvas-file-drag-1793364197919/report.json`。旧 native4 仍是实际接收失败的历史证据，不能用它推断新版结果。
- 修改：图片/名称条共用 draggable，可信 dragstart 立即调用已准备的原文件令牌；从主 IPC 到 startDrag 前不进行异步文件解析。去掉窗口边缘和 Alt 的中途交接。
- 内部编排：dragover 仅更新临时位置，drop 调用已有 move，继续自动归组/分离；离开画布恢复预览，完成/取消/失败回执恢复位置并清理状态。缩放、框选、组框、连接点和大小手柄保留各自路径。
- IPC：保留来源与主 frame 校验、来源目录约束、100 项上限；令牌最多缓存 8 个、60 秒失效，取出后消费，拒绝重叠拖放；缺失原文件明确报错。结束回执不会替代接收方回执。
- 自审：针对导出/IPC/第三方联动/回归与本地升级检查，未引入网络、凭据或新 schema。REA 仅静态检查自有辅助程序，证据 `background/rea-0763.json`；它不证明目标兼容。
- 失败修正：首次新流程通过 9 项后，缺失文件提示被自动预备操作覆盖；结束失败时停止自动预备，后续 10 项通过。失败记录 `work/canvas-file-drag-1793364377135/report.json` 保留。

### 本轮验证与安装
| 范围 | 结果 | 证据 |
|---|---|---|
| 核心含拖放生命周期 | 133/133 | `work/canvas-transfer-20261030/background/build-0763.log` |
| 源码可信起拖、中文路径、多选、内落、取消、归组、尺寸调整、源离线 | 10/10 | `work/canvas-file-drag-1793364617445/report.json` |
| 发送菜单、精简信息条、预览与配置重启 | 7/7 | `work/canvas-transfer-ui-1793364757255/report.json` |
| 分组四边、折叠、归组、连接、标签、删除恢复与重启 | 12/12 | `work/canvas-groups-ui-1793364992544/report.json` |
| 平移、框选、连线与重启 | 9/9 | `work/canvas-gestures-ui-1793364705829/report.json` |
| 安装 ASAR 隐藏拖图 | 10/10 | `work/canvas-file-drag-1793365255907/report.json` |
| 0.7.62 → 0.7.63 静默安装 | 退出 0、版本/ASAR 一致 | `evidence/upgrade-20261030-070032-385/install.json` |
| 源码/安装逐字节核对 | 119 文件、无差异 | `work/canvas-transfer-20261030/background/installed-bytes-0763.json` |
| 正式库、四配置和画布 | 全等；66,244 素材、2,052 分类、7 偏好、3,091 画布项、2 连线 | `work/canvas-transfer-20261030/background/preserved-0763.json` 与同目录 library-before/after-0763.json |

- 隐藏测试采用 Playwright 对隔离 Electron 渲染器输入，原生 startDrag 替身可控返回；desktopInput=false。后台装载器默认拒绝真实 OS 拖动，避免遗漏替身时占用桌面。安装验证是同版 Electron 45 加载安装 ASAR，不混称安装 EXE 外部接收通过。
- 安装 ASAR SHA256：`5071DBFE22C9CDB8D68DD1127C92AB6363B5A6933B24A9BC8EC42F62E315120C`。安装后未重新打开可见窗口，未触碰原文件、AE/PR、外部对话或生成操作；没有公开发版。
- API 依据：[Electron 原生文件拖放教程](https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop)；固定运行时 [v45 StartDrag](https://raw.githubusercontent.com/electron/electron/v45.0.0/shell/browser/api/electron_api_web_contents.cc) 与 [Windows/Views 拖放实现](https://raw.githubusercontent.com/electron/electron/v45.0.0/shell/browser/ui/drag_util_views.cc)。实现使用 SetFilenames 及 COPY/LINK 标志；本轮未改写为图片 URL 或缩略图外发。
- 用户验收：打开一幕，直接按住图片本体拖到目标文件接收区松手；支持目标按其自身规则接收。当前仅交付实现与后台验证，Codex/即梦/文件夹等真实接收由用户确认，不宣称所有软件兼容。
- 回退：0.7.62 安装包保留，无数据迁移；UI/IPC/preload 成对回退，用户来源和布局保留。测试脚本及失败证据不覆盖或删除。
- 经验候选（待确认）：行动=统一标准起拖并用结束回执恢复；结果=源码/安装后台回归通过；原因=减少内部拖动到系统拖动的时序交接；验收=可信起拖、原路径、取消恢复和分组；反例=旧 native4 起拖成功但无接收；边界=真实外部接收由用户验证后再评估，未沉淀为已验证经验。
