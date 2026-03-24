# Workspace Exports Spec Delta

## Added Requirements

### Requirement: Export Center Contract

The workspace MUST provide a persistent export center contract that supports create, history, and redownload operations.

#### Scenario: Employee creates a public export

- **WHEN** an employee submits a `public` export with at least one selected product or supplier
- **THEN** the service returns a new export job plus a downloadable artifact
- **AND** the employee can see that job in their history

#### Scenario: Employee is blocked from priced export

- **WHEN** an employee submits a `priced` export
- **THEN** the service returns `EXPORT_FORBIDDEN`

#### Scenario: Director creates a priced export

- **WHEN** a director submits a `priced` export
- **THEN** the resulting artifact includes internal cost lines
- **AND** the director can redownload the stored artifact from history

### Requirement: Export Center Must Reuse Supplier Visibility

The export generator MUST reuse the same supplier masking rules as the supplier module.

#### Scenario: Employee exports another person’s private supplier

- **WHEN** an employee exports a private supplier they do not own
- **THEN** the artifact shows `私有供应商（受限）`
- **AND** contact fields remain blank

#### Scenario: Director exports a private supplier

- **WHEN** a director exports the same supplier
- **THEN** the artifact includes the full private supplier name and contacts
