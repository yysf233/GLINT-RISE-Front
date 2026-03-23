# Products Filter Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the current curated top section on `#/products` and add a filterable product results section below it.

**Architecture:** Extend the existing public products page instead of replacing it. Reuse shared search/filter primitives and existing product cards so the new lower section feels like part of the same page rather than a parallel product route.

**Tech Stack:** React 18, react-router-dom 7, Tailwind CSS 4, existing route verifier script with Playwright

---

### Task 1: Add the failing acceptance check

**Files:**
- Modify: `scripts/verify-pages.mjs`

- [ ] Add a verifier for the products page filter section.
- [ ] Assert that `#/products` contains search/filter controls and a results area.
- [ ] Assert that entering a keyword narrows results to a matching product.
- [ ] Assert that clicking a tag filter further narrows the results.
- [ ] Run `npm run verify:routes -- http://127.0.0.1:4173` and confirm it fails for the new products filter expectations.

### Task 2: Implement shared product filtering logic

**Files:**
- Modify: `src/data/siteContent.js`
- Create or modify: `src/utils/productSearch.js`

- [ ] Centralize reusable helpers for product category lookup, tag extraction, and filtering.
- [ ] Keep the helpers compatible with the existing search page to avoid divergence.

### Task 3: Add the lower-half filter results section to `#/products`

**Files:**
- Modify: `src/pages/ProductsOverviewPage.jsx`
- Modify: `src/components/common/SearchBar.jsx` only if shared behavior/text needs adjustment

- [ ] Keep the current top curated structure intact.
- [ ] Add a new lower section with search, category badges, tag badges, result count, and product card grid.
- [ ] Wire the controls to local page state.
- [ ] Add empty-state handling and a reset path.

### Task 4: Align existing product search route with shared logic

**Files:**
- Modify: `src/pages/SearchPage.jsx`

- [ ] Reuse the shared filtering helpers where practical.
- [ ] Preserve current `#/search` behavior as the dedicated product search route.

### Task 5: Update progress tracking and verify

**Files:**
- Modify: `docs/PRJ_PRD.md`

- [ ] Update the PRD progress row for the product list page with the new current result.
- [ ] Mention that the page now keeps the curated upper structure and adds a lower filter results section.
- [ ] Run `npm run build`.
- [ ] Run `npm run verify:routes -- http://127.0.0.1:4173`.
- [ ] Commit and push only the files for this feature.
