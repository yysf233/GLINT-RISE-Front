# 后台 Ant Design 化与第一波业务闭环 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将登录后的后台页面重构为统一的 Ant Design 风格后台，并完整打通产品上架、项目上架、首页轮播图管理 3 条 mock 业务闭环，同时把结果同步映射到公开站与 `PRJ_PRD.md`。

**Architecture:** 先搭建后台通用基座和组件体系，再分别补齐产品、项目、轮播 3 个后台数据子模块与公开站映射层。后台页面统一通过 `AdminLayout`、表格/表单/详情等公共组件组装，公开站通过独立的“后台结果 -> 公开展示模型”适配层读取本地持久化后的 mock 数据，保证“发布/预览/回查”是真闭环。

**Tech Stack:** React 18, react-router-dom 7, Vite 5, Vitest, Playwright route verifier, Ant Design, localStorage-backed mock services

---

## Workspace Root

以下路径均相对于：

`C:\Users\23271\Desktop\光速上升\front\.worktrees\mock-auth-shell`

## File Map

### Create

- `src/components/workspace/admin/AdminProvider.jsx`
- `src/components/workspace/admin/adminTheme.js`
- `src/components/workspace/admin/adminNavConfig.js`
- `src/components/workspace/admin/adminNavConfig.test.js`
- `src/components/workspace/admin/AdminLayout.jsx`
- `src/components/workspace/admin/AdminSiderNav.jsx`
- `src/components/workspace/admin/AdminTopbar.jsx`
- `src/components/workspace/admin/AdminPageHeader.jsx`
- `src/components/workspace/admin/AdminStatsRow.jsx`
- `src/components/workspace/admin/AdminFilterBar.jsx`
- `src/components/workspace/admin/AdminTableCard.jsx`
- `src/components/workspace/admin/AdminDetailSection.jsx`
- `src/components/workspace/admin/AdminFormSection.jsx`
- `src/components/workspace/admin/AdminUploadPanel.jsx`
- `src/components/workspace/admin/AdminSortableMediaList.jsx`
- `src/components/workspace/admin/AdminStepShell.jsx`
- `src/components/workspace/admin/AdminResultState.jsx`
- `src/components/workspace/admin/PermissionGuardNotice.jsx`
- `src/components/workspace/admin/AdminPlaceholderPage.jsx`
- `src/data/workspace/workspaceProjectSeeds.js`
- `src/data/workspace/workspaceBannerSeeds.js`
- `src/services/mock/workspaceStorage.js`
- `src/services/mock/workspaceStorage.test.js`
- `src/services/mock/mockWorkspaceProjectsService.js`
- `src/services/mock/mockWorkspaceProjectsService.test.js`
- `src/services/mock/mockWorkspaceBannersService.js`
- `src/services/mock/mockWorkspaceBannersService.test.js`
- `src/services/workspace/workspaceProjectsApi.js`
- `src/services/workspace/workspaceBannersApi.js`
- `src/services/publicSiteContent.js`
- `src/services/publicSiteContent.test.js`
- `src/utils/workspaceProjectTimeline.js`
- `src/utils/workspaceProjectTimeline.test.js`
- `src/utils/workspaceBannerTargets.js`
- `src/utils/workspaceBannerTargets.test.js`
- `src/pages/WorkspaceProjectsPage.jsx`
- `src/pages/WorkspaceProjectDetailPage.jsx`
- `src/pages/WorkspaceProjectFormPage.jsx`
- `src/pages/WorkspaceBannerListPage.jsx`
- `src/pages/WorkspaceBannerFormPage.jsx`

### Modify

