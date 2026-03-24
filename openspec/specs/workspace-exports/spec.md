# Workspace Exports Spec

## Purpose

This spec defines the export center contract used by the internal workspace. It freezes the request and response payloads, role boundaries, artifact rules, and data-source linkage that any future backend implementation MUST preserve.

The export center is not an isolated feature. It MUST reuse:

- current workspace product data
- current workspace supplier data
- supplier visibility and masking rules
- role-based access control from the workspace auth model

Business note:

- `public` exports are the external-facing package used for sales, sharing, and non-priced circulation.
- `priced` exports are internal-only artifacts used for quote review, procurement, and director approval flows.

## Normative Requirements

### 1. Export Job Record Shape

Each persisted export job MUST use this shape:

```json
{
  "id": "workspace-export-001",
  "title": "春季招商包",
  "version": "public",
  "format": "pdf",
  "productIds": ["wp-lumina-arc"],
  "supplierIds": ["ws-private-foreign"],
  "productCount": 1,
  "supplierCount": 1,
  "owner": "内部员工",
  "ownerId": "user-employee",
  "ownerRole": "employee",
  "containsSensitiveData": false,
  "createdAt": "2026-03-24T00:00:00.000Z",
  "notes": "用于客户一轮沟通",
  "filename": "spring-pack-public.pdf",
  "download": {
    "filename": "spring-pack-public.pdf",
    "content": "导出名称: 春季招商包",
    "mimeType": "text/plain;charset=utf-8"
  }
}
```

Allowed values:

- `version`: `public`, `priced`
- `format`: `pdf`, `pptx`, `xlsx`, `csv`

Required fields:

- `title`
- `version`
- `format`
- at least one item across `productIds` and `supplierIds`

### 2. Role Matrix

The service layer MUST enforce this role matrix:

- `employee`: may access export center, create `public` exports, view only their own export history, and redownload only their own artifacts
- `director`: may access export center, create both `public` and `priced` exports, view all export history, and redownload all artifacts
- `developer`: may not access export center routes and MUST NOT receive procurement or quote-oriented export data

Business rule:

- `priced` exports are a controlled internal artifact and MUST be blocked for non-director roles even if the client passes a crafted payload

### 3. Source Linkage Rules

Export generation MUST always read the latest persisted workspace data instead of stale page-local snapshots.

The generator MUST:

- read current product records from workspace products storage
- read current supplier records from workspace suppliers storage
- apply the same supplier visibility projection used by supplier list and detail pages

This means:

- employee export of another person’s private supplier MUST keep `name` masked as `私有供应商（受限）`
- employee export of another person’s private supplier MUST blank `contactName`, `contactPhone`, and `contactEmail`
- director export of the same supplier MAY include the full private data

### 4. Sensitive Data Rules

`public` export rules:

- MUST NOT include product `internalCost`
- MAY include supplier contact fields only when `includeContacts=true` and the current viewer is allowed to see them
- MUST still respect supplier masking rules

`priced` export rules:

- MUST include product `internalCost`
- MUST be treated as sensitive output
- MUST include full supplier contacts when the current viewer is allowed to see them
- MUST require risk acknowledgement when the client explicitly sends `riskAcknowledged=false`

Business note:

- The redownload contract returns the originally generated artifact snapshot. It MUST NOT silently regenerate a different visibility result later.

### 5. Create Contract

`createWorkspaceExport(input, viewer)` MUST accept:

```json
{
  "title": "春季招商包",
  "version": "public",
  "format": "pdf",
  "productIds": ["wp-lumina-arc"],
  "supplierIds": ["ws-private-foreign"],
  "includeContacts": false,
  "riskAcknowledged": false,
  "notes": "用于客户一轮沟通"
}
```

Create behavior:

- validate the payload
- enforce role rules
- resolve the latest product and supplier records
- generate a unique export id
- generate a downloadable artifact snapshot
- persist the new export job
- return the job metadata plus immediate download payload

Success response:

```json
{
  "exportJob": {
    "id": "workspace-export-001",
    "title": "春季招商包",
    "version": "public",
    "format": "pdf",
    "productIds": ["wp-lumina-arc"],
    "supplierIds": ["ws-private-foreign"],
    "productCount": 1,
    "supplierCount": 1,
    "owner": "内部员工",
    "ownerId": "user-employee",
    "containsSensitiveData": false,
    "createdAt": "2026-03-24T00:00:00.000Z",
    "notes": "用于客户一轮沟通",
    "filename": "spring-pack-public.pdf"
  },
  "download": {
    "filename": "spring-pack-public.pdf",
    "content": "导出名称: 春季招商包",
    "mimeType": "text/plain;charset=utf-8"
  }
}
```

Validation failures MUST use:

```json
{
  "error": {
    "code": "INVALID_EXPORT_INPUT",
    "message": "Export title is required."
  }
}
```

Unauthorized version attempts MUST use:

```json
{
  "error": {
    "code": "EXPORT_FORBIDDEN",
    "message": "Only directors can export priced materials."
  }
}
```

Risk acknowledgement failures MUST use:

```json
{
  "error": {
    "code": "EXPORT_RISK_UNCONFIRMED",
    "message": "Priced exports require explicit risk acknowledgement."
  }
}
```

### 6. History Contract

`listWorkspaceExports(viewer)` MUST return:

```json
{
  "items": [],
  "total": 0
}
```

History visibility rules:

- employee history MUST contain only jobs where `ownerId === viewer.id`
- director history MUST contain all jobs
- history items MUST NOT inline large binary payloads except lightweight metadata such as `filename`

### 7. Download Contract

`downloadWorkspaceExport(id, viewer)` MUST return:

```json
{
  "filename": "spring-pack-public.pdf",
  "content": "导出名称: 春季招商包",
  "mimeType": "text/plain;charset=utf-8"
}
```

Download rules:

- employee may download only their own jobs
- director may download any persisted job
- the returned payload MUST be the stored artifact snapshot created at export time

If the artifact does not exist, the service MUST return:

```json
{
  "error": {
    "code": "EXPORT_NOT_FOUND",
    "message": "Export artifact not found."
  }
}
```

### 8. Persistence Rules

The export center store MUST persist in local storage during mock mode.

If persisted data is missing, unreadable, or structurally invalid, the service MUST fall back to an empty export history with sequence reset.

The store MUST persist changes for:

- create export
- history read consistency
- redownload of existing artifacts

### 9. Artifact Content Rules

The generated artifact content MAY be a mock text file in frontend-only mode, but its semantic sections MUST remain stable so a future backend can produce equivalent structured documents.

At minimum, each artifact MUST include:

- export title
- export version
- export format
- creator
- generated time
- product section
- supplier section

The `priced` artifact MUST additionally expose product internal cost lines.

The supplier section MUST mirror the same visibility result the current viewer is allowed to see at generation time.
