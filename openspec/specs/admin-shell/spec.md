# Admin Shell Spec

## Purpose

This spec defines route protection, role landing, and corrupted persisted-session recovery for the mock admin shell slice.

## Normative Requirements

### 1. Role Landing Rules

After a successful login, the shell MUST redirect users to their role landing route using these rules:

| role | default landing route |
| --- | --- |
| `employee` | `#/workspace/dashboard` |
| `director` | `#/workspace/dashboard` |
| `developer` | `#/workspace/content` |

The shell MUST preserve `#/login` as a public route, but when an already authenticated user visits `#/login`, the shell MUST redirect immediately to that user's role landing route.

### 2. Protected Route Behavior

All routes under `#/workspace/*` MUST require an authenticated session.

If a user is not authenticated and visits any `#/workspace/*` route, the shell MUST redirect that user to `#/login`.

If an authenticated user visits a `#/workspace/*` route that is not allowed for that user's role, the shell MUST redirect that user to `#/workspace/forbidden`.

The route `#/workspace/forbidden` MUST be accessible to authenticated users of all supported roles.

### 3. Unauthorized and Forbidden Behavior

The shell MUST use these behaviors consistently:

- unauthenticated access to protected workspace routes MUST redirect to `#/login`
- authenticated access to a disallowed workspace route MUST redirect to `#/workspace/forbidden`
- authenticated access to `#/workspace/forbidden` MUST render a forbidden-state page rather than redirect again

### 4. Corrupted Persisted-Session Recovery Policy

When the shell initializes from persisted auth state, it MUST validate the persisted session before restoring it.

The persisted session MUST be treated as corrupted if any of the following are missing or invalid:

- `token`
- `user.id`
- `user.role`
- `user.role` is not one of `employee`, `director`, or `developer`

When corrupted persisted session data is detected, the shell MUST:

1. clear the persisted storage entry
2. reset auth state to unauthenticated
3. if the current route is under `#/workspace/*`, redirect to `#/login`
4. show a non-blocking invalid-session notice to the user

The invalid-session notice MUST explain that the login session is no longer valid and the user must sign in again.
The invalid-session notice text MUST be `登录状态已失效，请重新登录`.

### 5. Session Restoration and Refresh

The shell MUST support restoring a valid persisted session on refresh.

If the persisted session is valid, the shell MUST restore the current user and maintain the authenticated route state according to the role landing and route-protection rules above.
