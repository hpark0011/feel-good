---
status: pending
priority: p3
issue_id: "004"
tags:
  - code-review
  - icons
  - dependencies
dependencies: []
---

# Remove Unused @svgr/core Dependency

## Problem Statement

The `@svgr/core` package is listed as a devDependency in `packages/icons/package.json`, but the conversion script uses string manipulation instead of SVGR.

## Findings

**package.json:**
```json
"devDependencies": {
  "@svgr/core": "^8.1.0",  // Listed but unused
  ...
}
```

**Conversion script uses:**
- Regex for viewBox extraction
- String template literals for component generation
- Manual SVG attribute to JSX conversion

No imports from `@svgr/core` in the codebase.

## Proposed Solutions

### Option 1: Remove Dependency (Recommended)
- Remove `@svgr/core` from package.json
- Run `pnpm install` to update lockfile
- **Pros:** Reduces node_modules size, fewer dependencies to maintain
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

### Option 2: Use SVGR Instead
- Refactor conversion script to use SVGR properly
- **Pros:** Industry standard tool, more robust
- **Cons:** More complex, script already works
- **Effort:** High
- **Risk:** Medium

## Recommended Action

_(To be filled during triage)_

## Technical Details

**Affected files:**
- `packages/icons/package.json` - Remove @svgr/core
- `pnpm-lock.yaml` - Updated automatically

## Acceptance Criteria

- [ ] @svgr/core removed from package.json
- [ ] pnpm install succeeds
- [ ] Conversion script still works

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|

## Resources

- Package.json: `packages/icons/package.json`
