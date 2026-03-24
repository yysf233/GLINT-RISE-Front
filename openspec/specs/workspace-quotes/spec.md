# Workspace Quotes Spec

## Purpose

This spec defines the quote workflow contract used by the internal workspace. It freezes the five-step quote flow, the mock data model, the role boundaries, and the data-linkage rules that any future backend implementation MUST preserve.

The quote workflow is not an isolated page. It MUST reuse:

- current workspace product data
- current workspace supplier data
- supplier visibility and masking rules
- export center prefill and artifact generation rules

Business note:

- `draft` quotes are working records used during matching and pricing.
- `quoted` quotes are finalized quote sheets that can be exported or handed off to the export center.

## Normative Requirements

### 1. Quote Draft Record Shape

Each persisted quote draft MUST use this shape:

```json
{
  "id": "workspace-quote-001",
  "title": "门店智能中控询价",
  "status": "draft",
  "currentStep": 1,
  "owner": "内部员工",
  "ownerId": "user-employee",
  "supplierSortBy": "score",
  "requirements": [
    {
      "id": "quote-requirement-001",
      "name": "智能中控升级",
      "keywords": ["smart hub", "device"],
      "quantity": 100,
      "targetLeadDays": 18,
      "targetPriceBand": "中",
      "isCustom": false,
      "notes": "门店设备升级"
    }
  ],
  "matches": [],
  "supplierSelections": [],
  "pricingEntries": [],
  "pricingPreview": {},
  "quoteSheet": null,
  "logs": [
    {
      "timestamp": "2026-03-24T00:00:00.000Z",
      "action": "create",
      "actor": "内部员工",
      "message": "Created workspace quote draft."
    }
  ],
  "createdAt": "2026-03-24T00:00:00.000Z",
  "updatedAt": "2026-03-24T00:00:00.000Z"
}
```

Required fields:

- `title`
- `status`
- `currentStep`
- `owner`
- `ownerId`
- `requirements`

Allowed values:

- `status`: `draft`, `quoted`, `archived`
- `currentStep`: `1`, `2`, `3`, `4`, `5`
- `supplierSortBy`: `score`, `price`, `leadTime`, `capability`

### 2. Role Matrix

The service layer MUST enforce this role matrix:

- `employee`: may access the quote workflow, create drafts, edit drafts they own, generate quote sheets for their own drafts, and view only their own quote history
- `director`: may access the quote workflow, create drafts, edit any draft, generate quote sheets for any draft, and view all quote history
- `developer`: may not access quote routes and MUST NOT receive procurement-sensitive quote data through this contract

Business rule:

- A non-director MUST never be able to force a `priced` or cost-exposing quote snapshot by crafting client payloads

### 3. Step 1 Contract: Import or Create

`previewWorkspaceQuoteImport(rawText)` MUST accept a pipe-delimited import text block with this canonical field order:

```text
name|keywords|quantity|targetLeadDays|targetPriceBand|isCustom|notes
```

`previewWorkspaceQuoteImport(rawText)` MUST return:

```json
{
  "preview": [
    {
      "index": 1,
      "requirement": {
        "id": "quote-import-001",
        "name": "智能中控升级",
        "keywords": ["smart hub", "device"],
        "quantity": 100,
        "targetLeadDays": 18,
        "targetPriceBand": "中",
        "isCustom": false,
        "notes": "门店设备升级"
      },
      "warnings": []
    }
  ],
  "warnings": []
}
```

Import preview rules:

- invalid rows MUST still produce preview entries with `requirement: null`
- warnings MUST include `Record {index}` prefixes
- row validation MUST check at least `name`, `quantity`, and `targetLeadDays`

`createWorkspaceQuoteDraft(input, viewer)` MUST accept:

```json
{
  "title": "门店智能中控询价",
  "currentStep": 1,
  "supplierSortBy": "score",
  "requirements": [
    {
      "name": "智能中控升级",
      "keywords": ["smart hub", "device"],
      "quantity": 100,
      "targetLeadDays": 18,
      "targetPriceBand": "中",
      "isCustom": false,
      "notes": "门店设备升级"
    }
  ]
}
```

Create behavior:

- validate the title and requirements
- generate a unique quote id
- assign ownership to the current viewer
- persist the draft to local mock storage
- auto-build the first product matches from the latest workspace product set
- return the hydrated quote draft

### 4. Step 2 Contract: Product Matching

The quote workflow MUST generate product matches from the current workspace product catalog.

`buildWorkspaceQuoteMatches(requirements, products, existingMatches)` MUST:

- match each requirement to the best product candidate
- preserve manual overrides when supplied
- return the candidate product ids that the UI can present as replacements

