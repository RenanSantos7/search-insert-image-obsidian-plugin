import { App, PluginSettingTab } from 'obsidian';
import type SearchInsertImagePlugin from './main';

// Settings fields are defined in task 04.
export type SearchInsertImageSettings = Record<string, never>;

export const DEFAULT_SETTINGS: SearchInsertImageSettings = {};

export class SearchInsertImageSettingTab extends PluginSettingTab {
	private readonly plugin: SearchInsertImagePlugin;

	constructor(app: App, plugin: SearchInsertImagePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('p', {
			text: 'As configurações do plugin estarão disponíveis em breve.',
		});
	}
}
