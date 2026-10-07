import { requestUrl } from 'obsidian';
import {
	ImageProvider,
	ImageResult,
	ProviderConfigError,
	ProviderRateLimitError,
	ProviderResponseError,
	ImageSearchPage,
	waitForProviderRequest,
} from './types';

const ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const PAGE_SIZE = 10;
/** The API returns at most 100 results per query. */
const MAX_START = 91;

interface GoogleItem {
	link?: string;
	title?: string;
	image?: {
		thumbnailLink?: string;
		contextLink?: string;
		width?: number;
		height?: number;
	};
}

interface GoogleResponse {
	items?: GoogleItem[];
	error?: { message?: string };
}

/** Google image search through the official Custom Search JSON API. */
export class GoogleProvider implements ImageProvider {
	constructor(
		private readonly apiKey: string,
		private readonly cx: string,
		private readonly safeSearch: boolean,
	) {}

	async search(query: string, page: number): Promise<ImageSearchPage> {
		const start = 1 + PAGE_SIZE * (Math.max(page, 1) - 1);
		if (start > MAX_START) return { results: [], hasMore: false };

		const params = new URLSearchParams({
			key: this.apiKey,
			cx: this.cx,
			q: query,
			searchType: 'image',
			num: String(PAGE_SIZE),
			start: String(start),
			safe: this.safeSearch ? 'active' : 'off',
		});
		await waitForProviderRequest();
		const response = await requestUrl({ url: `${ENDPOINT}?${params.toString()}`, throw: false });

		let data: GoogleResponse;
		try {
			data = JSON.parse(response.text) as GoogleResponse;
		} catch {
			throw new ProviderResponseError(`Google response is not valid JSON (status ${response.status})`);
		}

		const detail = data.error?.message ?? `status ${response.status}`;
		if (response.status === 429) throw new ProviderRateLimitError(`Google quota exceeded: ${detail}`);
		if (response.status === 400 || response.status === 403) {
			throw new ProviderConfigError(`Google rejected the API key or CX: ${detail}`);
		}
		if (response.status >= 400) throw new ProviderResponseError(`Google request failed: ${detail}`);

		// Google omits `items` when there are no results.
		const results = (data.items ?? []).flatMap((item) => this.toImageResult(item));
		return { results, hasMore: results.length === PAGE_SIZE && start < MAX_START };
	}

	private toImageResult(item: GoogleItem): ImageResult[] {
		if (!item.link) return [];
		return [
			{
				imageUrl: item.link,
				thumbnailUrl: item.image?.thumbnailLink ?? item.link,
				title: item.title ?? '',
				sourceUrl: item.image?.contextLink,
				width: item.image?.width,
				height: item.image?.height,
			},
		];
	}
}
