# Workspace Products Design Locks

Date: 2026-03-24

This addendum closes the gaps identified during design review for the workspace products slice.

## Locked Schema

- Required fields: `name`, `category`, `status`, `owner`
- System-managed fields: `id`, `updatedAt`, `logs`
- Editable fields: `ownerTeam`, `needsUpdate`, `retailPrice`, `internalCost`, `tags`, `summary`, `publicProductId`, `hero`, `progressSummary`, `supplierSummary`

## Locked Enumerations

- Categories: `flagship`, `device`, `space`, `hot`
- Statuses: `active`, `draft`, `archived`
- List query `needsUpdate`: `all`, `yes`, `no`

## Locked Search Scope

Keyword search must match:

- `id`
- `name`
- `owner`
- `summary`
- `progressSummary`
- `supplierSummary`
- `publicProductId`
- `tags`

## Locked Save Behavior

- Create success navigates to the new detail route
- Edit success navigates to the edited detail route
- Validation failure stays on the current form route and shows inline errors

## Locked Import Contract

Canonical demo format:

```text
name|id|category|status|owner|retailPrice|internalCost|tags|needsUpdate|summary
```

Rules:

- Valid rows create new records
- Invalid rows are skipped with warnings
- Duplicate ids do not overwrite existing records
- Duplicate ids receive a generated unique id

## Locked Verification Matrix

Route verification must cover:

- employee/director allow: list, new, detail, edit, import
- developer deny: list, new, detail, edit, import
- list filtering
- bulk tag behavior
- create validation and success
- edit validation and success
- import preview and import success
