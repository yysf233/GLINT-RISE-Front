# Apple-Style Public Carousels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把公开站现有轮播统一成一套更接近 Apple 产品介绍页的自动播放与平滑过渡交互。

**Architecture:** 抽出一个轻量的公开轮播控制 hook，统一处理自动播放、悬停暂停、用户手动接管和恢复播放。首页 Hero、首页产品轮播、产品详情主画廊都接入同一套控制逻辑和同一类过渡节奏，案例大图继续跟随 Hero 的活动索引联动。

**Tech Stack:** React、Vite、Framer Motion、Vitest、Testing Library

---

### Task 1: 锁定轮播范围与交互测试

**Files:**
- Modify: `src/pages/HomePage.test.jsx`
- Modify: `src/pages/ProductDetailPage.test.jsx`

- [ ] 为首页补交互测试，断言 Hero 轮播与产品轮播暴露统一的 carousel hook 标记。
- [ ] 为产品详情补交互测试，断言主画廊暴露自动播放、悬停暂停、当前索引标记。
- [ ] 运行目标测试并确认先失败。

### Task 2: 实现公共轮播控制

**Files:**
- Create: `src/hooks/useAppleStyleCarousel.js`

- [ ] 实现最小 hook，支持：
  - 自动播放间隔
  - `prefers-reduced-motion` 降级
  - 悬停暂停 / 移出恢复
  - 手动切换后延迟恢复自动播放
  - `next / prev / goTo`

### Task 3: 接入首页 Hero 与产品轮播

**Files:**
- Modify: `src/pages/HomePage.jsx`

- [ ] Hero 轮播改用统一 hook。
- [ ] 产品轮播从纯手动改为同一套自动播放逻辑。
- [ ] 动画切到更平滑的横向位移 + 轻淡入淡出节奏。

### Task 4: 接入产品详情画廊

**Files:**
- Modify: `src/pages/ProductDetailPage.jsx`

- [ ] 主画廊改为自动轮播。
- [ ] 缩略图点击接管当前索引。
- [ ] 主图区域悬停暂停，离开恢复。

### Task 5: 验证并提交

**Files:**
- Modify: `src/pages/HomePage.test.jsx`
- Modify: `src/pages/ProductDetailPage.test.jsx`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/ProductDetailPage.jsx`
- Create: `src/hooks/useAppleStyleCarousel.js`

- [ ] 跑定向测试。
- [ ] 跑全量单测与构建。
- [ ] 提交并推送当前分支。
