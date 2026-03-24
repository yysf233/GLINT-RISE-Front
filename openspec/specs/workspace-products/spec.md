# Workspace Products Spec

## Purpose

This spec defines the mock workspace products contract used by the internal backend product module.

## Normative Requirements

### 1. Product Record Shape

Each workspace product record MUST use this shape:

```json
{
  "id": "wp-lumina-arc",
  "name": "Lumina Arc",
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
- `hero`
- `progressSummary`
- `supplierSummary`

Read-only or system-managed fields:

- `id` after create
- `updatedAt`
- `logs`

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
- `owner`
- `summary`
- `progressSummary`
- `supplierSummary`
- `publicProductId`
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

### 6. Create and Update Contract

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

### 7. Bulk Tag Contract

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

### 8. Import Preview and Import Contract

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

### 9. Persistence Rules

The workspace products store MUST persist in local storage.

If persisted data is missing, unreadable, or structurally invalid, the service MUST fall back to seed data.

The service MUST persist changes for:

- create
- update
- bulk tag
- import

