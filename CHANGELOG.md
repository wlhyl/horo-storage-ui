# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-06-29

### Fixed

- 改进用户状态管理和 token 处理逻辑，避免 horo-ui 注销后 horo-storage-ui 仍然是登录状态。

### Changed

- 重构了整个 UI

## [0.1.0] - 2025-06-28

### Changed

- 升级到 Angular 20
- 升级 Dockerfile 中的 node、nginx 镜像版本
- Dockerfile 构建 angular 项目时，指定 base-href
- 改进页面 UI

### Fixed

- 修复添加/更新记录后页面数据不刷新的问题
- 修正添加/更新操作错误消息文本混淆问题，确保提示信息与操作类型匹配
