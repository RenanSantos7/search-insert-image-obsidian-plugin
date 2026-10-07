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
	search(query: string, page: number): Promise<ImageResult[]>;
}

/** The provider is temporarily blocking requests (rate limit). */
export class ProviderRateLimitError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProviderRateLimitError';
	}
}

/** The provider answered with something we can't parse (e.g. the endpoint changed). */
export class ProviderResponseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ProviderResponseError';
	}
}
