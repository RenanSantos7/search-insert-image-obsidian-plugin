import { getLanguage as getObsidianLanguage } from 'obsidian';
import en from './locales/en';
import ptBr from './locales/pt-br';
import es from './locales/es';

export type TranslationKey = keyof typeof en;

const locales: Record<string, Partial<typeof en>> = {
	en,
	'pt-br': ptBr,
	pt: ptBr,
	es,
	'es-419': es,
	'es-es': es,
};

/**
 * Returns the currently configured Obsidian language code (e.g. 'en', 'pt-br', 'es').
 */
export function getLanguage(): string {
	try {
		const lang = getObsidianLanguage();
		if (lang) return lang.toLowerCase();
	} catch {
		// Fallback outside Obsidian runtime
	}
	return 'en';
}

/**
 * Translates a key according to the active Obsidian locale, with fallback to English.
 * Supports placeholder substitution: e.g. `{provider}` via params object.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
	const lang = getLanguage();
	const primaryLang = lang.split('-')[0] ?? '';
	const activeLocale = locales[lang] ?? locales[primaryLang] ?? en;
	let text = activeLocale[key] ?? en[key] ?? key;

	if (params) {
		for (const [paramKey, paramValue] of Object.entries(params)) {
			text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
		}
	}
	return text;
}
