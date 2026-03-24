# Public Products Spec

## ADDED Requirements

### Requirement: Public Product Read Model

The public catalog MUST expose workspace-derived product records with stable public identifiers and presentation fields.

#### Scenario: Publish workspace product to public catalog

- **WHEN** a workspace product is active and has a non-empty `publicProductId`
- **THEN** the public catalog exposes a read model with `id`, `workspaceProductId`, `name`, `shortName`, `displayTag`, `desc`, `hero`, `thumbs`, and `meta`
- **AND** the public record uses `publicProductId` as the lookup key

### Requirement: Public List Interface

The public catalog MUST support a list query for product landing, search, and category browsing.

#### Scenario: List public products by keyword

- **WHEN** the client calls `listPublicProducts({ "keyword": "arc" })`
- **THEN** the service returns matching public products in `items`
- **AND** the response includes `total`

### Requirement: Public Detail Interface

The public catalog MUST support a detail query keyed by `publicProductId`.

#### Scenario: Load a public product detail page

- **WHEN** the client calls `getPublicProduct("lumina-arc")`
- **THEN** the service returns the public detail payload for that product
- **AND** the client does not need the workspace `id`

### Requirement: Stable Public Error Envelope

The public catalog MUST use a stable error envelope for missing and invalid reads.

#### Scenario: Read missing public product

- **WHEN** the client requests a public product that does not exist
- **THEN** the service returns `PUBLIC_PRODUCT_NOT_FOUND`
- **AND** the error response contains `error.code` and `error.message`

### Requirement: Publish Eligibility

Only active workspace products with a public identifier MAY be published.

#### Scenario: Hide unpublished workspace product

- **WHEN** a workspace product is `draft`, `archived`, or missing `publicProductId`
- **THEN** it does not appear in the public list
- **AND** it does not resolve from the public detail lookup
