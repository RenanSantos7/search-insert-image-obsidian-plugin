import { describe, expect, it, vi } from 'vitest';
import { getLanguage as getObsidianLanguage } from 'obsidian';
import { getLanguage, t } from '../src/i18n';
import en from '../src/i18n/locales/en';
import ptBr from '../src/i18n/locales/pt-br';
import es from '../src/i18n/locales/es';

const mockGetLanguage = vi.mocked(getObsidianLanguage);

describe('i18n', () => {
	it('defaults to English when Obsidian language is en or unrecognized', () => {
		mockGetLanguage.mockReturnValue('en');
		expect(getLanguage()).toBe('en');
		expect(t('commandOpenSearch')).toBe(en.commandOpenSearch);

		mockGetLanguage.mockReturnValue('unknown-lang');
		expect(getLanguage()).toBe('unknown-lang');
		expect(t('commandOpenSearch')).toBe(en.commandOpenSearch);
	});

	it('returns Brazilian Portuguese strings when language is pt or pt-br', () => {
		mockGetLanguage.mockReturnValue('pt-BR');
		expect(getLanguage()).toBe('pt-br');
		expect(t('commandOpenSearch')).toBe(ptBr.commandOpenSearch);

		mockGetLanguage.mockReturnValue('pt');
		expect(getLanguage()).toBe('pt');
		expect(t('commandOpenSearch')).toBe(ptBr.commandOpenSearch);
	});

	it('returns Spanish strings when language is es or regional es', () => {
		mockGetLanguage.mockReturnValue('es');
		expect(getLanguage()).toBe('es');
		expect(t('commandOpenSearch')).toBe(es.commandOpenSearch);

		mockGetLanguage.mockReturnValue('es-419');
		expect(getLanguage()).toBe('es-419');
		expect(t('commandOpenSearch')).toBe(es.commandOpenSearch);
	});

	it('interpolates parameters', () => {
		mockGetLanguage.mockReturnValue('en');
		expect(t('errorProviderGeneric', { provider: 'Google' })).toBe(
			'Could not search images with Google. Try again later.',
		);

		mockGetLanguage.mockReturnValue('pt-BR');
		expect(t('errorProviderGeneric', { provider: 'DuckDuckGo' })).toBe(
			'Não foi possível buscar imagens no DuckDuckGo. Tente novamente mais tarde.',
		);
	});

	it('all locales have matching keys for all en keys', () => {
		const enKeys = Object.keys(en);
		const ptKeys = Object.keys(ptBr);
		const esKeys = Object.keys(es);

		expect(ptKeys.sort()).toEqual(enKeys.sort());
		expect(esKeys.sort()).toEqual(enKeys.sort());
	});
});
