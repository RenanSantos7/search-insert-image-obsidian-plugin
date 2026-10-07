# Search Insert Image

Plugin para o [Obsidian](https://obsidian.md) que permite pesquisar imagens na internet e inseri-las na nota atual com um clique.

## Funcionalidades

- Pesquisar imagens no DuckDuckGo (padrão, sem chave) ou no Google.
- Paginar os resultados com **Carregar mais**.
- Inserir a imagem como link externo: `![texto alternativo|700](url_da_imagem)`.
- Ou baixar a imagem para o cofre e inseri-la como wikilink: `![[imagem|700]]`.
- Escolher o buscador, o modo de inserção, a largura, a pasta de download e a busca segura nas configurações.

## Como usar

Com uma nota Markdown aberta, abra a busca de imagens de uma destas formas:

- Paleta de comandos (Ctrl/Cmd+P) → **Search Insert Image: Buscar e inserir imagem**;
- Ícone **Buscar e inserir imagem** na barra lateral;
- Clique com o botão direito no editor → **Buscar imagem…**.

Se houver texto selecionado na nota, ele é usado como termo de busca.

## Configuração do Google

O DuckDuckGo funciona sem configuração adicional. Para usar o Google, preencha a chave de API e o ID do mecanismo de busca nas configurações do plugin. A API do Google oferece uma cota gratuita limitada a 100 buscas por dia; cobranças e limites adicionais dependem da sua conta Google.

## Serviços externos e privacidade

Ao pesquisar, os termos digitados são enviados ao buscador selecionado. O plugin usa o endpoint de imagens do DuckDuckGo por padrão, que é um endpoint não oficial e pode limitar requisições temporariamente. Quando configurado, o Google usa a API oficial de pesquisa personalizada. O plugin não coleta telemetria, não envia o conteúdo das notas e só faz download de uma imagem quando você escolhe inseri-la como arquivo no cofre.

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
