import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { requestUrl } from 'obsidian';
import { DuckDuckGoProvider } from '../src/providers/duckduckgo';
import { GoogleProvider } from '../src/providers/google';
import { ProviderConfigError, ProviderRateLimitError } from '../src/providers/types';

const requestUrlMock = vi.mocked(requestUrl);

beforeEach(() => {
	requestUrlMock.mockReset();
	vi.useFakeTimers();
	vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
});

afterEach(() => {
	vi.useRealTimers();
});

async function resolveProviderSearch<T>(startSearch: () => Promise<T>): Promise<T> {
	const settled = startSearch().then(
		(value) => ({ value }),
		(error: unknown) => ({ error }),
	);
	await vi.runAllTimersAsync();
	const outcome = await settled;
	if ('error' in outcome) throw outcome.error;
	return outcome.value;
}

describe('DuckDuckGo provider', () => {
	it('caches the token and follows the next page without fetching a new token', async () => {
		requestUrlMock
			.mockResolvedValueOnce({ status: 200, text: '<html vqd="12345">' } as never)
			.mockResolvedValueOnce({
				status: 200,
				text: JSON.stringify({
					results: [{ image: 'https://img/one.jpg', thumbnail: 'https://thumb/one.jpg', title: 'One' }],
					next: '/i.js?next=2',
				}),
			} as never)
			.mockResolvedValueOnce({
				status: 200,
				text: JSON.stringify({
					results: [{ image: 'https://img/two.jpg', thumbnail: 'https://thumb/two.jpg', title: 'Two' }],
				}),
			} as never);
		const provider = new DuckDuckGoProvider(true);

		const first = await resolveProviderSearch(() => provider.search('cats', 1));
		const second = await resolveProviderSearch(() => provider.search('cats', 2));

		expect(first.results[0]).toMatchObject({
			imageUrl: 'https://img/one.jpg',
			thumbnailUrl: 'https://thumb/one.jpg',
			title: 'One',
		});
		expect(first.hasMore).toBe(true);
		expect(second.results[0]?.imageUrl).toBe('https://img/two.jpg');
		expect(second.hasMore).toBe(false);
		expect(requestUrlMock).toHaveBeenCalledTimes(3);
	});

	it('reports a rate limit when DuckDuckGo omits the token', async () => {
		requestUrlMock.mockResolvedValueOnce({ status: 200, text: '<html></html>' } as never);

		await expect(
			resolveProviderSearch(() => new DuckDuckGoProvider(true).search('cats', 1)),
		).rejects.toBeInstanceOf(ProviderRateLimitError);
	});
});

describe('Google provider', () => {
	it('maps image results and stops pagination after a short page', async () => {
		requestUrlMock.mockResolvedValueOnce({
			status: 200,
			text: JSON.stringify({
				items: [
					{
						link: 'https://img/one.jpg',
						title: 'One',
						image: { thumbnailLink: 'https://thumb/one.jpg', contextLink: 'https://source/one' },
					},
				],
			}),
		} as never);

		const page = await resolveProviderSearch(() => new GoogleProvider('key', 'cx', true).search('cats', 1));

		expect(page.results[0]).toMatchObject({
			imageUrl: 'https://img/one.jpg',
			thumbnailUrl: 'https://thumb/one.jpg',
			title: 'One',
			sourceUrl: 'https://source/one',
		});
		expect(page.hasMore).toBe(false);
	});

	it('classifies invalid credentials as a configuration error', async () => {
		requestUrlMock.mockResolvedValueOnce({
			status: 403,
			text: JSON.stringify({ error: { message: 'forbidden' } }),
		} as never);

		await expect(
			resolveProviderSearch(() => new GoogleProvider('bad', 'bad', true).search('cats', 1)),
		).rejects.toBeInstanceOf(ProviderConfigError);
	});
});