- `package.json`
- `package-lock.json`
- `src/main.jsx`
- `src/App.jsx`
- `src/components/workspace/WorkspaceShell.jsx`
- `src/pages/WorkspaceDashboardPage.jsx`
- `src/pages/WorkspaceContentPage.jsx`
- `src/pages/WorkspaceForbiddenPage.jsx`
- `src/pages/WorkspaceProductsPage.jsx`
- `src/pages/WorkspaceProductDetailPage.jsx`
- `src/pages/WorkspaceProductFormPage.jsx`
- `src/pages/WorkspaceProductImportPage.jsx`
- `src/services/mockWorkspaceProductsService.js`
- `src/services/mockWorkspaceProductsService.test.js`
- `src/services/workspaceProductsApi.js`
- `src/data/workspaceProductSeeds.js`
- `src/utils/authRoutes.js`
- `src/utils/authRoutes.test.js`
- `src/pages/HomePage.jsx`
- `src/pages/CasesOverviewPage.jsx`
- `src/pages/CaseTimelinePage.jsx`
- `src/pages/CaseDetailPage.jsx`
- `src/pages/CaseSharePage.jsx`
- `src/pages/ProductsOverviewPage.jsx`
- `src/pages/ProductDetailPage.jsx`
- `src/pages/ProductSharePage.jsx`
- `src/pages/SearchPage.jsx`
- `scripts/verify-pages.mjs`
- `docs/PRJ_PRD.md`

---

### Task 1: 安装 Ant Design 并建立后台导航配置

**Files:**
- Create: `src/components/workspace/admin/adminNavConfig.js`
- Create: `src/components/workspace/admin/adminNavConfig.test.js`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: 先写失败的后台导航配置测试**

覆盖：
- 员工可见“仪表盘 / 产品管理 / 项目管理 / 轮播与推荐”
- 总监可见同样的第 1 波模块
- 开发者不可见产品、项目、轮播
- 未落地的第 2 波后续路由会标记为“待开发”

- [ ] **Step 2: 运行测试确认确实失败**

Run:
```bash
npm run test:unit -- src/components/workspace/admin/adminNavConfig.test.js
```
Expected: FAIL because config/test target does not exist.

- [ ] **Step 3: 安装依赖并写最小实现**

Run:
```bash
npm install antd @ant-design/icons
```

实现：
- 统一后台导航分组
- 角色可见性规则
- 第 2 波以后入口的 `isPlaceholder` 标记

- [ ] **Step 4: 再跑测试确认通过**

Run:
```bash
npm run test:unit -- src/components/workspace/admin/adminNavConfig.test.js
```
Expected: PASS

- [ ] **Step 5: 提交**

Run:
```bash
git add package.json package-lock.json src/components/workspace/admin/adminNavConfig.js src/components/workspace/admin/adminNavConfig.test.js
git commit -m "feat: add admin nav config and antd deps"
```

### Task 2: 建立后台主题 Provider 与公共布局组件

**Files:**
- Create: `src/components/workspace/admin/AdminProvider.jsx`
- Create: `src/components/workspace/admin/adminTheme.js`
- Create: `src/components/workspace/admin/AdminLayout.jsx`
- Create: `src/components/workspace/admin/AdminSiderNav.jsx`
- Create: `src/components/workspace/admin/AdminTopbar.jsx`
- Create: `src/components/workspace/admin/AdminPageHeader.jsx`
- Create: `src/components/workspace/admin/AdminResultState.jsx`
- Create: `src/components/workspace/admin/PermissionGuardNotice.jsx`
- Create: `src/components/workspace/admin/AdminPlaceholderPage.jsx`
- Modify: `src/main.jsx`
- Modify: `src/components/workspace/WorkspaceShell.jsx`
- Modify: `src/pages/WorkspaceDashboardPage.jsx`
- Modify: `src/pages/WorkspaceContentPage.jsx`
- Modify: `src/pages/WorkspaceForbiddenPage.jsx`

- [ ] **Step 1: 先扩展路由验收，要求后台壳层出现中文导航和顶部工具区**

在 `scripts/verify-pages.mjs` 增加失败断言：
- 后台左侧出现中文分组
- 顶部出现中文角色标识和“返回官网”
- 开发者访问受限模块仍进入无权限页

- [ ] **Step 2: 运行构建和验收，确认新断言先失败**

