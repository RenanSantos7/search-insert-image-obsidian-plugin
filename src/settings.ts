import { App, PluginSettingTab, Setting } from 'obsidian';
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
	imageWidth: 700,
};

export const PROVIDER_LABELS: Record<ImageProviderId, string> = {
	duckduckgo: 'DuckDuckGo',
	google: 'Google',
};

export function isGoogleConfigured(settings: SearchInsertImageSettings): boolean {
	return settings.googleApiKey.trim() !== '' && settings.googleCx.trim() !== '';
}

/** Parses the width field: empty = 0 (no suffix); returns `null` if invalid. */
function parseImageWidth(value: string): number | null {
	const trimmed = value.trim();
	if (trimmed === '') return 0;
	if (!/^\d+$/.test(trimmed)) return null;
	return Number(trimmed);
}

export class SearchInsertImageSettingTab extends PluginSettingTab {
	private readonly plugin: SearchInsertImagePlugin;

	constructor(app: App, plugin: SearchInsertImagePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const settings = this.plugin.settings;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Buscador padrão')
			.setDesc('Buscador selecionado ao abrir a janela de busca. Ele também pode ser trocado na própria janela.')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(PROVIDER_LABELS)
					.setValue(settings.provider)
					.onChange(async (value) => {
						settings.provider = value as ImageProviderId;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Modo de inserção padrão')
			.setDesc('Usado ao clicar na imagem. Shift+clique usa o outro modo.')
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						link: 'Inserir como link',
						download: 'Baixar e inserir como wikilink',
					})
					.setValue(settings.defaultInsertMode)
					.onChange(async (value) => {
						settings.defaultInsertMode = value as InsertMode;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Pasta de download')
			.setDesc('Pasta do cofre onde as imagens baixadas são salvas. Deixe vazio para usar a pasta de anexos do Obsidian. A pasta é criada se não existir.')
			.addText((text) =>
				text
					.setPlaceholder('Pasta de anexos do Obsidian')
					.setValue(settings.downloadFolder)
					.onChange(async (value) => {
						settings.downloadFolder = value.trim();
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Largura da imagem')
			.setDesc('Largura em pixels adicionada à imagem inserida (ex.: |700). Deixe vazio ou 0 para não definir largura.')
			.addText((text) => {
				text.inputEl.type = 'number';
				text.inputEl.min = '0';
				text.inputEl.step = '1';
				text
					.setPlaceholder('Sem largura')
					.setValue(settings.imageWidth > 0 ? String(settings.imageWidth) : '')
					.onChange(async (value) => {
						const width = parseImageWidth(value);
						text.inputEl.toggleClass('search-insert-image-invalid', width === null);
						if (width === null) return;
						settings.imageWidth = width;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Busca segura')
			.setDesc('Filtra conteúdo explícito dos resultados.')
			.addToggle((toggle) =>
				toggle.setValue(settings.safeSearch).onChange(async (value) => {
					settings.safeSearch = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl).setName('Busca no Google').setHeading();

		new Setting(containerEl).setDesc(
			'Para buscar no Google é preciso uma chave de API e o ID de um mecanismo de busca. O uso gratuito é limitado a 100 buscas por dia.',
		);

		new Setting(containerEl)
			.setName('Chave de API')
			.setDesc('Crie a chave no console de desenvolvedor do Google e ative a API de pesquisa personalizada.')
			.addText((text) => {
				text.inputEl.type = 'password';
				text
					.setPlaceholder('Chave de API do Google')
					.setValue(settings.googleApiKey)
					.onChange(async (value) => {
						settings.googleApiKey = value.trim();
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('ID do mecanismo de busca')
			.setDesc('Crie um mecanismo de pesquisa programável do Google, com a busca de imagens ativada.')
			.addText((text) =>
				text
					.setPlaceholder('ID do mecanismo de busca')
					.setValue(settings.googleCx)
					.onChange(async (value) => {
						settings.googleCx = value.trim();
						await this.plugin.saveSettings();
					}),
			);
	}
}
