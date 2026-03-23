# Mock Auth Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为公开站补齐可运行的 mock 登录、角色分发、受保护后台路由、后台基础壳层和认证接口 OpenSpec，并让相关单元测试与路由验收全部通过。

**Architecture:** 先冻结 OpenSpec 契约，再以 `authApi` 作为唯一认证入口实现 mock 服务。前端新增认证上下文、角色工具函数和受保护路由，把后台页面统一收敛到 `#/workspace/*` 下。测试采用 “Vitest 单元测试 + Playwright 路由验收脚本” 双层验证。

**Tech Stack:** React 18, react-router-dom 7, Vite 5, Vitest, Playwright route verifier, OpenSpec markdown specs

---

## File Map

### Create

- `C:\Users\23271\Desktop\光速上升\front\openspec\specs\auth-session\spec.md`
- `C:\Users\23271\Desktop\光速上升\front\openspec\specs\admin-shell\spec.md`
- `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\proposal.md`
- `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\tasks.md`
- `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\specs\auth-session\spec.md`
- `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\specs\admin-shell\spec.md`
- `C:\Users\23271\Desktop\光速上升\front\src\services\authApi.js`
- `C:\Users\23271\Desktop\光速上升\front\src\services\mockAuthService.js`
- `C:\Users\23271\Desktop\光速上升\front\src\context\AuthContext.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\context\useAuth.js`
- `C:\Users\23271\Desktop\光速上升\front\src\components\auth\ProtectedRoute.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\components\workspace\WorkspaceShell.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\pages\WorkspaceDashboardPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\pages\WorkspaceContentPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\pages\WorkspaceForbiddenPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\utils\authRoutes.js`
- `C:\Users\23271\Desktop\光速上升\front\src\utils\sessionStorage.js`
- `C:\Users\23271\Desktop\光速上升\front\src\utils\authRoutes.test.js`
- `C:\Users\23271\Desktop\光速上升\front\src\services\mockAuthService.test.js`
- `C:\Users\23271\Desktop\光速上升\front\src\utils\sessionStorage.test.js`

### Modify

- `C:\Users\23271\Desktop\光速上升\front\package.json`
- `C:\Users\23271\Desktop\光速上升\front\src\App.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\main.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\pages\LoginPage.jsx`
- `C:\Users\23271\Desktop\光速上升\front\src\components\layout\TopNav.jsx`
- `C:\Users\23271\Desktop\光速上升\front\scripts\verify-pages.mjs`
- `C:\Users\23271\Desktop\光速上升\front\docs\PRJ_PRD.md`

---

### Task 1: Add OpenSpec Contract Files

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\openspec\specs\auth-session\spec.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\openspec\specs\admin-shell\spec.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\proposal.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\tasks.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\specs\auth-session\spec.md`
- Create: `C:\Users\23271\Desktop\光速上升\front\openspec\changes\add-mock-auth-shell\specs\admin-shell\spec.md`

- [ ] **Step 1: Write the contract content from the approved design**

Write exact OpenSpec markdown that defines:
- `login(identifier, password)` request body
- `getSession(token)` request shape and success payload
- `getSession(token)` invalid-session error payload
- `logout()` request shape
- session success payload
- logout success payload
- error object shape and error codes
- role landing rules
- unauthorized and forbidden route behavior
- corrupted persisted-session recovery policy:
  - clear storage
  - reset auth state
  - show invalid-session notice
  - redirect workspace access to `#/login`

- [ ] **Step 2: Verify the files contain no placeholders**

Run: `Get-ChildItem -Recurse "C:\Users\23271\Desktop\光速上升\front\openspec"`
Expected: All six files exist

Run: `rg -n "TODO|TBD|placeholder" "C:\Users\23271\Desktop\光速上升\front\openspec"`
Expected: No matches

- [ ] **Step 3: Commit**

Run:
```bash
git add openspec
git commit -m "docs: add mock auth openspec contract"
```

### Task 2: Add Unit Test Tooling and Auth Route Tests

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\package.json`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\utils\authRoutes.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\utils\authRoutes.test.js`

- [ ] **Step 1: Install Vitest and add scripts**

Run: `npm install -D vitest`

Modify `package.json` to add:
```json
{
  "scripts": {
    "test:unit": "vitest run"
  }
}
```

- [ ] **Step 2: Write the failing route/permission tests**

Test file should cover:
```js
import { describe, expect, it } from "vitest";
import {
  canAccessWorkspaceRoute,
  getDefaultWorkspaceRoute,
  isKnownRole,
} from "./authRoutes";

describe("authRoutes", () => {
  it("returns dashboard for employee", () => {
    expect(getDefaultWorkspaceRoute("employee")).toBe("/workspace/dashboard");
  });

  it("returns content for developer", () => {
    expect(getDefaultWorkspaceRoute("developer")).toBe("/workspace/content");
  });

  it("blocks developer from dashboard", () => {
    expect(canAccessWorkspaceRoute("developer", "/workspace/dashboard")).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test:unit -- src/utils/authRoutes.test.js`