Run:
```bash
npm run build
# 在第二个终端保持运行：
npm run preview -- --host 127.0.0.1 --port 4184
# 当前终端执行：
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: FAIL on missing admin shell behaviors.

- [ ] **Step 3: 写最小布局实现**

实现：
- `ConfigProvider` + 后台主题
- `AdminLayout` 替代旧 `WorkspaceShell` 视觉
- 中文左侧导航、顶部工具区、统一结果态
- `WorkspaceDashboardPage`、`WorkspaceContentPage`、`WorkspaceForbiddenPage` 接入新布局

- [ ] **Step 4: 重新运行验收，确认壳层断言通过**

Run:
```bash
npm run build
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: workspace shell checks PASS, later business checks may still fail.

- [ ] **Step 5: 提交**

Run:
```bash
git add src/main.jsx src/components/workspace/WorkspaceShell.jsx src/components/workspace/admin src/pages/WorkspaceDashboardPage.jsx src/pages/WorkspaceContentPage.jsx src/pages/WorkspaceForbiddenPage.jsx scripts/verify-pages.mjs
git commit -m "feat: add admin layout foundation"
```

### Task 3: 抽通用表格、表单、详情、上传、排序组件

**Files:**
- Create: `src/components/workspace/admin/AdminStatsRow.jsx`
- Create: `src/components/workspace/admin/AdminFilterBar.jsx`
- Create: `src/components/workspace/admin/AdminTableCard.jsx`
- Create: `src/components/workspace/admin/AdminDetailSection.jsx`
- Create: `src/components/workspace/admin/AdminFormSection.jsx`
- Create: `src/components/workspace/admin/AdminUploadPanel.jsx`
- Create: `src/components/workspace/admin/AdminSortableMediaList.jsx`
- Create: `src/components/workspace/admin/AdminStepShell.jsx`

- [ ] **Step 1: 先写排序与上传辅助交互的失败测试**

新增纯函数测试目标：
- 图片顺序调整会上移、下移并保持稳定顺序
- 上传条目替换封面时只保留一个封面标识

如果组件内部没有纯函数，先创建最小 helper 再测。

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
npm run test:unit -- src/utils/workspaceProjectTimeline.test.js src/utils/workspaceBannerTargets.test.js
```
Expected: FAIL because helper/test target not fully implemented yet.

- [ ] **Step 3: 写最小公共组件实现**

实现：
- 统计卡行
- 筛选栏
- 表格卡片
- 详情区块
- 表单区块
- 上传面板
- 顺序调整列表
- 步骤容器

- [ ] **Step 4: 只跑新增测试，确保工具层通过**

Run:
```bash
npm run test:unit -- src/utils/workspaceProjectTimeline.test.js src/utils/workspaceBannerTargets.test.js
```
Expected: PASS

- [ ] **Step 5: 提交**

Run:
```bash
git add src/components/workspace/admin src/utils/workspaceProjectTimeline.js src/utils/workspaceProjectTimeline.test.js src/utils/workspaceBannerTargets.js src/utils/workspaceBannerTargets.test.js
git commit -m "feat: add reusable admin content components"
```

### Task 4: 抽统一持久化层和公开站适配层

**Files:**
- Create: `src/services/mock/workspaceStorage.js`
- Create: `src/services/mock/workspaceStorage.test.js`
- Create: `src/services/publicSiteContent.js`
- Create: `src/services/publicSiteContent.test.js`

- [ ] **Step 1: 先写失败测试**

覆盖：
- 损坏的模块存储会回退到 seed
- 产品、项目、轮播使用独立存储 key
- 公开站适配层只暴露已上架产品 / 已上架项目 / 已上线轮播
- 公开站适配层会按后台顺序输出轮播和图片

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
npm run test:unit -- src/services/mock/workspaceStorage.test.js src/services/publicSiteContent.test.js
```
Expected: FAIL because helper does not exist.

- [ ] **Step 3: 写最小实现**

