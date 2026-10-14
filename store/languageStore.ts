import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LanguageCode = 'en' | 'ph' | 'ko';

interface LanguageState {
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en',

            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'language-preferences',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);