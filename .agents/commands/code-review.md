---
name: code-review
description: Review and clean up code after implementation. Use after generating code, when asked to review recent changes, or when asked to clean up code quality issues.
---

# Code Review & Cleanup

Review recently implemented code and assess quality, then clean up any issues found.

## Review Checklist

Analyze the code for:

### 1. Consistency Issues

- Naming conventions (camelCase, PascalCase usage)
- Import ordering and grouping
- Component structure patterns
- File organization matching project conventions

### 2. Dead Code

- Unused imports
- Unused variables and functions
- Commented-out code that should be removed
- Unreachable code paths

### 3. Complexity Issues

- Functions longer than 50 lines
- Deeply nested conditionals (3+ levels)
- Components doing too many things
- Logic that could be extracted into hooks or utilities

### 4. Naming Clarity

- Vague names (data, info, item, stuff, handle)
- Inconsistent naming for similar concepts
- Boolean variables not prefixed with is/has/should/can
- Event handlers not prefixed with on/handle

### 5. Structural Issues

- Props drilling that should use context
- Repeated code that should be abstracted
- Missing TypeScript types or using `any`
- Hardcoded values that should be constants

### 6. React-Specific

- Missing or incorrect dependency arrays in hooks
- Components that should be memoized
- State that could be derived instead of stored
- Effects that could be event handlers

## Process

1. **Identify changed files** - Look at recent git changes or files modified in session
2. **Review each file** - Apply the checklist above
3. **Prioritize issues** - Focus on high-impact problems first
4. **Fix issues** - Make the necessary cleanups
5. **Summarize changes** - Report what was cleaned up

## Output Format

After review, provide:

```
## Code Review Summary

### Files Reviewed
- [list of files]

### Issues Found & Fixed
- [category]: [description of fix]

### Recommendations
- [any remaining suggestions that weren't auto-fixed]
```

## Guidelines

- Preserve existing functionality - don't change behavior
- Match existing project patterns found in CLAUDE.md
- Don't over-engineer or add unnecessary abstractions
- Keep changes minimal and focused
- If unsure about a change, ask before modifying
