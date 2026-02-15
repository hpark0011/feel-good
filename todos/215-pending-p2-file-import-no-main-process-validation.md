---
status: pending
priority: p2
issue_id: "215"
tags: [code-review, security, greyboard-desktop, validation]
dependencies: []
---

# File Import Returns Raw Content Without Main-Process Validation

## Problem Statement

The `importBoard` IPC handler reads arbitrary file content and sends it unvalidated to the renderer. No file size limit, no JSON parse check, no schema validation in the main process. A multi-gigabyte file could cause OOM.

## Findings

- **Location:** `apps/greyboard-desktop/electron/ipc/files.ts:17-20`
- **Risk:** OOM from large files, binary garbage crossing IPC bridge
- **Contrast:** Export handler validates with Zod (line 27)
- **Flagged by:** Security, TypeScript reviewers

## Proposed Solutions

Add file size limit and JSON parse validation in the main process before returning content.

```typescript
import { stat } from 'node:fs/promises'
const MAX_IMPORT_SIZE = 10 * 1024 * 1024 // 10MB
const fileInfo = await stat(filePath)
if (fileInfo.size > MAX_IMPORT_SIZE) throw new Error('File too large')
const content = await readFile(filePath, 'utf-8')
JSON.parse(content) // Validate parseable JSON
return content
```

- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] File size limit enforced before reading
- [ ] Content validated as parseable JSON before IPC transfer

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | Defense-in-depth: validate at the IPC boundary, not just in consumer |
