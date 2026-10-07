import { App, Editor, MarkdownView, Modal } from 'obsidian';
import type SearchInsertImagePlugin from './main';

/** Modal to search for images and insert the chosen one into the note. */
export class ImageSearchModal extends Modal {
	private searchInput: HTMLInputElement | null = null;

	constructor(
		app: App,
		private readonly plugin: SearchInsertImagePlugin,
		private readonly editor: Editor,
		private readonly view: MarkdownView,
		private readonly initialQuery: string,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		this.titleEl.setText('Buscar imagem');

		this.searchInput = contentEl.createEl('input', {
			type: 'search',
			placeholder: 'Digite o termo e pressione Enter',
			value: this.initialQuery,
		});
		this.searchInput.focus();
	}

	onClose(): void {
		this.contentEl.empty();
		this.searchInput = null;
	}
}
