---
status: completed
priority: p1
issue_id: "224"
tags: [code-review, bug, greyboard-desktop, release, ci]
dependencies: []
---

# Point electron-builder publish target to the actual repository

## Problem Statement

`electron-builder.yml` sets GitHub publish target to `owner: feel-good` and `repo: feel-good`. The current repository remote is `hpark0011/feel-good`, so release artifacts from this repo will be published to the wrong destination (or fail) unless special cross-repo credentials are configured.

## Findings

- **Location:** `apps/greyboard-desktop/electron-builder.yml:37-38`
- **Current value:** `owner: feel-good`, `repo: feel-good`
- **Observed remote:** `https://github.com/hpark0011/feel-good.git`
- **Impact:** Tagged release workflow may fail to publish desktop artifacts for this repository

## Proposed Solutions

### Option A: Align publish owner/repo with current repository (Recommended)

- Update `publish.owner` and `publish.repo` to match the repository where workflows run
- Confirm workflow token permissions are valid for the target repo

- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] `electron-builder` publish target matches the repo running release workflows
- [ ] Tagged release (`desktop-v*`) publishes artifacts successfully
- [ ] No cross-repository publish misconfiguration remains

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from code review on `claude/orchestration-greyboard-desktop-KISfQ` | Publish metadata must be validated against actual git remote |
