# Proposal: Add Workspace Suppliers Module

## Why

The internal backend already supports products, projects, and banner management, but supplier management is still a blocker for procurement workflows and quote recommendation.

We need a backend-facing supplier contract that fixes:

- canonical supplier record fields
- private supplier visibility and ownership rules
- employee vs director edit permissions
- import preview and auto-rating behavior
- export behavior that reuses the same visibility projection

## What Changes

- add a canonical `workspace-suppliers` spec
- add supplier CRUD, import preview, import, and export rules
- define a role x action x ownership matrix
- define a shared masking contract for list, detail, and export reads

## Impact

- unblocks supplier management UI implementation
- creates a reusable procurement contract for quote and export modules
- gives future backend work a stable business baseline
