# 03 — Download + wikilink

**Plan sections:** "Insertion → Download + wikilink", "Modal" (Shift+click and buttons).

## Goal

Download the chosen image into the vault and insert it as `![[file|700]]`; let the user choose the mode per click.

## Checklist

- [ ] `src/insert.ts`: `insertAsDownload()`:
  - [ ] Download with `requestUrl(...).arrayBuffer`.
  - [ ] Extension from `content-type` (png/jpg/webp/gif/svg/avif), fallback to URL; reject non-images with a `Notice`.
  - [ ] File name: slugified alt + short timestamp (e.g. `orange-cat-20261006-142530.jpg`).
  - [ ] Path via `app.fileManager.getAvailablePathForAttachment(name, currentNote.path)` (the `downloadFolder` setting comes in task 04).
  - [ ] Save with `app.vault.createBinary()`.
  - [ ] Insert `![[${file.name}|700]]`; use the full path if the name is ambiguous in the vault.
  - [ ] Network/write errors → pt-BR `Notice`.
- [ ] Modal: Shift+click uses the non-default mode (default = link until task 04).
- [ ] Each thumbnail gets "🔗 Link" and "⬇ Baixar" buttons; add a hint explaining Shift+click.
- [ ] Show progress while downloading (avoid double insert on repeated clicks).
- [ ] Lint passes; build and install in the test vault.

## Acceptance criteria

- "⬇ Baixar" (or Shift+click) saves the image in the attachment folder configured in Obsidian and inserts a working embed.
- Downloading the same image twice creates two distinct files (no overwrite).
