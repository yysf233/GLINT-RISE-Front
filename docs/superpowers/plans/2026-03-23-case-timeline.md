# Case Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `#/case-timeline` public route with a narrative vertical timeline, expose it in navigation, and backfill `PRJ_PRD.md` to mark the timeline slice complete.

**Architecture:** Keep the existing case overview, case map, and case detail routes intact. Add a focused timeline page plus a small timeline helper in `src/utils`, update shared case data with minimal timeline metadata, and extend the Playwright route verifier to cover the new route and navigation path.

**Tech Stack:** React 18, react-router-dom 7, Vite 5, existing shared layout/components, Playwright route verifier

---

### Task 1: Add the failing route verification

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/scripts/verify-pages.mjs`

- [ ] **Step 1: Write the failing verification expectations**

Add `#/case-timeline` to the verified routes and a dedicated assertion helper that expects:
- the timeline page route to render
- timeline labels to appear
- at least one timeline card/button to exist
- at least one card to navigate into a case detail page

- [ ] **Step 2: Run the verifier to confirm it fails for the missing route**

Run:
```powershell
npm run build
Start-Process -FilePath npm.cmd -ArgumentList 'run','preview','--','--host','127.0.0.1','--port','4173' -WorkingDirectory 'C:\Users\23271\Desktop\光速上升\front'
npm run verify:routes -- http://127.0.0.1:4173
```

Expected: verification fails because `#/case-timeline` is not implemented yet.

- [ ] **Step 3: Keep the failing verifier changes staged for implementation**

No production code yet. Only the verifier should reflect the new contract.

### Task 2: Implement timeline data and route

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/data/siteContent.js`
- Create: `C:/Users/23271/Desktop/光速上升/front/src/utils/caseTimeline.js`
- Create: `C:/Users/23271/Desktop/光速上升/front/src/pages/CaseTimelinePage.jsx`
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/App.jsx`

- [ ] **Step 1: Add the minimal timeline metadata**

Extend case entries with lightweight timeline fields such as `timelineLabel` or another minimal sort/group value so the timeline can show multiple segments without disturbing existing detail-page fields.

- [ ] **Step 2: Implement timeline grouping and sorting helpers**

Create a utility that:
- reads the case list
- derives a stable descending order
- groups cases into timeline sections
- exposes per-card metadata for rendering

- [ ] **Step 3: Build the timeline page**

Implement `CaseTimelinePage.jsx` using existing shared layout/components:
- hero/intro section
- buttons to `#/cases` and `#/case-map`
- vertical grouped timeline
- clickable case cards leading to `#/case/:id`
- responsive single-column mobile layout

- [ ] **Step 4: Register the route**

Add `#/case-timeline` to `App.jsx` and ensure routing works with refresh/history.

### Task 3: Wire navigation and overview entry points

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/data/siteContent.js`
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/components/layout/TopNav.jsx`
- Modify: `C:/Users/23271/Desktop/光速上升/front/src/pages/CasesOverviewPage.jsx`

- [ ] **Step 1: Expose the timeline in nav items**

Add a dedicated nav item for `#/case-timeline` while preserving the existing case overview item.

- [ ] **Step 2: Fix active-nav behavior**

Update `TopNav.jsx` so:
- `#/case-timeline` highlights the timeline nav item
- `#/case-map` and `#/case/:id` still map to the case overview nav item unless there is a stronger explicit timeline route context

- [ ] **Step 3: Add an overview-to-timeline entry**

Update `CasesOverviewPage.jsx` to include a direct button into `#/case-timeline` without removing the existing map entry.

### Task 4: Backfill the project tracker

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/docs/PRJ_PRD.md`

- [ ] **Step 1: Mark the timeline slice complete**

Update status tables and route lists so `项目时间轴 / 案例列表页` reflects:
- case overview
- case timeline
- case map

- [ ] **Step 2: Update the next recommended item**

Remove the independent timeline todo from the recommended order and move the public-site next slice to independent share landing pages.

- [ ] **Step 3: Preserve tracker utility**

Keep the doc useful as a progress-control file by updating:
- current result
- next action
- route inventory
- current implementation vs PRD difference summary

### Task 5: Verify, commit, and push

**Files:**
- Modify if needed after verification fixes: same files as above

- [ ] **Step 1: Run the full verification**

Run:
```powershell
npm run build
Start-Process -FilePath npm.cmd -ArgumentList 'run','preview','--','--host','127.0.0.1','--port','4173' -WorkingDirectory 'C:\Users\23271\Desktop\光速上升\front'
npm run verify:routes -- http://127.0.0.1:4173
```

Expected:
- build passes
- route verification passes including `#/case-timeline`

- [ ] **Step 2: Review the diff**

Check only the intended files are included and unrelated worktree changes remain untouched.

- [ ] **Step 3: Commit**

```powershell
git add src/App.jsx src/components/layout/TopNav.jsx src/data/siteContent.js src/pages/CasesOverviewPage.jsx src/pages/CaseTimelinePage.jsx src/utils/caseTimeline.js scripts/verify-pages.mjs docs/PRJ_PRD.md docs/superpowers/plans/2026-03-23-case-timeline.md
git commit -m "feat: add case timeline page"
```

- [ ] **Step 4: Push**

```powershell
git push
```

### Task 6: Advance the next project item

**Files:**
- Modify: `C:/Users/23271/Desktop/光速上升/front/docs/PRJ_PRD.md`
- Create if needed: next-slice spec/plan docs under `docs/superpowers/`

- [ ] **Step 1: Move the tracker to the next slice**

After the timeline work is committed, update the tracker so the next target is clearly independent share landing pages.

- [ ] **Step 2: Start the next slice in docs**

Create the initial design/progress artifact for the next slice so the repo has an explicit handoff point for the following implementation pass.
