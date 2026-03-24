## ADDED Requirements

### Requirement: 用户列表与详情
系统必须提供后台用户列表、详情和基础筛选能力。

#### Scenario: 员工或总监查看用户列表
- Given 当前登录角色为员工或总监
- When 访问 `#/workspace/settings/users`
- Then 系统应返回用户列表、账号状态、角色、部门岗位、数据范围摘要和最近登录时间

#### Scenario: 查看用户详情
- Given 当前登录角色为员工或总监
- When 打开某个用户详情页
- Then 系统应展示基础信息、权限能力、数据可见范围、审批记录和操作日志

### Requirement: 用户创建与编辑
系统必须支持总监创建和编辑后台账号。

#### Scenario: 总监新建用户
- Given 当前登录角色为总监
- When 提交合法的新用户表单
- Then 系统应创建用户并生成唯一账号记录
- And 新用户应写入本地 mock 存储用于后续登录与权限判断

#### Scenario: 非总监尝试修改用户
- Given 当前登录角色不是总监
- When 调用创建或编辑接口
- Then 系统应返回 `USER_ADMIN_FORBIDDEN`

### Requirement: 权限申请与审批
系统必须支持当前用户提交自己的权限申请，并由总监审批。

#### Scenario: 员工提交权限申请
- Given 当前登录角色为员工
- When 在权限与用户页提交“带价导出权限”申请
- Then 系统应创建一条 `pending` 状态的申请记录

#### Scenario: 总监审批通过权限申请
- Given 存在待审批申请
- When 总监执行通过操作
- Then 系统应将申请状态更新为 `approved`
- And 对应用户的目标权限字段应变为 `true`

### Requirement: 认证联动
系统必须让用户管理模块成为 mock 认证的数据源。

#### Scenario: 登录读取用户管理数据
- Given 用户管理存储中存在启用账号
- When 使用该账号标识和固定密码登录
- Then `mockAuthService` 应返回该账号的最新角色、状态、权限和数据范围
