import { MarkdownView, Notice, Plugin } from 'obsidian';
import { openImageSearchModal, registerCommands } from './commands';
import { t } from './i18n';
import {
	DEFAULT_SETTINGS,
	SearchInsertImageSettings,
	SearchInsertImageSettingTab,
} from './settings';

const ICON = 'image-plus';

export default class SearchInsertImagePlugin extends Plugin {
	settings!: SearchInsertImageSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		registerCommands(this);
		this.addSettingTab(new SearchInsertImageSettingTab(this.app, this));

		this.addRibbonIcon(ICON, t('ribbonTooltip'), () => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view) {
				new Notice(t('noticeOpenMarkdownFirst'));
				return;
			}
			openImageSearchModal(this, view.editor, view);
		});

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor, info) => {
				if (!(info instanceof MarkdownView)) return;
				menu.addItem((item) =>
					item
						.setTitle(t('menuItemSearchImage'))
						.setIcon(ICON)
						.onClick(() => openImageSearchModal(this, editor, info)),
				);
			}),
		);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<SearchInsertImageSettings>,
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
