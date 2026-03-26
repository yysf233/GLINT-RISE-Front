# Product Detail Header Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove redundant product-detail header chrome and restyle the product image carousel to match an Apple-style thumbnail rail with cleaner spacing and focus states.

**Architecture:** Keep the current product-detail content structure and hero media model, but simplify the header to only back/share actions. Convert the thumbnail selector into a centered glass rail with wider card spacing, stronger active-state emphasis, and explicit carousel markers for verification.

**Tech Stack:** React 18, React Router, Tailwind utility classes, Vitest, Playwright

---

### Task 1: Lock the behavior in tests

**Files:**
- Modify: `src/pages/ProductDetailPage.test.jsx`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run `npm.cmd run test:unit -- src/pages/ProductDetailPage.test.jsx` to verify it fails**
- [ ] **Step 3: Assert the removed header elements are absent and the Apple-style carousel rail markers are present**
- [ ] **Step 4: Re-run the same test until it passes**

### Task 2: Simplify the header and restyle the carousel

**Files:**
- Modify: `src/pages/ProductDetailPage.jsx`

- [ ] **Step 1: Remove the product-detail brand text and center tab navigation from the header**
- [ ] **Step 2: Add explicit carousel rail/thumb markers for testing**
- [ ] **Step 3: Restyle the thumbnail selector into a centered Apple-like glass rail with larger spacing and stronger active state**
- [ ] **Step 4: Keep the existing image-switch interaction intact**

### Task 3: Verify in browser and ship

**Files:**
- Verify: `src/pages/ProductDetailPage.jsx`
- Verify: `src/pages/ProductDetailPage.test.jsx`

- [ ] **Step 1: Run `npm.cmd run test:unit -- src/pages/ProductDetailPage.test.jsx`**
- [ ] **Step 2: Run `npm.cmd run test:unit`**
- [ ] **Step 3: Run `npm.cmd run build`**
- [ ] **Step 4: Run local/production headless browser verification for header removal and carousel switching**
- [ ] **Step 5: Commit, push, and redeploy Vercel**
