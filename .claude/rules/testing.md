# Testing Guidelines

## E2E Testing: Playwright CLI Only

Use the Playwright CLI to write and run e2e tests. Never use Playwright MCP or similar browser-automation MCP tools for testing.

**Write test files** in the app's test directory and run them with the app's test script:

```bash
pnpm test:e2e --filter=@feel-good/mirror    # Run all e2e tests
pnpm test:e2e:ui --filter=@feel-good/mirror  # Run with Playwright UI
```

Test files go in `apps/{app}/tests/` or `apps/{app}/e2e/` following existing conventions.

**Why:** Test files are persistent, repeatable, and run in CI. MCP browser tools are ephemeral and produce no reusable artifacts.

## Interactive Debugging: Chrome MCP

For visual debugging (screenshots, DOM inspection, live behavior observation), use the Chrome MCP tools (`mcp__claude-in-chrome__*`). This is for investigating bugs, not for writing tests.

## Tool Boundaries

| Task | Tool |
|------|------|
| Automated testing | Playwright CLI (`playwright test`) |
| Visual debugging | Chrome MCP |
| Build verification | `pnpm build`, `pnpm lint` |
