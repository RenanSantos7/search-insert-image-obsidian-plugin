import { App, PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import type SearchInsertImagePlugin from './main';
import { t } from './i18n';

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
				heading: t('settingsHeadingSearchAndInsert'),
				items: [
					{
						name: t('settingDefaultProviderName'),
						desc: t('settingDefaultProviderDesc'),
						control: { type: 'dropdown', key: 'provider', options: PROVIDER_LABELS, defaultValue: settings.provider },
					},
					{
						name: t('settingDefaultInsertModeName'),
						desc: t('settingDefaultInsertModeDesc'),
						control: {
							type: 'dropdown',
							key: 'defaultInsertMode',
							options: {
								link: t('settingInsertModeLink'),
								download: t('settingInsertModeDownload'),
							},
							defaultValue: settings.defaultInsertMode,
						},
					},
					{
						name: t('settingDownloadFolderName'),
						desc: t('settingDownloadFolderDesc'),
						control: {
							type: 'text',
							key: 'downloadFolder',
							placeholder: t('settingDownloadFolderPlaceholder'),
							defaultValue: settings.downloadFolder,
						},
					},
					{
						name: t('settingImageWidthName'),
						desc: t('settingImageWidthDesc'),
						control: {
							type: 'number',
							key: 'imageWidth',
							min: 0,
							step: 1,
							defaultValue: settings.imageWidth,
							validate: (value) =>
								Number.isInteger(value) && value >= 0
									? undefined
									: t('settingImageWidthValidation'),
						},
					},
					{
						name: t('settingSafeSearchName'),
						desc: t('settingSafeSearchDesc'),
						control: { type: 'toggle', key: 'safeSearch', defaultValue: settings.safeSearch },
					},
				],
			},
			{
				type: 'group',
				heading: t('settingsHeadingGoogle'),
				items: [
					{
						name: t('settingGoogleConfigName'),
						desc: t('settingGoogleConfigDesc'),
					},
					{
						name: t('settingGoogleApiKeyName'),
						desc: t('settingGoogleApiKeyDesc'),
						control: {
							type: 'text',
							key: 'googleApiKey',
							placeholder: t('settingGoogleApiKeyPlaceholder'),
							defaultValue: settings.googleApiKey,
						},
					},
					{
						name: t('settingGoogleCxName'),
						desc: t('settingGoogleCxDesc'),
						control: {
							type: 'text',
							key: 'googleCx',
							placeholder: t('settingGoogleCxPlaceholder'),
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
