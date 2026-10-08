>[!Note]
>This plugin was developed with AI assistance.

# Search Insert Image

*Read this in other languages: [English](README.md) | [Português](README.pt-br.md)*

An [Obsidian](https://obsidian.md) plugin that lets you search for images on the web and insert them into the active note with a single click.

## Features

- Search images using DuckDuckGo (default, no API key needed) or Google Custom Search.
- Paginate through results using **Load more**.
- Insert images as external Markdown links: `![alt text|700](image_url)`.
- Download images directly into the vault and insert them as wikilinks: `![[image|700]]`.
- Customize default search provider, insert mode, image width, download folder, and safe search in settings.
- Multi-language support (English, Brazilian Portuguese, and Spanish) that automatically adapts to Obsidian's interface language.

## How to use

With a Markdown note open, open the image search modal in any of the following ways:

- Command palette (`Ctrl`/`Cmd`+`P`) → **Search Insert Image: Search and insert image**;
- Ribbon icon in the left sidebar (**Search and insert image**);
- Right-click editor context menu → **Search image…**.

If you have text selected in the note, it will automatically be used as the initial search query.

Inside the search modal:
- **Click** an image to insert using the default mode (link or download).
- **Shift+click** an image to insert using the alternative mode.
- Thumbnail buttons allow you to explicitly choose between `🔗 Link` and `⬇ Download`.

## Google setup

DuckDuckGo works out of the box without any extra configuration. To use Google, fill in your API key and Search Engine ID in the plugin settings. Google Custom Search provides a free tier of 100 queries per day; any additional usage depends on your Google Cloud account.

## External services and privacy

When searching, query terms are sent directly to the selected search provider. DuckDuckGo uses its public web endpoint by default, which may temporarily rate-limit high request volumes. When configured, Google uses the official Custom Search JSON API.

This plugin:
- Collects no telemetry or user data.
- Does not transmit note contents or vault files.
- Only downloads images when you explicitly choose to download them into your vault.

## Manual installation

1. Baixe `main.js`, `manifest.json` e `styles.css` da [versão mais recente](https://github.com/RenanSantos7/search-insert-image-obsidian-plugin/releases).
2. Copie os arquivos para `<seu cofre>/.obsidian/plugins/search-insert-image/`.
3. Recarregue o Obsidian e ative o plugin em **Configurações → Plugins da comunidade**.

## Development

Requires Node.js 18 or higher and [pnpm](https://pnpm.io).

```bash
pnpm dev     # compila em modo watch
pnpm build   # build de produção
pnpm lint
```

### Git hook

The repository includes a `pre-push` hook that runs `pnpm test` and prevents pushing when any test fails. To activate it in a local clone, run:

```bash
git config core.hooksPath .githooks
```

## License

[0BSD](LICENSE)
