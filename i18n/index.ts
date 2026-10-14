import en from './en';
import ph from './ph';
import ko from './ko';

export const translations = {
    en,
    ph,
    ko,
} as const;

export type TranslationLanguage = keyof typeof translations;

export type TranslationKeys = typeof en;

export function getTranslations(language: TranslationLanguage) {
    return translations[language] ?? translations.en;
}