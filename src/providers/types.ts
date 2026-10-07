export interface ImageResult {
	/** Full-size image. */
	imageUrl: string;
	/** Used in the grid. */
	thumbnailUrl: string;
	/** Becomes the alt text. */
	title: string;
	/** Source page. */
	sourceUrl?: string;
	width?: number;
	height?: number;
}

export interface ImageProvider {
	search(query: string, page: number): Promise<ImageSearchPage>;
}

export interface ImageSearchPage {
	results: ImageResult[];
	hasMore: boolean;
}

/** The provider is temporarily blocking requests (rate limit). */
export class ProviderRateLimitError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProviderRateLimitError';
	}
}

/** The provider rejected the credentials or configuration (e.g. invalid API key). */
export class ProviderConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProviderConfigError';
	}
}

/** The provider answered with something we can't parse (e.g. the endpoint changed). */
export class ProviderResponseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProviderResponseError';
	}
}

const MIN_REQUEST_INTERVAL = 1000;
let lastProviderRequestAt = 0;

/** Keeps requests to unofficial and quota-limited providers at least one second apart. */
export async function waitForProviderRequest(): Promise<void> {
	const wait = MIN_REQUEST_INTERVAL - (Date.now() - lastProviderRequestAt);
	if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait));
	lastProviderRequestAt = Date.now();
}
