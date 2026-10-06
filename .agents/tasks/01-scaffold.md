# 01 — Scaffold from sample plugin

**Plan sections:** "Starting point: sample plugin", "Project structure", "Commands", "Entry points".

## Goal

A clean, building plugin based on the official sample, with the command module and an empty search modal wired up.

## Checklist

- [ ] Clone `https://github.com/obsidianmd/obsidian-sample-plugin.git` into a temp folder outside the project.
- [ ] Copy everything except `.git` into the project root; do not overwrite `.agents/`, `install.mjs` or `.gitignore` (merge the sample's `.gitignore` entries into ours).
- [ ] Delete `package-lock.json` from the sample (we use pnpm).
- [ ] Merge the sample's `AGENTS.md` into ours (keep useful guidance, drop duplicates/conflicts; ours wins).
- [ ] `git init` (fresh history).
- [ ] Remove example code from `src/main.ts` and `src/settings.ts` (sample modal, global click handler, `setInterval`, `mySetting`).
- [ ] `manifest.json`: set `id`, `name`, `description`, `author`, `isDesktopOnly: false`; keep `minAppVersion` from the sample unless an API we use requires more.
- [ ] `package.json`: set `name`, `description`.
- [ ] Rewrite `README.md` in pt-BR (what the plugin does, how to install/use).
- [ ] Create `src/commands.ts` with `registerCommands()` and `openImageSearchModal()` (command id `open-image-search`, name "Buscar e inserir imagem").
- [ ] Create `src/modal.ts` with an empty `ImageSearchModal` (title + search input only; no search yet).
- [ ] `src/main.ts`: `loadSettings`, `registerCommands(this)`, settings tab, ribbon icon and `editor-menu` item ("Buscar imagem…") calling `openImageSearchModal()`. Ribbon shows a `Notice` when no `MarkdownView` is active.
- [ ] `pnpm i`, `pnpm build`, `pnpm lint` all pass.
- [ ] `node ./install.mjs` copies the plugin into the test vault; enable it there and check it loads.
- [ ] Update `AGENTS.md`: add dev/build/lint commands to "Commands" and remove the "planning stage only" note from "Current state".

## Acceptance criteria

- Plugin loads in Obsidian without errors; command "Search Insert Image: Buscar e inserir imagem" opens the empty modal.
- Ribbon icon and editor context menu open the same modal.
- Lint passes; no example code from the sample remains.
