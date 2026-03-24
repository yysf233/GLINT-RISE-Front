# Workspace Products Spec

## Purpose

This spec defines the mock workspace products contract used by the internal backend product module and the source-of-truth fields that can be synchronized to the public catalog.

## Normative Requirements

### 1. Product Record Shape

Each workspace product record MUST use this shape:

```json
{
  "id": "wp-lumina-arc",
  "name": "Lumina Arc",
  "shortName": "LUMINA ARC",
  "displayTag": "可持续科技 / 旗舰系列",
  "category": "flagship",
  "status": "active",
  "needsUpdate": false,
  "owner": "Maya",
  "ownerTeam": "Operations",
  "updatedAt": "2026-03-24T08:00:00.000Z",
  "tags": ["flagship", "materials"],
  "retailPrice": 2499,
  "internalCost": 1320,
  "summary": "Flagship product aligned to the public showcase product.",
  "publicProductId": "lumina-arc",
  "publicMeta": [
    { "label": "材质", "value": "阳极黑钛" },
    { "label": "版本", "value": "V2.0" }
  ],
  "hero": "data:image/svg+xml;utf8,...",
  "progressSummary": "Launch ready and mirrored to the public site.",
  "supplierSummary": "Primary supplier confirmed with stable lead times.",
  "logs": [
    {
      "timestamp": "2026-03-24T08:00:00.000Z",
      "action": "seed",
      "actor": "system",
      "message": "Imported from public catalog alignment."
    }
  ]
}
```

Required fields:

- `name`
- `category`
- `status`
- `owner`

Editable fields:

- `name`
- `shortName`
- `displayTag`
- `category`
- `status`
- `needsUpdate`
- `owner`
- `ownerTeam`
- `retailPrice`
- `internalCost`
- `tags`
- `summary`
- `publicProductId`
- `publicMeta`
- `hero`
- `progressSummary`
- `supplierSummary`

Read-only or system-managed fields:

- `id` after create
- `updatedAt`
- `logs`

Business meaning:

- `name` is the internal canonical name used by workspace operators.
- `shortName` is the short public-facing title that should be shown in the public catalog.
- `displayTag` is the public badge or tagline shown under the title in the public catalog.
- `publicMeta` is the structured public detail metadata that should appear on the public detail page.
- `publicProductId` is the stable public identifier and must be preserved once a product is published.
- `ownerTeam` identifies the internal team currently responsible for the record and is not part of the public contract.

### 2. Enumerations

Allowed category values:

- `flagship`
- `device`
- `space`
- `hot`

Allowed status values:

- `active`
- `draft`
- `archived`

The `needsUpdate` field MUST be boolean in storage and API payloads.

### 3. List Query Contract

`listWorkspaceProducts(query)` MUST accept this query object:

```json
{
  "keyword": "hub",
  "category": "all",
  "status": "all",
  "needsUpdate": "all",
  "sort": "updated-desc"
}
```

Allowed query values:

- `category`: `all`, `flagship`, `device`, `space`, `hot`
- `status`: `all`, `active`, `draft`, `archived`
- `needsUpdate`: `all`, `yes`, `no`
- `sort`: `updated-desc`, `updated-asc`, `name-asc`, `name-desc`, `price-desc`, `price-asc`

Keyword matching MUST search at least:

- `id`
- `name`
- `shortName`
- `displayTag`
- `owner`
- `summary`
- `progressSummary`
- `supplierSummary`
- `publicProductId`
- `publicMeta`
- `tags`

### 4. List Success Payload

`listWorkspaceProducts(query)` MUST return:

```json
{
  "items": [],
  "total": 0,
  "summary": {
    "total": 0,
    "activeCount": 0,
    "draftCount": 0,
    "archivedCount": 0,
    "needsUpdateCount": 0,
    "categoryCounts": {
      "flagship": 0,
      "device": 0,
      "space": 0,
      "hot": 0
    }
  }
}
```

### 5. Detail Success and Error Payloads

