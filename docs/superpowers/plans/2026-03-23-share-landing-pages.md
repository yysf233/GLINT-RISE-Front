# Share Landing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add independent public share landing pages for products and cases, and update detail-page sharing to point at those landing routes.

**Architecture:** Keep the existing product/case detail pages intact. Add two focused share routes with lightweight public layouts, extract a small URL helper for share targets, and extend the route verifier to cover direct-open share pages plus the entry CTA back into the main detail routes.

**Tech Stack:** React 18, react-router-dom 7, Vite 5, existing shared layout/components, Playwright route verifier

---

### Task 1: Add failing verification for share routes

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/scripts/verify-pages.mjs`

- [ ] **Step 1: Add share-route expectations**

Require:
- `#/share/product/:id`
- `#/share/case/:id`
- each share page renders
- each share page exposes an “进入官网详情” CTA

- [ ] **Step 2: Run verifier and confirm failure**

Run:
```powershell
npm run build
npm run verify:routes -- http://127.0.0.1:4173
```

Expected: failure because the share routes do not exist yet.

### Task 2: Implement share target helpers

**Files:**
- Create: `C:/Users/23271/Desktop/光速上升/front/src/utils/shareRoutes.js`
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/utils/shareCurrentPage.js`

- [ ] **Step 1: Add route builders**

Create helper functions for:
- product detail route
- case detail route
- product share route
- case share route

- [ ] **Step 2: Update share utility**

Allow detail pages to pass the explicit share target route so native share / clipboard copy uses the landing-page URL instead of the current page URL.

### Task 3: Build the share pages

**Files:**
- Create: `C:/Users/23271/Desktop/光速上升/front/src/pages/ProductSharePage.jsx`
- Create: `C:/Users/23271/Desktop/光速上升/front/src/pages/CaseSharePage.jsx`
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/App.jsx`

- [ ] **Step 1: Create product share page**

Render:
- hero image
- product name, tag, summary
- public meta summary
- CTA into `#/product/:id`

- [ ] **Step 2: Create case share page**

Render:
- hero image
- case title, timeline/year label, summary
- public project summary
- CTA into `#/case/:id`

- [ ] **Step 3: Register routes**

Add:
- `#/share/product/:id`
- `#/share/case/:id`

### Task 4: Update detail-page sharing

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/pages/ProductDetailPage.jsx`
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/pages/CaseDetailPage.jsx`

- [ ] **Step 1: Point product share to product share page**
- [ ] **Step 2: Point case share to case share page**
- [ ] **Step 3: Keep notices and fallback copy behavior intact**

### Task 5: Backfill tracker and verify

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/docs/PRJ_PRD.md`
- Modify: `C:/Users/23271/Desktop/光速上升/front/scripts/verify-pages.mjs`

- [ ] **Step 1: Mark share landing pages complete in PRD after implementation**
- [ ] **Step 2: Run `npm run build`**
- [ ] **Step 3: Run `npm run verify:routes -- http://127.0.0.1:4173`**
- [ ] **Step 4: Commit with a focused message and push**
