import { useMemo } from 'react';

import { getTranslations } from '@/i18n';
import { useLanguageStore } from '@/store/languageStore';

export function useTranslation() {
    const language = useLanguageStore((state) => state.language);

    const translations = useMemo(
        () => getTranslations(language),
        [language],
    );

    return {
        language,
        t: translations,
    };
}