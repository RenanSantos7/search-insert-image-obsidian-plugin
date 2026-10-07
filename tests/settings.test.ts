import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, SearchInsertImageSettingTab, isGoogleConfigured } from '../src/settings';

describe('settings', () => {
	it('provides the agreed defaults', () => {
		expect(DEFAULT_SETTINGS).toMatchObject({
			provider: 'duckduckgo',
			defaultInsertMode: 'link',
			safeSearch: true,
			imageWidth: 700,
		});
	});

	it('recognizes Google only when both credentials are present', () => {
		expect(isGoogleConfigured({ ...DEFAULT_SETTINGS, googleApiKey: 'key', googleCx: 'cx' })).toBe(true);
		expect(isGoogleConfigured({ ...DEFAULT_SETTINGS, googleApiKey: 'key', googleCx: ' ' })).toBe(false);
	});

	it('exposes declarative controls and persists normalized values', async () => {
		const saveSettings = vi.fn(async () => undefined);
		const plugin = { settings: { ...DEFAULT_SETTINGS }, saveSettings };
		const tab = new SearchInsertImageSettingTab({} as never, plugin as never);

		const definitions = tab.getSettingDefinitions();
		expect(definitions).toHaveLength(2);
		await tab.setControlValue('downloadFolder', '  images  ');
		await tab.setControlValue('googleApiKey', '  api-key  ');

		expect(plugin.settings.downloadFolder).toBe('images');
		expect(plugin.settings.googleApiKey).toBe('api-key');
		expect(saveSettings).toHaveBeenCalledTimes(2);
	});
});
