# 验证记录 — 2026-10-21

本记录区分核心逻辑、真实桌面、Adobe 宿主和安装后运行。通过单项不代表完整 1:1。

## 核心与桌面

- `npm test`：30 个测试通过。覆盖导入、搜索、元数据重启、备份恢复、分类、哈希重复项、ZIP、安全路径、分类迁移、真实文件重命名和像素搜索。
- `scripts/smoke.cjs`：9 项桌面检查，包括 H264 时间推进、WAV 解码、真实波形、标签搜索、回收站、重启持久化及窄窗口无横向溢出。
- `library-management-ui.json`：菜单标签合并、切换空库、备份恢复、源文件不变。
- `context-menu-ui.json`：右键保留多选；复制真实 Windows FileDropList、Unicode 文件名和路径；回收站恢复不删源文件。
- `rename-ui.json`：F2 实际重命名；同名错误显示在弹窗内；原文件内容与占用目标文件保留。
- `visual-ui.json`：菜单建立像素索引，真实红蓝图片筛选及重置。`visual-search.test.cjs` 另验证相似图排序、索引复用、取消和重启。
- `media-preferences-ui.json`：兼容视频真实播放、偏好重启持久化、关闭到托盘及恢复；当次为 0.3.0 打包 EXE。

## AE 与真实迁移

| 证据 | 已验证内容 |
|---|---|
| ae-integration.json | 真 AEP 含 PNG/WAV；收集哈希一致；旧路径离线后重开零缺失 |
| ae-ui.json | 桌面发送 AE、收集导出 ZIP、重导入、宿主重开验证 |
| ae-edge-cases.json | 同名不同目录素材、12 帧数字序列、代理、帧率与 15 个文件哈希 |
| ae-selected.json | reduceProject 裁剪选中合成；原工程仍保留两个合成 |
| ae-font.json | ArialMT 应用到真实所选文字层 |
| ae-presets-scripts.json | FFX 对两个选中层各应用一次；两个文字关键帧换字体且内容/时间不变；自有 JSX 真执行 |
| installed-migration.json | 安装后 EXE 导出真实 AEP ZIP；源和收集缓存离线；新包所有依赖路径与零缺失重开；嵌套分类保留 |

AE 版本 26.0x67。独立收集/验证会关闭自己打开的工程并等待进程释放锁，不覆盖现有用户项目。
FFX 使用本机 Adobe 自带预设作为测试输入，未复制进安装包。JSXBIN 尚无真实样本验收。

## PR

- 自有 CEP 面板已在本机安装并启用；没有启用遗留的其他 MCP 面板或执行其命令。
- `pr-mogrt.json`、`pr-ui.json`、`installed-pr-ui.json`：AE 真 MOGRT 在 PR 26.0.0 播放头插入，宿主返回新片段 ID 与起止时间。
- `pr-media-project.json`：安装版发送真实 PNG 后工程条目增加；打开另一份真实 PRPROJ，核对活动工程路径与序列后返回原测试工程。
- 当前 MOGRT 插入 V1；同轨同时间可能覆盖。没有目标轨道选择器，未验证干净电脑 CEP 部署。

## 规模与格式

- `scale-65588.json`：自有 65,588 小 PNG/文本文件、2,047 目录；导入 26,954 ms，首次查询 29.7 ms，搜索 34.7 ms，末页 215.7 ms。
- `scale-ui.json`：就绪 443 ms，连续滚动加载 1,800 条元数据；测量时仅挂载 100 张卡片；滚回能恢复。
- 上述不是 6.5 万真实混合视频库验收，也未验证数小时滚动、全部过滤组合和显存压力。
- `media-formats.json`：真实 EXR、DPX、TIFF、AVI 转预览成功，原 SHA-256 不变；大于 50 MB WAV 的波形封面成功。
- PSD/PSB 解码尚未验证；AI、RAW、3D 没有专用预览。色彩与相似图仅基于本地像素，不等同 AI 理解。

## 已修复问题

