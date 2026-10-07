import { vi } from 'vitest';

if (typeof window === 'undefined') {
	vi.stubGlobal('window', { setTimeout });
}

vi.mock('obsidian', () => {
	class PluginSettingTab {
		constructor(public app: unknown, public plugin: unknown) {}
	}

	class TFolder {}

	return {
		Modal: class {},
		Notice: class {
			noticeEl = {
				createEl: vi.fn(() => ({ addEventListener: vi.fn() })),
			};
			hide = vi.fn();
		},
		PluginSettingTab,
		TFolder,
		normalizePath: (path: string) => path.replace(/\\/g, '/').replace(/\/+/g, '/'),
		requestUrl: vi.fn(),
		moment: () => ({ format: () => '20261007-085500' }),
	};
});
