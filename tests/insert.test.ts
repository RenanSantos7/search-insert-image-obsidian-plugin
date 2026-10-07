import { describe, expect, it, vi } from 'vitest';
import { requestUrl } from 'obsidian';
import { insertAsDownload, insertAsLink, sanitizeAlt } from '../src/insert';
import type { ImageResult } from '../src/providers/types';

const requestUrlMock = vi.mocked(requestUrl);

const result: ImageResult = {
	imageUrl: 'https://example.com/orange cat.jpg',
	thumbnailUrl: 'https://example.com/thumb.jpg',
	title: 'Orange [cat] | summer',
};

describe('image insertion', () => {
	it('sanitizes markdown-sensitive characters from alt text', () => {
		expect(sanitizeAlt('  Orange [cat] | summer\n')).toBe('Orange cat summer');
	});

	it('inserts a link with the configured width and escaped URL', () => {
		const editor = { replaceSelection: vi.fn() };

		insertAsLink(editor as never, result, 700);

		expect(editor.replaceSelection).toHaveBeenCalledWith(
			'![Orange cat summer|700](https://example.com/orange%20cat.jpg)',
		);
	});

	it('downloads an image and inserts a wikilink in the configured folder', async () => {
		requestUrlMock.mockResolvedValueOnce({
			status: 200,
			headers: { 'content-type': 'image/png' },
			arrayBuffer: new ArrayBuffer(4),
			text: '',
		} as never);
		const editor = { replaceSelection: vi.fn() };
		const createdFolders: string[] = [];
		const app = {
			vault: {
				getAbstractFileByPath: vi.fn(() => null),
				createFolder: vi.fn(async (path: string) => {
					createdFolders.push(path);
				}),
				createBinary: vi.fn(async (path: string) => ({ name: path.split('/').pop(), path })),
				getFiles: vi.fn(() => []),
			},
			fileManager: {
				getAvailablePathForAttachment: vi.fn(),
			},
		};

		const inserted = await insertAsDownload(
			app as never,
			editor as never,
			'notes/current.md',
			result,
			{ width: 700, downloadFolder: 'attachments/images' },
		);

		expect(inserted).toBe(true);
		expect(createdFolders).toEqual(['attachments', 'attachments/images']);
		expect(editor.replaceSelection).toHaveBeenCalledWith(
			'![[orange-cat-summer-20261007-085500.png|700]]',
		);
	});

	it('reports a failure instead of inserting a non-image response', async () => {
		requestUrlMock.mockResolvedValueOnce({
			status: 200,
			headers: { 'content-type': 'text/html' },
			arrayBuffer: new ArrayBuffer(0),
			text: '<html />',
		} as never);
		const editor = { replaceSelection: vi.fn() };

		const inserted = await insertAsDownload(
			{ vault: {}, fileManager: {} } as never,
			editor as never,
			'notes/current.md',
			result,
			{ width: 0, downloadFolder: '' },
		);

		expect(inserted).toBe(false);
		expect(editor.replaceSelection).not.toHaveBeenCalled();
	});
});
