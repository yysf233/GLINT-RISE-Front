# Homepage Prototype Realignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `#/home` 改造成接近 Stitch 深色科技首页原型的布局，同时保留轮播、搜索、跳转和页面动效。

**Architecture:** 只重做首页和首页壳层的深色变体，不破坏其他公开站页面的浅色主题。`TopNav`、`Footer`、`SearchBar` 增加首页专属视觉分支，`HomePage` 重建为原型结构，仍继续读取现有公开数据服务。

**Tech Stack:** React、Framer Motion、Tailwind、Vitest、现有公开站 mock 服务

---

## 文件结构

### 重点修改文件

- `src/pages/HomePage.jsx`
- `src/pages/HomePage.test.jsx`
- `src/components/layout/TopNav.jsx`
- `src/components/layout/TopNav.test.jsx`
- `src/components/layout/Footer.jsx`
- `src/components/common/SearchBar.jsx`
- `src/components/layout/PageShell.jsx`

### Task 1: 写首页与导航失败测试

**Files:**
- Modify: `src/pages/HomePage.test.jsx`
- Modify: `src/components/layout/TopNav.test.jsx`

- [ ] **Step 1: 为首页增加原型结构断言**
- [ ] **Step 2: 为导航增加首页深色变体断言**
- [ ] **Step 3: 运行 `npm run test:unit -- src/pages/HomePage.test.jsx src/components/layout/TopNav.test.jsx` 并确认失败**

### Task 2: 实现首页深色原型骨架

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/components/common/SearchBar.jsx`

- [ ] **Step 1: 重建 Hero 为深色原型布局并保留轮播钩子**
- [ ] **Step 2: 重建案例区、产品区、品牌拼贴区**
- [ ] **Step 3: 修正首页可见文案，避免乱码**
- [ ] **Step 4: 运行 `npm run test:unit -- src/pages/HomePage.test.jsx`**

### Task 3: 实现首页专属顶栏与页脚视觉

**Files:**
- Modify: `src/components/layout/TopNav.jsx`
- Modify: `src/components/layout/Footer.jsx`
- Modify: `src/components/layout/PageShell.jsx`

- [ ] **Step 1: 为首页导航增加深色原型变体并保留右侧搜索交互**
- [ ] **Step 2: 为首页页脚增加深色极简变体**
- [ ] **Step 3: 保持页面动效容器不丢失**
- [ ] **Step 4: 运行 `npm run test:unit -- src/components/layout/TopNav.test.jsx src/pages/HomePage.test.jsx`**

### Task 4: 完成整体验收

**Files:**
- Modify: `docs/PRJ_PRD.md`

- [ ] **Step 1: 运行 `npm run build`**
- [ ] **Step 2: 如预览可用，运行 `npm run verify:routes -- http://127.0.0.1:4184`**
- [ ] **Step 3: 回填 PRD 中首页视觉纠偏进度**
