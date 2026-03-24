# Workspace Suppliers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐后台供应商管理完整模块，包含列表、详情、新增/编辑、批量导入、脱敏权限与 mock 导出。

**Architecture:** 新增独立的 workspace suppliers seed、mock service 与 API 层，把敏感字段可见性收口到 service 脱敏投影；页面层沿用现有 AntD 后台组件，按“列表 / 详情 / 表单 / 导入”四页闭环实现。路由验收脚本新增供应商模块访问与关键行为断言，PRD 与 OpenSpec 同步回填。

**Tech Stack:** React 18, React Router, Ant Design, Vitest, Playwright route verifier, localStorage mock services, OpenSpec markdown specs

---

### Task 1: 先写失败测试，锁定供应商数据模型与权限脱敏边界

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mock\mockWorkspaceSuppliersService.test.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceSupplierForm.test.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceSupplierImport.test.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\authRoutes.test.js`

- [ ] **Step 1: 为 suppliers service 写失败测试**
  断言列表、详情、创建、更新、导入、导出与私有供应商脱敏行为。
- [ ] **Step 2: 为 supplier form / import helpers 写失败测试**
  断言表单映射、导入预览、自动评级与字段归一化。
- [ ] **Step 3: 为 authRoutes 增加供应商路由失败测试**
  断言员工/总监可访问 `#/workspace/suppliers*`，开发维护无权访问。
- [ ] **Step 4: 运行最小测试集确认按预期失败**
  Run: `npm run test:unit -- src/services/mock/mockWorkspaceSuppliersService.test.js src/utils/workspaceSupplierForm.test.js src/utils/workspaceSupplierImport.test.js src/utils/authRoutes.test.js`
  Expected: FAIL，失败集中在供应商 service、helper 与权限路由缺失。

### Task 2: 建立供应商数据源、导入解析与权限可见性规则

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\data\workspace\workspaceSupplierSeeds.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mock\mockWorkspaceSuppliersService.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\workspace\workspaceSuppliersApi.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceSupplierForm.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceSupplierImport.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceSupplierVisibility.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mock\workspaceStorage.js`

- [ ] **Step 1: 创建供应商种子数据**
  至少包含公开供应商、员工本人私有供应商、他人私有供应商三类记录。
- [ ] **Step 2: 实现权限可见性 helper**
  收口“本人可见、他人脱敏、总监全量”的字段裁剪规则。
- [ ] **Step 3: 实现 supplier form / import helpers**
  支持表单默认值、详情映射、payload 构建、文本导入预览与自动评级。
- [ ] **Step 4: 实现 suppliers mock service 与 API**
  支持列表、详情、创建、更新、导入、导出、重置 store。
- [ ] **Step 5: 跑相关单测并修到通过**
  Run: `npm run test:unit -- src/services/mock/mockWorkspaceSuppliersService.test.js src/utils/workspaceSupplierForm.test.js src/utils/workspaceSupplierImport.test.js src/utils/authRoutes.test.js`
  Expected: PASS

### Task 3: 实现后台供应商四个页面并接入路由

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceSuppliersPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceSupplierDetailPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceSupplierFormPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceSupplierImportPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\App.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\authRoutes.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\components\workspace\admin\adminNavConfig.js`

- [ ] **Step 1: 接入供应商路由与导航**
  补齐 `/workspace/suppliers`、`/workspace/suppliers/new`、`/workspace/suppliers/import`、`/workspace/suppliers/:supplierId`、`/workspace/suppliers/:supplierId/edit`。
- [ ] **Step 2: 实现供应商列表页**
  支持搜索、标签/评级/私有筛选、统计卡片、新建/导入入口和脱敏列表。
- [ ] **Step 3: 实现供应商详情页**
  支持基础信息、联系方式、评级能力、合作记录、关联产品与导出入口。
- [ ] **Step 4: 实现新增/编辑页**
  支持表单校验、私有开关、关联产品选择与保存回流详情页。
- [ ] **Step 5: 实现批量导入页**
  沿用现有导入交互模式，支持预览、告警、导入完成后回流列表。

### Task 4: 补 OpenSpec、PRD 与端到端验收脚本

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\specs\workspace-suppliers\spec.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\changes\add-workspace-suppliers\proposal.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\changes\add-workspace-suppliers\tasks.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\changes\add-workspace-suppliers\specs\workspace-suppliers\spec.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\docs\PRJ_PRD.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\scripts\verify-pages.mjs`

- [ ] **Step 1: 写 workspace suppliers OpenSpec**
  明确字段、列表查询、详情返回、脱敏规则、导入与导出契约。
- [ ] **Step 2: 回填 PRD**
  把供应商模块状态、测试标准和后续待办写回进度控制文档。
- [ ] **Step 3: 扩展 route verifier**
  覆盖供应商路由权限、列表页种子渲染、私有供应商脱敏、导入页入口与详情页导出按钮。

### Task 5: 跑完整验收并修完所有失败

**Files:**
- Verify only

- [ ] **Step 1: 跑供应商相关单测**
  Run: `npm run test:unit -- src/services/mock/mockWorkspaceSuppliersService.test.js src/utils/workspaceSupplierForm.test.js src/utils/workspaceSupplierImport.test.js src/utils/authRoutes.test.js`
  Expected: PASS
- [ ] **Step 2: 跑构建**
  Run: `npm run build`
  Expected: PASS
- [ ] **Step 3: 启动预览并跑路由验收**
  Run: `npm run preview -- --host 127.0.0.1 --port 4184`
  Run: `npm run verify:routes -- http://127.0.0.1:4184`
  Expected: PASS
- [ ] **Step 4: 手工检查供应商完整业务链**
  检查列表筛选、私有脱敏、详情导出、新建供应商、编辑供应商、批量导入回流列表全部可用。