- 自定义协议数字主机被 Chromium 改写为 IP，导致媒体 404；固定为 yimu://asset 后通过真实解码。
- 同 URL 缓存旧 AVI，生成 MP4 后仍报解码失败；媒体路径版本参数与 no-store 后通过安装包播放。
- AE 子进程补齐进程级 OS/CommonProgramFiles，处理既有恢复窗口后脚本可跑；没有重置 Adobe 偏好。
- AE 回执早于文件锁释放；关闭自有工程并等待进程退出后，离线迁移测试通过。
- MOGRT 导出需添加文字控件，本机 Arial 云字体警告需确认；不能说该导出步骤完全无人值守。
- FFX 原生 applyPreset 会作用于全部选中层；只调用一次，避免对每层重复套用。

## Aetodo 对照与未完成项

- 参照本机 4.33.1 build7；核心菜单、偏好和素材右键已实际查看。
- 在独立 YimuInteropTest 库，仅导入自有 PNG；两次 .aetodopack 导出均停在进度框，没有取得文件，原因未确认。
- 测试后已切回 D:\00-aetodo.library；原库未用于测试导入、导出、重命名或删除。
- Aetodo 自有样本导入会复制到库内 source；一幕当前以原路径索引为主，受管理的复制导入流程尚未对齐。
- .aetodopack、AI、物理目录操作、完整批量标签、全格式和逐项视觉/操作体验仍未完成；详见 PARITY.md。

## 可复用经验候选（待确认）

行动：让原工程、源素材和收集缓存全部离线，再用安装后的程序迁移并在 AE 重开。
结果：真实包在新路径零缺失，哈希与分类保留。原因：旧路径仍在线会掩盖未收集依赖。
验收：宿主引用全部指向新包且缺失为 0。反例：只看 ZIP 存在或仍能访问旧盘时打开成功。
边界：本次原生文件/序列/代理；不覆盖插件内部路径、字体授权及干净电脑部署。

## 最终安装回归（0.5.0）

- NSIS 安装后文件版本 0.5.0，桌面与开始菜单快捷方式存在；Authenticode 状态 NotSigned。
- 重新运行安装版 smoke、右键复制、色彩筛选、F2 重命名、真实 AE 离线迁移、PR PNG/PRPROJ 和 MOGRT，均通过。
- `installed-panel.json`：安装版实际部署四个 PR 面板文件，与源码字节一致。
- `installed-build.json`：安装 ASAR 中 24 个源码文件与当前源码哈希一致，未包含工作/逆向/参考目录。
- 安装包 SHA-256：6d25a536b1bf2eb70cd8e99315d2e96fa5968d5764a8ea4888718d0ef7441c0c。


## 本轮持续补齐（0.6.0 源码，尚未以此段声称安装完成）

- `managed-ui.json`：默认复制、重复跳过/保留两份、批量标签追加/移除、注释、目录改名、空目录创建/图标/删除、Aetodo 包导出导入、源目录离线后整进程重启。
- `managed-ae.json`：真实 AEP 复制入库时原生收集；源离线后，AE 所有文件引用均在管理库内，零缺失。
- `aetodopack-interop.json`：一幕生成 PNG 包被原版 Aetodo 4.33.1 build7 导入；原程序 DB、文件哈希、GUI 及重启验证；仅该方向和样本。
- `aetodopack-ae.json`：真实 AEP+PNG+WAV 导出 .aetodopack、源目录离线、新库导入，AE 独立重开所有引用均在新库，零缺失。
- `photoshop-formats.json`：独立构造真实 PSD/PSB 的 8-bit RGB 合并图，预览生成成功且原文件哈希不变；不是任意大型分层文件验收。
- `photoshop-preview.test.cjs`：PSB raw/RLE/ZIP、8/16-bit 合并图精确像素与截断拒绝；依据 Adobe 公开格式规范 https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/ 。
- `premiere-tracks.test.cjs`：宿主逻辑在片段占用、序列改变、播放头改变、无效轨道时，插入调用次数为 0；这不是新版轨道 UI 的真实 PR 验收。
- 当前 PR 是用户真实广清工程，未写入本轮测试片段；旧 PR 原生证据仍有效，但不覆盖新增轨道行为。
- AE 收集超时保留独占输出目录和请求记录，未收到回执前拒绝再次收集。普通失败/取消回滚索引并移除自己的临时文件。
- 文件夹素材包的桌面入口复制到库内；底层 importPackage 保留原有已管理目录的幂等读取，便于 ZIP/原生包复用。
- 反向原版导出包尚未实测；用户回复“跳过”提供样本，不反复索取，也不计为兼容性通过。


## 0.6.0 安装与 AI（本机已执行）

