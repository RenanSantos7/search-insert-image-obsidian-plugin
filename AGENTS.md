# AGENTS.md

## Implementation plan

- **Before any implementation task, read `.agents/PLAN.md` with the Read tool** (it is not loaded automatically). It defines the architecture, modules, settings, providers, insertion logic, and the step order ("Steps") — follow it.
- Work through the "Steps" in order; don't skip ahead unless the user asks.
- Each step has a task file in `.agents/tasks/` (index: `.agents/tasks/README.md`) with a checklist and acceptance criteria. Read the current task file, tick items as you go, and update its status in the index.
- If the user changes a decision, or implementation reveals the plan is wrong, update `.agents/PLAN.md` in the same task so it stays the source of truth.

## Current state

- Scaffolded from the official sample plugin (task 01). Entry point `src/main.ts` → bundled `main.js` (git-ignored; release artifacts are `main.js`, `manifest.json`, `styles.css`).
- `.agents/IDEA.md` is the original use case (Obsidian note). `.agents/PLAN.md` is the agreed design and the source of truth for implementation — follow it, and update it when decisions change.
- **Implement only the task the user asked for.** Don't pull in work from later tasks (e.g. settings fields, CI changes) or "improve" files outside the task checklist.
- `.gitignore` is customized by the user (ignores `install.mjs` and other local install scripts); edit it, never replace it.

## Commands

- Package manager: **pnpm** (not npm), even though the sample plugin's docs and the GitHub workflows use npm.
- `pnpm install` · `pnpm dev` (watch) · `pnpm build` (`tsc -noEmit` + esbuild production) · `pnpm lint` (ESLint with `eslint-plugin-obsidianmd`).
- `pnpm-workspace.yaml` must keep `allowBuilds: esbuild: true`; pnpm blocks esbuild's postinstall otherwise and `pnpm install` fails.
- Verify a task with: `pnpm build` → `pnpm lint` → `node ./install.mjs`.
- Test vault install: `node ./install.mjs` (run after the build). It copies the build output into the local test vault; the destination is defined by the script and the `OBSIDIAN` env var.
- `install.mjs` is local-only and git-ignored; don't commit or delete it.
- Never write machine-specific paths, user names, or vault locations into tracked files (docs, `.agents/`, code, config).

## Agreed decisions (easy to miss)

- Providers: DuckDuckGo (default, unofficial `i.js` endpoint + `vqd` token, rate-limited) and Google Custom Search (needs API key + CX).
- Use Obsidian `requestUrl`, not `fetch` (CORS; mobile support).
- Commands live in their own module `src/commands.ts` (`registerCommands`, `openImageSearchModal`); `main.ts` only wires things up.
- Settings default `imageWidth = 700`, applied to both `![alt|700](url)` and `![[file|700]]`.
- Default insert mode comes from settings; Shift+click uses the other mode.
- Internationalization (i18n): zero-dependency typed dictionary approach (`src/i18n/`) with English (`en`) as the base locale and Brazilian Portuguese (`pt-br`) supported. Active language detected via `window.localStorage.getItem('language')` (with fallback to `en`). All UI text, commands, notices, and settings use `t('key')`.

## Coding conventions

- TypeScript with `"strict": true` preferred.
- **Keep `main.ts` minimal**: Focus only on plugin lifecycle (onload, onunload, addCommand calls). Delegate all feature logic to separate modules.
- **Split large files**: If any file exceeds ~200-300 lines, consider breaking it into smaller, focused modules.
- **Use clear module boundaries**: Each file should have a single, well-defined responsibility.
- Bundle everything into `main.js` (no unbundled runtime deps).
- Prefer `async/await` over promise chains; handle errors gracefully.
- Prefer `try...catch` over `.then().catch()`.
- `isDesktopOnly` is `false`: avoid Node/Electron APIs (`fs`, `path`, etc.) in `src/`.

## Obsidian plugin rules (merged from the sample plugin's AGENTS.md)

- `manifest.json`: never change `id` (`search-insert-image`) after release; keep `minAppVersion` accurate when using newer APIs. Canonical checks: https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml
- Releases: bump `version` in `manifest.json` (SemVer) and map it in `versions.json`; the GitHub release tag must equal the version exactly (no leading `v`); attach `main.js`, `manifest.json`, `styles.css`.
- Follow Obsidian's Developer Policies and Plugin Guidelines: disclose every external service (DuckDuckGo, Google) in `README.md`; no telemetry; never execute remote code; read/write only inside the vault.
- UI copy: sentence case for headings, buttons, titles and commands; don't prefix command names with the plugin name (Obsidian adds it).
- Keep `onload` light; defer heavy work until needed.
- References: https://docs.obsidian.md · https://docs.obsidian.md/Developer+policies · https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines

## Git Conventions

- **Atomic Commits**: Keep commits focused and logically isolated.
- **Conventional Commits with Gitmoji**:
  - Follow the format: `flag: :gitmoji: message`
  - Examples:
    - `feat: :sparkles: add support for SBC paper document style`
    - `fix: :adhesive_bandage: correct endnote backlink URL in HtmlTree`
    - `refactor: :recycle: extract bibliography formatting to model method`
    - `docs: :memo: update AGENTS.md guide`
- **Commit the code** after each task are concluded.

## Natural language

- **English — developer artifacts and base locale:**
    - Identifiers: variables, functions, classes, file names, command IDs, settings keys (e.g. `open-image-search`, `ImageSearchModal`, `defaultInsertMode`).
    - Code comments, `console.log`/`console.error` messages, TSDocs and internal exception messages.
    - Commit messages.
    - Technical docs such as `AGENTS.md` and `.agents/PLAN.md`.
    - Base locale dictionary (`src/i18n/locales/en.ts`) for all UI copy (Obsidian community guideline requirement).

- **Translations (i18n):**
    - Supported locales: Brazilian Portuguese (`src/i18n/locales/pt-br.ts`) and Spanish (`src/i18n/locales/es.ts`).
    - All UI copy (command palette names, modal controls, buttons, settings labels/descriptions, `Notice` alerts) must be referenced via `t(key)`.
    - User documentation: `README.md` in English (base), with Brazilian Portuguese translation in `README.pt-br.md`.

- **Chat:** always reply to the user in Brazilian Portuguese.

## Agent do/don't

**Do**

- Add commands with stable IDs (don't rename once released).
- Provide defaults and validation in settings.
- Write idempotent code paths so reload/unload doesn't leak listeners or intervals.
- Use `this.register*` helpers for everything that needs cleanup.
- Before making any code modifications, check if there are uncommitted changes (staged or unstaged). If present, create a single initial commit (e.g., "wip: save state before agent tasks").
- Keep all subsequent edits uncommitted in the working tree until the entire assigned task is complete.
- After ensuring the task is complete and code changes are tested, build the plugin and install it in the test vault (skip if the task only modifies documentation or `AGENTS.md`).

**Don't**

- Introduce network calls without an obvious user-facing reason and documentation.
- Ship features that require cloud services without clear disclosure and explicit opt-in.
- Store or transmit vault contents unless essential and consented.
- Do not create commits for individual file edits, small steps, or partial changes during task execution.
- Do not push changes to remote or modify the main branch without explicit approval
