# Tasks

Derived from the "Steps" in `.agents/PLAN.md`. The plan is the source of truth for design details; these files track execution.

| # | Task | Depends on | Status |
|---|---|---|---|
| 01 | [Scaffold from sample plugin](01-scaffold.md) | — | done |
| 02 | [DuckDuckGo search + insert as link](02-duckduckgo-link.md) | 01 | done |
| 03 | [Download + wikilink](03-download-wikilink.md) | 02 | done |
| 04 | [Settings tab + Google Custom Search](04-settings-google.md) | 02 | done |
| 05 | [Pagination, styles, errors, rate limiting, testing](05-polish.md) | 03, 04 | in progress |

## Conventions

- Do tasks in order. One task = one unit of work; commit only when the whole task is done (see "Git Conventions" in `AGENTS.md`).
- Tick checkboxes as items are completed and update the Status column (`todo` → `in progress` → `done`).
- If a task reveals the plan is wrong, update `.agents/PLAN.md` and the affected task files in the same change.
