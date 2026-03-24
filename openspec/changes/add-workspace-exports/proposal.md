# Proposal: add-workspace-exports

## Why

The workspace already supports supplier and product CRUD, but the export center remained a placeholder. This blocks the PRD requirement that staff can generate external delivery packages, directors can generate priced approval packages, and the team can retain downloadable history for acceptance and business review.

## What Changes

1. Add a real `#/workspace/exports` management page.
2. Define the export job contract, role boundaries, history, and redownload semantics.
3. Reuse workspace product data and supplier masking rules while generating artifacts.
4. Add browser-level verification that covers employee public export, director priced export, and history redownload.

## Impact

- Unlocks a complete mock export workflow without waiting for backend APIs
- Provides an OpenSpec contract for future backend implementation
- Creates the foundation that quote workflow can reuse for final package output
