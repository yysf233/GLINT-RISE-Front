# Workspace Quotes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `#/workspace/quotes` 实现完整五步询报价流程，并接通标准报价单下载与导出中心预填联动。

**Architecture:** 使用单页五步流转承载询价业务，数据持久化到新的 quotes mock store。纯算法下沉到 `utils`，页面只负责交互编排，mock service 负责状态持久化、权限校验和快照生成。

**Tech Stack:** React、React Router、Ant Design、Vitest、Playwright 验收脚本、localStorage mock store

---

### Task 1: 固化询价契约与红灯测试

**Files:**
- Create: `src/utils/workspaceQuoteImport.test.js`
- Create: `src/utils/workspaceQuoteFlow.test.js`
- Create: `src/services/mock/mockWorkspaceQuotesService.test.js`
- Modify: `src/utils/authRoutes.test.js`
- Modify: `src/components/workspace/admin/adminNavConfig.test.js`

- [ ] Step 1: 先写导入解析、匹配、推荐、报价生成、service 权限与快照行为的失败测试
- [ ] Step 2: 运行新增测试，确认红灯来自缺失实现
- [ ] Step 3: 补充 `/workspace/quotes` 权限与后台导航断言

### Task 2: 实现询价纯函数与 mock service

**Files:**
- Create: `src/utils/workspaceQuoteImport.js`
- Create: `src/utils/workspaceQuoteFlow.js`
- Create: `src/services/mock/mockWorkspaceQuotesService.js`
- Create: `src/services/workspace/workspaceQuotesApi.js`
- Modify: `src/services/mock/workspaceStorage.js`

- [ ] Step 1: 实现需求导入解析、必填校验、模板输出
- [ ] Step 2: 实现产品匹配、供应商推荐、报价预览、报价单内容生成
- [ ] Step 3: 实现 quotes store、create/list/get/update/generateQuoteSheet 能力
- [ ] Step 4: 运行单测直到全部转绿

### Task 3: 实现询价页面与复用组件

**Files:**
- Create: `src/components/workspace/quotes/QuoteFlowHeader.jsx`
- Create: `src/components/workspace/quotes/QuoteRequirementsStep.jsx`
- Create: `src/components/workspace/quotes/QuoteMatchesStep.jsx`
- Create: `src/components/workspace/quotes/QuoteSuppliersStep.jsx`
- Create: `src/components/workspace/quotes/QuotePricingStep.jsx`
- Create: `src/components/workspace/quotes/QuoteResultStep.jsx`
- Create: `src/pages/WorkspaceQuotesPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/workspace/admin/adminNavConfig.js`

- [ ] Step 1: 接入真实路由和侧边导航
- [ ] Step 2: 实现最近询价单列表与新建草稿
- [ ] Step 3: 逐步实现 5 个步骤组件并接通 service
- [ ] Step 4: 实现标准报价单下载和导出中心预填跳转

### Task 4: 补齐验收、文档与最终回归

**Files:**
- Modify: `scripts/verify-pages.mjs`
- Create: `openspec/specs/workspace-quotes/spec.md`
- Create: `openspec/changes/add-workspace-quotes/proposal.md`
- Create: `openspec/changes/add-workspace-quotes/tasks.md`
- Create: `openspec/changes/add-workspace-quotes/specs/workspace-quotes/spec.md`
- Modify: `docs/PRJ_PRD.md`

- [ ] Step 1: 为询价模块补浏览器级完整回归
- [ ] Step 2: 写 OpenSpec，固定请求/响应格式与业务规则
- [ ] Step 3: 回填 PRD 最新完成状态、测试标准和下一步
- [ ] Step 4: 运行 unit test、build、verify:routes，确认无回归