- NSIS 已构建并安装，本机 EXE ProductVersion=0.6.0.0，FileVersion=0.6.0；安装包 176,248,282 字节，仍未签名。
- 安装包 ASAR 3,169 个条目，未包含 private-analysis/work/reference/evidence；模型权重独立缓存，不随安装包分发。
- `installed-aetodopack.json`：安装版菜单完成真实 AEP 导入/原生收集/导出/再导入；源、managed 和 collection-cache 离线，宿主重开零缺失，全部依赖位于新包；安装版重启保留标签。
- `semantic-integration.json`：固定版中文模型真实图文向量、匿名文件中文检索、外部图片检索、标签追加、原标签保留、关闭重开及原路径离线。
- `semantic-ui.json`：打包 EXE 的 AI 菜单、建立索引、中文搜索排序、AI 标签弹窗及整个进程重启；实际使用本地 ONNX，不是模拟模型输出。
- `managed-ui.json`：最新记录也已在 0.6.0 打包 EXE 通过。
- 构建曾受 electron-builder 26.0.12 的可选跨平台依赖收集问题阻塞；升级固定版本 26.15.3 后构建通过。未复制伪造的可选依赖目录。
- 当前源码随后继续加入 AE 目录移动及自定义标题栏，尚未以此段声称这些后续改动已进入安装版。

## 0.6.1 / 0.6.2 持续验证

- 核心测试 33 项通过；新增同大小内容篡改重定位拒绝、PDF 兼容 AI/PDF 红蓝矢量精确像素、原文件哈希不变、无 PDF 的旧式 AI 明确失败。
- `installed-folder-ae.json`：0.6.1 实际安装目录 EXE 的文件夹弹窗改名收集工程；原依赖离线，新工程全部引用在新 bundle，零缺失；重启保留路径和资料。
- `font-install-ui.json`：0.6.1 打包 EXE 实际安装自有 TTF、重复安装、原生置顶、隐藏系统菜单和重启保持；测试字体已按限定路径注销删除，见 font-fixture-cleanup.json。
- `document-ui.json`：0.6.2 打包 EXE 自动生成并解码 PDF 兼容 AI/PDF 预览、整进程重启复用缓存。样本是独立构造的 PDF 矢量内容，不代表任意 Illustrator 私有编辑数据都兼容。
- 文档渲染采用 Mozilla PDF.js 6.4.299 和 @napi-rs/canvas 1.0.13；独立 worker、60 秒超时、192 MB 输入限制，渲染第一页，旧式非 PDF AI 明确提示。
- 原版 Aetodo 重启后已截图核对原库 65,589 项、2,047 个文件夹；原库没有用作写入样本。
- 并行桌面回归发现测试库仍共享 Electron 浏览器缓存，已将 YIMU_DATA_DIR 对应的 app-profile 独立；不影响正式运行路径。受影响的包迁移重启回归重新执行，不用宿主单次成功冒充整条回归通过。

## 0.7.2 安装回归与 0.7.3 修复

- 0.7.2 本机安装后，selection-ui、model-ui、raw-ui、document-ui、theme-ui、semantic-ui 均通过；记录 executable 指向正式安装目录。测试库独立，未改用户原库。
- 512 个真实文件全量选择、批量标签和 Windows FileDropList 通过；65,588 项全选另有 scale-ui 证据，但素材为小型 PNG/文本，不代表真实混合大库。
- OBJ/STL/GLB 实际 WebGL 几何、旋转、保存封面、自动缩略图及重启通过。RAW 仅验证公开 Nikon NEF 内嵌 JPEG；不是完整 RAW 显影。
- 原生拖出尚未通过独立接收端。最近测试仅确认两个真实路径进入 startDrag；桌面坐标变化后停止鼠标自动化，不把 payload 当作交付成功。
- 0.7.2 基础回归发现音频波形点击只播放、不选中；0.7.3 已统一卡片与波形选择处理，开发程序完整 smoke 通过，安装版待回归。
- 新增媒体头读取；JPEG/视频尺寸、音视频时长写入 .aetodopack 元数据，真实 JPEG/MP4/WAV 导出解包测试通过。没有据此声称原版全部媒体变体兼容。
- 核心测试现为 36/36，通过真实文件、持久化、包迁移、校验拒绝及预览像素测试。0.7.3 安装构建中。

