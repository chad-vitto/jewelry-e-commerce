import { ScrollView, Text, StyleSheet, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { Bell, Moon, Lock, FileText, Info, ChevronLeft, Languages, ShieldCheck, CircleHelp, } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeMode } from '@/store/themeStore';
import type { AppColors } from '@/constants/themes';
import { useLanguageStore } from '@/store/languageStore';
import type { LanguageCode } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function SettingsScreen() {
    const router = useRouter();

    const mode = useThemeStore((state) => state.mode);
    const appVersion = Constants.expoConfig?.version ?? '—';

    const { t } = useTranslation();

    const { colors } = useTheme();
    const styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const appearanceLabel: Record<ThemeMode, string> = {
        system: 'System',
        light: 'Light',
        dark: 'Dark',
    };

    const language = useLanguageStore((state) => state.language);

    const languageLabel: Record<LanguageCode, string> = {
        en: 'English',
        ph: 'Filipino',
        ko: '한국어',
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}>
                        <ChevronLeft size={20} color={colors.gold.DEFAULT} />
                    </Pressable>
                    <Text style={styles.title}>{t.settings.title}</Text>
                    <Text style={styles.subtitle}>
                        {t.settings.headerSubtitle}
                    </Text>
                </View>


                {/* Preferences */}
                <SettingsSection title={t.settings.preferences}>
                    <SettingsItem
                        icon={<Bell size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.notifications}
                        subtitle={t.settings.notificationsSubtitle}
                        onPress={() => router.push('/profile/settings/notifications')}
                    />

                    <SettingsItem
                        icon={<Moon size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.appearance}
                        subtitle={`${t.settings.appearanceSubtitle} · ${appearanceLabel[mode]}`}
                        onPress={() => router.push('/profile/settings/appearance')}
                    />

                    <SettingsItem
                        icon={<Languages size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.language}
                        subtitle={`${t.settings.languageSubtitle} · ${languageLabel[language]}`}
                        showDivider={false}
                        onPress={() => router.push('/profile/settings/language')}
                    />
                </SettingsSection>

                {/* Security */}
                <SettingsSection title={t.settings.security}>
                    <SettingsItem
                        icon={<Lock size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.changePassword}
                        subtitle={t.settings.changePasswordSubtitle}
                        showDivider={false}
                        onPress={() => router.push('/profile/settings/change-password')}
                    />
                </SettingsSection>

                {/* Support */}
                <SettingsSection title={t.settings.support}>
                    <SettingsItem
                        icon={<CircleHelp size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.helpCenter}
                        subtitle={t.settings.helpCenterSubtitle}
                        onPress={() => router.push('/profile/settings/help-center')}
                    />

                    <SettingsItem
                        icon={<ShieldCheck size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.privacyPolicy}
                        subtitle={t.settings.privacyPolicySubtitle}
                        onPress={() => router.push('/profile/settings/privacy-policy')}
                    />

                    <SettingsItem
                        icon={<FileText size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.terms}
                        subtitle={t.settings.termsSubtitle}
                        showDivider={false}
                        onPress={() => router.push('/profile/settings/terms')}
                    />
                </SettingsSection>

                {/* About */}
                <SettingsSection title={t.settings.about}>
                    <SettingsItem
                        icon={<Info size={20} color={colors.gold.DEFAULT} />}
                        title={t.settings.appVersion}
                        subtitle={`v${appVersion}`}
                        showDivider={false}
                        showChevron={false}
                        disabled
                    />
                </SettingsSection>

            </ScrollView>
        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
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
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border.gold,
        position: 'absolute',
        left: 20,
        top: 0,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.text.primary,
        textAlign: 'center',
        marginTop: 12,
    },
    subtitle: {
        fontSize: 15,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 22,
    },
});
