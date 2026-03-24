# Admin Shell Spec

## ADDED Requirements

### Requirement: Workspace Product Route Authorization

The admin shell MUST treat all workspace product routes as protected employee/director routes.

#### Scenario: Employee opens workspace product route

- **WHEN** an authenticated `employee` visits `#/workspace/products`, `#/workspace/products/new`, `#/workspace/products/:id`, `#/workspace/products/:id/edit`, or `#/workspace/products/import`
- **THEN** the shell renders the requested route

#### Scenario: Director opens workspace product route

- **WHEN** an authenticated `director` visits any workspace product route
- **THEN** the shell renders the requested route

#### Scenario: Developer opens workspace product route

- **WHEN** an authenticated `developer` visits any workspace product route
- **THEN** the shell redirects to `#/workspace/forbidden`
