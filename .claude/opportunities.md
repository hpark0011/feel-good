# Context Improvement Opportunities

**Last Updated**: 2025-01-13 (Initial creation)
**Total Opportunities**: 0

---

## Active Opportunities

### 🎯 Ready to Implement (High Value, Low Effort)

*No opportunities currently tracked*

*When context-guardian identifies quick wins, they'll appear here with:*
- *Complete implementation drafts*
- *Estimated effort (< 30 minutes)*
- *Clear impact description*

### 📋 Planned (Medium Priority)

*No opportunities currently tracked*

*Medium-effort improvements (30 min - 2 hours) will appear here.*

### 💡 Backlog (Good Ideas)

*No opportunities currently tracked*

*Speculative ideas and future improvements will be tracked here.*

---

## Implemented (Changelog)

- **[2025-01-13]** Created context-guardian agent
  - Monitors CLAUDE.md, .claude/, codebase patterns, git history, and conversations
  - Identifies automation opportunities
  - Suggests new commands/skills/agents

- **[2025-01-13]** Added /sync-docs command
  - Analyzes project structure, tech stack, patterns, hooks, features
  - Generates health reports with specific suggested fixes

- **[2025-01-13]** Organized .claude/ directory structure
  - Added agents/ for specialized reasoning agents
  - Added commands/ for reusable commands
  - Added commands/patterns/ for architectural patterns
  - Created health.md for context tracking

---

## Rejected (Why Not)

*When suggestions are rejected, we document them here to avoid re-suggesting.*

*Example format:*
- *[Date] Suggestion - Reason for rejection*

---

## How This Works

The **context-guardian** agent populates this file by:

1. **Detecting patterns** in your development work
2. **Analyzing git history** for repeated changes
3. **Learning from conversations** for common workflows
4. **Monitoring infrastructure** for documentation gaps

When you run:
- `/sync-docs` - Checks CLAUDE.md accuracy, suggests context-guardian
- `context-guardian` - Comprehensive analysis, updates this file

### Opportunity Lifecycle

```
Detected → Active (Ready/Planned/Backlog) → Implemented or Rejected
```

**Active opportunities** have:
- Clear description of the pattern/need
- Complete implementation draft
- Effort estimate (time to build)
- Impact assessment (time saved, quality improvement)

**Implementation process**:
1. Review opportunity from this file
2. Decide to implement, defer, or reject
3. If implementing: Use provided draft as starting point
4. Move to "Implemented" section with completion date
5. If rejecting: Move to "Rejected" with reasoning

### Quick Stats

- **Opportunities detected**: 0 (so far)
- **Opportunities implemented**: 3 (sync-docs, context-guardian, .claude organization)
- **Opportunities rejected**: 0
- **Success rate**: 100% (3/3 implemented)

---

## Next Steps

1. Run `context-guardian` to populate this file with detected opportunities
2. Review "Ready to Implement" section for quick wins
3. Schedule time for "Planned" items
4. Revisit "Backlog" during planning sessions

This file evolves as your codebase grows and patterns emerge.
