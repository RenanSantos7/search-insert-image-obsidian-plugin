import { requestUrl, RequestUrlResponse } from 'obsidian';
import {
	ImageProvider,
	ImageResult,
	ProviderRateLimitError,
	ProviderResponseError,
} from './types';

const BASE_URL = 'https://duckduckgo.com/';
const HEADERS = {
	Referer: BASE_URL,
	'User-Agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};
const VQD_REGEX = /vqd=["']?([\d-]+)/;
const RATE_LIMIT_STATUSES = new Set([202, 403, 429]);

interface DuckDuckGoResult {
	image?: string;
	thumbnail?: string;
	title?: string;
	url?: string;
	width?: number;
	height?: number;
}

interface DuckDuckGoResponse {
	results?: DuckDuckGoResult[];
	next?: string;
}

interface QueryState {
	vqd: string;
	/** Relative URL of the next page, as returned by DuckDuckGo. */
	next?: string;
}

/** DuckDuckGo image search through its unofficial `i.js` endpoint. */
export class DuckDuckGoProvider implements ImageProvider {
	private readonly queries = new Map<string, QueryState>();

	constructor(private readonly safeSearch: boolean) {}

	async search(query: string, page: number): Promise<ImageResult[]> {
		const state = await this.getQueryState(query);

		let url: string;
		if (page <= 1) {
			const params = new URLSearchParams({
				l: 'wt-wt',
				o: 'json',
				q: query,
				vqd: state.vqd,
				f: ',,,,',
				p: this.safeSearch ? '1' : '-1',
			});
			url = `${BASE_URL}i.js?${params.toString()}`;
		} else {
			if (!state.next) return [];
			url = this.buildNextUrl(state.next, state.vqd);
		}

		const response = await this.get(url);
		const data = this.parseJson(response);
		if (!Array.isArray(data.results)) {
			throw new ProviderResponseError('DuckDuckGo response has no results array');
		}

		state.next = data.next;
		return data.results.flatMap((item) => this.toImageResult(item));
	}

	private async getQueryState(query: string): Promise<QueryState> {
		const cached = this.queries.get(query);
		if (cached) return cached;

		const params = new URLSearchParams({ q: query, iax: 'images', ia: 'images' });
		const response = await this.get(`${BASE_URL}?${params.toString()}`);
		const vqd = VQD_REGEX.exec(response.text)?.[1];
		if (!vqd) {
			// DuckDuckGo omits the token when it is throttling the client.
			throw new ProviderRateLimitError('DuckDuckGo did not return a vqd token');
		}

		const state: QueryState = { vqd };
		this.queries.set(query, state);
		return state;
	}

	private async get(url: string): Promise<RequestUrlResponse> {
		const response = await requestUrl({ url, method: 'GET', headers: HEADERS, throw: false });
		if (RATE_LIMIT_STATUSES.has(response.status)) {
			throw new ProviderRateLimitError(`DuckDuckGo responded with status ${response.status}`);
		}
		if (response.status >= 400) {
			throw new ProviderResponseError(`DuckDuckGo responded with status ${response.status}`);
		}
		return response;
	}

	private parseJson(response: RequestUrlResponse): DuckDuckGoResponse {
		try {
			return JSON.parse(response.text) as DuckDuckGoResponse;
		} catch {
			throw new ProviderResponseError('DuckDuckGo response is not valid JSON');
		}
	}

	private buildNextUrl(next: string, vqd: string): string {
		const url = new URL(next, BASE_URL);
		if (!url.searchParams.has('vqd')) url.searchParams.set('vqd', vqd);
		return url.toString();
	}

	private toImageResult(item: DuckDuckGoResult): ImageResult[] {
		if (!item.image) return [];
		return [
			{
				imageUrl: item.image,
				thumbnailUrl: item.thumbnail ?? item.image,
				title: item.title ?? '',
				sourceUrl: item.url,
				width: item.width,
				height: item.height,
			},
		];
	}
}
