# Workspace Products Module Design

## Goal

在当前已完成的 mock 认证和后台壳层基础上，补齐产品管理模块的第一条完整后台业务链路。该链路必须在纯前端 + mock 服务条件下可运行、可验收、可演示，并为后续真实 API 接入保留稳定接口边界。

本次设计覆盖：

- 产品管理列表页
- 产品后台详情页
- 产品新增 / 编辑页
- 产品批量导入页
- 对应 mock 数据与 mock 服务
- 角色访问控制
- PRD 回填与测试标准

## Why This Slice

当前项目已经完成：

- 公开站主链路
- mock 登录
- 角色落点
- `#/workspace/*` 后台壳层

下一步如果继续推进后台，最合适的起点就是产品管理模块，因为它天然处在后续“产品详情 / 编辑 / 导入 / 供应商关联 / 询价匹配”的上游。先把产品管理做成完整 mock 闭环，可以为后面的所有后台模块提供：

1. 稳定的后台导航入口
2. 稳定的后台数据操作模式
3. 稳定的 mock 服务边界
4. 可回填到 PRD 的阶段性成果

## In Scope

### 1. Workspace Product Routes

新增以下受保护路由：

- `#/workspace/products`
- `#/workspace/products/new`
- `#/workspace/products/:id`
- `#/workspace/products/:id/edit`
- `#/workspace/products/import`

路由规则：

- `employee` 可访问以上全部产品管理路由
- `director` 可访问以上全部产品管理路由
- `developer` 访问以上任一路由时跳转到 `#/workspace/forbidden`

### 2. Product Management List

`#/workspace/products` 必须提供可实际操作的列表页，不做死按钮占位。至少包含：

- 关键词搜索
- 分类筛选
- 状态筛选
- “待更新”筛选
- 排序
- 结果统计
- 表格展示
- 批量勾选
- 批量加标签
- 新增产品入口
- 批量导入入口
- 行级“查看详情 / 编辑”入口

### 3. Product Detail

`#/workspace/products/:id` 必须是可访问的后台详情页，至少展示：

- 基础信息摘要
- 分类、标签、状态、更新时间
- 对外参考价 / 内部成本价
- 生产进度摘要
- 供应商摘要占位
- 最近操作记录

说明：

- 本次只做 mock 产品后台详情，不接供应商真实模块
- 供应商区域允许是可解释的 mock 摘要，不扩展成供应商详情系统

### 4. Product Create / Edit

`#/workspace/products/new` 与 `#/workspace/products/:id/edit` 必须共用一套表单能力，支持：

- 新增产品
- 编辑现有产品
- 分类、标签、状态、待更新标记
- 公开信息与后台信息
- 基础校验
- 保存成功后回到详情页或列表页

本次不要求复杂自动保存、版本比对、多步骤表单。

### 5. Product Import

`#/workspace/products/import` 必须提供一个可演示的 mock 导入流，不只是说明文案。至少包含：

- 模板字段说明
- 文本输入或 mock 数据粘贴区
- 导入预览
- 字段校验结果
- 导入成功数量
- 导入完成后能回流到产品列表

本次不要求真实 Excel 解析。可以使用“粘贴 JSON / TSV / 简化行文本”的 mock 导入形式，只要交互链路完整、可演示、可验收。

## Out Of Scope

本次明确不包含：

- 真实后端 API
- 真实文件上传解析
- 供应商管理模块
- 询价流程模块
- 导出中心
- 审批流
- 复杂权限矩阵
- 多用户协作冲突处理

## Mock Data Architecture

### Source Of Truth

新增一层独立于公开站 `siteContent.js` 的后台产品 mock 数据源。原因：

- 公开站产品字段偏展示导向
- 后台产品字段需要额外的状态、归属、更新时间、内部价格、进度、标签数组等
- 后台编辑和导入会修改数据，不适合直接复用公开站静态展示数据

建议结构：

- `src/data/workspaceProductSeeds.js`
- `src/services/mockWorkspaceProductsService.js`
- `src/services/workspaceProductsApi.js`

### Persistence Rule

