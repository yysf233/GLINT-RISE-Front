# Remaining Public Pages Prototype Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页之外的公开站页面继续对齐到 Stitch 的深色 GLINT RISE 原型图语言，同时保留现有搜索、分享、详情跳转和数据同步能力。

**Architecture:** 以已经完成的深色首页为视觉锚点，把剩余公开页拆成三个域分批推进：产品线域、案例线域、入口页与时间轴补齐。每批先把测试断言切到新的原型结构，再做最小共享组件调整和页面重构，避免一次性重写全站导致回归面失控。案例线批次同时需要把公共壳层（导航、页脚、PageShell 背景）统一到深色原型模式。

**Tech Stack:** React、Vite、Tailwind、Framer Motion、Vitest、Stitch MCP screens、现有 `publicSiteContent` / `publicProductsCatalog`

---

## 文件结构

### 第一批重点修改文件

- `src/pages/ProductsOverviewPage.jsx`
- `src/pages/ProductsOverviewPage.test.jsx`
- `src/pages/SearchPage.jsx`
- `src/pages/SearchPage.test.jsx`
- `src/pages/HotProductsPage.jsx`
- `src/pages/HotProductsPage.test.jsx`
- `src/pages/ProductDetailPage.jsx`
- `src/pages/ProductDetailPage.test.jsx`
- `src/components/common/SearchBar.jsx`
- `src/components/common/ProductTile.jsx`
- `src/components/common/MetaTile.jsx`
- `src/components/common/SectionHeading.jsx`

### 第二批重点修改文件

- `src/pages/CasesOverviewPage.jsx`
- `src/pages/CasesOverviewPage.test.jsx`
- `src/pages/CaseDetailPage.jsx`
- `src/pages/CaseDetailPage.test.jsx`
- `src/pages/CaseMapPage.jsx`
- `src/pages/CaseMapPage.test.jsx`
- `src/pages/CaseTimelinePage.jsx`
- `src/pages/CaseTimelinePage.test.jsx`
- `src/pages/CaseSharePage.jsx`
- `src/components/layout/PageShell.jsx`
- `src/components/layout/TopNav.jsx`
- `src/components/layout/Footer.jsx`

### 第三批重点修改文件

- `src/pages/EntryPage.jsx`
- `src/pages/EntryPage.test.jsx`

## 原型映射

- 产品概览：`projects/15241179983541341880/screens/b424cb0ed5984ac0a69684e7cd6d09f5`
- 热门产品列表：`projects/15241179983541341880/screens/a59633dfcf9744a4abea65071ef0e25e`
- 产品详情：`projects/15241179983541341880/screens/b606c2279e67472f84a9c464aec1abb5`
- 搜索结果页：`projects/15241179983541341880/screens/b37c43055d0f47c5ba243c053afef0de`
- 案例总览：`projects/15241179983541341880/screens/ee00007dadf7459ba4a99d656165ba0c`
- 案例详情：`projects/15241179983541341880/screens/27bd7e0ede83457c924a17630af4e360`
- 案例图谱：`projects/15241179983541341880/screens/1e3672a73af34f5aa8b0df03557ba4ed`
- 案例时间轴：无专属 Stitch 页面，沿用案例线深色原型语言补齐
- 入口页：`projects/15241179983541341880/screens/db677a0bd61e452e8cb5322a214f225a`

## 共享约束

- 必须保留 `readPublicSiteSettings()`、`listPublicProducts()`、`getPublicProductFilters()`、`readPublishedHomeBanners()` 现有数据来源，不把公开页硬编码死。
- 必须保留 `/search` 的 `keyword/category/tag` URL 参数同步行为。
- 必须保留产品详情页和案例详情页现有分享入口与跳转逻辑。
- 不改后台工作台页面，也不把工作台样式混入本次公开页改造。

### Task 1: 第一批产品线页组对齐原型

**Files:**
- Modify: `src/pages/ProductsOverviewPage.jsx`
- Modify: `src/pages/ProductsOverviewPage.test.jsx`
- Modify: `src/pages/SearchPage.jsx`
- Modify: `src/pages/SearchPage.test.jsx`
- Modify: `src/pages/HotProductsPage.jsx`
- Modify: `src/pages/HotProductsPage.test.jsx`
- Modify: `src/pages/ProductDetailPage.jsx`
- Modify: `src/pages/ProductDetailPage.test.jsx`
- Modify: `src/components/common/ProductTile.jsx`
- Modify: `src/components/common/MetaTile.jsx`
- Modify: `src/components/common/SectionHeading.jsx`

- [ ] **Step 1: 把产品概览页测试改成原型断言**
  断言目标：
  - `data-products-layout="prototype-dark"`
  - 页面包含原型风格的 Hero 产品策展区
  - 页面包含筛选结果区和搜索占位文案 `搜索洞察、产品、案例`

- [ ] **Step 2: 运行 `npm run test:unit -- src/pages/ProductsOverviewPage.test.jsx` 并确认失败**

- [ ] **Step 3: 把搜索页测试改成原型断言**
  断言目标：
  - 搜索结果页的深色结果布局标记
  - URL 参数摘要仍保留
  - 结果区仍保留产品跳转入口

- [ ] **Step 4: 运行 `npm run test:unit -- src/pages/SearchPage.test.jsx` 并确认失败**