Expected: FAIL because `authRoutes.js` does not exist or exports are missing

- [ ] **Step 4: Write minimal implementation**

Implement exact helpers:
- `isKnownRole(role)`
- `getDefaultWorkspaceRoute(role)`
- `canAccessWorkspaceRoute(role, pathname)`

Rules must match the approved spec.

- [ ] **Step 5: Run unit test to verify it passes**

Run: `npm run test:unit -- src/utils/authRoutes.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

Run:
```bash
git add package.json src/utils/authRoutes.js src/utils/authRoutes.test.js
git commit -m "test: add auth route rules coverage"
```

### Task 3: Add Session Persistence Helpers and Tests

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\src\utils\sessionStorage.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\utils\sessionStorage.test.js`

- [ ] **Step 1: Write the failing session persistence tests**

Cover:
- saves a valid session payload
- restores a valid session payload
- returns `null` for missing token
- returns `null` for missing `user.role`
- returns `null` for unknown role

Use explicit in-memory `localStorage` stubs inside the test file.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/utils/sessionStorage.test.js`
Expected: FAIL because module does not exist

- [ ] **Step 3: Write minimal implementation**

Implement:
- `loadPersistedSession(storage = window.localStorage)`
- `persistSession(session, storage = window.localStorage)`
- `clearPersistedSession(storage = window.localStorage)`

Invalid payload policy must match the spec:
- return `null`
- never throw

- [ ] **Step 4: Run unit test to verify it passes**

Run: `npm run test:unit -- src/utils/sessionStorage.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/utils/sessionStorage.js src/utils/sessionStorage.test.js
git commit -m "test: cover persisted auth session parsing"
```

### Task 4: Add Mock Auth Service and Tests

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\src\services\mockAuthService.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\services\authApi.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\services\mockAuthService.test.js`

- [ ] **Step 1: Write the failing mock service tests**

Cover:
- `login("employee", "glintrise-123")` returns employee session
- unknown identifier returns `USER_NOT_FOUND`
- wrong password returns `INVALID_CREDENTIALS`
- `getSession(validSession)` returns same session shape
- `logout()` returns `{ success: true }`

Use the exact error shape from the spec:
```js
{
  error: {
    code: "INVALID_CREDENTIALS",
    message: "账号或密码错误",
  },
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/services/mockAuthService.test.js`
Expected: FAIL because service does not exist

- [ ] **Step 3: Write minimal implementation**

Implement:
- mock user table for `employee`, `director`, `developer`
- fixed password `glintrise-123`
- Promise-based API with small artificial delay
- `authApi.getSession({ token })` contract, where the caller passes the restored token instead of the service reading storage directly
- `authApi` re-exporting the mock implementation as the current provider

- [ ] **Step 4: Run unit test to verify it passes**

Run: `npm run test:unit -- src/services/mockAuthService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/services/mockAuthService.js src/services/authApi.js src/services/mockAuthService.test.js
git commit -m "feat: add mock auth service contract"
```

### Task 5: Add Auth Context and Protected Routing

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\src\context\AuthContext.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\context\useAuth.js`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\components\auth\ProtectedRoute.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\src\main.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\src\App.jsx`

- [ ] **Step 1: Write the route verifier assertions first**

Before implementation, extend `scripts/verify-pages.mjs` with checks that will eventually verify:
- unauthenticated `#/workspace/dashboard` redirects to `#/login`
- successful logins land on the correct route per role
- forbidden role access lands on `#/workspace/forbidden`

Do not implement the production code yet.

- [ ] **Step 2: Run the verifier to confirm it fails for the expected reason**

Run:
```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4181
npm run verify:routes -- http://127.0.0.1:4181
```
Expected: FAIL on missing workspace/auth flow assertions

- [ ] **Step 3: Implement auth context and protected route**

Implement:
- `AuthProvider`
- `useAuth`
- auth bootstrap from persisted session
- bootstrap flow: `loadPersistedSession()` -> `authApi.getSession({ token })`
- non-blocking invalid-session notice
- `ProtectedRoute` that redirects to `#/login` or `#/workspace/forbidden`
- corrupted-session recovery path that clears storage and resets auth state

- [ ] **Step 3.1: Add explicit bootstrap coverage to unit tests**

Before finalizing the auth context, add or extend tests to cover:
- valid persisted session bootstraps to authenticated state inputs
- corrupted persisted session returns `null`
- invalid token response clears storage and returns unauthenticated state

Wire `AuthProvider` at the app root and add route groups in `App.jsx`.

- [ ] **Step 4: Re-run targeted unit tests**

