# 02 — DuckDuckGo search + insert as link

**Plan sections:** "Shared types", "Providers → DuckDuckGo", "Modal", "Insertion → As link".

## Goal

Search DuckDuckGo from the modal, show thumbnails, and insert the clicked image as a Markdown link with the width suffix.

## Checklist

- [ ] `src/providers/types.ts`: `ImageResult`, `ImageProvider`.
- [ ] `src/providers/duckduckgo.ts`:
  - [ ] Fetch the `vqd` token via `requestUrl` (regex `vqd=["']?([\d-]+)`).
  - [ ] Query `i.js` with `Referer` and browser-like `User-Agent`; map `results[]` to `ImageResult`.
  - [ ] Cache `vqd` per query; keep the `next` cursor for later pagination.
  - [ ] Throw typed errors for "rate limited" (403/429/202/no `vqd`) vs. "unexpected format".
- [ ] `src/modal.ts`: search on Enter (never on keystroke), loading indicator, thumbnail grid, "no results" message.
- [ ] Pre-fill the query with the editor selection and auto-search when present.
- [ ] `src/insert.ts`: `insertAsLink()` — sanitize alt (remove `[`, `]`, `|`, line breaks), append `|700` (hardcoded default until task 04 adds settings), `editor.replaceSelection()`.
- [ ] Click on a thumbnail inserts as link and closes the modal.
- [ ] User-facing errors as `Notice` in pt-BR (e.g. "DuckDuckGo limitou as requisições, tente novamente em alguns minutos").
- [ ] Lint passes; build and install in the test vault.

## Acceptance criteria

- Searching "cat" shows a grid of thumbnails; clicking one inserts `![<alt>|700](<url>)` at the cursor (replacing the selection if any).
- A failed/blocked search shows a clear pt-BR `Notice` and does not break the modal.
