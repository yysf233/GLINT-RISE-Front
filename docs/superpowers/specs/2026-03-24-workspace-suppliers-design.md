# Workspace Suppliers Design

## Goal

补齐后台供应商管理完整模块，覆盖列表、详情、新增/编辑、批量导入，并把“员工仅查看本人私有供应商完整信息、总监查看全量、开发维护无权访问”落实到 mock service 与页面验收。

## Chosen Approach

采用“单一供应商源模型 + service 层脱敏投影”的方案。

- 供应商数据只维护一份 canonical workspace record，持久化到独立的 suppliers storage key。
- 页面不直接决定敏感字段是否显示，而是把当前 viewer 传给 suppliers service，由 service 返回已经按权限裁剪后的列表/详情数据。
- 员工与总监共用同一套 AntD 后台页面结构，开发维护角色通过路由权限直接拦截。
- 批量导入沿用当前产品导入的交互模式，但字段替换为供应商维度，并在导入阶段自动补评级。

## Why This Approach

相比把脱敏逻辑散落在页面里，这种做法更适合后续询价流程复用，因为后面的“供应商推荐”“报价导出”都需要同样的权限边界。先把规则沉到 service 层，后续新页面只需要复用 API，不必重复写一套可见性判断。

## Data Model

workspace supplier record 计划包含这些核心字段：

- `id`
- `name`
- `rating`
- `status`
- `isPrivate`
- `owner`
- `companyArea`
- `leadTimeBand`
- `priceBand`
- `cooperationHistory`
- `fitScore`
- `patentCount`
- `capacitySummary`
- `contactName`
- `contactPhone`
- `contactEmail`
- `tags`
- `relatedProductIds`
- `summary`
- `logs`
- `updatedAt`

其中：

- `name/contact*` 属于敏感字段，对“他人私有供应商”默认脱敏。
- `rating/fitScore/patentCount/companyArea` 用于列表筛选、详情展示与后续推荐排序。
- `relatedProductIds` 先复用现有 workspace product id，详情页支持跳转回产品后台详情。

## Page Scope

### 列表页

路由：`#/workspace/suppliers`

能力：

- 搜索
- 标签筛选
- 评级筛选
- 私有/公开筛选
- 新建、导入入口
- 行级查看/编辑
- 脱敏展示

### 详情页

路由：`#/workspace/suppliers/:supplierId`

能力：

- 基础信息
- 联系方式
- 评级与工厂能力
- 合作记录
- 关联产品
- Excel / CSV 导出入口

### 新增 / 编辑页

路由：

- `#/workspace/suppliers/new`
- `#/workspace/suppliers/:supplierId/edit`

能力：

- 基础字段录入
- 私有开关
- 联系方式维护
- 关联产品选择
- 表单校验

### 批量导入页

路由：`#/workspace/suppliers/import`

能力：

- 文本导入预览
- 校验告警
- 自动评级
- 导入成功回流列表

## Permission Rules

- `employee`
  - 可访问供应商模块
  - 可查看公开供应商完整信息
  - 可查看本人私有供应商完整信息
  - 查看他人私有供应商时，`name/contact*` 脱敏
- `director`
  - 可访问供应商模块
  - 可查看所有供应商完整信息
  - 可使用带敏感字段的导出
- `developer`
  - 不可访问供应商模块

## Export Rule

本阶段不单独实现“导出中心”，但在供应商详情页提供 mock 导出能力：

- 员工默认只能导出当前可见字段
- 总监可导出完整字段
- 导出动作写入供应商日志，便于后续审计页复用

## Testing Strategy

- 单元测试覆盖：
  - service 权限脱敏
  - form payload 映射
  - import preview / auto rating
  - authRoutes 新增供应商路由权限
- 构建验证：
  - `npm run build`
- 端到端路由验收：
  - 员工/总监可进入供应商路由
  - 开发维护被拒绝
  - 列表页出现种子供应商
  - 私有供应商脱敏规则生效
  - 新建/导入页基础交互可用

## Expected Output

完成后，后台剩余未做的核心业务模块会从“供应商管理”切到“询价流程 / 导出中心”，而不是继续停留在基础主数据层。
