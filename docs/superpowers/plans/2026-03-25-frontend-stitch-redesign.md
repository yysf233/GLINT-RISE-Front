# Frontend Stitch Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不损失现有公开站功能的前提下，把前台页面逐页改造成接近 Stitch 原型的浅底蓝系视觉系统，并完成逐页验收和整站回归。

**Architecture:** 先建立公开站局部主题注入层，避免后台工作台跟着换肤，再按页面域分批重写首页、产品线、案例线和入口页。首页与产品线继续保持现有前后台联动，案例线和入口页保留当前静态内容源，测试通过 Vitest 静态断言与 `verify-pages.mjs` 浏览器回归双层验证功能没有退化。

**Tech Stack:** React、Vite、Tailwind、Framer Motion、Vitest、现有 mock services、`scripts/verify-pages.mjs`

---

## 文件结构

### 重点修改文件

- `src/App.jsx`
- `src/theme/tokens.js`
- `src/index.css`
- `src/components/layout/PageShell.jsx`
- `src/components/layout/TopNav.jsx`
- `src/components/layout/Footer.jsx`
- `src/components/common/SectionHeading.jsx`
- `src/components/common/SearchBar.jsx`
- `src/components/common/ProductTile.jsx`
- `src/components/common/ImageCard.jsx`
- `src/components/common/MetaTile.jsx`
- `src/components/common/Badge.jsx`
- `src/pages/HomePage.jsx`
- `src/pages/ProductsOverviewPage.jsx`
- `src/pages/SearchPage.jsx`
- `src/pages/HotProductsPage.jsx`
- `src/pages/ProductDetailPage.jsx`
- `src/pages/ProductSharePage.jsx`
- `src/pages/CasesOverviewPage.jsx`
- `src/pages/CaseDetailPage.jsx`
- `src/pages/CaseTimelinePage.jsx`
- `src/pages/CaseMapPage.jsx`
- `src/pages/CaseSharePage.jsx`
- `src/pages/EntryPage.jsx`
- `src/pages/LoginPage.jsx`
- `scripts/verify-pages.mjs`
- `docs/PRJ_PRD.md`

### 重点新增测试

- `src/components/layout/TopNav.test.jsx`
- `src/components/layout/PageShell.test.jsx`
- `src/pages/HomePage.test.jsx`
- `src/pages/ProductsOverviewPage.test.jsx`
- `src/pages/ProductDetailPage.test.jsx`

---

### Task 0: 建立公开站测试与主题隔离前置条件

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/layout/PageShell.jsx`
- Modify: `scripts/verify-pages.mjs`
- Test: `src/components/layout/PageShell.test.jsx`

- [ ] **Step 1: 写失败断言，锁定公开站局部主题容器和现有 test hook 不被删掉**
- [ ] **Step 2: 运行相关测试并确认失败**
- [ ] **Step 3: 最小实现公开站主题隔离层，保证后台工作台不受影响**
- [ ] **Step 4: 运行相关测试并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 提交一次前置基建改动**

### Task 1: 固化新视觉主题与公共布局

**Files:**
- Modify: `src/theme/tokens.js`
- Modify: `src/index.css`
- Modify: `src/components/layout/PageShell.jsx`
- Modify: `src/components/layout/TopNav.jsx`
- Modify: `src/components/layout/Footer.jsx`
- Test: `src/components/layout/TopNav.test.jsx`
- Test: `src/components/layout/PageShell.test.jsx`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 写公共层失败测试，锁定导航搜索交互和全站 page shell hook**
- [ ] **Step 2: 运行公共层测试并确认按预期失败**
- [ ] **Step 3: 最小实现 Stitch 浅底主题 token 与公共布局**
- [ ] **Step 4: 运行公共层测试并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 运行浏览器回归，确认顶部搜索、页面动效和后台入口不退化**
- [ ] **Step 6: 提交一次公共层改动**

### Task 2: 重写首页并保留轮播、搜索、推荐功能

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/components/common/SectionHeading.jsx`
- Modify: `src/components/common/SearchBar.jsx`
- Modify: `src/components/common/ImageCard.jsx`
- Modify: `src/components/common/ProductTile.jsx`
- Test: `src/pages/HomePage.test.jsx`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 写首页失败断言，覆盖轮播标题、搜索提交、后台轮播同步**
- [ ] **Step 2: 运行首页相关测试并确认失败**
- [ ] **Step 3: 最小实现首页高拟真改版**
- [ ] **Step 4: 运行首页单测并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 运行浏览器回归，确认首页相关断言通过**
- [ ] **Step 7: 提交首页改动**

