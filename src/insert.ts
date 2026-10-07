import { Editor } from 'obsidian';
import type { ImageResult } from './providers/types';

/** Hardcoded until task 04 moves it to the settings. */
export const DEFAULT_IMAGE_WIDTH = 700;

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
