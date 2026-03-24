# Workspace Quotes Spec Delta

## Added Requirements

### Requirement: Five-Step Quote Workflow

The workspace MUST provide a five-step quote workflow that covers import or creation, product matching, supplier recommendation, pricing preview, and standard quote sheet generation.

#### Scenario: Employee creates a working draft

- **WHEN** an employee creates a new quote draft with a valid title and at least one valid requirement
- **THEN** the workflow creates a draft owned by that employee
- **AND** the draft is initialized at Step 1

#### Scenario: Director generates a quote sheet

- **WHEN** a director finishes pricing and generates the standard quote sheet
- **THEN** the workflow returns a downloadable artifact snapshot
- **AND** the quote status becomes `quoted`

### Requirement: Quote Workflow Must Reuse Workspace Products and Suppliers

The quote workflow MUST derive product matches and supplier recommendations from the current workspace product and supplier data sets.

#### Scenario: Product matching uses the latest product catalog

- **WHEN** the workflow builds product matches
- **THEN** it uses the current workspace product catalog
- **AND** it does not rely on stale page-local snapshots

#### Scenario: Supplier recommendation respects masking rules

- **WHEN** an employee views a private supplier recommendation that they do not own
- **THEN** the supplier name is masked
- **AND** contact fields remain empty

### Requirement: Quote Sheet Can Hand Off to Export Center

The workflow MUST expose a handoff payload that allows the final quote to be prefilled into the export center.

#### Scenario: Step 5 produces export prefill data

- **WHEN** a quote sheet is generated
- **THEN** the workflow can return an export-center prefill payload
- **AND** the payload includes the quote id, title, selected products, and selected suppliers
