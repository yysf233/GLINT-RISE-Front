# Workspace Suppliers Spec

## Purpose

This spec defines the mock workspace suppliers contract used by the internal procurement module and the business rules that any future backend implementation must preserve.

The supplier contract is page-independent. The same visibility projection, ownership rules, import contract, and export contract MUST be reusable by supplier management, quote recommendation, and export center flows.

## Normative Requirements

### 1. Supplier Record Shape

Each workspace supplier record MUST use this shape:

```json
{
  "id": "ws-public-001",
  "name": "Mika Lighting",
  "rating": "A",
  "status": "active",
  "isPrivate": false,
  "owner": "内部员工",
  "companyArea": 3200,
  "leadTimeBand": "10-15天",
  "priceBand": "中高",
  "cooperationHistory": "Retail lighting rollout",
  "fitScore": 89,
  "patentCount": 10,
  "capacitySummary": "Lighting, wiring, and smart control integration",
  "contactName": "Mika",
  "contactPhone": "13800000001",
  "contactEmail": "mika@supplier.test",
  "tags": ["lighting", "retail"],
  "relatedProductIds": ["wp-smart-hub", "wp-lumina-arc"],
  "summary": "旗舰零售照明长期合作供应商。",
  "cooperationRecords": [
    {
      "id": "record-001",
      "title": "2025 秋季零售升级",
      "outcome": "按期交付"
    }
  ],
  "updatedAt": "2026-03-24T00:00:00.000Z",
  "logs": [
    {
      "timestamp": "2026-03-24T00:00:00.000Z",
      "action": "seed",
      "actor": "system",
      "message": "Seeded public supplier."
    }
  ]
}
```

Required fields:

- `name`
- `rating`
- `status`
- `owner`
- `leadTimeBand`
- `priceBand`
- `contactName`
- `contactPhone`

Allowed values:

- `rating`: `A`, `B`, `C`
- `status`: `active`, `draft`, `archived`

### 2. Role and Ownership Matrix

The service layer MUST enforce this role matrix:

- `employee`: may list supplier pages, view full data for public suppliers, view full data for their own private suppliers, view masked data for other people's private suppliers, create suppliers, import suppliers, edit public suppliers, edit their own private suppliers, export only what they are allowed to see.
- `director`: may list, view, create, import, edit, and export all supplier records with full data.
- `developer`: may not access supplier module routes and MUST NOT receive procurement-sensitive data through this contract.

Ownership rules:

- employee create MUST assign `owner` to the current employee when the created record is private
- employee import MUST assign `owner` to the current employee for imported records
- employee update MUST fail for another person's private supplier
- director create, import, and update MAY keep or override `owner`

### 3. List Query Contract

`listWorkspaceSuppliers(query, viewer)` MUST accept this query object:

```json
{
  "keyword": "lighting",
  "status": "all",
  "rating": "all",
  "visibility": "all"
}
```

Allowed query values:

- `status`: `all`, `active`, `draft`, `archived`
- `rating`: `all`, `A`, `B`, `C`
- `visibility`: `all`, `public`, `private`

Keyword matching MUST search at least:

- `id`
- `name`
- `owner`
- `cooperationHistory`
- `capacitySummary`
- `summary`
- `tags`

`listWorkspaceSuppliers(query, viewer)` MUST return:

```json
{
  "items": [],
  "total": 0
}
```

### 4. Visibility Projection Contract

List, detail, and export reads MUST use the same visibility projection contract.

When an employee reads another person's private supplier:

- `name` MUST become `私有供应商（受限）`
- `contactName` MUST be empty
- `contactPhone` MUST be empty
- `contactEmail` MUST be empty
- `isMasked` MUST be `true`

When the current viewer is allowed to see full data:

- all stored fields MAY be returned
- `isMasked` MUST be `false`

Business note:

- Quote recommendation and export center MUST reuse this same projection so list, detail, and export never disagree about what a user may see.

### 5. Detail Success and Error Payloads

`getWorkspaceSupplier(id, viewer)` MUST return:

```json
{
  "supplier": {}
}
```

If the record does not exist, the operation MUST fail with:

```json
{
  "error": {
    "code": "SUPPLIER_NOT_FOUND",
    "message": "Supplier not found."
  }
}
```

The detail read for an employee viewing another person's private supplier MUST succeed with a masked payload. It MUST NOT fail only because the record is private.

### 6. Create and Update Contract

`createWorkspaceSupplier(input, viewer)` MUST:

- validate the required fields
- accept an optional `id`
- generate a unique id when `id` is missing or conflicts
- persist the record to local mock storage
- append a `create` log entry
- return `{ "supplier": { ... } }`

`updateWorkspaceSupplier(id, input, viewer)` MUST:

- preserve the original `id`
- update `updatedAt`
- append an `update` log entry
- enforce the role and ownership rules defined above
- return `{ "supplier": { ... } }`

If the current viewer is not allowed to edit the record, the operation MUST fail with:

```json
{
  "error": {
    "code": "SUPPLIER_FORBIDDEN",
    "message": "You do not have permission to edit this supplier."
  }
}
```

Validation failures MUST use:

```json
{
  "error": {
    "code": "INVALID_SUPPLIER_INPUT",
    "message": "Missing required fields: name"
  }
}
```

### 7. Import Preview and Import Contract

The canonical demo import format MUST be one pipe-delimited row per supplier using this field order:

```text
name|rating|cooperationHistory|companyArea|leadTimeBand|priceBand|tags|owner|isPrivate|contactName|contactPhone|contactEmail|fitScore|patentCount|capacitySummary|relatedProductIds|summary
```

`previewWorkspaceSuppliersImport(rawText)` MUST return:

```json
{
  "preview": [
    {
      "index": 1,
      "supplier": {},
      "warnings": []
    }
  ],
  "warnings": []
}
```

Import preview rules:

- invalid rows MUST still produce preview entries with `supplier: null`
- warnings MUST include `Record {index}` prefixes
- missing `rating` MUST be auto-computed from `fitScore` and `patentCount`

`importWorkspaceSuppliers(rawText, viewer)` MUST:

- create new records only
- never overwrite an existing record in place
- import every valid row
- skip invalid rows
- return imported count plus warnings
- apply the employee ownership override rules when the viewer role is `employee`

The success payload MUST be:

```json
{
  "importedCount": 2,
  "items": [],
  "warnings": []
}
```

### 8. Export Contract

`exportWorkspaceSuppliers({ ids, format, includeSensitive }, viewer)` MUST support:

- `ids`: optional selected supplier ids
- `format`: currently `csv`
- `includeSensitive`: request to include contact fields when the viewer is allowed to see them

The export MUST use the same visibility projection as list and detail.

This means:

- employee export of another person's private supplier MUST keep the masked supplier name and blank contact fields
- director export of the same record MUST include the full private data

CSV export MUST return:

```json
{
  "filename": "workspace-suppliers.csv",
  "content": "id,name,...",
  "total": 1
}
```

### 9. Persistence Rules

The workspace suppliers store MUST persist in local storage.

If persisted data is missing, unreadable, or structurally invalid, the service MUST fall back to seed data.

The service MUST persist changes for:

- create
- update
- import

The visibility projection MUST NOT be persisted as separate records. Masking is a read-time projection derived from the stored canonical supplier record plus the current viewer.
