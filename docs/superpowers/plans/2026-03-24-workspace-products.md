# Workspace Products Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有后台认证与壳层基础上，完成产品管理模块的完整 mock 闭环，包括列表、详情、新增/编辑、批量导入、权限控制与验收回填。

**Architecture:** 新增独立的后台产品 mock 数据源与服务层，通过 `workspaceProductsApi` 暴露统一接口；在 `#/workspace/*` 下增加产品管理相关路由和页面；筛选、排序、批量标签、导入解析等规则拆成纯函数，优先用 Vitest 覆盖，再接入页面和路由验收。

**Tech Stack:** React 18, react-router-dom 7, Vite 5, Vitest, Playwright route verifier, localStorage-backed mock service

---

## File Map

### Create

- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\data\workspaceProductSeeds.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mockWorkspaceProductsService.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\workspaceProductsApi.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mockWorkspaceProductsService.test.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductFilters.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductFilters.test.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductImport.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductImport.test.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductsPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductDetailPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductFormPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductImportPage.jsx`

### Modify

- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\authRoutes.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\authRoutes.test.js`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\components\workspace\WorkspaceShell.jsx`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceDashboardPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\App.jsx`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\scripts\verify-pages.mjs`
- `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\docs\PRJ_PRD.md`

---

### Task 1: Extend Route Permissions for Workspace Products

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\authRoutes.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\authRoutes.test.js`

- [ ] **Step 1: Write the failing auth route tests**

Add tests for:
- employee can access `/workspace/products`
- director can access `/workspace/products/new`
- employee can access `/workspace/products/test-id/edit`
- developer cannot access `/workspace/products`
- developer cannot access `/workspace/products/test-id`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/utils/authRoutes.test.js`
Expected: FAIL because workspace product routes are not yet allowed

- [ ] **Step 3: Write minimal implementation**

Update route guards so:
- `/workspace/products`
- `/workspace/products/new`
- `/workspace/products/:id`
- `/workspace/products/:id/edit`
- `/workspace/products/import`
are allowed for `employee` and `director`, denied for `developer`

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:unit -- src/utils/authRoutes.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/utils/authRoutes.js src/utils/authRoutes.test.js
git commit -m "test: add workspace product route coverage"
```

### Task 2: Add Mock Workspace Product Service

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\data\workspaceProductSeeds.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mockWorkspaceProductsService.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\workspaceProductsApi.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mockWorkspaceProductsService.test.js`

- [ ] **Step 1: Write the failing mock product service tests**

Cover:
- seed products load when storage is empty
- createProduct adds a new product
- updateProduct changes an existing product
- bulkAddTags adds tags without duplicates
- importProducts appends valid products
- malformed persisted store falls back to seed data

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/services/mockWorkspaceProductsService.test.js`
Expected: FAIL because service does not exist

- [ ] **Step 3: Write minimal implementation**

Implement:
- localStorage-backed seed restore
- async CRUD methods
- bulk tag update
- import merge
- adapter export via `workspaceProductsApi`

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:unit -- src/services/mockWorkspaceProductsService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/data/workspaceProductSeeds.js src/services/mockWorkspaceProductsService.js src/services/workspaceProductsApi.js src/services/mockWorkspaceProductsService.test.js
git commit -m "feat: add mock workspace products service"
```

### Task 3: Add Filter and Import Helpers

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductFilters.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductFilters.test.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductImport.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductImport.test.js`

- [ ] **Step 1: Write the failing filter/import tests**

Cover:
- keyword filter
- category filter
- status filter
- needs-update filter
- supported sort orders
- parse import text into valid and invalid rows
- reject rows missing name/category/status

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm run test:unit -- src/utils/workspaceProductFilters.test.js src/utils/workspaceProductImport.test.js
```
Expected: FAIL because helpers do not exist

- [ ] **Step 3: Write minimal implementation**

Implement pure helpers for:
- filtering
- sorting
- result counts
- import parsing / validation

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm run test:unit -- src/utils/workspaceProductFilters.test.js src/utils/workspaceProductImport.test.js
```
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/utils/workspaceProductFilters.js src/utils/workspaceProductFilters.test.js src/utils/workspaceProductImport.js src/utils/workspaceProductImport.test.js
git commit -m "test: add workspace product helper coverage"
```

### Task 4: Add Route Verifier Assertions First

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\scripts\verify-pages.mjs`