## 0.7.3 已安装验证 / 0.7.4 继续对齐

- 0.7.3 安装版 smoke 全部通过，包含波形点击后的选择和删除/恢复；38 个源码文件逐项 ASAR 哈希一致，无 private-analysis/work/reference/evidence 内容。
- 0.7.3 安装版真实 AEP .aetodopack 菜单导出、源/受管原件/收集缓存离线后再导入、AE 重开零缺失及应用重启全部通过，见 installed-aetodopack.json。
- 0.7.4 开发程序新增仅改文件名大小写；真实磁盘拼写、中文改名、外部源不变、重启、SQLite 写入失败回滚均通过，见 rename-ui.json 和 rename.test.cjs。
- 新增 FBXLoader：自有 ASCII FBX 7.4 三角形，实际 GPU 像素、自动缩略图、设封面、重启通过；不能推定二进制/绑定动画/外部贴图全面支持。
- 最近库菜单按当前库勾选并持久化；两份真实独立库切换、重启、离线库拒绝且不新建目录已通过。菜单失败后仍只勾选原库。

## 0.7.5 安装验证

- 本机已安装 0.7.5；ASAR 内 40 个源码文件与工作区逐项哈希一致，无研究数据和原版素材；安装包哈希见 installed-build.json。
- 安装版 managed-ui 再次通过复制入库、重复跳过/保留两份、批量资料、物理文件夹管理、.aetodopack 导出导入、源离线及重启读取。
- Windows 临时文件夹改名遇 EPERM/EACCES/EBUSY 时最多重试 5 次，总等待 1.55 秒；持续失败保留明确错误并清理自有暂存。注入失败测试核对原素材和索引未变。
- 0.7.4 安装版另通过 rename-ui、recent-libraries-ui、model-ui、selection-ui、smoke、media-preferences-ui、library-management-ui。39 项核心测试通过。

## 0.7.6 媒体分段读取与真实副本

- 原库 source 只读枚举 87,789 个物理文件，从中复制 81 个、13 种格式、531,586,372 字节到 work；逐个 SHA-256 核对。私有文件名和来源映射仅在 work/private-provenance.json，不进入安装包。
- 真实 WAV 暴露原媒体通道缺失 Content-Length / Range：虽然能发声，duration 为 Infinity，定位不可验收。0.7.6 已实现带文件长度的流式 GET/HEAD、单段字节范围与 416 拒绝；未用转码掩盖问题。
- 安装版真实 MP4/MOV/MP3/WAV 均直接读取原副本，206 分段返回准确 44 字节、有限时长、定位后播放均通过；WAV 时长 79.235146 秒。真实 TTF FontFace 和 24 张 JPEG/PNG 解码通过。
- 安装版 model-ui、document-ui、smoke 随协议修复再次通过。41 个源码文件哈希一致，40 项核心测试通过。
- 这不是 6.5 万真实混合库性能验收。真实工程副本仅用于浏览，依赖迁移由另一个独立 AE 工程测试覆盖。

## 正在补齐横向排列体验

- 根据 reference/aetodo-user-reference.png，原版图片按比例横向等高成行；原纵向分栏已改为独立实现的等高行布局，保持阅读和选择顺序。
- 自有横竖图比例、滑块、列表切换、Shift 多选、底部偏好入口已测；6.5 万合成数据分页卸载及全选再次通过，最多挂载 200 卡片。
- 自绘导航 SVG、文件夹搜索移到底栏、移除重复侧栏品牌占位。保留一幕自身品牌；不据此宣称视觉 1:1 完成。

## 2026-10-21 安装版 0.7.8

- 0.7.7 已安装并通过等高行、真实混合媒体、全量选择、模型及复制入库 UI 回归。
- 0.7.8 安装包审计 42 个源码文件哈希一致，未混入 work/private-analysis/reference/evidence。
- 剪贴板真实 PNG、Windows 文件列表、输入框文本粘贴、源文件离线及重启通过；来源网址保存、系统打开调用、重启及非法协议拒绝通过。
- 41/41 逻辑与文件测试通过；网址经目录包、ZIP、aetodopack 往返保留。aetodopack 网址为一幕扩展字段，不代表原版支持。
- 用户已跳过提供原版包样本；反向原版包仍未验证。整体 1:1 未完成。
- 证据：evidence/installed-build.json、paste-ui.json、source-url-ui.json。

