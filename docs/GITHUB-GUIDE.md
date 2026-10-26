# 第一次使用 GitHub

- **Code**：查看源码，首页自动展示 README。
- **Releases**：下载安装包。`Pre-release` 表示预览版，不是稳定版。
- **Tags**：版本快照；当前下载为 `v0.7.56-dev.1`，旧 `v0.7.34-dev.1` 保留，不覆盖历史标签。
- **Issues**：记录问题和需求，一件事一个条目，写清复现步骤。
- **Public / License**：当前主分支的原创代码与文档采用 MIT；根目录 LICENSE 是许可正文，第三方内容遵循各自许可。旧标签和安装包保持历史原样。

首次归档使用单独的 main 快照，不推送旧开发历史；本地原开发分支保留用于追溯。安装包放 Releases，临时数据和依赖不进源码仓库。

后续修改：从 main 创建分支 → 修改并验证 → 更新维护记录 → 提交 → 推送。需要新安装包时再构建、建立新标签和 Release；不要覆盖已有归档标签。

README 参考 GitHub 官方说明与 Electron 桌面项目的组织方式：用途、下载、开发、反馈、授权。没有承诺采用它们的功能或许可证。

- [GitHub README 说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [GitHub 发布版本说明](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [Electron Fiddle](https://github.com/electron/fiddle)
- [GitHub Desktop](https://github.com/desktop/desktop)

## 本次可复用经验候选

- 行动：将源码快照、Release 安装包和个人运行数据分开管理，用哈希固定已有运行版。
- 结果：源码上传约 2.10 MiB；安装包服务端 SHA256 与本地一致；个人素材未上传。
- 原因：Git 历史与已跟踪数据不会因为新增 .gitignore 自动消失，独立快照可避免携带旧测试记录。
- 验收：核对远端文件树、标签、安装包哈希及空库启动；仅看到上传成功提示不够。
- 反例：直接上传整个项目目录，或把未完整验收的开发归档称为稳定发行版。
- 边界：这是本次整理的候选做法，尚未确认升级为通用经验；不等于安全或完整兼容性审计。
