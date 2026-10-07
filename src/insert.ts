import { App, Editor, moment, Notice, requestUrl, TFile } from 'obsidian';
import type { ImageResult } from './providers/types';

export type InsertMode = 'link' | 'download';

/** Hardcoded until task 04 moves it to the settings. */
export const DEFAULT_IMAGE_WIDTH = 700;
/** Hardcoded until task 04 moves it to the settings. */
export const DEFAULT_INSERT_MODE: InsertMode = 'link';

const MIME_EXTENSIONS: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/svg+xml': 'svg',
	'image/avif': 'avif',
};
const URL_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif']);
/** Content types that say nothing about the file, so the URL decides. */
const GENERIC_CONTENT_TYPES = new Set(['', 'application/octet-stream', 'binary/octet-stream']);
const MAX_SLUG_LENGTH = 50;

/** Removes characters that would break the Markdown/wikilink syntax. */
export function sanitizeAlt(text: string): string {
	return text.replace(/[[\]|]/g, '').replace(/\s+/g, ' ').trim();
}

function widthSuffix(width: number): string {
	return width > 0 ? `|${width}` : '';
}

/** Escapes characters that would end the Markdown link target early. */
function escapeUrl(url: string): string {
	return url.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
}

/** Inserts the image as an external Markdown link, replacing the selection. */
export function insertAsLink(editor: Editor, result: ImageResult, width = DEFAULT_IMAGE_WIDTH): void {
	const alt = sanitizeAlt(result.title);
	editor.replaceSelection(`![${alt}${widthSuffix(width)}](${escapeUrl(result.imageUrl)})`);
}

/**
 * Downloads the image into the vault and inserts it as a wikilink, replacing the selection.
 * Shows a `Notice` on failure. Returns whether the image was inserted.
 */
export async function insertAsDownload(
	app: App,
	editor: Editor,
	sourcePath: string,
	result: ImageResult,
	width = DEFAULT_IMAGE_WIDTH,
): Promise<boolean> {
	let data: ArrayBuffer;
	let extension: string | null;
	try {
		const response = await requestUrl({ url: result.imageUrl, method: 'GET', throw: false });
		if (response.status >= 400) {
			throw new Error(`Image download failed with status ${response.status}`);
		}
		data = response.arrayBuffer;
		extension = getImageExtension(getHeader(response.headers, 'content-type'), result.imageUrl);
	} catch (error) {
		console.error('Search Insert Image: image download failed', error);
		new Notice('Não foi possível baixar a imagem. Tente outra imagem ou insira como link.');
		return false;
	}

	if (!extension) {
		new Notice('O endereço escolhido não é uma imagem. Tente outra imagem.');
		return false;
	}

	let file: TFile;
	try {
		const fileName = `${slugify(result.title)}-${moment().format('YYYYMMDD-HHmmss')}.${extension}`;
		// Respects the user's attachment folder and adds a suffix if the name is taken.
		const path = await app.fileManager.getAvailablePathForAttachment(fileName, sourcePath);
		file = await app.vault.createBinary(path, data);
	} catch (error) {
		console.error('Search Insert Image: saving the image failed', error);
		new Notice('Não foi possível salvar a imagem no cofre.');
		return false;
	}

	const isAmbiguous = app.vault.getFiles().some((f) => f !== file && f.name === file.name);
	const target = isAmbiguous ? file.path : file.name;
	editor.replaceSelection(`![[${target}${widthSuffix(width)}]]`);
	return true;
}

function getHeader(headers: Record<string, string>, name: string): string {
	const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
	return key ? (headers[key] ?? '') : '';
}

/** Returns the file extension for an image, or `null` if the response is not an image. */
function getImageExtension(contentType: string, url: string): string | null {
	const mime = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
	const fromMime = MIME_EXTENSIONS[mime];
	if (fromMime) return fromMime;
	// A specific non-generic type (e.g. text/html) means it is not an image we support.
	if (!GENERIC_CONTENT_TYPES.has(mime) && !mime.startsWith('image/')) return null;

	try {
		const fromUrl = new URL(url).pathname.split('.').pop()?.toLowerCase() ?? '';
		if (URL_EXTENSIONS.has(fromUrl)) return fromUrl === 'jpeg' ? 'jpg' : fromUrl;
	} catch {
		// Invalid URL: fall through.
	}
	return null;
}

function slugify(text: string): string {
	const slug = text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.slice(0, MAX_SLUG_LENGTH)
		.replace(/^-+|-+$/g, '');
	return slug || 'image';
}
