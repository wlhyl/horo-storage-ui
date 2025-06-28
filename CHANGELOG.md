# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- 改进用户状态管理和token处理逻辑，避免horo-ui注销后horo-storage-ui仍然是登录状态。

## [0.1.0] - 2025-06-28

### Changed
- 升级到Angular 20
- 升级Dockerfile中的node、nginx镜像版本
- Dockerfile 构建angular项目时，指定base-href
- 改进页面UI

### Fixed
- 修复添加/更新记录后页面数据不刷新的问题
- 修正添加/更新操作错误消息文本混淆问题，确保提示信息与操作类型匹配