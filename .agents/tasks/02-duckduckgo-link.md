# 02 — DuckDuckGo search + insert as link

**Plan sections:** "Shared types", "Providers → DuckDuckGo", "Modal", "Insertion → As link".

## Goal

Search DuckDuckGo from the modal, show thumbnails, and insert the clicked image as a Markdown link with the width suffix.

## Checklist

- [x] `src/providers/types.ts`: `ImageResult`, `ImageProvider`.
- [x] `src/providers/duckduckgo.ts`:
  - [x] Fetch the `vqd` token via `requestUrl` (regex `vqd=["']?([\d-]+)`).
  - [x] Query `i.js` with `Referer` and browser-like `User-Agent`; map `results[]` to `ImageResult`.
  - [x] Cache `vqd` per query; keep the `next` cursor for later pagination.
  - [x] Throw typed errors for "rate limited" (403/429/202/no `vqd`) vs. "unexpected format".
- [x] `src/modal.ts`: search on Enter (never on keystroke), loading indicator, thumbnail grid, "no results" message.
- [x] Pre-fill the query with the editor selection and auto-search when present.
- [x] `src/insert.ts`: `insertAsLink()` — sanitize alt (remove `[`, `]`, `|`, line breaks), append `|700` (hardcoded default until task 04 adds settings), `editor.replaceSelection()`.
- [x] Click on a thumbnail inserts as link and closes the modal.
- [x] User-facing errors as `Notice` in pt-BR (e.g. "DuckDuckGo limitou as requisições, tente novamente em alguns minutos").
- [x] Lint passes; build and install in the test vault.

## Notes

- Endpoint verified outside Obsidian (Node `fetch`, query "cat"): `vqd` found, `i.js` returned 95 results. The `next` cursor comes without `vqd`; the provider appends it.
- Error classes (`ProviderRateLimitError`, `ProviderResponseError`) live in `providers/types.ts`.
- Safe search is hardcoded (`p=1`); the setting comes in task 04. The provider is created per modal instance, so the `vqd` cache lives while the modal is open.
- `styles.css` has only the minimal grid layout; full styling is task 05.
- Inserted image URLs have `(`, `)` and spaces percent-encoded so the Markdown link doesn't break.
- In-Obsidian behavior (grid, insertion) must be checked manually by the user.

## Acceptance criteria

- Searching "cat" shows a grid of thumbnails; clicking one inserts `![<alt>|700](<url>)` at the cursor (replacing the selection if any).
- A failed/blocked search shows a clear pt-BR `Notice` and does not break the modal.
