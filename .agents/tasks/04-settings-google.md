# 04 — Settings tab + Google Custom Search

**Plan sections:** "Settings", "Providers → Google Custom Search", "Modal" (provider selector).

## Goal

Make behavior configurable and add Google Custom Search as a second provider.

## Checklist

- [x] `src/settings.ts`: settings interface + `DEFAULT_SETTINGS` exactly as in the plan table (`provider`, `googleApiKey`, `googleCx`, `defaultInsertMode`, `downloadFolder`, `safeSearch`, `imageWidth = 700`).
- [x] Settings tab with pt-BR labels/descriptions; validate `imageWidth` (positive integer; empty/0 = no suffix).
- [x] Mask/hide the API key field; explain that Google requires an API key + CX and has 100 free queries/day.
- [x] Replace hardcoded values from tasks 02–03 with settings (`imageWidth`, `defaultInsertMode`, `downloadFolder`, `safeSearch`).
- [x] `downloadFolder`: when set, use it (create folder if missing); otherwise use Obsidian's attachment path.
- [x] Safe search: DuckDuckGo `p=1` / `p=-1`; Google `safe=active` / `safe=off`.
- [x] `src/providers/google.ts`: Custom Search JSON API with `searchType=image`, `num=10`, `start=1+10*(page-1)` (max `start` 91); map `items[]` to `ImageResult`.
- [x] Google disabled with a pt-BR notice while key/CX are empty.
- [x] Modal: provider selector (defaults to `settings.provider`).
- [x] Lint passes; build and install in the test vault.

## Notes

- `InsertMode`, `ImageProviderId`, `PROVIDER_LABELS` and `isGoogleConfigured()` live in `settings.ts`; `insert.ts` no longer has hardcoded defaults (`insertAsDownload` takes `{ width, downloadFolder }`).
- New `ProviderConfigError` in `providers/types.ts`: Google 400/403 (invalid key/CX, API not enabled). 429 → `ProviderRateLimitError` (quota). Verified: an invalid key returns 400 with `error.message`.
- Custom `downloadFolder`: parent folders are created; existing names get a ` 1`, ` 2`… suffix (no overwrite). Empty or `/` → Obsidian's attachment path.
- Invalid width input (non-integer) is not saved and the field gets a red border.
- Changing the provider in the modal re-runs the search if there is a query. Providers are cached per modal (one per id).
- The settings object is shared with the tab, so changes apply to the next modal opened without reloading.
- UI copy avoids "Custom Search", "Cloud Console" and "CX" because `obsidianmd/ui/sentence-case` flags them; the setting is "ID do mecanismo de busca".
- Lint warning `prefer-setting-definitions` remains: the declarative settings API requires Obsidian 1.13.0 (`minAppVersion` is 1.5.7). Kept the classic `display()` tab.
- Verified outside Obsidian: DuckDuckGo with `p=-1` returns results. Google with a valid key and in-Obsidian behavior must be checked manually by the user.

## Acceptance criteria

- Changing settings takes effect without reloading Obsidian.
- With valid key/CX, Google results appear and insert correctly in both modes.
- With width empty or 0, no `|<width>` suffix is added.