实现：
- 模块级持久化读写 helper
- `readPublishedProducts`
- `readPublishedCases`
- `readPublishedHomeBanners`
- 后台 schema -> 公开展示模型 的转换

- [ ] **Step 4: 再跑测试确认通过**

Run:
```bash
npm run test:unit -- src/services/mock/workspaceStorage.test.js src/services/publicSiteContent.test.js
```
Expected: PASS

- [ ] **Step 5: 提交**

Run:
```bash
git add src/services/mock/workspaceStorage.js src/services/mock/workspaceStorage.test.js src/services/publicSiteContent.js src/services/publicSiteContent.test.js
git commit -m "feat: add workspace storage and public site adapters"
```

### Task 5: 扩展产品服务，补齐上架、图片排序、公开预览逻辑

**Files:**
- Create: `src/data/workspace/workspaceProductSeeds.js`
- Modify: `src/services/mockWorkspaceProductsService.js`
- Modify: `src/services/mockWorkspaceProductsService.test.js`
- Modify: `src/services/workspaceProductsApi.js`
- Modify: `src/data/workspaceProductSeeds.js`

- [ ] **Step 1: 先写失败的产品服务测试**

新增覆盖：
- 保存产品时支持图片数组与封面
- 调整图片顺序会持久化
- 草稿、已上架、已下架切换
- 仅已上架产品会出现在公开站适配层
- 关键操作会写入日志

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
npm run test:unit -- src/services/mockWorkspaceProductsService.test.js src/services/publicSiteContent.test.js
```
Expected: FAIL on missing status/media behavior.

- [ ] **Step 3: 写最小实现**

实现：
- 将产品种子数据迁移到 `src/data/workspace/workspaceProductSeeds.js`，并把它确立为后台产品的唯一 canonical seed
- 旧 `src/data/workspaceProductSeeds.js` 仅保留兼容转发，或在所有引用迁移完成后删除
- 产品媒体字段标准化
- 上架状态切换
- 操作日志
- 与公开站适配层的映射字段

- [ ] **Step 4: 再跑测试确认通过**

Run:
```bash
npm run test:unit -- src/services/mockWorkspaceProductsService.test.js src/services/publicSiteContent.test.js
```
Expected: PASS

- [ ] **Step 5: 提交**

Run:
```bash
git add src/data/workspace/workspaceProductSeeds.js src/data/workspaceProductSeeds.js src/services/mockWorkspaceProductsService.js src/services/mockWorkspaceProductsService.test.js src/services/workspaceProductsApi.js src/services/publicSiteContent.js src/services/publicSiteContent.test.js
git commit -m "feat: extend workspace product publishing flow"
```

### Task 6: 建立项目服务与时间轴维护能力

**Files:**
- Create: `src/data/workspace/workspaceProjectSeeds.js`
- Create: `src/services/mock/mockWorkspaceProjectsService.js`
- Create: `src/services/mock/mockWorkspaceProjectsService.test.js`
- Create: `src/services/workspace/workspaceProjectsApi.js`
- Create: `src/utils/workspaceProjectTimeline.js`
- Create: `src/utils/workspaceProjectTimeline.test.js`

- [ ] **Step 1: 先写失败测试**

覆盖：
- 读取 seed 项目
- 创建项目
- 更新项目
- 时间轴节点新增、编辑、删除、排序
- 关联产品写入与读取
- 上架项目进入公开站适配层

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
npm run test:unit -- src/services/mock/mockWorkspaceProjectsService.test.js src/utils/workspaceProjectTimeline.test.js src/services/publicSiteContent.test.js
```
Expected: FAIL because project service does not exist.

- [ ] **Step 3: 写最小实现**

实现：
- 项目 CRUD
- 时间轴节点排序 helper
- 关联产品字段
- 草稿/上架/下架状态
- 公开展示模型转换

- [ ] **Step 4: 再跑测试确认通过**

Run:
```bash
npm run test:unit -- src/services/mock/mockWorkspaceProjectsService.test.js src/utils/workspaceProjectTimeline.test.js src/services/publicSiteContent.test.js
```
Expected: PASS

