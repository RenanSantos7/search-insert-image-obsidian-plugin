import { App, PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import type SearchInsertImagePlugin from './main';

export type ImageProviderId = 'duckduckgo' | 'google';
export type InsertMode = 'link' | 'download';

export interface SearchInsertImageSettings {
	provider: ImageProviderId;
	googleApiKey: string;
	googleCx: string;
	defaultInsertMode: InsertMode;
	/** Empty = use Obsidian's attachment folder settings. */
	downloadFolder: string;
	safeSearch: boolean;
	/** 0 = no width suffix. */
	imageWidth: number;
}

export const DEFAULT_SETTINGS: SearchInsertImageSettings = {
	provider: 'duckduckgo',
	googleApiKey: '',
	googleCx: '',
	defaultInsertMode: 'link',
	downloadFolder: '',
	safeSearch: true,
	imageWidth: 0,
};

export const PROVIDER_LABELS: Record<ImageProviderId, string> = {
	duckduckgo: 'DuckDuckGo',
	google: 'Google',
};

export function isGoogleConfigured(settings: SearchInsertImageSettings): boolean {
	return settings.googleApiKey.trim() !== '' && settings.googleCx.trim() !== '';
}

export class SearchInsertImageSettingTab extends PluginSettingTab {
	private readonly plugin: SearchInsertImagePlugin;

	constructor(app: App, plugin: SearchInsertImagePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		const settings = this.plugin.settings;
		return [
			{
				type: 'group',
				heading: 'Busca e inserção',
				items: [
					{
						name: 'Buscador padrão',
						desc: 'Buscador selecionado ao abrir a janela de busca. Ele também pode ser trocado na própria janela.',
						control: { type: 'dropdown', key: 'provider', options: PROVIDER_LABELS, defaultValue: settings.provider },
					},
					{
						name: 'Modo de inserção padrão',
						desc: 'Usado ao clicar na imagem. Shift+clique usa o outro modo.',
						control: {
							type: 'dropdown',
							key: 'defaultInsertMode',
							options: {
								link: 'Inserir como link',
								download: 'Baixar e inserir como wikilink',
							},
							defaultValue: settings.defaultInsertMode,
						},
					},
					{
						name: 'Pasta de download',
						desc: 'Pasta do cofre onde as imagens baixadas são salvas. Deixe vazio para usar a pasta de anexos do Obsidian. A pasta é criada se não existir.',
						control: {
							type: 'text',
							key: 'downloadFolder',
							placeholder: 'Pasta de anexos do Obsidian',
							defaultValue: settings.downloadFolder,
						},
					},
					{
						name: 'Largura da imagem',
						desc: 'Largura em pixels adicionada à imagem inserida (ex.: |700). Deixe vazio ou 0 para não definir largura.',
						control: {
							type: 'number',
							key: 'imageWidth',
							min: 0,
							step: 1,
							defaultValue: settings.imageWidth,
							validate: (value) =>
								Number.isInteger(value) && value >= 0
									? undefined
									: 'Informe um número inteiro maior ou igual a zero.',
						},
					},
					{
						name: 'Busca segura',
						desc: 'Filtra conteúdo explícito dos resultados.',
						control: { type: 'toggle', key: 'safeSearch', defaultValue: settings.safeSearch },
					},
				],
			},
			{
				type: 'group',
				heading: 'Busca no Google',
				items: [
					{
						name: 'Configuração',
						desc: 'Para buscar no Google é preciso uma chave de API e o ID de um mecanismo de busca. O uso gratuito é limitado a 100 buscas por dia.',
					},
					{
						name: 'Chave de API',
						desc: 'Crie a chave no console de desenvolvedor do Google e ative a API de pesquisa personalizada.',
						control: {
							type: 'text',
							key: 'googleApiKey',
							placeholder: 'Chave de API do Google',
							defaultValue: settings.googleApiKey,
						},
					},
					{
						name: 'ID do mecanismo de busca',
						desc: 'Crie um mecanismo de pesquisa programável do Google, com a busca de imagens ativada.',
						control: {
							type: 'text',
							key: 'googleCx',
							placeholder: 'ID do mecanismo de busca',
							defaultValue: settings.googleCx,
						},
					},
				],
			},
		];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as keyof SearchInsertImageSettings];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		switch (key) {
			case 'provider':
				if (value === 'duckduckgo' || value === 'google') this.plugin.settings.provider = value;
				break;
			case 'defaultInsertMode':
				if (value === 'link' || value === 'download') this.plugin.settings.defaultInsertMode = value;
				break;
			case 'downloadFolder':
				if (typeof value === 'string') this.plugin.settings.downloadFolder = value.trim();
				break;
			case 'googleApiKey':
				if (typeof value === 'string') this.plugin.settings.googleApiKey = value.trim();
				break;
			case 'googleCx':
				if (typeof value === 'string') this.plugin.settings.googleCx = value.trim();
				break;
			case 'safeSearch':
				if (typeof value === 'boolean') this.plugin.settings.safeSearch = value;
				break;
			case 'imageWidth':
				if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
					this.plugin.settings.imageWidth = value;
				}
				break;
			default:
				return;
		}
		await this.plugin.saveSettings();
	}
}
