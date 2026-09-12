import {
    ScrollView,
    Text,
    StyleSheet,
    Pressable,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Smartphone } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeMode } from '@/store/themeStore';

const APPEARANCE_OPTIONS: {
    value: ThemeMode;
    title: string;
    subtitle: string;
    icon: typeof Moon;
}[] = [
        {
            value: 'system',
            title: 'System',
            subtitle: 'Follow your device appearance',
            icon: Smartphone,
        },
        {
            value: 'light',
            title: 'Light',
            subtitle: 'Use a light appearance',
            icon: Sun,
        },
        {
            value: 'dark',
            title: 'Dark',
            subtitle: 'Use the premium dark appearance',
            icon: Moon,
        },
    ];

export default function AppearanceScreen() {
    const router = useRouter();

    const { colors } = useTheme();

    const mode = useThemeStore((state) => state.mode);
    const setMode = useThemeStore((state) => state.setMode);

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.primary },
            ]}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={[
                            styles.backButton,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border.gold,
                            },
                        ]}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft
                            size={20}
                            color={colors.gold.DEFAULT}
                        />
                    </Pressable>

                    <Text
                        style={[
                            styles.title,
                            { color: colors.text.primary },
                        ]}
                    >
                        Appearance
                    </Text>

                    <Text
                        style={[
                            styles.subtitle,
                            { color: colors.text.secondary },
                        ]}
                    >
                        Choose how the app looks.
                    </Text>
                </View>

                {/* Appearance Options */}
                <View
                    style={[
                        styles.optionsCard,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border.DEFAULT,
                        },
                    ]}
                >
                    {APPEARANCE_OPTIONS.map((option, index) => {
                        const selected = mode === option.value;
                        const Icon = option.icon;
                        const isLast = index === APPEARANCE_OPTIONS.length - 1;

                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => setMode(option.value)}
                                style={[
                                    styles.option,
                                    !isLast && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: colors.border.DEFAULT,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.iconContainer,
                                        {
                                            backgroundColor: selected
                                                ? colors.gold.DEFAULT
                                                : colors.surfaceLight,
                                        },
                                    ]}
                                >
                                    <Icon
                                        size={19}
                                        color={
                                            selected
                                                ? colors.primary
                                                : colors.gold.DEFAULT
                                        }
                                    />
                                </View>

                                <View style={styles.optionText}>
                                    <Text
                                        style={[
                                            styles.optionTitle,
                                            { color: colors.text.primary },
                                        ]}
                                    >
                                        {option.title}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.optionSubtitle,
                                            { color: colors.text.secondary },
                                        ]}
                                    >
                                        {option.subtitle}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.radio,
                                        {
                                            borderColor: selected
                                                ? colors.gold.DEFAULT
                                                : colors.border.gold,
                                        },
                                    ]}
                                >
                                    {selected && (
                                        <View
                                            style={[
                                                styles.radioInner,
                                                {
                                                    backgroundColor:
                                                        colors.gold.DEFAULT,
                                                },
                                            ]}
                                        />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    header: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 28,
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        position: 'absolute',
        left: 0,
        top: 0,
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 12,
    },

    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 22,
    },

    optionsCard: {
        borderRadius: 18,
        borderWidth: 1,
        overflow: 'hidden',
    },

    option: {
        minHeight: 86,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    optionText: {
        flex: 1,
    },

    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },

    optionSubtitle: {
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },

    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },

    radioInner: {
        width: 11,
        height: 11,
        borderRadius: 5.5,
    },
});