# 第三方组件说明

YimuCraft 使用 Electron、Node.js、SQLite、Three.js、FFmpeg、Transformers.js、ONNX Runtime、PDF.js、fontkit、Canvas 及 ZIP 工具等组件。精确依赖树由 package-lock.json 记录。

0.7.56 还使用 Model Context Protocol SDK、js-yaml 和 sharp。连接入口及文件夹品牌图形的来源见 [连接图标](src/logos/SOURCES.md)、[平台图标](src/logos/PLATFORM-SOURCES.md)与[软件图标](src/logos/SOFTWARE-SOURCES.md)。商标归各权利人所有，图标展示不表示合作、背书或对应工程格式兼容。

第三方组件保留各自版权和许可；项目未选择开源许可证不改变这些组件的许可。安装目录中的 LICENSE.electron.txt、LICENSES.chromium.html 及依赖自带的许可文件应随对应组件保留。

FFmpeg 随包构建信息与源码链接见 [FFmpeg-BUILD.txt](src/third-party/FFmpeg-BUILD.txt)，对应许可见 [FFmpeg-LICENSE.txt](src/third-party/FFmpeg-LICENSE.txt)。Three.js 许可见 [Three-LICENSE.txt](src/third-party/Three-LICENSE.txt)。

按需下载模型的许可须按实际模型版本核查。本文是组件索引，不是已完成商业分发许可审计的声明。正式公开发行前需要进一步整理完整许可与适用源码获取方式。
