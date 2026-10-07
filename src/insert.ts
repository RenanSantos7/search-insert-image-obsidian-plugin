import { App, Editor, moment, normalizePath, Notice, requestUrl, TFile, TFolder } from 'obsidian';
import type { ImageResult } from './providers/types';
import { t } from './i18n';

export interface DownloadOptions {
	/** 0 = no width suffix. */
	width: number;
	/** Empty = use Obsidian's attachment folder settings. */
	downloadFolder: string;
}

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
export function insertAsLink(editor: Editor, result: ImageResult, width: number): void {
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
	options: DownloadOptions,
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
		new Notice(t('noticeDownloadFailed'));
		return false;
	}

	if (!extension) {
		new Notice(t('noticeNotAnImage'));
		return false;
	}

	let file: TFile;
	try {
		const fileName = `${slugify(result.title)}-${moment().format('YYYYMMDD-HHmmss')}.${extension}`;
		const path = await getDownloadPath(app, fileName, sourcePath, options.downloadFolder);
		file = await app.vault.createBinary(path, data);
	} catch (error) {
		console.error('Search Insert Image: saving the image failed', error);
		new Notice(t('noticeSaveFailed'));
		return false;
	}

	const isAmbiguous = app.vault.getFiles().some((f) => f !== file && f.name === file.name);
	const target = isAmbiguous ? file.path : file.name;
	editor.replaceSelection(`![[${target}${widthSuffix(options.width)}]]`);
	return true;
}

/** Returns a free path for the new file, never overwriting an existing one. */
async function getDownloadPath(
	app: App,
	fileName: string,
	sourcePath: string,
	downloadFolder: string,
): Promise<string> {
	const folder = normalizePath(downloadFolder.trim());
	if (downloadFolder.trim() === '' || folder === '/') {
		// Respects the user's attachment folder and adds a suffix if the name is taken.
		return app.fileManager.getAvailablePathForAttachment(fileName, sourcePath);
	}

	await ensureFolder(app, folder);
	const dot = fileName.lastIndexOf('.');
	const base = fileName.slice(0, dot);
	const extension = fileName.slice(dot + 1);
	let path = normalizePath(`${folder}/${fileName}`);
	for (let i = 1; app.vault.getAbstractFileByPath(path); i++) {
		path = normalizePath(`${folder}/${base} ${i}.${extension}`);
	}
	return path;
}

/** Creates the folder and any missing parent folders. */
async function ensureFolder(app: App, folder: string): Promise<void> {
	let current = '';
	for (const part of folder.split('/')) {
		current = current ? `${current}/${part}` : part;
		const existing = app.vault.getAbstractFileByPath(current);
		if (!existing) {
			await app.vault.createFolder(current);
		} else if (!(existing instanceof TFolder)) {
			throw new Error(`Download folder path "${current}" is a file`);
		}
	}
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