Run:
```bash
npm run test:unit -- src/utils/authRoutes.test.js src/utils/sessionStorage.test.js src/services/mockAuthService.test.js
```
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/context/AuthContext.jsx src/context/useAuth.js src/components/auth/ProtectedRoute.jsx src/main.jsx src/App.jsx scripts/verify-pages.mjs
git commit -m "feat: add protected workspace routing"
```

### Task 6: Build the Workspace Shell and Pages

**Files:**
- Create: `C:\Users\23271\Desktop\光速上升\front\src\components\workspace\WorkspaceShell.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\pages\WorkspaceDashboardPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\pages\WorkspaceContentPage.jsx`
- Create: `C:\Users\23271\Desktop\光速上升\front\src\pages\WorkspaceForbiddenPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\src\App.jsx`

- [ ] **Step 1: Write verifier expectations for visible shell states**

Add route-level assertions for:
- dashboard renders employee/director shell copy
- content page renders developer shell copy
- forbidden page exposes “return” actions
- shell exposes logout and back-to-site controls

- [ ] **Step 2: Run verifier to watch it fail**

Run: `npm run verify:routes -- http://127.0.0.1:4181`
Expected: FAIL because workspace pages do not exist yet

- [ ] **Step 3: Implement the shell and pages**

Shell requirements:
- left nav
- top bar
- role badge
- logout button
- back to public site button

Page requirements:
- `dashboard`: employee/director welcome + future module placeholders
- `content`: developer content maintenance placeholders
- `forbidden`: no-permission explanation + recovery actions

- [ ] **Step 4: Re-run verifier**

Run: `npm run verify:routes -- http://127.0.0.1:4181`
Expected: some auth/login failures may remain, but shell rendering assertions should pass once login is wired

- [ ] **Step 5: Commit**

Run:
```bash
git add src/components/workspace/WorkspaceShell.jsx src/pages/WorkspaceDashboardPage.jsx src/pages/WorkspaceContentPage.jsx src/pages/WorkspaceForbiddenPage.jsx src/App.jsx scripts/verify-pages.mjs
git commit -m "feat: add workspace shell and starter pages"
```

### Task 7: Upgrade the Login Page to Real Mock Auth Flow

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\src\pages\LoginPage.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\src\components\layout\TopNav.jsx`
- Modify: `C:\Users\23271\Desktop\光速上升\front\src\App.jsx`

- [ ] **Step 1: Extend verifier for login page behavior**

Add assertions for:
- login form fields visible
- quick-fill cards populate but do not auto-submit
- empty submit shows validation error
- wrong password shows API error
- employee/director/developer login flows land correctly
- logged-in user revisiting `#/login` is redirected
- logout returns to `#/login`

- [ ] **Step 2: Run verifier to confirm it fails**

Run: `npm run verify:routes -- http://127.0.0.1:4181`
Expected: FAIL on login flow assertions

- [ ] **Step 3: Implement the minimal login flow**

Implement:
- controlled form state
- inline validation
- loading state
- mock API submission
- success redirect by role
- login quick-fill helpers
- login-page redirect-away for already authenticated users

Update `TopNav` as needed so public pages can still reach login but workspace pages do not show conflicting public navigation.

- [ ] **Step 4: Run full unit tests**

Run: `npm run test:unit`
Expected: PASS

- [ ] **Step 5: Commit**

Run:
```bash
git add src/pages/LoginPage.jsx src/components/layout/TopNav.jsx src/App.jsx scripts/verify-pages.mjs
git commit -m "feat: add mock login flow and role redirects"
```

### Task 8: Final Verification and PRD Backfill

**Files:**
- Modify: `C:\Users\23271\Desktop\光速上升\front\docs\PRJ_PRD.md`
- Modify: `C:\Users\23271\Desktop\光速上升\front\scripts\verify-pages.mjs`

- [ ] **Step 1: Backfill PRD status**

Update `docs/PRJ_PRD.md`:
- set “内部后台 登录页” from `进行中` to `已完成`
- set “工作台 / 仪表盘” from `待开始` to `进行中`
- describe current workspace shell routes and role landing
- append test standards for this slice

- [ ] **Step 2: Run all verification commands**

Run:
```bash
npm run test:unit
npm run build
npm run preview -- --host 127.0.0.1 --port 4181
npm run verify:routes -- http://127.0.0.1:4181
```
Expected:
- unit tests pass
- build passes
- route verification passes including workspace/auth flow

- [ ] **Step 3: Review diff for unrelated changes**

Run:
```bash
git status --short
git diff --stat
```
Expected: only intended auth/mock/workspace/spec/PRD/test files are staged or modified

- [ ] **Step 4: Commit**

Run:
```bash
git add docs/PRJ_PRD.md scripts/verify-pages.mjs
git commit -m "docs: backfill auth shell progress"
```

- [ ] **Step 5: Push**

Run:
```bash
git push
```

---

## Completion Checklist

- [ ] OpenSpec auth/session and admin-shell files exist and are complete
- [ ] Vitest is installed and `npm run test:unit` works
- [ ] Mock auth API matches the approved contract
- [ ] Session restore/clear logic matches the invalid-session policy
- [ ] Protected workspace routes are enforced
- [ ] Login page supports validation, loading, success and failure states
- [ ] Workspace shell exists for dashboard/content/forbidden
- [ ] PRD is backfilled for the new status
- [ ] Unit tests pass
- [ ] Build passes
- [ ] Route verifier passes
- [ ] All commits are pushed
