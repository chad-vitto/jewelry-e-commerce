import { ScrollView, Text, StyleSheet, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { Bell, Moon, Lock, FileText, Info, ArrowLeft, Languages, ShieldCheck, CircleHelp, } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeMode } from '@/store/themeStore';
import type { AppColors } from '@/constants/themes';

export default function SettingsScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const mode = useThemeStore((state) => state.mode);

    const styles = createStyles(colors);

    const appearanceLabel: Record<ThemeMode, string> = {
        system: 'System',
        light: 'Light',
        dark: 'Dark',
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}>
                        <ArrowLeft size={20} color={colors.gold.DEFAULT} />
                    </Pressable>
                    <Text style={styles.title}>Settings</Text>
                    <Text style={styles.subtitle}>
                        Manage your app preferences and security.
                    </Text>
                </View>


                {/* Preferences */}
                <SettingsSection title="Preferences">
                    <SettingsItem
                        icon={<Bell size={20} color={colors.gold.DEFAULT} />}
                        title="Notifications"
                        subtitle="Manage push notifications"
                        onPress={() => router.push('/profile/settings/notifications')}
                    />

                    <SettingsItem
                        icon={<Moon size={20} color={colors.gold.DEFAULT} />}
                        title="Appearance"
                        subtitle={appearanceLabel[mode]}
                        onPress={() => router.push('/profile/settings/appearance')}
                    />

                    <SettingsItem
                        icon={<Languages size={20} color={colors.gold.DEFAULT} />}
                        title="Language"
                        subtitle="English"
                        showDivider={false}
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* Security */}
                <SettingsSection title="Security">
                    <SettingsItem
                        icon={<Lock size={20} color={colors.gold.DEFAULT} />}
                        title="Change Password"
                        subtitle="Update your account password"
                        showDivider={false}
                        onPress={() => router.push('/profile/settings/change-password')}
                    />
                </SettingsSection>

                {/* Support */}
                <SettingsSection title="Support">
                    <SettingsItem
                        icon={<CircleHelp size={20} color={colors.gold.DEFAULT} />}
                        title="Help Center"
                        onPress={() => { }}
                    />

                    <SettingsItem
                        icon={<ShieldCheck size={20} color={colors.gold.DEFAULT} />}
                        title="Privacy Policy"
                        onPress={() => { }}
                    />

                    <SettingsItem
                        icon={<FileText size={20} color={colors.gold.DEFAULT} />}
                        title="Terms & Conditions"
                        showDivider={false}
                        onPress={() => { }}
                    />
                </SettingsSection>

                {/* About */}
                <SettingsSection title="About">
                    <SettingsItem
                        icon={<Info size={20} color={colors.gold.DEFAULT} />}
                        title="App Version"
                        subtitle="v1.0.0"
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
