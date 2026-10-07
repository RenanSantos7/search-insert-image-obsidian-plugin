import type en from './en';

const ptBr: Partial<typeof en> = {
	// Commands and menus
	commandOpenSearch: 'Buscar e inserir imagem',
	ribbonTooltip: 'Buscar e inserir imagem',
	noticeOpenMarkdownFirst: 'Abra uma nota Markdown para buscar imagens.',
	menuItemSearchImage: 'Buscar imagem…',

	// Modal
	modalTitle: 'Buscar imagem',
	searchPlaceholder: 'Digite o termo e pressione Enter',
	buttonLoadMore: 'Carregar mais',
	statusSearching: 'Buscando imagens…',
	statusLoadingMore: 'Buscando mais imagens…',
	statusNoResults: 'Nenhuma imagem encontrada.',
	statusDownloading: 'Baixando imagem…',
	ariaLabelImage: 'Imagem',
	buttonInsertLink: '🔗 Link',
	ariaLabelInsertLink: 'Inserir como link',
	buttonDownload: '⬇ Baixar',
	ariaLabelDownload: 'Baixar e inserir',
	hintClickToLink: 'Clique na imagem para inserir como link. Shift+clique para baixar e inserir.',
	hintClickToDownload: 'Clique na imagem para baixar e inserir. Shift+clique para inserir como link.',
	noticeGoogleNotConfigured:
		'Para buscar no Google, preencha a chave de API e o ID do mecanismo de busca nas configurações do plugin.',
	buttonRetryGoogle: 'Tentar com Google',

	// Errors
	errorGoogleConfig:
		'O Google recusou a chave de API ou o ID do mecanismo de busca. Verifique as configurações do plugin.',
	errorGoogleRateLimit:
		'A cota da API do Google foi atingida (100 buscas grátis por dia). Tente novamente mais tarde.',
	errorDuckDuckGoRateLimit:
		'DuckDuckGo limitou as requisições, tente novamente em alguns minutos.',
	errorProviderGeneric:
		'Não foi possível buscar imagens no {provider}. Tente novamente mais tarde.',

	// Insert notices
	noticeDownloadFailed:
		'Não foi possível baixar a imagem. Tente outra imagem ou insira como link.',
	noticeNotAnImage:
		'O endereço escolhido não é uma imagem. Tente outra imagem.',
	noticeSaveFailed:
		'Não foi possível salvar a imagem no cofre.',

	// Settings - Search and insertion
	settingsHeadingSearchAndInsert: 'Busca e inserção',
	settingDefaultProviderName: 'Buscador padrão',
	settingDefaultProviderDesc:
		'Buscador selecionado ao abrir a janela de busca. Ele também pode ser trocado na própria janela.',
	settingDefaultInsertModeName: 'Modo de inserção padrão',
	settingDefaultInsertModeDesc:
		'Usado ao clicar na imagem. Shift+clique usa o outro modo.',
	settingInsertModeLink: 'Inserir como link',
	settingInsertModeDownload: 'Baixar e inserir como wikilink',
	settingDownloadFolderName: 'Pasta de download',
	settingDownloadFolderDesc:
		'Pasta do cofre onde as imagens baixadas são salvas. Deixe vazio para usar a pasta de anexos do Obsidian. A pasta é criada se não existir.',
	settingDownloadFolderPlaceholder: 'Pasta de anexos do Obsidian',
	settingImageWidthName: 'Largura da imagem',
	settingImageWidthDesc:
		'Largura em pixels adicionada à imagem inserida (ex.: |700). Deixe vazio ou 0 para não definir largura.',
	settingImageWidthValidation: 'Informe um número inteiro maior ou igual a zero.',
	settingSafeSearchName: 'Busca segura',
	settingSafeSearchDesc: 'Filtra conteúdo explícito dos resultados.',

	// Settings - Google
	settingsHeadingGoogle: 'Busca no Google',
	settingGoogleConfigName: 'Configuração',
	settingGoogleConfigDesc:
		'Para buscar no Google é preciso uma chave de API e o ID de um mecanismo de busca. O uso gratuito é limitado a 100 buscas por dia.',
	settingGoogleApiKeyName: 'Chave de API',
	settingGoogleApiKeyDesc:
		'Crie a chave no console de desenvolvedor do Google e ative a API de pesquisa personalizada.',
	settingGoogleApiKeyPlaceholder: 'Chave de API do Google',
	settingGoogleCxName: 'ID do mecanismo de busca',
	settingGoogleCxDesc:
		'Crie um mecanismo de pesquisa programável do Google, com a busca de imagens ativada.',
	settingGoogleCxPlaceholder: 'ID do mecanismo de busca',
};

export default ptBr;
