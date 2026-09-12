import React, { PropsWithChildren, useMemo } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ThemeContextValue {
    colors: ReturnType<typeof useAppTheme>['colors'];
    mode: ReturnType<typeof useAppTheme>['mode'];
    resolvedMode: ReturnType<typeof useAppTheme>['resolvedMode'];
    isLight: boolean;
    isDark: boolean;
}

export const ThemeContext =
    React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
    const theme = useAppTheme();

    const value = useMemo(
        () => ({
            colors: theme.colors,
            mode: theme.mode,
            resolvedMode: theme.resolvedMode,
            isLight: theme.isLight,
            isDark: theme.isDark,
        }),
        [
            theme.colors,
            theme.mode,
            theme.resolvedMode,
            theme.isLight,
            theme.isDark,
        ],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}