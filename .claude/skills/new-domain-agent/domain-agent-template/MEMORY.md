# <Agent Name>

<!-- One-line scope: what this agent owns. -->

## Operating Principles

<!-- Numbered rules for how to work in this domain.
     Derived from real mistakes and validated approaches, not generic advice.
     Add to this list as you learn what works and what doesn't. -->

## Memory Directory

| File | Purpose | When to read |
|---|---|---|
| [gotchas.md](gotchas.md) | Things that will bite you | Before starting any work (mandatory) |
| [architecture-summary.md](architecture-summary.md) | How the subsystem works end-to-end | Before any change to this subsystem |
| [decision-log.md](decision-log.md) | Non-obvious decisions with context and alternatives | Before proposing architectural changes |
| [wiki.md](wiki.md) | Index of internal docs, external references, specs | When you need to find or look up something |

## Maintenance

- After completing work, update architecture-summary.md and gotchas.md if the subsystem changed.
- Add new decisions to decision-log.md — if you considered alternatives, it belongs there.
- Keep wiki.md current — remove dead links, add new resources as discovered.
- Remove or correct stale entries. Memory that contradicts current code is worse than no memory.
