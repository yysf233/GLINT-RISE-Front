# workspace-logs

## Purpose
后台“日志与监控”模块用于统一查看业务后台操作日志、登录与分享访问轨迹，以及公开站和后台的运行告警。

## Requirements

### Requirement: 路由与权限
系统必须向员工和总监开放 `#/workspace/settings/logs`，并拒绝开发维护角色访问。

#### Scenario: 员工或总监访问日志页
- Given 当前登录角色为员工或总监
- When 访问 `#/workspace/settings/logs`
- Then 系统应允许进入日志与监控页面
- And 页面应展示日志概览、访问记录和监控告警

#### Scenario: 开发维护访问日志页
- Given 当前登录角色为开发维护
- When 访问 `#/workspace/settings/logs`
- Then 系统应跳转到 `#/workspace/forbidden`

### Requirement: 受限与全量视图
系统必须根据角色与权限返回不同范围的日志视图。

#### Scenario: 员工默认查看个人视图
- Given 当前登录角色为员工且 `permissions.logAccess = false`
- When 打开日志与监控页
- Then 系统应只返回与本人相关的操作日志和访问记录
- And 告警详情字段应被脱敏为空

#### Scenario: 总监或拥有日志权限的员工查看全量视图
- Given 当前登录角色为总监，或员工且 `permissions.logAccess = true`
- When 打开日志与监控页
- Then 系统应返回全量操作日志、访问记录和告警详情

### Requirement: 告警确认闭环
系统必须支持总监确认活跃告警，并持久化确认结果。

#### Scenario: 总监确认活跃告警
- Given 当前登录角色为总监
- And 告警 `alert-001` 处于 `active`
- When 在日志页点击“确认告警”
- Then 系统应将该告警状态更新为 `acknowledged`
- And 应记录确认人和确认时间

#### Scenario: 非总监尝试确认告警
- Given 当前登录角色不是总监
- When 调用确认告警动作
- Then 系统应返回 `WORKSPACE_LOGS_FORBIDDEN`
