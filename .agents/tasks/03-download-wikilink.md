# 03 — Download + wikilink

**Plan sections:** "Insertion → Download + wikilink", "Modal" (Shift+click and buttons).

## Goal

Download the chosen image into the vault and insert it as `![[file|700]]`; let the user choose the mode per click.

## Checklist

- [x] `src/insert.ts`: `insertAsDownload()`:
  - [x] Download with `requestUrl(...).arrayBuffer`.
  - [x] Extension from `content-type` (png/jpg/webp/gif/svg/avif), fallback to URL; reject non-images with a `Notice`.
  - [x] File name: slugified alt + short timestamp (e.g. `orange-cat-20261006-142530.jpg`).
  - [x] Path via `app.fileManager.getAvailablePathForAttachment(name, currentNote.path)` (the `downloadFolder` setting comes in task 04).
  - [x] Save with `app.vault.createBinary()`.
  - [x] Insert `![[${file.name}|700]]`; use the full path if the name is ambiguous in the vault.
  - [x] Network/write errors → pt-BR `Notice`.
- [x] Modal: Shift+click uses the non-default mode (default = link until task 04).
- [x] Each thumbnail gets "🔗 Link" and "⬇ Baixar" buttons; add a hint explaining Shift+click.
- [x] Show progress while downloading (avoid double insert on repeated clicks).
- [x] Lint passes; build and install in the test vault.

## Notes

- `InsertMode` and `DEFAULT_INSERT_MODE` (hardcoded `'link'`) live in `insert.ts` until task 04.
- `getAvailablePathForAttachment` requires Obsidian 1.5.7: `minAppVersion` raised to `1.5.7` in `manifest.json` and `versions.json` (lint rule `obsidianmd/no-unsupported-api`).
- `tsconfig.json`: the user removed `"moduleResolution": "node"`, which broke module resolution; set to `"bundler"` (user's choice).
- `insertAsDownload()` shows its own `Notice`s and returns `false` on failure; the modal stays open so the user can pick another image or insert as link.
- Many original image hosts block hotlinking (e.g. 403 + `text/html`), so downloads of some results fail with a `Notice`; the Bing thumbnail URLs download fine (`image/jpeg`). Possible improvement (not planned): fall back to the thumbnail.
- In-Obsidian behavior must be checked manually by the user.

## Acceptance criteria

- "⬇ Baixar" (or Shift+click) saves the image in the attachment folder configured in Obsidian and inserts a working embed.
- Downloading the same image twice creates two distinct files (no overwrite).
