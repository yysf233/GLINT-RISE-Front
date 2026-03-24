# Proposal: Sync Public Products From Workspace

## Summary

Add the contract boundary for synchronizing backend workspace products into the public product catalog. This change introduces a dedicated public read model, defines the list/detail interfaces that the frontend consumes, and freezes the publish rules that determine when workspace data is exposed publicly.

## Scope

- Add a new `public-products` spec
- Define the workspace-to-public sync boundary
- Document the public list and detail request/response shapes
- Document the error envelope and publication rules

## Contract Coverage

This change documents:

- public product read model shape
- `listPublicProducts(query)` request parameters and success payload
- `getPublicProduct(publicProductId)` request key and success payload
- publish eligibility rules for workspace products
- public error envelope for missing or invalid reads

## Non-Goals

- No write API for public products
- No admin editor for public products
- No real backend implementation
- No routing or authorization changes

## Success Criteria

- The public product interface is frozen as a reusable backend contract
- Frontend consumers can treat the public catalog as a read-only projection
- Workspace product fields that feed the public catalog are documented clearly
- Missing-product and invalid-query failures use a stable error envelope
