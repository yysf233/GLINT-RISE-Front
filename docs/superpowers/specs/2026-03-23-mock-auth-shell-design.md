# Mock Auth Shell Design

## Goal

为当前项目补齐内部后台入口的第一阶段能力，形成一个可运行、可验收、可替换为真实后端的登录与后台壳层闭环。该闭环包含：

- 登录页从占位升级为可提交的认证页面
- 前端认证状态、角色落点与受保护路由
- 后台基础壳层与首批角色页面
- 认证相关接口的 OpenSpec 契约文档
- mock 服务实现与对应测试标准

本设计只覆盖“后台认证与入口壳层”这一子项目，不扩展产品管理、供应商管理、询价流程或高权限管理的完整业务页面。

## Why Now

根据当前 [PRJ_PRD](C:/Users/23271/Desktop/光速上升/front/docs/PRJ_PRD.md)，公开站主链路已经完成，唯一处于“进行中”的核心项是“登录页真实认证”。在内部后台其他页面尚未开始前，先补齐认证与后台入口可以带来三个直接收益：

1. 把登录页从展示性页面升级为真实可用的入口
2. 为后续所有后台页面提供统一路由、权限与导航框架
3. 通过 OpenSpec 提前冻结后续真实后端需要对接的接口契约

## In Scope

### 1. OpenSpec 契约

在仓库内新增 `openspec/` 目录，并为本次变更建立一个认证与后台入口相关的 change，至少覆盖以下规范能力：

- `auth-session`
- `admin-shell`

其中需要清晰定义：

- 登录请求参数
- 登录成功响应体
- 登录失败错误结构
- 获取当前会话的响应体
- 退出登录行为
- 用户角色字段
- 角色落点规则
- 未登录与无权限时的前端行为

当前子项目先固定以下认证契约字段，后续 OpenSpec 必须与此一致：

### Login Request

```json
{
  "identifier": "employee",
  "password": "******"
}
```

约束：

- `identifier` 为必填字符串
- `password` 为必填字符串
- 当前 mock 账号允许使用 `employee`、`director`、`developer`

### Login Success Response

```json
{
  "session": {
    "token": "mock-session-token",
    "user": {
      "id": "user-employee",
      "name": "内部员工",
      "role": "employee"
    }
  }
}
```

### Session Response

```json
{
  "session": {
    "token": "mock-session-token",
    "user": {
      "id": "user-employee",
      "name": "内部员工",
      "role": "employee"
    }
  }
}
```

### Logout Response

```json
{
  "success": true
}
```

### Error Response

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "账号或密码错误"
  }
}
```

错误码本阶段至少覆盖：

- `VALIDATION_ERROR`
- `USER_NOT_FOUND`
- `INVALID_CREDENTIALS`
- `INVALID_SESSION`

### 2. 前端 mock 服务

在前端仓内实现可替换的认证服务层，要求：

- 页面和路由只依赖 `authApi`
- 当前由 mock 数据和 Promise 延迟驱动
- 不直接在页面内耦合 mock 账号或 `localStorage`
- 后续切换真实 API 时只替换服务实现层

### 3. 登录页升级

保留 `#/login` 路由，但页面需要升级为：

- 可提交表单
- 有基础校验
- 有错误提示
- 有加载态
- 有 3 个可用于验收的 mock 账号说明或快捷填充入口

### 4. 认证状态管理

新增全局认证状态层，至少包含：

- 当前用户会话
- 登录中状态
- 登录方法
- 退出登录方法
- 初始化恢复会话能力

会话需要支持刷新后恢复。

### 5. 后台壳层与首批页面

新增受保护后台路由前缀：`#/workspace/*`

本阶段只落后台壳层与最小首批页面：

- `#/workspace/dashboard`
- `#/workspace/content`
- `#/workspace/forbidden`

角色落点规则固定为：

- `employee` -> `#/workspace/dashboard`
- `director` -> `#/workspace/dashboard`
- `developer` -> `#/workspace/content`

### 6. 受保护路由

需要实现：

- 未登录访问后台页时重定向到 `#/login`
- 已登录访问 `#/login` 时自动跳转到角色默认落点
- 无权限访问后台页时跳转到 `#/workspace/forbidden`

## Out Of Scope

以下内容明确不在本子项目内实现：

- 真实后端 API
- 独立 mock HTTP 服务器进程
- 工作台中的真实统计数据
- 产品管理、供应商管理、询价流程、导出中心的真实业务页面
- 用户权限管理页
- 复杂审批流、多组织、多租户权限模型

后台未实现模块只提供导航占位与“待开发”状态，不伪造业务能力。

## OpenSpec Structure

OpenSpec 采用仓库内标准组织方式，当前项目建议结构如下：

- `openspec/specs/auth-session/spec.md`
- `openspec/specs/admin-shell/spec.md`
- `openspec/changes/add-mock-auth-shell/proposal.md`
- `openspec/changes/add-mock-auth-shell/tasks.md`
- `openspec/changes/add-mock-auth-shell/specs/auth-session/spec.md`
- `openspec/changes/add-mock-auth-shell/specs/admin-shell/spec.md`

