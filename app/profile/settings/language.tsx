import { ScrollView, Text, StyleSheet, Pressable, View, } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Languages } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useLanguageStore } from '@/store/languageStore';
import type { LanguageCode } from '@/store/languageStore';
import type { AppColors } from '@/constants/themes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function LanguageScreen() {
    const router = useRouter();

    const { colors } = useTheme();
    const styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const language = useLanguageStore((state) => state.language);
    const setLanguage = useLanguageStore((state) => state.setLanguage);
    const { t } = useTranslation();

    const LANGUAGE_OPTIONS: {
        value: LanguageCode;
        title: string;
        subtitle: string;
        flag: string;
    }[] = [
            {
                value: 'en',
                title: t.language.english,
                subtitle: t.language.englishDescription,
                flag: '🇺🇸',
            },
            {
                value: 'ph',
                title: t.language.filipino,
                subtitle: t.language.filipinoDescription,
                flag: '🇵🇭',
            },
            {
                value: 'ko',
                title: t.language.korean,
                subtitle: t.language.koreanDescription,
                flag: '🇰🇷',
            },
        ];


    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <ChevronLeft
                            size={20}
                            color={colors.gold.DEFAULT}
                        />
                    </Pressable>

                    <Text style={styles.title}>{t.language.title}</Text>

                    <Text style={styles.subtitle}>{t.language.description}</Text>
                </View>

                {/* Language Options */}
                <View style={styles.optionsCard}>
                    {LANGUAGE_OPTIONS.map((option, index) => {
                        const selected = language === option.value;
                        const isLast =
                            index === LANGUAGE_OPTIONS.length - 1;

                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => setLanguage(option.value)}
                                accessibilityRole="radio"
                                accessibilityState={{
                                    selected,
                                }}
                                accessibilityLabel={`${option.title}, ${selected ? 'selected' : 'not selected'
                                    }`}
                                style={({ pressed }) => [
                                    styles.option,
                                    !isLast && styles.optionDivider,
                                    selected && styles.selectedOption,
                                    pressed && styles.pressedOption,
                                ]}
                            >
                                {/* Flag */}
                                <View
                                    style={[
                                        styles.flagContainer,
                                        selected &&
                                        styles.selectedFlagContainer,
                                    ]}
                                >
                                    <Text style={styles.flag}>
                                        {option.flag}
                                    </Text>
                                </View>

                                {/* Text */}
                                <View style={styles.optionText}>
                                    <Text style={styles.optionTitle}>
                                        {option.title}
                                    </Text>

                                    <Text style={styles.optionSubtitle}>
                                        {option.subtitle}
                                    </Text>
                                </View>

                                {/* Radio */}
                                <View
                                    style={[styles.radio, selected && styles.selectedRadio,]}>
                                    {selected && (<View style={styles.radioInner} />)}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Current Language */}
                <View style={styles.currentLanguage}>
                    <Languages
                        size={16}
                        color={colors.gold.DEFAULT}
                    />

                    <Text style={styles.currentLanguageText}>{t.language.current}:{' '}<Text style={styles.currentLanguageValue}>
                        {
                            LANGUAGE_OPTIONS.find(
                                (option) =>
                                    option.value === language,
                            )?.title
                        }
                    </Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: AppColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
        },

        content: {
            padding: 20,
            paddingBottom: 40,
        },

        /* Header */
        backButton: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border.gold,
            backgroundColor: colors.surface,
            position: 'absolute',
            left: 0,
            top: 0,
        },
        header: {
            alignItems: 'center',
            marginBottom: 28,
            position: 'relative',
        },
        title: {
            fontFamily: 'CormorantGaramond_700Bold',
            fontSize: 28,
            color: colors.text.primary,
            marginBottom: 4,
        },
        subtitle: {
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: colors.text.secondary,
            marginBottom: 20,
        },

        /* Options */

        optionsCard: {
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border.DEFAULT,
            backgroundColor: colors.surface,
            overflow: 'hidden',
        },

        option: {
            minHeight: 88,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
        },

        optionDivider: {
            borderBottomWidth: 1,
            borderBottomColor: colors.border.DEFAULT,
        },

        selectedOption: {
            backgroundColor: colors.surfaceLight,
        },

        pressedOption: {
            opacity: 0.78,
        },

        /* Flag */

        flagContainer: {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceLight,
            marginRight: 14,
        },

        selectedFlagContainer: {
            borderWidth: 1,
            borderColor: colors.gold.DEFAULT,
        },

        flag: {
            fontSize: 22,
        },

        /* Text */

        optionText: {
            flex: 1,
        },

        optionTitle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 16,
            color: colors.text.primary,
        },

        optionSubtitle: {
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: colors.text.secondary,
            marginTop: 4,
            lineHeight: 18,
        },

        /* Radio */

        radio: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1.5,
            borderColor: colors.border.gold,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 12,
        },

        selectedRadio: {
            borderColor: colors.gold.DEFAULT,
        },

        radioInner: {
            width: 11,
            height: 11,
            borderRadius: 5.5,
            backgroundColor: colors.gold.DEFAULT,
        },

        /* Current Language */

        currentLanguage: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            paddingHorizontal: 16,
        },

        currentLanguageText: {
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: colors.text.secondary,
            marginLeft: 7,
        },

        currentLanguageValue: {
            fontFamily: 'Inter_500Medium',
            color: colors.gold.DEFAULT,
        },
    });