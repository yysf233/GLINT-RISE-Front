# Public Products Spec

## Purpose

This spec defines the public product list and detail contract used by the frontend and any future backend implementation. The public catalog is a read model derived from workspace products, not an independently edited source of truth.

## Normative Requirements

### 1. Public Product Read Model

Each public product record MUST use this shape:

```json
{
  "id": "lumina-arc",
  "workspaceProductId": "wp-lumina-arc",
  "name": "Lumina Arc",
  "shortName": "LUMINA ARC",
  "displayTag": "可持续科技 / 旗舰系列",
  "price": "¥2,499",
  "desc": "Flagship product aligned to the public showcase product.",
  "hero": "https://example.com/hero.jpg",
  "thumbs": ["https://example.com/hero.jpg"],
  "meta": [
    { "label": "材质", "value": "阳极黑钛" },
    { "label": "版本", "value": "V2.0" }
  ],
  "publishedAt": "2026-03-24T08:00:00.000Z",
  "sourceUpdatedAt": "2026-03-24T08:00:00.000Z"
}
```

Required fields:

- `id`
- `workspaceProductId`
- `name`
- `shortName`
- `displayTag`
- `price`
- `desc`
- `hero`
- `thumbs`
- `meta`
- `publishedAt`
- `sourceUpdatedAt`

### 2. List Interface

`listPublicProducts(query)` MUST return the public catalog list view.

This interface exists to support the public product landing page, card grids, category filters, and search result pages.

`listPublicProducts(query)` MUST accept this query object:

```json
{
  "keyword": "arc",
  "category": "all",
  "tag": "all",
  "sort": "featured-desc"
}
```

Allowed query values:

- `category`: `all`, `flagship`, `device`, `space`, `hot`
- `tag`: `all` or a non-empty display tag string
- `sort`: `featured-desc`, `name-asc`, `name-desc`, `price-asc`, `price-desc`, `updated-desc`

Business notes:

- The backend contract uses stable enum-like values such as `flagship` and `device`; the frontend MAY map those values to localized Chinese labels for display.
- The list interface is the single source for the public home modules, product overview grids, search results, and share landing pages.
- The public catalog is read-only. No public interface may edit, publish, or archive products directly.

Keyword matching MUST search at least:

- `id`
- `workspaceProductId`
- `name`
- `shortName`
- `displayTag`
- `desc`
- `meta.label`
- `meta.value`

### 3. List Success Payload

`listPublicProducts(query)` MUST return:

```json
{
  "items": [],
  "total": 0
}
```

The response MAY include derived filter metadata, but `items` and `total` are the required contract fields.

If filter metadata is returned, it SHOULD be derived from the same published product set as `items` so search, overview, and recommendation modules stay consistent.

### 4. Detail Interface

`getPublicProduct(publicProductId)` MUST return the public detail view for a single product.

The detail interface MUST use `publicProductId` as the lookup key. It MUST NOT require a workspace `id`.

### 5. Detail Success Payload

`getPublicProduct(publicProductId)` MUST return:

```json
{
  "product": {}
}
```

### 6. Publishing Rules

The public catalog MUST be generated from workspace products that are publishable.

Only workspace products that satisfy all of the following MAY appear in the public catalog:

- `status` is `active`
- `publicProductId` is non-empty
- the record has not been archived or suppressed by the publishing flow

When published, the public record MUST be derived as follows:

- public `id` from workspace `publicProductId`
- public `workspaceProductId` from workspace `id`
- public `name` from workspace `name`
- public `shortName` from workspace `shortName`, falling back to workspace `name`
- public `displayTag` from workspace `displayTag`, falling back to workspace `tag` when present
- public `price` from workspace `retailPrice` when present
- public `desc` from workspace `summary`
- public `hero` from workspace `hero`
- public `thumbs` from workspace `media` or a single hero image when no gallery exists
- public `meta` from workspace `publicMeta`
- public `publishedAt` from the publication event timestamp
- public `sourceUpdatedAt` from workspace `updatedAt`

This derivation exists so internal editing and public rendering remain separated:

- workspace editors manage one canonical product record
- the public site consumes only the published projection of that record
- internal-only fields such as cost, supplier notes, or operational ownership MUST NOT leak into the public contract

If a workspace product becomes unpublished, the public catalog MUST stop returning it from list and detail reads.

If `publicProductId` changes, the old public id MUST no longer resolve after the sync completes.

### 7. Error Structure

Missing or unpublished products MUST fail with:

```json
{
  "error": {
    "code": "PUBLIC_PRODUCT_NOT_FOUND",
    "message": "Public product not found."
  }
}
```

Invalid list query input MAY fail with:

```json
{
  "error": {
    "code": "INVALID_PUBLIC_PRODUCT_QUERY",
    "message": "Invalid public product query."
  }
}
```

The error envelope MUST always use:

- `error.code`
- `error.message`

No alternate error shape is allowed for this contract.
