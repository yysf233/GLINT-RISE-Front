# Workspace Site Settings Spec

## Purpose

This spec defines the site settings contract used by the internal workspace to manage public-site base content.

The module MUST cover:

- brand naming
- entry eyebrow text
- public navigation labels
- public search placeholder
- footer description and footer links
- home hero eyebrow and description

The module is intentionally separate from banner management. Banner assets manage visual rotation order, while site settings manage stable copy and structural labels used across the public site.

## Normative Requirements

### 1. Record Shape

The persisted record MUST use a single settings object shape:

```json
{
  "id": "site-settings",
  "brand": {
    "name": "GLINT RISE",
    "cnName": "光速上升",
    "entryEyebrow": "灵感档案馆"
  },
  "navigation": {
    "items": [
      { "path": "/home", "label": "首页" },
      { "path": "/products", "label": "产品" },
      { "path": "/cases", "label": "案例总览" },
      { "path": "/case-timeline", "label": "项目时间轴" },
      { "path": "/search", "label": "搜索" }
    ],
    "searchPlaceholder": "搜索产品名称"
  },
  "footer": {
    "description": "公开站页脚说明文案",
    "links": ["隐私政策", "服务条款", "合规说明", "无障碍说明"]
  },
  "homeHero": {
    "eyebrow": "策展型品牌前端",
    "description": "首页 Hero 简介文案"
  },
  "updatedAt": "2026-03-24T00:00:00.000Z"
}
```

### 2. Role Matrix

- `employee`: may read and update site settings
- `director`: may read and update site settings
- `developer`: MUST NOT access this contract through the business workspace route

### 3. Read Contract

`getWorkspaceSiteSettings(viewer)` MUST:

- validate viewer role
- return the latest persisted settings record
- fall back to the seeded default record when storage is empty or invalid

Success response:

```json
{
  "settings": {
    "id": "site-settings"
  }
}
```

### 4. Update Contract

`updateWorkspaceSiteSettings(input, viewer)` MUST:

- validate viewer role
- normalize duplicate navigation paths by keeping the first valid occurrence
- normalize duplicate footer links by keeping the first valid occurrence
- reject empty required groups by falling back to seeded defaults
- persist the updated record
- update `updatedAt`

Business note:

- this contract manages textual and structural public-site settings only
- it MUST NOT replace banner ordering, product publishing, or case publishing contracts

### 5. Public Site Projection

The public site adapter MUST expose:

- `brand`
- `navigation`
- `footer`
- `homeHero`

The public projection MUST read the latest persisted workspace settings so that:

- entry page uses the latest `brand`
- top navigation uses the latest `brand`, `navigation.items`, and `navigation.searchPlaceholder`
- footer uses the latest `brand` and `footer`
- home page uses the latest `brand` and `homeHero`

### 6. Testing Requirements

Implementation is only acceptable when all of the following are covered:

- unit tests for settings read/update normalization and role rejection
- unit tests for public projection sync
- route permission tests for `#/workspace/settings/content`
- browser regression proving a save in the workspace is reflected on the public entry page and home page
