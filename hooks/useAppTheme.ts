import { useColorScheme } from 'react-native';

import { useThemeStore } from '@/store/themeStore';
import { DarkColors, LightColors, type AppColors, } from '@/constants/themes';

export function useAppTheme() {
    const systemScheme = useColorScheme();
    const mode = useThemeStore((state) => state.mode);

    const resolvedMode =
        mode === 'system'
            ? systemScheme === 'light'
                ? 'light'
                : 'dark'
            : mode;

    const colors: AppColors =
        resolvedMode === 'light'
            ? LightColors
            : DarkColors;

    return {
        mode,
        resolvedMode,
        colors,
        isLight: resolvedMode === 'light',
        isDark: resolvedMode === 'dark',
    };
}