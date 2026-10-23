# 第三方组件

本地构建包含 Electron、Node.js/SQLite、fontkit、yauzl/yazl 与 FFmpeg；各依赖许可证保留在包中。
FFmpeg 通过独立进程调用，来自 ffmpeg-static 5.3.0 的 Windows b6.1.1 构建。
FFmpeg 构建来源、配置与对应源码提交见 FFmpeg-BUILD.txt；许可证见 FFmpeg-LICENSE.txt。
本项目没有包含 Aetodo 的专有代码、图标或素材；private-analysis 与 work 不进入构建。
本次产物用于本机验收，尚未对公开发行作授权或发布。

PDF-compatible AI / PDF previews use Mozilla PDF.js (pdfjs-dist 6.4.299, Apache-2.0) and @napi-rs/canvas 1.0.13 (MIT). Their package licenses are included in node_modules in the application archive. No Illustrator proprietary code is distributed.

模型浏览使用 Three.js 0.186.1（MIT）；源码通过 esbuild 构建为 model-view.js，许可证见 Three-LICENSE.txt。OBJ 不加载外部 MTL；GLB/glTF 需内嵌资源，FBX 支持基本几何；暂不支持外部贴图、Draco 压缩、动画控制或 C4D。
