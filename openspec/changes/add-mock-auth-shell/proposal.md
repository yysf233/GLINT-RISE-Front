# Proposal: Add Mock Auth Shell Contract Files

## Summary

Add the OpenSpec contract files required for the mock auth shell slice. This change freezes the authentication session contract and the admin shell route behavior so the implementation can be built and later swapped from mock services to real backend services without changing page logic.

## Scope

- Create base specs for `auth-session` and `admin-shell`
- Create the change proposal and task list
- Create change-scoped specs for the same two areas

## Contract Coverage

This change documents:

- `login(identifier, password)` request and success/error payloads
- `getSession(token)` request and success/error payloads
- `logout()` request and success payloads
- shared error object shape and supported error codes
- role landing rules
- unauthorized and forbidden route behavior
- corrupted persisted-session recovery policy

## Non-Goals

- No runtime code changes
- No API server implementation
- No UI implementation
- No route or auth logic refactor beyond the documented contract

## Success Criteria

- All six requested OpenSpec files exist
- The files contain no temporary stub text
- The documents are implementation-ready and consistent with the approved design spec
