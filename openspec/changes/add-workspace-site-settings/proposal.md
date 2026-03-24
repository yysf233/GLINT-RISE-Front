# Proposal: add-workspace-site-settings

## Why

The workspace still has a placeholder route for site settings, but public-site brand text, navigation labels, footer copy, and home hero copy are already scattered in static files. This blocks controlled updates and makes progress tracking in PRD inaccurate.

## What Changes

- add a real `#/workspace/settings/content` page
- add a mock site settings service with persistence and role checks
- project saved settings into the public entry page, top navigation, footer, and home hero
- add regression coverage and PRD progress backfill

## Impact

- employee/director gain a usable site settings module
- developer remains blocked from this business route
- public site base copy becomes configurable without touching code
