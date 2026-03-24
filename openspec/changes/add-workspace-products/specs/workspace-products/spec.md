# Workspace Products Spec

## ADDED Requirements

### Requirement: Canonical Workspace Product Record

The workspace products module MUST use a stable backend-facing product record shape with required fields for `name`, `category`, `status`, and `owner`, plus system-managed `updatedAt` and `logs`.

#### Scenario: Create product with required fields

- **WHEN** the client submits a valid create request
- **THEN** the service returns `{ "product": { ... } }`
- **AND** the returned record contains a unique id
- **AND** the record is persisted to the local mock store

### Requirement: Filterable Product List

The workspace products module MUST support list filtering via `keyword`, `category`, `status`, `needsUpdate`, and `sort`.

#### Scenario: Filter product list by keyword and status

- **WHEN** the client calls `listWorkspaceProducts({ "keyword": "hub", "status": "active" })`
- **THEN** only matching active records are returned
- **AND** the response includes total and summary counts

### Requirement: Canonical Import Preview Format

The canonical demo import format MUST be pipe-delimited product rows.

#### Scenario: Preview pipe-delimited import text

- **WHEN** the client previews `name|id|category|status|owner|retailPrice|internalCost|tags|needsUpdate|summary`
- **THEN** the service returns normalized preview rows
- **AND** invalid rows are reported in warnings

### Requirement: Non-Destructive Import

Product import MUST create new records only and MUST NOT overwrite an existing record in place.

#### Scenario: Import record with duplicate id

- **WHEN** an imported row uses an existing id
- **THEN** the service generates a new unique id
- **AND** the original stored record remains unchanged