后台产品 mock 数据需要支持本地持久化，否则“新增 / 编辑 / 导入”没有真实反馈闭环。

规则固定为：

1. 初始数据来自 seed
2. 本地存储中若存在合法 workspace products 数据，则优先读取
3. 新增、编辑、批量加标签、导入操作均回写本地存储
4. 若存储损坏，则回退到 seed 数据

## UI Structure

### Workspace Navigation

现有 `WorkspaceShell` 侧边导航需要扩展：

- 员工：`dashboard`、`products`、`forbidden`
- 总监：`dashboard`、`products`、`forbidden`
- 开发者：保留 `content`、`forbidden`

### Products List Layout

列表页使用后台工作区风格，不复用公开站策展视觉。页面结构建议：

1. 顶部概览条
   - 标题
   - 当前结果数
   - 新增 / 导入按钮
2. 筛选区
   - 搜索框
   - 分类筛选
   - 状态筛选
   - 待更新切换
   - 排序
3. 批量操作条
   - 已选择数量
   - 批量加标签
   - 清空选择
4. 表格
   - 复选框
   - 产品名
   - 分类
   - 标签
   - 状态
   - 更新时间
   - 所有者
   - 行操作

### Product Detail Layout

详情页分为：

- 顶部返回与操作条
- 核心信息摘要卡
- 价格 / 状态 / 归属信息卡
- 生产进度卡
- 供应商摘要卡
- 最近操作日志卡

### Product Form Layout

新增 / 编辑页共用表单组件，分组为：

1. 基础信息
2. 展示信息
3. 后台信息
4. 标签与分类
5. 价格与进度

### Import Layout

导入页分为：

- 模板规则说明
- 输入区
- 校验结果区
- 导入预览区
- 提交导入按钮

## Behavior Rules

### Filtering And Sorting

列表筛选必须是纯前端即时反馈，不重新加载页面。排序至少支持：

- 最近更新优先
- 名称 A-Z
- 参考价高到低

### Bulk Tagging

批量加标签行为规则：

- 未勾选任何产品时按钮不可提交
- 选择标签后可一次性写入多条产品
- 重复标签不得重复写入

### Save Flow

新增 / 编辑保存规则：

- 校验失败时停留当前页并显示错误
- 保存成功后写入 mock store
- 新增成功进入对应详情页
- 编辑成功进入对应详情页

### Import Flow

导入规则：

- 空输入不可提交
- 非法行进入错误列表
- 合法行进入预览列表
- 提交导入后合并到 mock store

## Route Protection Rules

产品管理相关路由授权矩阵：

| Route | employee | director | developer |
| --- | --- | --- | --- |
| `#/workspace/products` | allowed | allowed | denied |
| `#/workspace/products/new` | allowed | allowed | denied |
| `#/workspace/products/:id` | allowed | allowed | denied |
| `#/workspace/products/:id/edit` | allowed | allowed | denied |
| `#/workspace/products/import` | allowed | allowed | denied |

## Testing Strategy

### Unit Tests

至少覆盖：

- 产品权限路由判断
- 产品列表筛选与排序 helper
- mock 产品服务 CRUD
- 批量加标签逻辑
- 导入解析与校验逻辑

### Route Verification

扩展 `scripts/verify-pages.mjs`，至少验证：

- 员工可访问 `#/workspace/products`
- 开发者访问 `#/workspace/products` 跳转 `#/workspace/forbidden`
- 列表页筛选能改变结果
- 新增产品后能进入详情页
- 编辑后详情页内容更新
- 批量加标签后列表可见结果变化
- 导入页导入成功后列表新增记录

## Acceptance Criteria

本切片完成时，必须满足以下条件：

1. 产品管理后台路由已落地
2. 员工 / 总监可进入产品管理模块
3. 开发者访问产品管理模块被正确拦截
4. 列表页具备搜索、筛选、排序、批量操作
5. 后台详情页可查看 mock 产品后台信息
6. 新增 / 编辑可用并持久化到本地 mock store
7. 批量导入可用并能回流列表
8. `PRJ_PRD.md` 已回填本轮最新状态与测试标准
9. 单元测试通过
10. 构建通过
11. 路由验收通过