- [ ] **Step 5: 提交**

Run:
```bash
git add src/data/workspace/workspaceProjectSeeds.js src/services/mock/mockWorkspaceProjectsService.js src/services/mock/mockWorkspaceProjectsService.test.js src/services/workspace/workspaceProjectsApi.js src/utils/workspaceProjectTimeline.js src/utils/workspaceProjectTimeline.test.js src/services/publicSiteContent.js src/services/publicSiteContent.test.js
git commit -m "feat: add workspace project publishing service"
```

### Task 7: 建立轮播图服务与跳转目标校验能力

**Files:**
- Create: `src/data/workspace/workspaceBannerSeeds.js`
- Create: `src/services/mock/mockWorkspaceBannersService.js`
- Create: `src/services/mock/mockWorkspaceBannersService.test.js`
- Create: `src/services/workspace/workspaceBannersApi.js`
- Create: `src/utils/workspaceBannerTargets.js`
- Create: `src/utils/workspaceBannerTargets.test.js`

- [ ] **Step 1: 先写失败测试**

覆盖：
- 读取 seed 轮播
- 创建和编辑轮播项
- 上线/下线切换
- 顺序调整
- 站内跳转目标校验
- 公开首页只读取已上线轮播且保持顺序

- [ ] **Step 2: 运行测试确认失败**

Run:
```bash
npm run test:unit -- src/services/mock/mockWorkspaceBannersService.test.js src/utils/workspaceBannerTargets.test.js src/services/publicSiteContent.test.js
```
Expected: FAIL because banner service does not exist.

- [ ] **Step 3: 写最小实现**

实现：
- 轮播 CRUD
- 顺序调整
- 上线/下线
- 跳转目标验证
- 发布后供首页读取的适配数据

- [ ] **Step 4: 再跑测试确认通过**

Run:
```bash
npm run test:unit -- src/services/mock/mockWorkspaceBannersService.test.js src/utils/workspaceBannerTargets.test.js src/services/publicSiteContent.test.js
```
Expected: PASS

- [ ] **Step 5: 提交**

Run:
```bash
git add src/data/workspace/workspaceBannerSeeds.js src/services/mock/mockWorkspaceBannersService.js src/services/mock/mockWorkspaceBannersService.test.js src/services/workspace/workspaceBannersApi.js src/utils/workspaceBannerTargets.js src/utils/workspaceBannerTargets.test.js src/services/publicSiteContent.js src/services/publicSiteContent.test.js
git commit -m "feat: add workspace banner publishing service"
```

### Task 8: 先把第 1 波完整验收脚本写成失败状态

**Files:**
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 扩展后台与公开站验收脚本**

新增失败断言：
- 中文后台导航与无权限拦截
- 产品新增、编辑、上架、预览、回查
- 项目新增、时间轴维护、上架、预览
- 轮播新增、编辑、顺序调整、上下线、首页预览
- 后台与公开站都不出现不该保留的英文 UI 文案

- [ ] **Step 2: 运行验收确认失败**

Run:
```bash
npm run build
# 在第二个终端保持运行：
npm run preview -- --host 127.0.0.1 --port 4184
# 当前终端执行：
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: FAIL on wave 1 missing routes and behaviors.

- [ ] **Step 3: 提交**

Run:
```bash
git add scripts/verify-pages.mjs
git commit -m "test: add admin wave1 route verification"
```

### Task 9: 用公共组件重构产品后台页面

**Files:**
- Modify: `src/pages/WorkspaceProductsPage.jsx`
- Modify: `src/pages/WorkspaceProductDetailPage.jsx`
- Modify: `src/pages/WorkspaceProductFormPage.jsx`
- Modify: `src/pages/WorkspaceProductImportPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 接入新布局与中文后台文案**

要求：
- 产品列表、详情、表单、导入全部切到 Ant Design 风格
- 全部接入 `AdminLayout` 和公共组件
- 当前英文后台文案全部替换为中文