Business note:

- The matching algorithm MAY be heuristic in mock mode, but it MUST stay deterministic for the same product set and requirement input

### 5. Step 3 Contract: Supplier Recommendation

`buildWorkspaceQuoteSupplierRecommendations(matches, suppliers, viewer, sortBy)` MUST:

- reuse the current supplier data set
- reuse the same visibility projection as supplier list and detail reads
- return ordered supplier candidates per matched product
- support `score`, `price`, `leadTime`, and `capability` sort modes

Visibility rules:

- employee recommendations for another person’s private supplier MUST show the masked supplier name and blank contact fields
- director recommendations MAY show full private data

### 6. Step 4 Contract: Pricing Preview

`buildWorkspaceQuotePricingPreview(input, context)` MUST accept the quote requirements, matches, selected suppliers, and pricing entries, then return a pricing preview suitable for the final quote sheet.

Pricing entries MUST allow at least:

- `markupRate`
- `toolingFee`
- `leadTimeBufferDays`

The preview MUST return:

```json
{
  "items": [],
  "totals": {
    "lineCount": 0,
    "totalQuantity": 0,
    "totalToolingFee": 0,
    "totalAmount": 0
  }
}
```

Cost visibility rules:

- employee previews MUST hide `baseUnitCostVisible`
- director previews MUST reveal `baseUnitCostVisible`
- the outward quote result MUST still be computed for both roles

Business note:

- The preview is a planning surface. It is not the final downloadable artifact.

### 7. Step 5 Contract: Quote Sheet Generation

`generateWorkspaceQuoteSheet(id, viewer)` MUST:

- resolve the latest saved draft
- recompute the quote snapshot from the current workspace products and suppliers
- save the quote status as `quoted`
- generate a downloadable standard quote sheet artifact
- return both the hydrated quote and the download payload

Success response:

```json
{
  "quote": {
    "id": "workspace-quote-001",
    "status": "quoted",
    "currentStep": 5,
    "quoteSheet": {
      "filename": "workspace-quote-001-quote.xlsx",
      "content": "标准报价单",
      "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  },
  "download": {
    "filename": "workspace-quote-001-quote.xlsx",
    "content": "标准报价单",
    "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

The generated quote sheet MUST include:

- quote title
- requirement list
- matched products
- selected suppliers
- pricing rows
- outward unit price
- outward total price
- a standard quote summary

Director quote sheets MAY include internal cost baselines. Employee quote sheets MUST not expose internal cost baselines directly in the downloadable sheet.

### 8. Export Center Linkage

Step 5 MUST expose an export-center handoff payload so the finalized quote can be turned into sales material without re-entering the quote data.

The handoff payload MUST include:

```json
{
  "title": "门店智能中控询价",
  "version": "public",
  "format": "pdf",
  "productIds": ["wp-smart-hub"],
  "supplierIds": ["ws-public-001"],
  "notes": "用于客户外发",
  "sourceQuoteId": "workspace-quote-001"
}
```

Business rule:

- The export center MAY prefill from this payload, but it MUST still enforce export-center permissions and pricing rules independently

### 9. History and Access Contract

`listWorkspaceQuotes(viewer)` MUST return:

```json
{
  "items": [],
  "total": 0
}
```

History visibility rules:

- employee history MUST contain only drafts owned by the current viewer
- director history MUST contain all quote drafts
- history items MUST stay metadata-only and MUST NOT inline large artifact payloads

`getWorkspaceQuote(id, viewer)` MUST return:

```json
{
  "quote": {}
}
```

If the record does not exist, the operation MUST fail with:

```json
{
  "error": {
    "code": "QUOTE_NOT_FOUND",
    "message": "Quote draft not found."
  }
}
```

If the current viewer is not allowed to access the workflow or the record, the service MUST return `QUOTE_FORBIDDEN`.

### 10. Persistence Rules

The quote store MUST persist in local storage during mock mode.

If persisted data is missing, unreadable, or structurally invalid, the service MUST fall back to an empty quote store with sequence reset.

The store MUST persist changes for:

- create draft
- update draft
- generate quote sheet

The quote snapshot MUST be recomputed from current product and supplier data at generation time, so stale page-local state cannot leak into the final sheet.

### 11. Error Structure

Validation failures MUST use:

```json
{
  "error": {
    "code": "INVALID_QUOTE_INPUT",
    "message": "Quote title is required."
  }
}
```

Access failures MUST use:

```json
{
  "error": {
    "code": "QUOTE_FORBIDDEN",
    "message": "You do not have permission to access quote workflow."
  }
}
```

No alternate error shape is allowed for this contract.
