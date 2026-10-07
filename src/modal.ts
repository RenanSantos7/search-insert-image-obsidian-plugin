import { App, DropdownComponent, Editor, MarkdownView, Modal, Notice } from 'obsidian';
import type SearchInsertImagePlugin from './main';
import { insertAsDownload, insertAsLink } from './insert';
import { DuckDuckGoProvider } from './providers/duckduckgo';
import { GoogleProvider } from './providers/google';
import {
	ImageProvider,
	ImageResult,
	ProviderConfigError,
	ProviderRateLimitError,
} from './providers/types';
import {
	ImageProviderId,
	InsertMode,
	isGoogleConfigured,
	PROVIDER_LABELS,
	SearchInsertImageSettings,
} from './settings';
import { t } from './i18n';

/** Modal to search for images and insert the chosen one into the note. */
export class ImageSearchModal extends Modal {
	/** One provider per id, so per-query state (e.g. the DuckDuckGo token) is reused. */
	private readonly providers = new Map<ImageProviderId, ImageProvider>();
	private readonly settings: SearchInsertImageSettings;
	private providerId: ImageProviderId;
	private searchInput: HTMLInputElement | null = null;
	private statusEl: HTMLElement | null = null;
	private gridEl: HTMLElement | null = null;
	/** Incremented on every search so stale responses are ignored. */
	private searchId = 0;
	private isInserting = false;
	private page = 1;
	private hasMore = false;
	private query = '';
	private seenImageUrls = new Set<string>();
	private loadMoreButton: HTMLButtonElement | null = null;

	constructor(
		app: App,
		plugin: SearchInsertImagePlugin,
		private readonly editor: Editor,
		private readonly view: MarkdownView,
		private readonly initialQuery: string,
	) {
		super(app);
		// Same object the settings tab edits, so changes apply without reloading the plugin.
		this.settings = plugin.settings;
		this.providerId = plugin.settings.provider;
	}

	onOpen(): void {
		const { contentEl } = this;
		this.titleEl.setText(t('modalTitle'));

		const searchBar = contentEl.createDiv({ cls: 'search-insert-image-search-bar' });
		this.searchInput = searchBar.createEl('input', {
			type: 'search',
			cls: 'search-insert-image-input',
			placeholder: t('searchPlaceholder'),
			value: this.initialQuery,
		});
		this.searchInput.addEventListener('keydown', (evt) => {
			if (evt.key === 'Enter') {
				evt.preventDefault();
				void this.search();
			}
		});

		new DropdownComponent(searchBar)
			.addOptions(PROVIDER_LABELS)
			.setValue(this.providerId)
			.onChange((value) => {
				this.providerId = value as ImageProviderId;
				if (this.searchInput?.value.trim()) void this.search();
			});

		contentEl.createDiv({
			cls: 'search-insert-image-hint',
			text: modeHint(this.settings.defaultInsertMode),
		});
		this.statusEl = contentEl.createDiv({ cls: 'search-insert-image-status' });
		this.gridEl = contentEl.createDiv({ cls: 'search-insert-image-grid' });
		this.loadMoreButton = contentEl.createEl('button', {
			cls: 'search-insert-image-load-more',
			text: t('buttonLoadMore'),
		});
		this.loadMoreButton.addEventListener('click', () => void this.loadMore());
		this.loadMoreButton.hide();

		this.searchInput.focus();
		if (this.initialQuery) void this.search();
	}

	onClose(): void {
		this.searchId++;
		this.contentEl.empty();
		this.searchInput = null;
		this.statusEl = null;
		this.gridEl = null;
		this.loadMoreButton = null;
		this.seenImageUrls.clear();
	}

	private getProvider(id: ImageProviderId): ImageProvider | null {
		const cached = this.providers.get(id);
		if (cached) return cached;

		const { safeSearch, googleApiKey, googleCx } = this.settings;
		let provider: ImageProvider;
		if (id === 'google') {
			if (!isGoogleConfigured(this.settings)) return null;
			provider = new GoogleProvider(googleApiKey, googleCx, safeSearch);
		} else {
			provider = new DuckDuckGoProvider(safeSearch);
		}
		this.providers.set(id, provider);
		return provider;
	}

	private async search(): Promise<void> {
		const query = this.searchInput?.value.trim() ?? '';
		if (!query) return;

		const id = ++this.searchId;
		const providerId = this.providerId;
		this.query = query;
		this.page = 1;
		this.hasMore = false;
		this.seenImageUrls.clear();
		this.gridEl?.empty();

		const provider = this.getProvider(providerId);
		if (!provider) {
			this.setStatus('');
			new Notice(t('noticeGoogleNotConfigured'));
			return;
		}

		this.setStatus(t('statusSearching'));
		try {
			const page = await provider.search(query, 1);
			if (id !== this.searchId) return;
			this.hasMore = page.hasMore;
			this.setStatus(page.results.length ? '' : t('statusNoResults'));
			this.renderResults(page.results);
			this.updateLoadMoreButton();
		} catch (error) {
			if (id !== this.searchId) return;
			console.error('Search Insert Image: search failed', error);
			this.setStatus('');
			this.showSearchError(providerId, error);
		}
	}

