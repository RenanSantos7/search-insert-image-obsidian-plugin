import { vi } from 'vitest';

if (typeof window === 'undefined') {
	vi.stubGlobal('window', { setTimeout });
}

vi.mock('obsidian', () => {
	class PluginSettingTab {
		constructor(public app: unknown, public plugin: unknown) {}
	}

	class TFolder {}

	const noticeElement = {
		createEl: vi.fn(() => ({ addEventListener: vi.fn() })),
	};

	return {
		Modal: class {},
		Notice: class {
			noticeEl = noticeElement;
			messageEl = noticeElement;
			hide = vi.fn();
		},
		PluginSettingTab,
		TFolder,
		getLanguage: vi.fn(() => 'en'),
		normalizePath: (path: string) => path.replace(/\\/g, '/').replace(/\/+/g, '/'),
		requestUrl: vi.fn(),
		moment: () => ({ format: () => '20261007-085500' }),
	};
});
