# 第一次使用 GitHub

- **Code**：查看源码，首页自动展示 README。
- **Releases**：下载安装包。`Pre-release` 表示预览版，不是稳定版。
- **Tags**：版本快照；`v0.7.34-dev.1` 固定本次归档，不随以后代码变动。
- **Issues**：记录问题和需求，一件事一个条目，写清复现步骤。
- **Private**：只有获授权的人能访问。上传 GitHub 不等于已经公开或开源。

首次归档使用单独的 main 快照，不推送旧开发历史；本地原开发分支保留用于追溯。安装包放 Releases，临时数据和依赖不进源码仓库。

后续修改：从 main 创建分支 → 修改并验证 → 更新维护记录 → 提交 → 推送。需要新安装包时再构建、建立新标签和 Release；不要覆盖已有归档标签。

README 参考 GitHub 官方说明与 Electron 桌面项目的组织方式：用途、下载、开发、反馈、授权。没有承诺采用它们的功能或许可证。

- [GitHub README 说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub 发布版本说明](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Electron Fiddle](https://github.com/electron/fiddle)
- [GitHub Desktop](https://github.com/desktop/desktop)
