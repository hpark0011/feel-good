---
status: pending
priority: p3
issue_id: "082"
tags: [auth, otp, testing, code-review]
dependencies: []
---

# Address Skipped E2E Tests

## Problem Statement

2 of 8 E2E tests are `test.skip` — the two that actually verify OTP flow behavior (step transition after email submit, back button). The running tests only verify element presence on page load. This means the most critical auth flows have zero automated coverage.

## Affected Files

- `apps/mirror/e2e/auth.spec.ts` (lines 37, 54)

## Proposed Solutions

### Option A: Add API mocking
Use Playwright's `route.fulfill()` to mock Better Auth responses, enabling the skipped tests without a running Convex backend.

### Option B: Test environment with seeded OTPs
Configure a test-mode Convex backend that returns known OTP codes.

**Effort:** Medium | **Risk:** Low

## Acceptance Criteria

- [ ] Step transition test runs in CI (not skipped)
- [ ] Back button test runs in CI (not skipped)
- [ ] Tests don't require a running Convex backend

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-06 | Created from PR #104 multi-agent review (typescript reviewer) | Skipped tests tend to stay skipped permanently |
