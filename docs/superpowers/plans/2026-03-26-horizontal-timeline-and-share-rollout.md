# Horizontal Timeline And Share Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public case timeline as a horizontal quarter/year canvas driven by published workspace projects, and replace all existing public share buttons with a unified QQ/微信/钉钉 share sheet that degrades safely by environment.

**Architecture:** Keep data sourcing and rendering separate. Workspace project services and form mappers own the new timeline positioning fields; timeline utilities turn published projects into continuous quarter/year rails and positioned cards; the public page owns drag/zoom interaction only. Share behavior is centralized behind one reusable hook/component so public pages pass only title and route metadata while environment-specific branching stays in a single adapter layer.

**Tech Stack:** React 18, React Router, Ant Design, Vitest, existing mock workspace services, current public site content services.

---

### Task 1: Extend workspace project schema for public timeline positioning

**Files:**
- Modify: `src/data/workspace/workspaceProjectSeeds.js`
- Modify: `src/services/mock/mockWorkspaceProjectsService.js`
- Modify: `src/services/workspace/workspaceProjectsApi.js`
- Modify: `src/utils/workspaceProjectForm.js`
- Test: `src/services/mock/mockWorkspaceProjectsService.test.js`
- Test: `src/utils/workspaceProjectForm.test.js`

- [ ] **Step 1: Write the failing tests**

Add assertions for:
- `timelineYear`
- `timelineQuarter`
- `timelineOrder`
- `timelineCardSide`
- `timelineAccent`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/utils/workspaceProjectForm.test.js src/services/mock/mockWorkspaceProjectsService.test.js`
Expected: FAIL because new fields are not mapped/persisted yet.

- [ ] **Step 3: Write minimal implementation**

Update seeds, payload normalization, mock service persistence, exported workspace project API surface, and form mappers to carry the new timeline fields end-to-end.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/utils/workspaceProjectForm.test.js src/services/mock/mockWorkspaceProjectsService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/workspace/workspaceProjectSeeds.js src/services/mock/mockWorkspaceProjectsService.js src/services/workspace/workspaceProjectsApi.js src/utils/workspaceProjectForm.js src/services/mock/mockWorkspaceProjectsService.test.js src/utils/workspaceProjectForm.test.js
git commit -m "feat: add project timeline positioning fields"
```

### Task 2: Upgrade workspace project editing surfaces for the new timeline fields

**Files:**
- Modify: `src/pages/WorkspaceProjectFormPage.jsx`
- Modify: `src/pages/WorkspaceProjectsPage.jsx`

- [ ] **Step 1: Write the failing test or route-level acceptance check**

Prefer adding focused assertions to existing project form/list coverage if present; otherwise create minimal tests around the form mapping/UI labels if needed.

- [ ] **Step 2: Run test to verify it fails**

Run the specific test file you added or updated.
Expected: FAIL because the new public timeline fields are not rendered.

- [ ] **Step 3: Write minimal implementation**

Add:
- year/quarter/order inputs
- card side select
- accent select or boolean control
- list summary column/tag for timeline placement
- save-time validation so public timeline positioning fields are required when a project is intended for public timeline exposure (`status=active` and mapped to a `publicCaseId`)
- clear empty-state/helper copy when the fields are missing on non-public drafts

- [ ] **Step 4: Run test to verify it passes**

Run the same targeted workspace test.
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/WorkspaceProjectFormPage.jsx src/pages/WorkspaceProjectsPage.jsx
git commit -m "feat: expose timeline placement in workspace projects"
```

### Task 3: Build horizontal timeline data utilities from published workspace projects

**Files:**
- Create: `src/utils/publicCaseTimeline.js`
- Test: `src/utils/publicCaseTimeline.test.js`
- Modify: `src/services/publicSiteContent.js`

- [ ] **Step 1: Write the failing test**

Cover:
- filtering to published projects
- deriving `timelineOrder` from year + quarter fallback
- filling missing quarter ticks
- grouping same-quarter items
- falling back card side placement
- disabling entries with missing `publicCaseId`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/utils/publicCaseTimeline.test.js`
Expected: FAIL because utility does not exist.

- [ ] **Step 3: Write minimal implementation**

