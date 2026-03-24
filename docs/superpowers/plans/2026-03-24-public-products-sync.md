# Public Products Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让后台产品 CRUD 的已发布数据成为前台产品页、搜索页、详情页、分享页和首页产品区的真实来源，并补齐未来后端可落地的 OpenSpec 接口契约与业务说明。

**Architecture:** 保留现有前台页面结构，新增一个公开产品查询层作为唯一入口，由它读取 `publicSiteContent.readPublishedProducts()` 并派生前台所需的分类、标签、热门集合和详情查询能力。同步扩展 workspace 产品数据模型，使后台可编辑字段覆盖前台实际消费的产品信息；OpenSpec 则拆成“后台产品管理契约补充”和“公开产品查询契约”两部分，冻结未来后端接口边界。

**Tech Stack:** React 18, React Router, Ant Design, Vitest, Playwright route verifier, localStorage mock services, OpenSpec markdown specs

---

### Task 1: 补齐失败测试，锁定前后台产品同步边界

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\publicProductsCatalog.test.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\publicSiteContent.test.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mockWorkspaceProductsService.test.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductForm.test.js`

- [ ] **Step 1: 为公开产品查询层写失败测试**
  断言已发布产品列表、详情查找、分类选项、标签选项、热门集合都来自 workspace product store，而不是静态 `siteContent.products`。

- [ ] **Step 2: 为 workspace 产品公开字段写失败测试**
  断言 `shortName`、`displayTag`、`publicMeta` 等字段可被 create/update 持久化并在公开映射中生效。

- [ ] **Step 3: 运行最小测试集确认失败原因正确**
  Run: `npm run test:unit -- src/services/publicProductsCatalog.test.js src/services/publicSiteContent.test.js src/services/mockWorkspaceProductsService.test.js src/utils/workspaceProductForm.test.js`
  Expected: 新增断言失败，且失败集中在缺失公开查询层和缺失字段映射。

### Task 2: 扩展 workspace 产品数据模型，覆盖前台所需字段

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\data\workspace\workspaceProductSeeds.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\mockWorkspaceProductsService.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\workspaceProductForm.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductFormPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\WorkspaceProductDetailPage.jsx`

- [ ] **Step 1: 实现最小字段扩展**
  给 workspace product record 增加前台实际消费的公开字段：`shortName`、`displayTag`、`publicMeta`，并保持旧记录兼容。

- [ ] **Step 2: 调整表单映射与编辑页**
  让后台新增/编辑页可以维护这些字段，且中文文案明确区分“后台管理字段”和“前台展示字段”。

- [ ] **Step 3: 运行相关单元测试确认通过**
  Run: `npm run test:unit -- src/services/mockWorkspaceProductsService.test.js src/utils/workspaceProductForm.test.js`
  Expected: PASS

### Task 3: 实现公开产品查询层与动态筛选元数据

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\publicProductsCatalog.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\services\publicSiteContent.js`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\utils\productSearch.js`

- [ ] **Step 1: 实现公开产品统一查询入口**
  提供至少这些能力：`listPublicProducts()`、`getPublicProductById(id)`、`getPublicProductFilters()`、`getFeaturedPublicProducts()`、`getHotPublicProducts()`。

- [ ] **Step 2: 收口静态兜底逻辑**
  让公开产品优先读取 workspace 已发布数据，缺失字段时才按 `publicProductId` 回退到 legacy seed，保证页面结构稳定。

- [ ] **Step 3: 把搜索工具改为接受动态分类/标签**
  不能再直接依赖 `siteContent` 里的产品分类和标签常量。

- [ ] **Step 4: 运行查询层测试确认通过**
  Run: `npm run test:unit -- src/services/publicProductsCatalog.test.js src/services/publicSiteContent.test.js`
  Expected: PASS

### Task 4: 把前台产品页面全部切到公开产品查询层

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\HomePage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\HotProductsPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\ProductDetailPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\ProductSharePage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\ProductsOverviewPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\src\pages\SearchPage.jsx`

- [ ] **Step 1: 首页产品区改读 published products**
  去掉对 `products[0]`、`slice(0, 6)` 的静态依赖，避免后台更新后首页仍展示旧内容。

- [ ] **Step 2: 产品概览页与搜索页改读动态产品、动态分类、动态标签**
  保留现有视觉结构，只替换数据源与筛选元数据。

- [ ] **Step 3: 热门页、详情页、分享页改读详情查询接口**
  详情和分享页必须和后台公开字段保持一致。

- [ ] **Step 4: 人工自检关键交互**
  检查右上搜索跳转、产品卡点击、详情页分享、工作台跳公开预览都仍然可用。

### Task 5: 补 OpenSpec、回填 PRD，并完成端到端验收

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\specs\public-products\spec.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\changes\sync-public-products-from-workspace\proposal.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\changes\sync-public-products-from-workspace\tasks.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\changes\sync-public-products-from-workspace\specs\public-products\spec.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\specs\workspace-products\spec.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\openspec\changes\add-workspace-products\specs\workspace-products\spec.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\docs\PRJ_PRD.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell\scripts\verify-pages.mjs`

- [ ] **Step 1: 写公开产品查询契约**
  定义未来后端的公开产品列表与详情接口、查询参数、返回体、发布规则、字段业务含义。

- [ ] **Step 2: 补后台产品管理契约**
  把 workspace 产品新增的公开字段及其业务用途写进规范，明确哪些字段驱动前台展示。

- [ ] **Step 3: 回填 PRD**
  记录“后台产品编辑同步前台”已完成，并补当前测试标准。

- [ ] **Step 4: 运行完整验收**
  Run: `npm run test:unit -- src/services/publicProductsCatalog.test.js src/services/publicSiteContent.test.js src/services/mockWorkspaceProductsService.test.js src/utils/workspaceProductForm.test.js`
  Run: `npm run build`
  Run: `npm run verify:routes -- http://127.0.0.1:4184`
  Expected: 单元测试通过、构建通过、路由验收不再出现前后台产品不同步相关失败。
