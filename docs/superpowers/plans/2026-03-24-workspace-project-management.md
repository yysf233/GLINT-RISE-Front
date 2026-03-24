# Workspace Project Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为后台补齐项目管理列表页、详情页和新建/编辑页，并接入现有 mock 项目服务形成完整 CRUD 闭环。

**Architecture:** 沿用现有后台 AntD 壳层与按路由拆页的模式，新增项目管理三类页面并复用后台通用组件。页面直接调用现有 `workspaceProjectsApi`，通过少量表单/展示辅助函数整理项目时间轴与关联产品数据，避免把页面逻辑塞进服务层。

**Tech Stack:** React 18、React Router、Ant Design、Vitest、现有 mock workspace services

---

### Task 1: 补齐项目管理测试与辅助函数

**Files:**
- Create: `src/utils/workspaceProjectForm.js`
- Create: `src/utils/workspaceProjectForm.test.js`

- [ ] **Step 1: 写失败测试**
- [ ] **Step 2: 运行测试确认失败**
- [ ] **Step 3: 实现最小辅助函数**
- [ ] **Step 4: 运行测试确认通过**

### Task 2: 实现项目管理页面

**Files:**
- Create: `src/pages/WorkspaceProjectsPage.jsx`
- Create: `src/pages/WorkspaceProjectDetailPage.jsx`
- Create: `src/pages/WorkspaceProjectFormPage.jsx`

- [ ] **Step 1: 写页面/交互失败测试或先通过路由验收点定义缺口**
- [ ] **Step 2: 实现列表页**
- [ ] **Step 3: 实现详情页**
- [ ] **Step 4: 实现新建/编辑页**
- [ ] **Step 5: 自检主要 testid、中文文案、路由跳转**

### Task 3: 接入路由、权限与导航

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/utils/authRoutes.js`
- Modify: `src/components/workspace/admin/adminNavConfig.js`

- [ ] **Step 1: 为项目管理补路由**
- [ ] **Step 2: 补权限判断**
- [ ] **Step 3: 校正导航文案与入口**

### Task 4: 回填文档并完成验收

**Files:**
- Modify: `docs/PRJ_PRD.md`

- [ ] **Step 1: 回填项目管理完成状态与测试标准**
- [ ] **Step 2: 运行 `npm run test:unit`**
- [ ] **Step 3: 运行 `npm run build`**
- [ ] **Step 4: 运行 `npm run verify:routes -- http://127.0.0.1:4184`**