- [ ] **Step 2: 接入上架闭环与媒体顺序交互**

要求：
- 列表页可切换状态
- 编辑页可管理图片和封面
- 详情页可回查状态与日志
- 导入页不只做视觉重排，必须保留“导入预览 -> 校验结果 -> 入库 -> 回流列表”的完整链路
- 支持跳转公开站预览

- [ ] **Step 3: 跑产品相关单测与验收**

Run:
```bash
npm run test:unit -- src/services/mockWorkspaceProductsService.test.js src/services/publicSiteContent.test.js
npm run build
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: product flow checks PASS, project/banner checks may still fail.

- [ ] **Step 4: 提交**

Run:
```bash
git add src/pages/WorkspaceProductsPage.jsx src/pages/WorkspaceProductDetailPage.jsx src/pages/WorkspaceProductFormPage.jsx src/pages/WorkspaceProductImportPage.jsx src/App.jsx
git commit -m "feat: redesign workspace product pages with antd shell"
```

### Task 10: 把公开站产品链路切到后台发布结果

**Files:**
- Modify: `src/pages/ProductsOverviewPage.jsx`
- Modify: `src/pages/ProductDetailPage.jsx`
- Modify: `src/pages/ProductSharePage.jsx`
- Modify: `src/pages/SearchPage.jsx`

- [ ] **Step 1: 把公开站产品页改为读取公开站适配层**

要求：
- `#/products` 可读到后台已上架产品
- `#/search` 可搜索后台已上架产品
- `#/product/:id` 可打开后台新上架产品
- `#/share/product/:id` 可打开后台新上架产品的分享页

- [ ] **Step 2: 校验草稿和下架产品不会误出现在公开站**

要求：
- 草稿、下架产品不能进入产品概览、搜索结果、分享页
- 已上架产品的图片顺序和后台一致

- [ ] **Step 3: 跑产品公开链路相关验证**

Run:
```bash
npm run test:unit -- src/services/publicSiteContent.test.js src/services/mockWorkspaceProductsService.test.js
npm run build
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: public product flow checks PASS, project/banner checks may still fail.

- [ ] **Step 4: 提交**

Run:
```bash
git add src/pages/ProductsOverviewPage.jsx src/pages/ProductDetailPage.jsx src/pages/ProductSharePage.jsx src/pages/SearchPage.jsx
git commit -m "feat: connect public product pages to workspace publishing"
```

### Task 11: 实现项目后台页面并映射到公开站案例体系

**Files:**
- Create: `src/pages/WorkspaceProjectsPage.jsx`
- Create: `src/pages/WorkspaceProjectDetailPage.jsx`
- Create: `src/pages/WorkspaceProjectFormPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/pages/CasesOverviewPage.jsx`
- Modify: `src/pages/CaseTimelinePage.jsx`
- Modify: `src/pages/CaseDetailPage.jsx`
- Modify: `src/pages/CaseSharePage.jsx`

- [ ] **Step 1: 实现项目列表、详情、表单页面**

要求：
- 中文后台页面
- 接入公共表格、详情、表单组件
- 可维护时间轴节点和关联产品

- [ ] **Step 2: 把公开站案例页改为读取适配层**

要求：
- 已上架项目出现在案例总览
- 已上架项目出现在时间轴
- 详情页与分享页能读取后台新项目
- 草稿 / 下架项目不出现在公开站

- [ ] **Step 3: 跑项目相关单测与验收**

Run:
```bash
npm run test:unit -- src/services/mock/mockWorkspaceProjectsService.test.js src/utils/workspaceProjectTimeline.test.js src/services/publicSiteContent.test.js
npm run build
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: project flow checks PASS, banner checks may still fail.

- [ ] **Step 4: 提交**