## 2026-10-21 安装版 0.7.10

- 字体文章预览、字号与文字重启记忆已在 0.7.9 安装版通过。
- 0.7.9 回归暴露空白点击不转移键盘焦点的问题；0.7.10 修复后，搜索再全选、512 项全量标签和 Windows 剪贴板通过。
- GIF 三帧像素、暂停、逐帧拖动、继续播放，源文件离线与重启已通过；源文件哈希不变。
- 安装版 65,588 项合成索引：就绪 614 ms，加载 1800 条时只挂载 200 卡片，搜索 245 ms；这不是原版 6.5 万真实混合库验收。
- 45 个源码文件与已安装 ASAR 哈希一致；安装包不含 work/private-analysis/reference/evidence。
- 证据：gif-ui.json、font-preview-ui.json、selection-ui.json、scale-ui.json、installed-build.json。

- 0.7.10 跨页框选安装版：120 项连续滚动选中、Ctrl/Shift、Escape 恢复、空白点击清空通过。测试需等待列表布局完成并聚焦测试窗口；失焦按设计取消并恢复原选择。基础媒体 smoke 同版通过。

## 2026-10-21 0.7.11 安装回归与包连续迁移修复

- 0.7.11 工具栏、添加/修改日期独立筛选、等高行、列表、120 项跨页框选安装版通过，45 个源码哈希一致。
- 回归发现 .aetodopack 导入未保留工程依赖根；新增可选 yimuBundleFolder/yimuCollections 字段，保留依赖与多分类。原版缺少扩展字段的工程包回退到素材所在目录，不代表所有原生变体已验证。
- 导出生成的工程目录避开已有分类目录；复制拒绝覆盖；无扩展名文件明确失败，保留源文件和索引，不发布不可回读包。
- 自有结构样本验证目录冲突、多分类和两次往返；真实 AEP 经两次往返后，将源目录和中间库离线，独立 AE 26.0x67 重开第二库：PNG/WAV 均在第二库内，missing=[]。
- 证据：evidence/pack-continuity-ae.json，tests/pack-continuity.test.cjs。0.7.12 安装回归待完成。

- 0.7.12 已安装，45 个源码哈希一致；完整 43/43 测试通过。安装版菜单：真实 AEP 默认复制入库与原生收集→导出 aetodopack→源、managed 和 collection-cache 离线→导入→AE 重开零丢失→应用重启资料保留，全部通过。见 evidence/installed-aetodopack.json。当前新增可选字段尚未重测原版 Aetodo，不能据旧 PNG 互通样本宣称全面兼容。

## 2026-10-21 安装版 0.7.13–0.7.15

- 0.7.13：底部自动播放、静音、名称显示与偏好一致；真实 H264 悬停推进、停止和完整重启通过。
- 0.7.14：标签浏览侧栏、独立标签搜索、筛选、计数、合并后刷新、菜单切换和重启通过；65,588 合成索引搜索 231 ms、加载 1800 条时挂载 200 卡片，不代表真实混合大库。
- 0.7.15：HDR RGBE、未压缩 BGRA DDS、无损 JP2 自有样本，实际解码主色像素与宽高比、原文件哈希、源离线、应用重启通过；没有声称所有变体可用。
- 安装版 45 个 src 文件与源码哈希一致，分发包不包含 work/private-analysis/reference/evidence。
- 证据：quick-preview-ui.json、tags-sidebar-ui.json、scale-ui.json、image-formats-ui.json、installed-build.json。

- 0.7.15 AE 回库菜单集成：全工程保留两个合成，选中合成仅保留一个；原目录和临时收集目录离线后，两份受管 AEP 由 AE 重开均零丢失，原 AEP 哈希未变，安装版重启保留。未保存状态拒绝回库。测试仅将 inspect 替换为独立原生 fixture 回执，不操作用户活动工程；实时选择发现仍未验收。证据：evidence/ae-collect-menu.json。

## 2026-10-21 安装版 0.7.16