Create helpers to:
- normalize project timeline metadata
- generate continuous quarter/year ticks
- derive positioned timeline cards
- expose published project timeline entries through `publicSiteContent`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/utils/publicCaseTimeline.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/publicCaseTimeline.js src/utils/publicCaseTimeline.test.js src/services/publicSiteContent.js
git commit -m "feat: add public project timeline utilities"
```

### Task 4: Rebuild the public case timeline page as a draggable horizontal canvas

**Files:**
- Modify: `src/pages/CaseTimelinePage.jsx`
- Test: `src/pages/CaseTimelinePage.test.jsx`

- [ ] **Step 1: Write the failing test**

Replace the old vertical-list assertions with checks for:
- horizontal timeline layout marker
- timeline canvas
- draggable viewport marker
- year tick marker
- quarter tick marker
- zoom controls
- at least one timeline card anchor

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/pages/CaseTimelinePage.test.jsx`
Expected: FAIL because the old DOM structure still renders.

- [ ] **Step 3: Write minimal implementation**

Implement:
- top toolbar
- horizontal rail
- quarter/year ticks
- project nodes with connector lines
- drag state
- wheel/button zoom state
- navigation to `/case/:publicCaseId`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/pages/CaseTimelinePage.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/CaseTimelinePage.jsx src/pages/CaseTimelinePage.test.jsx
git commit -m "feat: rebuild public case timeline canvas"
```

### Task 5: Add the unified share sheet and environment adapters

**Files:**
- Create: `src/utils/shareChannels.js`
- Create: `src/utils/shareChannels.test.js`
- Create: `src/components/common/ShareSheet.jsx`
- Modify: `src/utils/shareCurrentPage.js`

- [ ] **Step 1: Write the failing test**

Cover:
- environment detection for 微信 / 钉钉 / QQ / browser
- channel decision order
- fallback to navigator share / clipboard
- share sheet rendering for QQ / 微信 / 钉钉 / copy link

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/utils/shareChannels.test.js`
Expected: FAIL because new adapter layer does not exist.

- [ ] **Step 3: Write minimal implementation**

Build one reusable share layer that:
- opens a channel picker
- detects host environment
- attempts channel-specific handoff
- falls back safely with user feedback

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/utils/shareChannels.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/shareChannels.js src/utils/shareChannels.test.js src/components/common/ShareSheet.jsx src/utils/shareCurrentPage.js
git commit -m "feat: add unified share sheet"
```

### Task 6: Replace existing public share buttons with the unified share sheet

**Files:**
- Modify: `src/pages/CaseDetailPage.jsx`
- Modify: `src/pages/CaseSharePage.jsx`
- Modify: `src/pages/ProductDetailPage.jsx`
- Modify: `src/pages/ProductSharePage.jsx`
- Modify: `src/pages/CaseMapPage.jsx`
- Modify: `src/pages/CaseTimelinePage.jsx`
- Test: `src/pages/CaseSharePage.test.jsx`
- Test: `src/pages/ProductSharePage.test.jsx`

- [ ] **Step 1: Write the failing tests**

Update share-page expectations to reflect the unified share action entry, and add any page-level structural assertion needed for the new sheet trigger.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/pages/CaseSharePage.test.jsx src/pages/ProductSharePage.test.jsx`
Expected: FAIL because the old direct-share behavior is still wired in.

- [ ] **Step 3: Write minimal implementation**

Swap page-level share handlers to the new shared entry point. Keep existing Chinese labels unless the new design requires clearer wording.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/pages/CaseSharePage.test.jsx src/pages/ProductSharePage.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/CaseDetailPage.jsx src/pages/CaseSharePage.jsx src/pages/ProductDetailPage.jsx src/pages/ProductSharePage.jsx src/pages/CaseMapPage.jsx src/pages/CaseTimelinePage.jsx src/pages/CaseSharePage.test.jsx src/pages/ProductSharePage.test.jsx
git commit -m "feat: unify public share entry points"
```

### Task 7: Full verification

**Files:**
- Modify if needed based on verification output

- [ ] **Step 1: Run the targeted tests**

Run: `npm run test:unit -- src/utils/workspaceProjectForm.test.js src/services/mock/mockWorkspaceProjectsService.test.js src/utils/publicCaseTimeline.test.js src/pages/CaseTimelinePage.test.jsx src/utils/shareChannels.test.js src/pages/CaseSharePage.test.jsx src/pages/ProductSharePage.test.jsx`
Expected: PASS

- [ ] **Step 2: Run the full unit suite**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Final review**

Confirm:
- timeline reads published workspace projects
- horizontal drag/zoom controls exist
- share buttons route through the unified share sheet
- no old direct `navigator.share` entry points remain on public pages
- `rg "navigator\\.share|clipboard\\.writeText|shareCurrentPage\\(" src/pages src/utils` only returns the centralized new share layer and expected wrappers
