# Search Insert Image

Plugin para o [Obsidian](https://obsidian.md) que permite pesquisar imagens na internet e inseri-las na nota atual com um clique.

> **Em desenvolvimento.** Por enquanto, o plugin abre apenas a janela de busca; a pesquisa e a inserção de imagens ainda serão implementadas.

## Funcionalidades previstas

- [ ] Pesquisar imagens no DuckDuckGo (padrão, sem chave) ou no Google Custom Search (exige chave de API).
- [ ] Inserir a imagem como link externo: `![texto alternativo|700](url_da_imagem)`.
- [ ] Ou baixar a imagem para o cofre e inseri-la como wikilink: `![[imagem|700]]`.

## Como usar

Com uma nota Markdown aberta, abra a busca de imagens de uma destas formas:

- Paleta de comandos (Ctrl/Cmd+P) → **Search Insert Image: Buscar e inserir imagem**;
- Ícone **Buscar e inserir imagem** na barra lateral;
- Clique com o botão direito no editor → **Buscar imagem…**.

Se houver texto selecionado na nota, ele é usado como termo de busca.

## Instalação manual

1. Baixe `main.js`, `manifest.json` e `styles.css` da versão mais recente.
2. Copie os arquivos para `<seu cofre>/.obsidian/plugins/search-insert-image/`.
3. Recarregue o Obsidian e ative o plugin em **Configurações → Plugins da comunidade**.

## Desenvolvimento

Requer Node.js 18 ou superior e [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev     # compila em modo watch
pnpm build   # build de produção
pnpm lint
```

## Licença

[0BSD](LICENSE)
