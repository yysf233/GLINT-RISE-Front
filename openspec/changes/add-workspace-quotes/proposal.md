# Proposal: add-workspace-quotes

## Why

The workspace currently has products, projects, suppliers, and export center contracts, but the quote workflow is still only a PRD placeholder. That leaves the procurement path incomplete and blocks the Step1-5 business chain that connects requirements intake, product matching, supplier recommendation, pricing, and final quote sheet generation.

## What Changes

1. Add a real `#/workspace/quotes` workflow contract.
2. Define the five-step quote flow and the mock data model it needs.
3. Freeze the linkage between quote drafts, workspace products, workspace suppliers, and the export center.
4. Document the role matrix, the quote-sheet download payload, and the error envelopes for future backend implementation.

## Impact

- Unblocks the UI and mock service implementation for the procurement flow
- Gives future backend work a stable quote contract instead of a loosely described PRD section
- Creates a clean handoff from final quote generation to export-center prefill
