# workspace-logs

## ADDED Requirements

### Requirement: 日志与监控后台模块
系统必须提供统一的日志与监控后台模块，用于查看后台操作、访问记录和运行告警。

#### Scenario: 员工打开日志模块
- Given 当前登录角色为员工
- When 打开 `#/workspace/settings/logs`
- Then 页面应正常渲染日志概览、访问记录和告警列表
- And 页面应提示当前处于个人范围视图

#### Scenario: 总监打开日志模块
- Given 当前登录角色为总监
- When 打开 `#/workspace/settings/logs`
- Then 页面应返回全量日志和完整告警详情

### Requirement: 告警确认
系统必须允许总监确认活跃告警，并把结果持久化到本地 mock 存储。

#### Scenario: 总监确认 alert-001
- Given `alert-001` 当前状态为 `active`
- When 总监点击确认告警
- Then 该告警状态应更新为 `acknowledged`
- And 确认人应显示为当前总监名称