### Task 3: 重写产品概览页与搜索结果页

**Files:**
- Modify: `src/pages/ProductsOverviewPage.jsx`
- Modify: `src/pages/SearchPage.jsx`
- Modify: `src/components/common/Badge.jsx`
- Modify: `src/components/common/ProductTile.jsx`
- Test: `src/pages/ProductsOverviewPage.test.jsx`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 写产品概览页失败测试，并在浏览器回归中补搜索页失败断言，覆盖筛选、URL 参数、跳转**
- [ ] **Step 2: 运行相关测试并确认失败**
- [ ] **Step 3: 最小实现产品概览与搜索页高拟真改版**
- [ ] **Step 4: 运行相关测试并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 运行浏览器回归，确认产品线搜索链路通过**
- [ ] **Step 7: 提交产品概览与搜索页改动**

### Task 4: 重写热门产品页、产品详情页与分享页

**Files:**
- Modify: `src/pages/HotProductsPage.jsx`
- Modify: `src/pages/ProductDetailPage.jsx`
- Modify: `src/pages/ProductSharePage.jsx`
- Modify: `src/components/common/MetaTile.jsx`
- Test: `src/pages/ProductDetailPage.test.jsx`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 写产品详情失败测试，并在浏览器回归中补热门产品和分享页断言，覆盖图片切换、分享入口、后台同步字段展示**
- [ ] **Step 2: 运行相关测试并确认失败**
- [ ] **Step 3: 最小实现热门产品、详情、分享页高拟真改版**
- [ ] **Step 4: 运行相关测试并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 运行浏览器回归，确认产品详情与分享链路通过**
- [ ] **Step 7: 提交产品详情域改动**

### Task 5: 重写案例总览与案例详情域

**Files:**
- Modify: `src/pages/CasesOverviewPage.jsx`
- Modify: `src/pages/CaseDetailPage.jsx`
- Modify: `src/pages/CaseSharePage.jsx`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 在浏览器回归中补案例总览、案例详情和分享页失败断言，覆盖跳转、分享、核心文案展示**
- [ ] **Step 2: 运行相关测试并确认失败**
- [ ] **Step 3: 最小实现案例总览、案例详情、案例分享页高拟真改版**
- [ ] **Step 4: 运行相关测试并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 运行浏览器回归，确认案例详情链路通过**
- [ ] **Step 7: 提交案例详情域改动**

### Task 6: 重写案例时间轴与案例图谱

**Files:**
- Modify: `src/pages/CaseTimelinePage.jsx`
- Modify: `src/pages/CaseMapPage.jsx`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 为时间轴与图谱关键交互补失败浏览器断言**
- [ ] **Step 2: 运行相关检查并确认失败**
- [ ] **Step 3: 最小实现时间轴与图谱页高拟真改版**
- [ ] **Step 4: 运行相关测试并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 运行浏览器回归，确认时间轴和图谱链路通过**
- [ ] **Step 7: 提交案例扩展页改动**

### Task 7: 重写入口页与登录页公开站外壳

**Files:**
- Modify: `src/pages/EntryPage.jsx`
- Modify: `src/pages/LoginPage.jsx`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 为入口页与登录页关键展示补失败浏览器断言**
- [ ] **Step 2: 运行相关检查并确认失败**
- [ ] **Step 3: 最小实现入口页与登录页高拟真改版**
- [ ] **Step 4: 运行相关测试并确认通过**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 运行浏览器回归，确认入口和登录路径通过**
- [ ] **Step 7: 提交入口与登录页改动**

### Task 8: 更新 PRD 与执行整站最终回归

**Files:**
- Modify: `docs/PRJ_PRD.md`
- Modify: `docs/REGRESSION_TEST_PLAN.md`
- Modify: `docs/REGRESSION_TEST_REPORT.md`
- Modify: `scripts/verify-pages.mjs`

- [ ] **Step 1: 回填前台高拟真改版的阶段性成果到 PRD**
- [ ] **Step 2: 更新回归文档，补充逐页改版验收结果**
- [ ] **Step 3: 运行 `npm run test:unit`**
- [ ] **Step 4: 运行 `npm run build`**
- [ ] **Step 5: 启动预览并运行 `npm run verify:routes -- http://127.0.0.1:4184`**
- [ ] **Step 6: 检查四类重点验收项并记录结果，明确区分“后台驱动页面”和“静态内容页面”**
- [ ] **Step 7: 提交最终整站改版结果**
