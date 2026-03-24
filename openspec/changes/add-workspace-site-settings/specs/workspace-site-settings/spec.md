## ADDED Requirements

### Requirement: Workspace Site Settings Route

The system SHALL provide a real workspace route at `#/workspace/settings/content` for employee and director roles.

#### Scenario: employee opens site settings

- **WHEN** an employee visits `#/workspace/settings/content`
- **THEN** the page renders site settings content instead of a placeholder

#### Scenario: developer is denied

- **WHEN** a developer visits `#/workspace/settings/content`
- **THEN** the system redirects the user to `#/workspace/forbidden`

### Requirement: Persisted Site Settings

The system SHALL persist site settings in workspace storage and expose the latest saved record to the public site adapter.

#### Scenario: save updates public site

- **WHEN** a business user saves updated brand and home hero text
- **THEN** the public home page reads the new values without requiring code edits

### Requirement: Public Site Base Copy Sync

The system SHALL sync site settings to the public entry page, top nav, footer, and home page hero.

#### Scenario: update navigation label

- **WHEN** the label for `/products` is changed in site settings
- **THEN** the public top navigation displays the updated label
