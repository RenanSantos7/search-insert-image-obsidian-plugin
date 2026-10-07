import { Editor, MarkdownView } from 'obsidian';
import type SearchInsertImagePlugin from './main';
import { ImageSearchModal } from './modal';

/** Opens the image search modal, using the editor selection as the initial query. */
export function openImageSearchModal(
	plugin: SearchInsertImagePlugin,
	editor: Editor,
	view: MarkdownView,
): void {
	const initialQuery = editor.getSelection().trim();
	new ImageSearchModal(plugin.app, plugin, editor, view, initialQuery).open();
}

export function registerCommands(plugin: SearchInsertImagePlugin): void {
	plugin.addCommand({
		id: 'open-image-search',
		name: 'Buscar e inserir imagem',
		editorCallback: (editor, ctx) => {
			if (ctx instanceof MarkdownView) {
				openImageSearchModal(plugin, editor, ctx);
			}
		},
	});
}