- 0.7.15 全部 43/43 核心测试通过；安装版库管理/索引备份恢复/最近库/预览转换与偏好/托盘/Unicode 和仅大小写重命名回归通过。
- 0.7.16 的 45 个源码文件哈希一致。真实 H264 播放器 PageUp/PageDown 固定 1/30 秒、起点限位、暂停、空格切换和输入框隔离通过；播放器不因空格重建。
- 原版静态处理器有上述固定步长行为，非本次原版运行时实测；证据 aetodo-video-key-observation.json、video-keys-ui.json。
- 新增格式的导出信息读取纳入 HDR/DDS/JP2 系列，自有样本头信息均为 16×8；不据此认定所有 JPEG 2000 容器和压缩变体通过。

- JSXBIN：使用 [Adobe 官方批量编译工具](https://marketplace.visualstudio.com/items?itemName=Adobe.extendscript-debug) 2.1.0 编译自有仅写测试回执脚本。0.7.16 安装版取消不执行、同意后真实 AE 写出唯一回执、源离线及应用重启再执行通过；当前 AE 项目路径、dirty、条目、合成、媒体及所选合成前后未变。工具仅在 work，未进入分发物。证据：evidence/jsxbin-ui.json。


## 2026-10-21 安装版 0.7.17–0.7.18

- 0.7.17：偏好四分区、方向键导航、AI 状态与候选标签取消/保存、独立 AI 弹窗、重启通过；预览偏好和底部开关回归通过。证据 preferences-tabs-ui.json、media-preferences-ui.json、quick-preview-ui.json。
- 0.7.18：MSIX/CEP 同名 AppData 实际目录不同，改用 Documents 通信；Node 入口兼容和错误提示、过期请求与故障恢复测试通过。完整核心 45/45。
- 真实 PR 26 独立工程：占用轨禁选，播放头移动后拒绝并保留弹窗；选择空轨后只新增一个 MOGRT，既有片段不变。安装版 pr-tracks-ui.json 通过。
- 安装版 45 个源码哈希匹配，无 work/private-analysis/reference/evidence；见 installed-build.json。干净机器部署仍未验证。
- PR LUT 未通过：路径及枚举回读成功，实际 PNG 未变化；曝光对照会改变像素，排除导出缓存。2/32 阶自有 LUT 均未生效；未添加虚假成功入口。依据和输出见 pr-lut-investigation.json。


## 2026-10-21 安装版 0.7.19

- CUBE：独立 1D/3D、红分量最快索引顺序、三线性插值、输入范围、截断及非法数据拒绝均通过。反相 LUT 对真实红色 PNG 得到青色，原始字节哈希未变。
- 安装版自动色卡、选择参考图（测试仅提供文件选择结果）、源文件与参考图离线、完整重启通过；自选预览随素材包搬家也经核心测试。证据 lut-preview-ui.json/png。
- 47/47 核心测试；安装版图片/H264/WAV、资料、回收恢复、重启、1000×700 布局回归通过。46 个 src 哈希匹配；不含分析、工作和证据目录。
- 自有 CEP 临时 .debug 已删除，不重启用户 PR；现有监听待面板关闭后结束。pr-debug-cleanup.json。

## 2026-10-21 PR LUT 与音频/右键修正

- REA 定向静态分析原版 host.jsx：解析 1 个源文件，调用图不完整；仅观察路径协议，不复制实现。证据 ev_a191bb1ef3b51f8169c698ff1a2fe562ce2bb5e0729649912b46e9ca867b9767。
- PR 接受路径回执不等于生效；独立新增 Lumetri 使用末尾斜杠，原生帧先绿再蓝，排除前一效果掩盖。见 evidence/pr-lut-ui.json；安装版 0.7.20。
- 官方关闭工程参数依据 https://github.com/Adobe-CEP/Samples/blob/master/PProPanel/jsx/PremierePro.23.0.d.ts 。只保存关闭自有工程；关闭销毁调试端口，已重开但不能宣称重开后像素复验通过。
- audio-experience-ui.json：真实 WAV 计时、非静音、拖动与离开暂停、源离线重启；不等于扬声器录音回环测量。
- context-refinement-ui.json：真实菜单回调、取帧位置不重置、分类加入/移出、子目录筛选可访问。原生弹出菜单由测试拦截并调用实际菜单项，不使用伪业务响应。

- 长音频：scripts/large-audio-ui.cjs 使用 69,120,102 字节真实立体声 WAV，验证自动波形、180 秒时长、跳转 135 秒、独立静音状态和源离线重启；流式解码限制两个并发，峰值采样缓存不保存完整 PCM。50 项核心测试通过。