Run:
```bash
git add src/pages/WorkspaceProjectsPage.jsx src/pages/WorkspaceProjectDetailPage.jsx src/pages/WorkspaceProjectFormPage.jsx src/App.jsx src/pages/CasesOverviewPage.jsx src/pages/CaseTimelinePage.jsx src/pages/CaseDetailPage.jsx src/pages/CaseSharePage.jsx
git commit -m "feat: add workspace project publishing flow"
```

### Task 12: 实现轮播管理页面并把结果映射到首页

**Files:**
- Create: `src/pages/WorkspaceBannerListPage.jsx`
- Create: `src/pages/WorkspaceBannerFormPage.jsx`
- Modify: `src/App.jsx`
- Modify: `src/pages/HomePage.jsx`

- [ ] **Step 1: 实现轮播列表与表单页面**

要求：
- 列表页展示当前轮播项
- 支持新增、编辑、删除、上下线
- 支持图片顺序调整
- 跳转目标校验失败时阻止保存

- [ ] **Step 2: 把首页主视觉改为读取轮播适配层**

要求：
- 首页展示已上线轮播
- 顺序和后台一致
- 下线项不再展示
- 后台有首页预览跳转入口

- [ ] **Step 3: 跑轮播相关单测与验收**

Run:
```bash
npm run test:unit -- src/services/mock/mockWorkspaceBannersService.test.js src/utils/workspaceBannerTargets.test.js src/services/publicSiteContent.test.js
npm run build
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: banner flow checks PASS.

- [ ] **Step 4: 提交**

Run:
```bash
git add src/pages/WorkspaceBannerListPage.jsx src/pages/WorkspaceBannerFormPage.jsx src/App.jsx src/pages/HomePage.jsx
git commit -m "feat: add workspace banner publishing flow"
```

### Task 13: 把待开发模块接入统一占位页并回填 PRD

**Files:**
- Modify: `src/App.jsx`
- Modify: `docs/PRJ_PRD.md`

- [ ] **Step 1: 接入统一待开发页面**

要求：
- 供应商、询价、导出、权限、日志等第 2 波后的入口进入统一待开发页
- 待开发页复用 `AdminResultState`
- 页面要显示所属波次、返回仪表盘入口

- [ ] **Step 2: 回填 `PRJ_PRD.md`**

必须更新：
- 工作台 / 仪表盘
- 产品管理相关条目
- 项目管理相关条目
- 首页轮播管理相关条目
- 当前测试标准
- 下一步动作

- [ ] **Step 3: 提交**

Run:
```bash
git add src/App.jsx docs/PRJ_PRD.md
git commit -m "docs: backfill admin wave1 progress"
```

### Task 14: 全量验证、修复残余问题并推送

**Files:**
- Modify whatever remains after verification

- [ ] **Step 1: 跑完整单测**

Run:
```bash
npm run test:unit
```
Expected: PASS with zero failures.

- [ ] **Step 2: 跑完整构建**

Run:
```bash
npm run build
```
Expected: exit code 0.

- [ ] **Step 3: 跑完整路由验收**

Run:
```bash
# 在第二个终端保持运行：
npm run preview -- --host 127.0.0.1 --port 4184
# 当前终端执行：
npm run verify:routes -- http://127.0.0.1:4184
```
Expected: PASS on public routes, admin routes, product/project/banner flows, role restrictions, and Chinese UI assertions.

- [ ] **Step 4: 若有失败，先补失败测试再修复，再重跑**

要求：
- 不允许凭“看起来已经好了”结束
- 所有失败必须有对应修复和复验

- [ ] **Step 5: 推送**

Run:
```bash
git push
```

---

## Execution Notes

- 用户已明确要求：计划写完后直接开始开发，不需要再次询问执行方式。
- 执行顺序必须保持：先基座，再服务层，再失败验收脚本，再页面实现，再 PRD 回填。
- 所有新增后台文案默认使用中文。
- `npm run preview` 必须在第二个终端或后台进程中保持运行，不能和 `verify:routes` 写成阻塞式串行命令。
- 完成前不得声称“已通过验收”，除非第 14 任务中的 3 个验证命令都已新鲜运行并通过。
