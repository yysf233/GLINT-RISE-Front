# Workspace Suppliers Spec

## ADDED Requirements

### Requirement: Canonical Workspace Supplier Record

The workspace suppliers module MUST use a stable backend-facing supplier record shape with required fields for `name`, `rating`, `status`, `owner`, `leadTimeBand`, `priceBand`, `contactName`, and `contactPhone`.

#### Scenario: Create supplier with required fields

- **WHEN** the client submits a valid create request
- **THEN** the service returns `{ "supplier": { ... } }`
- **AND** the returned record contains a unique id
- **AND** the record is persisted to the local mock store

### Requirement: Ownership and Permission Matrix

The service layer MUST enforce employee, director, and developer differences for supplier operations.

#### Scenario: Employee updates another person's private supplier

- **WHEN** an employee submits an update for a private supplier owned by someone else
- **THEN** the service fails with `SUPPLIER_FORBIDDEN`

#### Scenario: Director updates another person's private supplier

- **WHEN** a director submits an update for a private supplier owned by someone else
- **THEN** the update succeeds

### Requirement: Shared Visibility Projection

List, detail, and export reads MUST reuse the same masking projection for private suppliers.

#### Scenario: Employee reads another person's private supplier

- **WHEN** an employee reads another person's private supplier through list, detail, or export
- **THEN** the visible name becomes `私有供应商（受限）`
- **AND** contact fields are blank

### Requirement: Canonical Import Preview Format

The canonical demo import format MUST be pipe-delimited supplier rows.

#### Scenario: Preview supplier import text without rating

- **WHEN** the client previews a supplier row without a rating
- **THEN** the preview computes the rating from `fitScore` and `patentCount`
- **AND** invalid rows are returned with `Record {index}` warnings

### Requirement: Export Reuses Visibility Rules

Supplier export MUST not bypass masking.

#### Scenario: Employee exports another person's private supplier

- **WHEN** an employee exports a private supplier they do not own
- **THEN** the CSV contains the masked supplier name
- **AND** the CSV does not expose the stored phone number
