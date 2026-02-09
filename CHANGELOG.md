# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.1] - 2026-02-09

### Changed

- 使用更精简的 Docker 基础镜像

## [0.8.0] - 2026-02-09

### Added

- 分页组件增加“首页”和“尾页”跳转功能

## [0.7.0] - 2025-12-29

### Added

- 星座管理删除记录时增加确认对话框，防止误删

### Changed

- 优化星座管理删除/更新记录后的刷新逻辑，根据当前是否处于搜索模式智能刷新

## [0.6.0] - 2025-12-08

### Added

- 增加管理功能

## [0.5.1] - 2025-12-05

### Fixed

- 修复分页组件页码点击跳转的逻辑问题

## [0.5.0] - 2025-11-30

### Added

- 增加条件搜索功能

### Fixed

- 修复分页组件第 6 页开始当前页仍显示为蓝色的问题

## [0.4.0] - 2025-10-02

### Added

- 支持 Horoscope 记录的 lock 字段功能，当记录锁定时：
  - 只能编辑描述和锁定状态字段
  - 禁止删除记录
  - 其他字段在编辑时被禁用

## [0.3.0] - 2025-08-03

### Added

- 为本地存储服务添加了根据地名查询经纬度的功能，用户可以通过搜索按钮查询并从结果列表中选择合适的地理位置

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