- [ ] **Step 5: 把热门产品页与产品详情页测试改成原型断言**
  断言目标：
  - 热门产品页使用原型式垂直列表或主卡布局
  - 产品详情页使用 `data-product-detail-layout="prototype-dark"`
  - 分享按钮与缩略图切换入口仍保留

- [ ] **Step 6: 运行 `npm run test:unit -- src/pages/HotProductsPage.test.jsx src/pages/ProductDetailPage.test.jsx` 并确认失败**

- [ ] **Step 7: 最小实现产品概览页**
  结构目标：
  - 深色 Hero 大图与右侧策展说明
  - 下方深色筛选结果区
  - 保留现有搜索与分类逻辑

- [ ] **Step 8: 最小实现搜索结果页**
  结构目标：
  - 左侧筛选栏或顶部筛选区
  - 右侧结果网格
  - 保留 URL 参数驱动

- [ ] **Step 9: 最小实现热门产品页**
  结构目标：
  - 深色标题段
  - 主推荐卡 + 列表式热门产品区
  - 返回产品总览入口

- [ ] **Step 10: 最小实现产品详情页**
  结构目标：
  - 深色大图展示
  - 右侧产品标题、说明、CTA
  - 底部参数信息块

- [ ] **Step 11: 调整共享组件以支持第一批页面**
  - `SearchBar` 继续支持深色变体
  - `ProductTile` 支持更贴近原型的深色列表/卡片样式
  - `MetaTile` 支持深色详情信息块
  - `SectionHeading` 支持更贴近原型的标题层级

- [ ] **Step 12: 运行第一批目标测试并确认通过**
  Run: `npm run test:unit -- src/pages/ProductsOverviewPage.test.jsx src/pages/SearchPage.test.jsx src/pages/HotProductsPage.test.jsx src/pages/ProductDetailPage.test.jsx`

- [ ] **Step 13: 运行完整单测并确认通过**
  Run: `npm run test:unit`

- [ ] **Step 14: 运行构建并确认通过**
  Run: `npm run build`

- [ ] **Step 15: 提交第一批改动**
  ```bash
  git add src/pages/ProductsOverviewPage.jsx src/pages/ProductsOverviewPage.test.jsx src/pages/SearchPage.jsx src/pages/SearchPage.test.jsx src/pages/HotProductsPage.jsx src/pages/HotProductsPage.test.jsx src/pages/ProductDetailPage.jsx src/pages/ProductDetailPage.test.jsx src/components/common/ProductTile.jsx src/components/common/MetaTile.jsx src/components/common/SectionHeading.jsx src/components/common/SearchBar.jsx
  git commit -m "feat: align public product pages to prototype"
  ```

### Task 2: 第二批案例线页组对齐原型

**Files:**
- Modify: `src/pages/CasesOverviewPage.jsx`
- Modify: `src/pages/CasesOverviewPage.test.jsx`
- Modify: `src/pages/CaseDetailPage.jsx`
- Modify: `src/pages/CaseDetailPage.test.jsx`
- Modify: `src/pages/CaseMapPage.jsx`
- Modify: `src/pages/CaseMapPage.test.jsx`
- Modify: `src/pages/CaseTimelinePage.jsx`
- Modify: `src/pages/CaseTimelinePage.test.jsx`
- Modify: `src/components/layout/PageShell.jsx`
- Modify: `src/components/layout/TopNav.jsx`
- Modify: `src/components/layout/Footer.jsx`
- Modify: `src/pages/CaseSharePage.jsx`

- [ ] **Step 1: 把案例总览页、案例详情页、案例图谱页、案例时间轴页测试改成原型断言并先跑失败**
- [ ] **Step 2: 最小实现案例总览页深色策展布局**
- [ ] **Step 3: 最小实现案例详情页章节式深色叙事布局**
- [ ] **Step 4: 最小实现案例图谱页深色原型外壳，保留缩放和分享交互**
- [ ] **Step 5: 最小实现案例时间轴页深色长轴布局并保留缩放**
- [ ] **Step 6: 让公共壳层（导航、页脚、PageShell 背景）切到深色原型模式**
- [ ] **Step 7: 让案例分享页视觉跟随详情页体系**
- [ ] **Step 8: 运行案例线目标测试**
  Run: `npm run test:unit -- src/pages/CasesOverviewPage.test.jsx src/pages/CaseDetailPage.test.jsx src/pages/CaseMapPage.test.jsx src/pages/CaseTimelinePage.test.jsx`
- [ ] **Step 9: 运行 `npm run test:unit`**
- [ ] **Step 10: 运行 `npm run build`**
- [ ] **Step 11: 提交案例线改动**

### Task 3: 第三批入口页对齐原型

**Files:**
- Modify: `src/pages/EntryPage.jsx`
- Modify: `src/pages/EntryPage.test.jsx`

- [ ] **Step 1: 把入口页测试改成原型断言并先跑失败**
- [ ] **Step 2: 最小实现深色品牌入口页，保留访客进入和登录入口两个分流按钮**
- [ ] **Step 3: 运行 `npm run test:unit -- src/pages/EntryPage.test.jsx`**
- [ ] **Step 4: 运行 `npm run test:unit`**
- [ ] **Step 5: 运行 `npm run build`**
- [ ] **Step 6: 提交入口页改动**

## 执行顺序建议

1. 第一批产品线页组
2. 第二批案例线页组
3. 第三批入口页

## 本次会话执行范围

- 先完成本计划文档
- 立即开始执行第一批产品线页组