- [ ] **Step 1: Extend the verifier before implementing UI**

Add checks for:
- employee can open `/workspace/products`
- developer is redirected from `/workspace/products`
- list filtering changes visible rows
- create flow lands on new detail route
- edit flow updates visible detail text
- import flow adds a product
- bulk tag action updates list-visible tag state

- [ ] **Step 2: Run verifier to verify it fails**

Run:
```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4181
npm run verify:routes -- http://127.0.0.1:4181
```
Expected: FAIL on missing workspace products behaviors

- [ ] **Step 3: Commit**

Run:
```bash
git add scripts/verify-pages.mjs
git commit -m "test: add workspace product route verification"
```

### Task 5: Build Workspace Product Pages

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductsPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductDetailPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductFormPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductImportPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\components\workspace\WorkspaceShell.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\App.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceDashboardPage.jsx`

- [ ] **Step 1: Implement the products list page**

Requirements:
- filters
- sort
- result count
- selection
- batch tag input
- navigation to detail / edit / new / import

- [ ] **Step 2: Implement detail, form, and import pages**

Requirements:
- detail shows backend-only mock fields
- form supports create and edit
- import page supports text input, validation, preview, import submit

- [ ] **Step 3: Wire routes and navigation**

Requirements:
- add workspace nav item for employee/director
- mount all product routes under `ProtectedRoute`
- keep developer denied

- [ ] **Step 4: Re-run unit tests and verifier**

Run:
```bash
npm run test:unit
npm run build
npm run verify:routes -- http://127.0.0.1:4181
```
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/pages/WorkspaceProductsPage.jsx src/pages/WorkspaceProductDetailPage.jsx src/pages/WorkspaceProductFormPage.jsx src/pages/WorkspaceProductImportPage.jsx src/components/workspace/WorkspaceShell.jsx src/App.jsx src/pages/WorkspaceDashboardPage.jsx
git commit -m "feat: add workspace product management module"
```

### Task 6: Backfill PRD and Final Verification

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\docs\PRJ_PRD.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\scripts\verify-pages.mjs`

- [ ] **Step 1: Backfill PRD**

Update:
- 产品管理列表页 -> 已完成
- 产品后台详情页 -> 已完成
- 产品新增 / 编辑页 -> 已完成
- 产品批量导入页 -> 已完成
- 工作台 / 仪表盘 -> 保持进行中或更新为“已具备产品管理入口”
- append testing standards for the workspace products slice

- [ ] **Step 2: Run final verification**

Run:
```bash
npm run test:unit
npm run build
npm run verify:routes -- http://127.0.0.1:4181
```
Expected: PASS

- [ ] **Step 3: Review diff scope**

Run:
```bash
git status --short
git diff --stat
```
Expected: only workspace product module files are changed

- [ ] **Step 4: Commit**

Run:
```bash
git add docs/PRJ_PRD.md scripts/verify-pages.mjs
git commit -m "docs: backfill workspace products progress"
```

- [ ] **Step 5: Push**

Run:
```bash
git push
```

---

## Completion Checklist

- [ ] Workspace product routes exist and are protected
- [ ] Employee and director can access workspace products
- [ ] Developer is denied workspace products
- [ ] Mock product store persists local edits/imports
- [ ] List page supports search, filter, sort, selection, bulk tags
- [ ] Detail page renders backend product data
- [ ] Create/edit flow works
- [ ] Import flow works
- [ ] PRD is backfilled
- [ ] Unit tests pass
- [ ] Build passes
- [ ] Route verifier passes
- [ ] All commits are pushed
