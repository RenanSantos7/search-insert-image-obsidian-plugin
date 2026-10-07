# 05 — Pagination, styles, errors, rate limiting, testing

**Plan sections:** "Providers → DuckDuckGo → Rate limiting", "Modal", "Settings".

## Goal

Make the plugin robust and pleasant to use on desktop and mobile.

## Checklist

- [x] "Carregar mais" button: DuckDuckGo via cached `vqd` + `next`; Google via `start` (stop at 100 results).
- [x] Minimum ~1 s interval between provider requests.
- [x] On DuckDuckGo rate limit: pt-BR `Notice` and, if Google is configured, offer to retry with Google.
- [x] `styles.css`: responsive thumbnail grid, hover state, buttons, loading/empty states; use Obsidian CSS variables (works with light/dark themes).
- [x] Keyboard: Enter searches; Esc closes (default modal behavior).
- [x] Review cleanup: everything registered via `this.register*`; no leaks on plugin reload.
- [x] Review files over ~200–300 lines and split if needed (see `AGENTS.md`).
- [ ] Manual test on desktop: both providers, both insert modes, width on/off, custom `downloadFolder`, selection pre-fill, error cases (offline, invalid key, blocked).
- [ ] Manual test on mobile (if available).
- [x] Update pt-BR `README.md` (features, settings, Google key setup, DuckDuckGo limitation disclosure).
- [ ] Lint passes; build and install in the test vault.

## Acceptance criteria

- Pagination works for both providers without duplicate results.
- No unhandled errors in the console during the manual test matrix.
- README documents network usage (DuckDuckGo/Google) as required by Obsidian plugin guidelines.
