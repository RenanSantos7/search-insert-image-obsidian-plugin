# 04 — Settings tab + Google Custom Search

**Plan sections:** "Settings", "Providers → Google Custom Search", "Modal" (provider selector).

## Goal

Make behavior configurable and add Google Custom Search as a second provider.

## Checklist

- [ ] `src/settings.ts`: settings interface + `DEFAULT_SETTINGS` exactly as in the plan table (`provider`, `googleApiKey`, `googleCx`, `defaultInsertMode`, `downloadFolder`, `safeSearch`, `imageWidth = 700`).
- [ ] Settings tab with pt-BR labels/descriptions; validate `imageWidth` (positive integer; empty/0 = no suffix).
- [ ] Mask/hide the API key field; explain that Google requires an API key + CX and has 100 free queries/day.
- [ ] Replace hardcoded values from tasks 02–03 with settings (`imageWidth`, `defaultInsertMode`, `downloadFolder`, `safeSearch`).
- [ ] `downloadFolder`: when set, use it (create folder if missing); otherwise use Obsidian's attachment path.
- [ ] Safe search: DuckDuckGo `p=1` / `p=-1`; Google `safe=active` / `safe=off`.
- [ ] `src/providers/google.ts`: Custom Search JSON API with `searchType=image`, `num=10`, `start=1+10*(page-1)` (max `start` 91); map `items[]` to `ImageResult`.
- [ ] Google disabled with a pt-BR notice while key/CX are empty.
- [ ] Modal: provider selector (defaults to `settings.provider`).
- [ ] Lint passes; build and install in the test vault.

## Acceptance criteria

- Changing settings takes effect without reloading Obsidian.
- With valid key/CX, Google results appear and insert correctly in both modes.
- With width empty or 0, no `|<width>` suffix is added.