	private async loadMore(): Promise<void> {
		if (!this.hasMore || !this.query || this.isInserting) return;
		const id = this.searchId;
		const providerId = this.providerId;
		const provider = this.getProvider(providerId);
		if (!provider) return;

		this.loadMoreButton?.setAttr('disabled', 'true');
		this.setStatus(t('statusLoadingMore'));
		try {
			const page = await provider.search(this.query, ++this.page);
			if (id !== this.searchId) return;
			this.hasMore = page.hasMore;
			this.renderResults(page.results);
			this.setStatus('');
			this.updateLoadMoreButton();
		} catch (error) {
			if (id !== this.searchId) return;
			this.page--;
			this.setStatus('');
			this.showSearchError(providerId, error);
			this.updateLoadMoreButton();
		}
	}

	private renderResults(results: ImageResult[]): void {
		const grid = this.gridEl;
		if (!grid) return;
		const defaultMode = this.settings.defaultInsertMode;

		for (const result of results) {
			if (this.seenImageUrls.has(result.imageUrl)) continue;
			this.seenImageUrls.add(result.imageUrl);
			const item = grid.createDiv({ cls: 'search-insert-image-item' });

			const thumbnail = item.createEl('button', {
				cls: 'search-insert-image-thumbnail',
				attr: { title: result.title, 'aria-label': result.title || t('ariaLabelImage') },
			});
			thumbnail.createEl('img', {
				attr: { src: result.thumbnailUrl, alt: result.title, loading: 'lazy' },
			});
			thumbnail.addEventListener('click', (evt) => {
				const mode = evt.shiftKey ? otherMode(defaultMode) : defaultMode;
				void this.insert(result, mode, item);
			});

			const actions = item.createDiv({ cls: 'search-insert-image-actions' });
			actions
				.createEl('button', { text: t('buttonInsertLink'), attr: { 'aria-label': t('ariaLabelInsertLink') } })
				.addEventListener('click', () => void this.insert(result, 'link', item));
			actions
				.createEl('button', { text: t('buttonDownload'), attr: { 'aria-label': t('ariaLabelDownload') } })
				.addEventListener('click', () => void this.insert(result, 'download', item));
		}
	}

	private updateLoadMoreButton(): void {
		if (!this.loadMoreButton) return;
		this.loadMoreButton.toggle(this.hasMore);
		this.loadMoreButton.removeAttribute('disabled');
	}

	private showSearchError(providerId: ImageProviderId, error: unknown): void {
		const notice = new Notice(searchErrorMessage(providerId, error));
		if (
			providerId !== 'duckduckgo' ||
			!(error instanceof ProviderRateLimitError) ||
			!isGoogleConfigured(this.settings)
		) {
			return;
		}
		const retryButton = notice.messageEl.createEl('button', {
			text: t('buttonRetryGoogle'),
			cls: 'search-insert-image-notice-button',
		});
		retryButton.addEventListener('click', () => {
			notice.hide();
			this.providerId = 'google';
			void this.search();
		});
	}

	private async insert(result: ImageResult, mode: InsertMode, item: HTMLElement): Promise<void> {
		// Ignore clicks while a download is in progress to avoid double inserts.
		if (this.isInserting) return;
		const { imageWidth, downloadFolder } = this.settings;

		if (mode === 'link') {
			insertAsLink(this.editor, result, imageWidth);
			this.close();
			return;
		}

		this.isInserting = true;
		item.addClass('is-loading');
		this.setStatus(t('statusDownloading'));
		try {
			const sourcePath = this.view.file?.path ?? '';
			const inserted = await insertAsDownload(this.app, this.editor, sourcePath, result, {
				width: imageWidth,
				downloadFolder,
			});
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
		? t('hintClickToLink')
		: t('hintClickToDownload');
}

function searchErrorMessage(providerId: ImageProviderId, error: unknown): string {
	if (error instanceof ProviderConfigError) {
		return t('errorGoogleConfig');
	}
	if (error instanceof ProviderRateLimitError) {
		return providerId === 'google'
			? t('errorGoogleRateLimit')
			: t('errorDuckDuckGoRateLimit');
	}
	return t('errorProviderGeneric', { provider: PROVIDER_LABELS[providerId] });
}