`getWorkspaceProduct(id)` MUST return:

```json
{
  "product": {}
}
```

If the record does not exist, the operation MUST fail with:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

### 6. Public Sync Rules

Workspace products MUST be the source of truth for public product publishing.

Only workspace products that satisfy all of the following MAY be synchronized to the public catalog:

- `status` is `active`
- `publicProductId` is non-empty
- the record is not archived or otherwise suppressed by the publishing flow

When a workspace product is synchronized, the public read model MUST derive from these workspace fields:

- public `id` from `publicProductId`
- public `workspaceProductId` from workspace `id`
- public `name` from workspace `name`
- public `shortName` from workspace `shortName`, falling back to `name`
- public `displayTag` from workspace `displayTag`, falling back to the workspace `tag` when present
- public `desc` from workspace `summary`
- public `hero` from workspace `hero`
- public `thumbs` from workspace `media` or other image sources if present
- public `meta` from workspace `publicMeta`
- public `price` from workspace `retailPrice` when present
- public `sourceUpdatedAt` from workspace `updatedAt`

The `shortName`, `displayTag`, and `publicMeta` fields MUST be treated as public presentation fields, not internal inventory fields.

Business notes:

- Workspace product CRUD is the only editorial entry point for public product content in the current project stage.
- A product can be fully valid for workspace management while still being private if it remains `draft` or has no `publicProductId`.
- Archiving or clearing `publicProductId` is the business action used to remove a product from all public pages, search results, and share links.

If a workspace product changes from publishable to unpublished, the public catalog MUST stop exposing it.

If `publicProductId` changes, the previous public identifier MUST be treated as retired and the new identifier MUST be used for subsequent public reads.

### 7. Create and Update Contract

`createWorkspaceProduct(input)` MUST:

- require `name`, `category`, `status`, and `owner`
- accept an optional `id`
- generate a unique id when `id` is missing or conflicts
- persist the record to local mock storage
- return `{ "product": { ... } }`

`updateWorkspaceProduct(id, input)` MUST:

- preserve the original `id`
- update `updatedAt`
- append a new `logs` entry with action `update`
- return `{ "product": { ... } }`

Create and update validation failures MUST use:

```json
{
  "error": {
    "code": "INVALID_PRODUCT_INPUT",
    "message": "Missing required fields: name"
  }
}
```

### 8. Bulk Tag Contract

`bulkAddWorkspaceProductTags({ ids, tags })` MUST:

- require a non-empty `ids` array
- require at least one non-empty tag
- deduplicate tag values
- keep existing tags
- update `updatedAt`
- append a `bulk-tag` log entry

On success it MUST return:

```json
{
  "items": [],
  "total": 0,
  "summary": {}
}
```

On invalid input it MUST return:

```json
{
  "error": {
    "code": "INVALID_BULK_TAG_INPUT",
    "message": "ids and tags are required."
  }
}
```

### 9. Import Preview and Import Contract

The canonical mock import format MUST be one pipe-delimited row per product using this field order:

```text
name|id|category|status|owner|retailPrice|internalCost|tags|needsUpdate|summary
```

The implementation MAY additionally accept JSON or key/value block text, but the pipe-delimited format is the required demo format.

`previewWorkspaceProductImport(rawText)` MUST return:

```json
{
  "preview": [
    {
      "index": 1,
      "product": {},
      "warnings": []
    }
  ],
  "warnings": []
}
```

`importWorkspaceProducts(rawText)` MUST:

- create new records only
- never overwrite an existing record in place
- generate a unique id when an imported id already exists
- import every valid row
- skip invalid rows
- return imported count plus warnings

The success payload MUST be:

```json
{
  "importedCount": 2,
  "items": [],
  "warnings": []
}
```

### 10. Persistence Rules

The workspace products store MUST persist in local storage.

If persisted data is missing, unreadable, or structurally invalid, the service MUST fall back to seed data.

The service MUST persist changes for:

- create
- update
- bulk tag
- import
