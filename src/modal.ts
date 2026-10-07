import { App, Editor, MarkdownView, Modal, Notice } from 'obsidian';
import type SearchInsertImagePlugin from './main';
import {
	DEFAULT_INSERT_MODE,
	insertAsDownload,
	insertAsLink,
	InsertMode,
} from './insert';
import { DuckDuckGoProvider } from './providers/duckduckgo';
import {
	ImageProvider,
	ImageResult,
	ProviderRateLimitError,
} from './providers/types';

/** Modal to search for images and insert the chosen one into the note. */
export class ImageSearchModal extends Modal {
	private readonly provider: ImageProvider = new DuckDuckGoProvider();
	private searchInput: HTMLInputElement | null = null;
	private statusEl: HTMLElement | null = null;
	private gridEl: HTMLElement | null = null;
	/** Incremented on every search so stale responses are ignored. */
	private searchId = 0;
	private isInserting = false;

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
			cls: 'search-insert-image-input',
			placeholder: 'Digite o termo e pressione Enter',
			value: this.initialQuery,
		});
		this.searchInput.addEventListener('keydown', (evt) => {
			if (evt.key === 'Enter') {
				evt.preventDefault();
				void this.search();
			}
		});

		contentEl.createDiv({ cls: 'search-insert-image-hint', text: modeHint(DEFAULT_INSERT_MODE) });
		this.statusEl = contentEl.createDiv({ cls: 'search-insert-image-status' });
		this.gridEl = contentEl.createDiv({ cls: 'search-insert-image-grid' });

		this.searchInput.focus();
		if (this.initialQuery) void this.search();
	}

	onClose(): void {
		this.searchId++;
		this.contentEl.empty();
		this.searchInput = null;
		this.statusEl = null;
		this.gridEl = null;
	}

	private async search(): Promise<void> {
		const query = this.searchInput?.value.trim() ?? '';
		if (!query) return;

		const id = ++this.searchId;
		this.gridEl?.empty();
		this.setStatus('Buscando imagens…');

		try {
			const results = await this.provider.search(query, 1);
			if (id !== this.searchId) return;
			this.setStatus(results.length ? '' : 'Nenhuma imagem encontrada.');
			this.renderResults(results);
		} catch (error) {
			if (id !== this.searchId) return;
			console.error('Search Insert Image: search failed', error);
			this.setStatus('');
			new Notice(
				error instanceof ProviderRateLimitError
					? 'DuckDuckGo limitou as requisições, tente novamente em alguns minutos.'
					: 'Não foi possível buscar imagens no DuckDuckGo. Tente novamente mais tarde.',
			);
		}
	}

	private renderResults(results: ImageResult[]): void {
		const grid = this.gridEl;
		if (!grid) return;

		for (const result of results) {
			const item = grid.createDiv({ cls: 'search-insert-image-item' });

			const thumbnail = item.createEl('button', {
				cls: 'search-insert-image-thumbnail',
				attr: { title: result.title, 'aria-label': result.title || 'Imagem' },
			});
			thumbnail.createEl('img', {
				attr: { src: result.thumbnailUrl, alt: result.title, loading: 'lazy' },
			});
			thumbnail.addEventListener('click', (evt) => {
				const mode = evt.shiftKey ? otherMode(DEFAULT_INSERT_MODE) : DEFAULT_INSERT_MODE;
				void this.insert(result, mode, item);
			});

			const actions = item.createDiv({ cls: 'search-insert-image-actions' });
			actions
				.createEl('button', { text: '🔗 Link', attr: { 'aria-label': 'Inserir como link' } })
				.addEventListener('click', () => void this.insert(result, 'link', item));
			actions
				.createEl('button', { text: '⬇ Baixar', attr: { 'aria-label': 'Baixar e inserir' } })
				.addEventListener('click', () => void this.insert(result, 'download', item));
		}
	}

	private async insert(result: ImageResult, mode: InsertMode, item: HTMLElement): Promise<void> {
		// Ignore clicks while a download is in progress to avoid double inserts.
		if (this.isInserting) return;

		if (mode === 'link') {
			insertAsLink(this.editor, result);
			this.close();
			return;
		}

		this.isInserting = true;
		item.addClass('is-loading');
		this.setStatus('Baixando imagem…');
		try {
			const sourcePath = this.view.file?.path ?? '';
			const inserted = await insertAsDownload(this.app, this.editor, sourcePath, result);
			if (inserted) {
				this.close();
				return;
			}
			this.setStatus('');
		} finally {
			this.isInserting = false;
			item.removeClass('is-loading');
		}
	}

	private setStatus(text: string): void {
		this.statusEl?.setText(text);
	}
}

function otherMode(mode: InsertMode): InsertMode {
	return mode === 'link' ? 'download' : 'link';
}

function modeHint(defaultMode: InsertMode): string {
	return defaultMode === 'link'
		? 'Clique na imagem para inserir como link. Shift+clique para baixar e inserir.'
		: 'Clique na imagem para baixar e inserir. Shift+clique para inserir como link.';
}
