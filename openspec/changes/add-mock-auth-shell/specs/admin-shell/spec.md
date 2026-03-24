# Change Spec: Admin Shell

This change introduces route protection, role landing, and persisted-session recovery rules for the mock admin shell.

## Normative Requirements

### Role Landing

| role | default landing route |
| --- | --- |
| `employee` | `#/workspace/dashboard` |
| `director` | `#/workspace/dashboard` |
| `developer` | `#/workspace/content` |

An authenticated user who visits `#/login` MUST be redirected to the role landing route for that user's role.

### Protected Routes

All `#/workspace/*` routes MUST require authentication.

An unauthenticated user who visits any `#/workspace/*` route MUST be redirected to `#/login`.

An authenticated user who visits a workspace route that is not allowed for that user's role MUST be redirected to `#/workspace/forbidden`.

`#/workspace/forbidden` MUST be available to all authenticated users.
The shell MUST NOT redirect away from `#/workspace/forbidden` for a user who has already been routed there.

### Corrupted Persisted-Session Recovery

On startup, the shell MUST validate any persisted session before restoring it.

If persisted session data is missing `token`, `user.id`, or `user.role`, or if `user.role` is not one of `employee`, `director`, or `developer`, the shell MUST:

1. clear persisted storage
2. reset auth state to unauthenticated
3. if the current route is under `#/workspace/*`, redirect to `#/login`
4. show a non-blocking invalid-session notice

The invalid-session notice text MUST be `登录状态已失效，请重新登录`.

### Valid Session Restore

A valid persisted session MUST restore the authenticated user after refresh and keep route protection behavior unchanged.