本次实现以 change 为主驱动，能力级 `spec.md` 用于沉淀长期规范，change 内 spec 用于描述本次新增或修订内容。

## Mock Users

为了保证页面可验收并且后续易切换真实后端，mock 用户固定为三类：

| Role | Identifier | Default Landing | Purpose |
| --- | --- | --- | --- |
| employee | `employee` | `#/workspace/dashboard` | 验证普通内部员工链路 |
| director | `director` | `#/workspace/dashboard` | 验证高级查看角色链路 |
| developer | `developer` | `#/workspace/content` | 验证内容维护角色链路 |

设计上允许登录页展示“测试账号提示”或“填充示例账号”的快捷操作，但实际登录仍然必须走表单提交。

快捷填充的行为本阶段固定为：

- 点击账号卡片只填充表单
- 不自动提交
- 用户仍需点击登录按钮或回车提交

## Frontend Architecture

### Route Layer

路由层增加后台路由分区：

- 公开站维持现有路由不动
- 后台统一挂在 `#/workspace/*`
- 使用受保护路由包装后台页面

### Auth Layer

新增认证上下文或状态管理模块，负责：

- 初始化读取本地会话
- 调用 `authApi.login`
- 调用 `authApi.getSession`
- 调用 `authApi.logout`
- 暴露当前用户与权限判断结果

### Service Layer

新增 `authApi` 适配层，屏蔽具体实现来源。当前先接 mock 服务，未来真实 API 接入时不改页面逻辑。

### Mock Persistence

会话可以持久化在本地存储，但必须通过服务层和认证状态层读写，而不是页面直接操作。

如果本地持久化会话存在以下任一问题，则必须执行统一恢复策略：

- `token` 缺失
- `user.id` 缺失
- `user.role` 缺失
- `user.role` 不在 `employee | director | developer` 内

统一恢复策略固定为：

1. 清空本地持久化会话
2. 将当前认证状态恢复为未登录
3. 若用户正在访问 `#/workspace/*`，则重定向到 `#/login`
4. 显示一次“登录状态已失效，请重新登录”的非阻塞提示

## UI Structure

### Login Page

登录页需要包含：

- 账号输入
- 密码输入
- 角色/测试账号提示区
- 登录错误提示
- 登录提交按钮
- 返回官网入口

### Workspace Shell

后台壳层需要包含：

- 侧边导航
- 顶部栏
- 当前登录角色信息
- 返回官网入口
- 退出登录按钮
- 页面内容容器

### First Pages

- `dashboard`：作为员工与总监的默认落点，展示欢迎语、角色摘要、后续模块入口占位
- `content`：作为开发者默认落点，展示内容维护入口壳层与待开发模块卡片
- `forbidden`：展示无权限说明、返回默认后台页、返回官网

## Authorization Rules

本阶段先落最小角色可见规则：

| Route | employee | director | developer |
| --- | --- | --- | --- |
| `#/workspace/dashboard` | allowed | allowed | denied |
| `#/workspace/content` | denied | denied | allowed |
| `#/workspace/forbidden` | allowed | allowed | allowed |

未登录用户对全部 `#/workspace/*` 页面均为 denied，并跳转到 `#/login`。

## Error Handling

至少覆盖以下错误场景：

- 空账号提交
- 空密码提交
- mock 服务返回账号不存在
- mock 服务返回密码错误
- 本地会话损坏或角色缺失
- 已登录用户访问无权页面

错误信息要在界面上可见，并与 OpenSpec 中定义的错误结构保持一致。

## Testing Strategy

本次子项目采用“两层验证”：

### 1. 单元测试

引入 `Vitest`，优先覆盖：

- 角色落点映射
- 权限判断逻辑
- mock 认证服务的成功/失败分支
- 会话恢复与清除逻辑

### 2. 路由级验收

扩展现有 `scripts/verify-pages.mjs`，覆盖：

- 登录页表单可见
- 三种角色登录成功后的正确落点
- 未登录访问后台页会跳转登录
- 无权限访问会进入 `forbidden`
- 刷新后仍保留登录态
- 退出登录后返回登录页并失去后台访问权限

## Acceptance Criteria

该子项目完成时，必须满足以下条件：

1. `#/login` 已从占位页升级为可提交登录页
2. 已存在 OpenSpec 认证/后台壳层规范文档
3. 已存在 mock 认证服务层，且页面不直接依赖 mock 数据
4. 已存在 `#/workspace/dashboard`、`#/workspace/content`、`#/workspace/forbidden`
5. 未登录访问后台页会被拦截
6. 三种角色都有明确默认落点
7. 无权限访问会展示正确结果
8. 登录态刷新后保持
9. 退出登录后会话被清空
10. 单元测试与路由级验收均通过

## Non-Goals For This Slice

本设计不追求“后台系统已做完”。它的目标是提供一个稳定的后台入口骨架与契约层，使后续所有待开发事项都可以在统一的认证、路由和权限壳层上继续推进。
