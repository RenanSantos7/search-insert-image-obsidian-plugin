import { App, Editor, MarkdownView, Modal, Notice } from 'obsidian';
import type SearchInsertImagePlugin from './main';
import { insertAsLink } from './insert';
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
			const item = grid.createEl('button', {
				cls: 'search-insert-image-item',
				attr: { title: result.title, 'aria-label': result.title || 'Imagem' },
			});
			item.createEl('img', {
				attr: { src: result.thumbnailUrl, alt: result.title, loading: 'lazy' },
			});
			item.addEventListener('click', () => this.insert(result));
		}
	}

	private insert(result: ImageResult): void {
		insertAsLink(this.editor, result);
		this.close();
	}

	private setStatus(text: string): void {
		this.statusEl?.setText(text);
	}
}
