# Proposal: Add Workspace Products Contract

## Summary

Add the OpenSpec contract files required for the internal workspace products module. This change freezes the backend product record shape, list query contract, create/update rules, import format, and route authorization expectations so the mock implementation and a future real backend can share the same behavior boundary.

## Scope

- Add a new `workspace-products` spec
- Extend the admin-shell spec with workspace product route rules
- Add change-scoped specs, proposal, and task tracking for this slice

## Contract Coverage

This change documents:

- workspace product record shape
- list query fields and allowed values
- list/detail/create/update/bulk-tag payload shapes
- canonical import preview and import format
- local persistence rules for the mock store
- employee/director allow and developer deny rules for all product workspace routes

## Non-Goals

- No supplier module contract
- No quotation workflow contract
- No export center contract
- No real backend API server

## Success Criteria

- The product module has an implementation-ready contract
- Product route authorization is documented in OpenSpec
- Mock import behavior is fixed to a canonical demo format
- The spec matches the implemented mock service and route verifier

