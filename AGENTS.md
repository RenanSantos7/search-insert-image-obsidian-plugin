# AGENTS.md

## Implementation plan

- **Before any implementation task, read `.agents/PLAN.md` with the Read tool** (it is not loaded automatically). It defines the architecture, modules, settings, providers, insertion logic, and the step order ("Steps") — follow it.
- Work through the "Steps" in order; don't skip ahead unless the user asks.
- Each step has a task file in `.agents/tasks/` (index: `.agents/tasks/README.md`) with a checklist and acceptance criteria. Read the current task file, tick items as you go, and update its status in the index.
- If the user changes a decision, or implementation reveals the plan is wrong, update `.agents/PLAN.md` in the same task so it stays the source of truth.

## Current state

- Planning stage only: no code, `package.json`, build config, or git repo exists yet. Do not invent or run build/test commands until the project is scaffolded; update this file once real commands exist.
- `.agents/IDEA.md` is the original use case (Obsidian note). `.agents/PLAN.md` is the agreed design and the source of truth for implementation — follow it, and update it when decisions change.
- Implement only when the user asks; they have previously requested "plan only".
- Pre-existing user files at the root: `.gitignore` (customized; ignores `install.mjs` and other local install scripts) and `install.mjs`. When copying the sample plugin, merge the sample's `.gitignore` into ours — never overwrite either file.

## Commands

- Package manager: **pnpm** (not npm), even though the sample plugin's docs use npm.
- Test vault install: `node ./install.mjs` (run after the build). It copies the build output into the local test vault; the destination is defined by the script and the `OBSIDIAN` env var.
- `install.mjs` is local-only and git-ignored; don't commit or delete it.
- Never write machine-specific paths, user names, or vault locations into tracked files (docs, `.agents/`, code, config).

## Agreed decisions (easy to miss)

- Step 1 is cloning https://github.com/obsidianmd/obsidian-sample-plugin and building on it — do not hand-scaffold. The folder is non-empty, so clone to a temp dir and copy everything except `.git`. The sample ships its own `AGENTS.md`: merge it into this one, never overwrite.
- Providers: DuckDuckGo (default, unofficial `i.js` endpoint + `vqd` token, rate-limited) and Google Custom Search (needs API key + CX).
- Use Obsidian `requestUrl`, not `fetch` (CORS; mobile support).
- Commands live in their own module `src/commands.ts` (`registerCommands`, `openImageSearchModal`); `main.ts` only wires things up.
- Settings default `imageWidth = 700`, applied to both `![alt|700](url)` and `![[file|700]]`.
- Default insert mode comes from settings; Shift+click uses the other mode.

## Coding conventions

- TypeScript with `"strict": true` preferred.
- **Keep `main.ts` minimal**: Focus only on plugin lifecycle (onload, onunload, addCommand calls). Delegate all feature logic to separate modules.
- **Split large files**: If any file exceeds ~200-300 lines, consider breaking it into smaller, focused modules.
- **Use clear module boundaries**: Each file should have a single, well-defined responsibility.
- Bundle everything into `main.js` (no unbundled runtime deps).
- Prefer `async/await` over promise chains; handle errors gracefully.
- Prefer `try...catch` over `.then().catch()`.

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

- **English — anything intended for developers:**
    - Identifiers: variables, functions, classes, file names, command IDs, settings keys (e.g. `open-image-search`, `ImageSearchModal`, `defaultInsertMode`).
    - Code comments, `console.log`/`console.error` messages, TSDocs and internal exception messages.
    - Commit messages.
    - Technical docs such as `AGENTS.md`.

- **Brazilian Portuguese (pt-BR) — anything intended for plugin users:**
    - UI text: command names in the command palette (e.g. "Buscar e inserir imagem"), modal text, buttons, settings tab labels and descriptions.
    - User notifications (`Notice`), e.g. "DuckDuckGo limitou as requisições…".
    - The plugin `README.md`.

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
