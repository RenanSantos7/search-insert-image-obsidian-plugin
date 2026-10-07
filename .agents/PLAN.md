# Plan — Obsidian Plugin "Search Insert Image"

> UI strings support internationalization (i18n) via `src/i18n/` with English (`en`) as the base locale and Brazilian Portuguese (`pt-BR`) as a supported locale. Detection uses Obsidian's configured language (`window.localStorage.getItem('language')`), falling back to English. Everything else is in English (see "Natural language" in `AGENTS.md`).

## Use case

Search for images on the web (DuckDuckGo or Google Custom Search) and insert them into the current note with one click:

- As an external link: `![alt|700](image_url)`; or
- By downloading the image into the vault and inserting it as a wikilink: `![[image|700]]`.

Reference: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin

## Decisions

- **Providers:** DuckDuckGo (default, no key) and Google Custom Search (requires API key + CX).
- **Insert mode:** the default comes from settings. In the modal, click uses the default and Shift+click uses the other mode; each thumbnail also has explicit buttons.
- **Default image width:** `700`.
- **Commands:** live in their own module (`src/commands.ts`).
- **Internationalization (i18n):** zero-dependency typed dictionary module in `src/i18n/`. English is the base locale (`en.ts`); Brazilian Portuguese is supported (`pt-br.ts`). Detection follows Obsidian's locale setting.
- **Project base:** clone the official [obsidianmd/obsidian-sample-plugin](https://github.com/obsidianmd/obsidian-sample-plugin) repository and build on it (TypeScript + esbuild + ESLint already configured). Do not hand-scaffold.

## Starting point: sample plugin

The project folder already contains files (`.agents/`, `AGENTS.md`), so `git clone` directly into it fails. Procedure:

1. Clone into a temporary folder: `git clone https://github.com/obsidianmd/obsidian-sample-plugin.git <temp>`.
2. Copy the contents to the project root, **except `.git`**, and start a fresh repository (`git init`). Our `.gitignore` already exists: merge the sample's entries into it instead of overwriting. Don't touch `install.mjs`.
3. Conflict: the sample ships its own `AGENTS.md`. Merge its useful guidance into this project's `AGENTS.md`; never overwrite ours.
4. Remove the example code from `src/main.ts` and `src/settings.ts` (sample modal, global click handler, `setInterval`, `mySetting` setting).
5. Adjust `manifest.json` (`id`, `name`, `description`, `author`, `isDesktopOnly: false`), `package.json` (`name`, `description`) and `README.md` (README in pt-BR).
6. `pnpm i`, then `pnpm dev` (compiles `src/main.ts` → `main.js` in watch mode) and `pnpm lint`.

The sample also ships: `eslint.config.mts` (with Obsidian-specific rules), a GitHub Actions workflow that runs lint, `version-bump.mjs` + `versions.json` (`npm version patch|minor|major`) and `.editorconfig`. Requires Node ≥ 18.

## Project structure

Files from the sample (`manifest.json`, `package.json`, `esbuild.config.mjs`, `eslint.config.mts`, `tsconfig.json`, `version-bump.mjs`, `versions.json`, `.github/workflows/`) are kept. What changes / is created:

```
search-insert-image-obsidian-plugin/
├── manifest.json        # adjusted: id, name, isDesktopOnly: false
├── styles.css           # modal thumbnail grid
└── src/
    ├── main.ts          # Plugin: loads settings, registerCommands(this), ribbon icon, editor menu
    ├── commands.ts      # registers the plugin commands and exposes openImageSearchModal()
    ├── settings.ts      # interface, DEFAULT_SETTINGS and PluginSettingTab
    ├── modal.ts         # ImageSearchModal: search field + grid + pagination
    ├── insert.ts        # insert as link / download and insert as wikilink
    ├── i18n/            # internationalization
    │   ├── index.ts     # t() helper, locale resolution (window.localStorage 'language')
    │   └── locales/
    │       ├── en.ts    # default locale (English)
    │       └── pt-br.ts # Brazilian Portuguese locale
    └── providers/
        ├── types.ts     # ImageResult + ImageProvider interface
        ├── duckduckgo.ts
        └── google.ts
```

## Shared types (`providers/types.ts`)

```ts
interface ImageResult {
  imageUrl: string;     // full-size image
  thumbnailUrl: string; // used in the grid
  title: string;        // becomes the alt text
  sourceUrl?: string;   // source page
  width?: number;
  height?: number;
}

interface ImageProvider {
  search(query: string, page: number): Promise<ImageResult[]>;
}
```

## Providers

All requests use Obsidian's `requestUrl` instead of `fetch`, to avoid CORS blocking (the browser restriction on cross-site requests). This also works on mobile.

### DuckDuckGo (no key; unofficial endpoint)

1. `GET https://duckduckgo.com/?q=<query>&iax=images&ia=images` and extract the `vqd` token from the HTML with a regex (`vqd=["']?([\d-]+)`).
2. `GET https://duckduckgo.com/i.js?l=wt-wt&o=json&q=<query>&vqd=<token>&f=,,,,&p=1`, with the header `Referer: https://duckduckgo.com/`. When safe search is off, use `p=-1`.
3. Map each item of `results[]` (`image`, `thumbnail`, `title`, `url`, `width`, `height`). The next page comes from the `next` field.

**Rate limiting:** there is no published official limit, but DuckDuckGo temporarily blocks clients that send too many requests. Symptoms are `403`, `429` or `202` responses with no results, or failure to obtain the `vqd`. The block usually lasts from minutes to hours. To avoid it:

- Cache the `vqd` token per query and reuse it for pagination.
- Search only on Enter or on clicking "Buscar", never on every keystroke.
- Keep a minimum interval of about 1 s between requests.
- Send browser-like headers (`User-Agent`, `Referer`).
- When a block is detected: show a `Notice` ("DuckDuckGo limitou as requisições, tente novamente em alguns minutos") and, if a key is configured, offer to search with Google instead.
- If the endpoint format changes and the search fails, show a clear error.

### Google Custom Search (official API)

- `GET https://www.googleapis.com/customsearch/v1?key=<API_KEY>&cx=<CX>&q=<query>&searchType=image&num=10&start=<1+10*(page-1)>&safe=<active|off>`
- Map `items[]`: `link` → image, `image.thumbnailLink` → thumbnail, `title` → alt, `image.contextLink` → source page.
- Limits: 10 results per request, at most 100 per query (`start` ≤ 91) and 100 free queries per day.
- Disabled, with a notice, until `googleApiKey` and `googleCx` are filled in.

## Settings (`settings.ts`)

| Field | Type | Default |
|---|---|---|
| `provider` | `'duckduckgo' \| 'google'` | `'duckduckgo'` |
| `googleApiKey` | `string` | `''` |
| `googleCx` | `string` | `''` |
| `defaultInsertMode` | `'link' \| 'download'` | `'link'` |
| `downloadFolder` | `string` (empty = use Obsidian's attachment settings) | `''` |
| `safeSearch` | `boolean` | `true` |
| `imageWidth` | `number` (0 or empty = no width) | `700` |

`imageWidth` accepts only positive integers. If empty or 0, the `|<width>` suffix is not added.

## Modal (`modal.ts`)

- `ImageSearchModal extends Modal`, with a text field (Enter searches), a provider selector to switch on the fly, and a thumbnail grid.
- If there is selected text in the editor, it is used as the initial query and the search starts automatically.
- **Click** inserts with the default mode. **Shift+click** uses the other mode.
- Each thumbnail has two small buttons: "🔗 Link" and "⬇ Baixar". A hint in the modal explains that Shift switches the mode.
- "Carregar mais" button for pagination, a loading indicator, and a message when there are no results.
- The modal closes after inserting the image.

## Insertion (`insert.ts`)

Width suffix: `const size = settings.imageWidth > 0 ? `|${settings.imageWidth}` : ''`.

### As link

```ts
editor.replaceSelection(`![${alt}${size}](${imageUrl})`);
```

The alt text is sanitized: no `[`, `]`, `|` or line breaks.

### Download + wikilink

1. `requestUrl({ url: imageUrl, method: 'GET' })` and read `.arrayBuffer`.
2. The extension comes from `content-type` (png/jpg/webp/gif/svg/avif). If missing, fall back to the URL. If it is not an image, show an error.
3. The file name is the alt text slugified + a short timestamp (e.g. `orange-cat-20261006-142530.jpg`).
4. The path comes from:
   - `downloadFolder`, if set (the folder is created if it doesn't exist); or
   - `app.fileManager.getAvailablePathForAttachment(name, currentNote.path)`, which respects the user's attachment folder.
5. Save with `app.vault.createBinary(path, buffer)`.
6. Insert `![[${file.name}${size}]]`. If another file with the same name exists in the vault, use the full path.
7. Network or write errors show a `Notice`.

## Commands (`commands.ts`)

```ts
import { Editor, MarkdownView } from 'obsidian';
import type SearchInsertImagePlugin from './main';
import { ImageSearchModal } from './modal';

export function openImageSearchModal(
  plugin: SearchInsertImagePlugin, editor: Editor, view: MarkdownView
) {
  const initialQuery = editor.getSelection().trim();
  new ImageSearchModal(plugin.app, plugin, editor, view, initialQuery).open();
}

export function registerCommands(plugin: SearchInsertImagePlugin) {
  plugin.addCommand({
    id: 'open-image-search',
    name: 'Buscar e inserir imagem',
    editorCallback: (editor, ctx) => {
      if (ctx instanceof MarkdownView) openImageSearchModal(plugin, editor, ctx);
    },
  });
}
```

- Appears in the command palette (Ctrl/Cmd+P) as **"Search Insert Image: Buscar e inserir imagem"** and can be bound to a hotkey in Settings → Hotkeys.
- Because it uses `editorCallback`, it only appears when a Markdown note is open.
- Future commands (e.g. separate "Buscar com DuckDuckGo" and "Buscar com Google") go in this module.

## Entry points (`main.ts`)

```ts
async onload() {
  await this.loadSettings();
  registerCommands(this);
  this.addSettingTab(new SearchInsertImageSettingTab(this.app, this));
  // the ribbon icon (addRibbonIcon) and the "Buscar imagem…" editor menu item ('editor-menu' event)
  // also call openImageSearchModal()
}
```

- The ribbon icon only works when a `MarkdownView` is active; otherwise it shows a `Notice`.
- All entry points reuse `openImageSearchModal()`.

## Internationalization (`src/i18n/`)

- Architecture: zero-dependency typed dictionary pattern.
- Base locale: `src/i18n/locales/en.ts` contains all keys and English text (single source of truth for string keys).
- Locales: `src/i18n/locales/pt-br.ts` implements `Partial<typeof en>` for Brazilian Portuguese.
- Detection: `(window.localStorage.getItem('language') || 'en').toLowerCase()`.
- Helper: `t(key: keyof typeof en, ...args)` looks up the active translation with fallback to English.
- All user-facing strings (commands, ribbon icon tooltip, editor menu item, modal inputs/buttons/labels, settings tab, provider error messages, and notices) use `t()`.

## Steps

1. Clone the sample plugin (see "Starting point"), remove the example code, adjust manifest/package.json, confirm that `pnpm dev`, `pnpm build`, `pnpm lint` and `node ./install.mjs` work. Then create `commands.ts` + an empty modal.
2. DuckDuckGo provider + thumbnail grid + insert as link (with `|700`).
3. Download + wikilink.
4. Settings tab + Google Custom Search.
5. Pagination, styles, error handling and rate limiting, testing on desktop and mobile.
6. Internationalization (i18n): create `src/i18n/` with English base and Portuguese translation, replace hardcoded strings with `t()`, and verify locale switching.
