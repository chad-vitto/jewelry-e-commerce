import { ChevronLeft, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text, StyleSheet, Pressable, ScrollView, } from 'react-native';
import type { AppColors } from '@/constants/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TermsSection {
    title: string;
    paragraphs: string[];
}

export default function TermsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const sections: TermsSection[] = [
        {
            title: t.terms.introductionTitle,
            paragraphs: [
                t.terms.introduction,
            ],
        },
        {
            title: t.terms.accountProfileTitle,
            paragraphs: [
                t.terms.accountProfileInformation,
                t.terms.accountProfileSecurity,
                t.terms.accountProfilePermission,
            ],
        },
        {
            title: t.terms.ordersShippingTitle,
            paragraphs: [
                t.terms.ordersShippingConfirmation,
                t.terms.ordersShippingAddress,
                t.terms.ordersShippingFraud,
            ],
        },
        {
            title: t.terms.wishlistPreferencesTitle,
            paragraphs: [
                t.terms.wishlistData,
                t.terms.notificationPreferences,
                t.terms.serviceNotifications,
            ],
        },
        {
            title: t.terms.paymentsTitle,
            paragraphs: [
                t.terms.paymentAccuracy,
                t.terms.paymentCardDetails,
                t.terms.paymentFraud,
            ],
        },
        {
            title: t.terms.contentUploadsTitle,
            paragraphs: [
                t.terms.contentRequirements,
                t.terms.contentRemoval,
            ],
        },
        {
            title: t.terms.dataSecurityTitle,
            paragraphs: [
                t.terms.dataStorage,
                t.terms.dataSecurity,
                t.terms.accountSecurity,
            ],
        },
        {
            title: t.terms.liabilityTitle,
            paragraphs: [
                t.terms.indirectDamages,
                t.terms.liabilityLimit,
            ],
        },
        {
            title: t.terms.changesTitle,
            paragraphs: [
                t.terms.changesDescription,
                t.terms.changesAcceptance,
            ],
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.backButton,
                            pressed && styles.pressed,
                        ]}
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        accessibilityLabel={t.terms.back}
                    >
                        <ChevronLeft
                            size={20}
                            color={colors.gold.DEFAULT}
                        />
                    </Pressable>

                    <View style={styles.headerIcon}>
                        <FileText
                            size={22}
                            color={colors.gold.DEFAULT}
                        />
                    </View>

                    <Text style={styles.title}>
                        {t.terms.title}
                    </Text>

                    <Text style={styles.subtitle}>
                        {t.terms.description}
                    </Text>
                </View>

                {/* Terms */}
                <View style={styles.termsCard}>
                    {sections.map((section, index) => (
                        <View
                            key={section.title}
                            style={[
                                styles.section,
                                index < sections.length - 1 &&
                                styles.sectionDivider,
                            ]}
                        >
                            <Text style={styles.sectionTitle}>
                                {section.title}
                            </Text>

                            {section.paragraphs.map((paragraph) => (
                                <Text
                                    key={paragraph}
                                    style={styles.paragraph}
                                >
                                    {paragraph}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>

                <Text style={styles.footer}>
                    {t.terms.footer}
                </Text>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: AppColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.surface,
        },

        content: {
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 100,
        },

        // Header
        header: {
            alignItems: 'center',
            position: 'relative',
            marginBottom: 28,
        },

        backButton: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border.gold,
            zIndex: 1,
        },

        headerIcon: {
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            backgroundColor: colors.surfaceLight,
            borderWidth: 1,
            borderColor: colors.border.gold,
        },

        title: {
            fontFamily: 'CormorantGaramond_700Bold',
            fontSize: 28,
            lineHeight: 34,
            color: colors.text.primary,
            marginBottom: 4,
            textAlign: 'center',
        },

        subtitle: {
            paddingHorizontal: 36,
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 20,
            color: colors.text.secondary,
            textAlign: 'center',
        },

        // Terms Card
        termsCard: {
            overflow: 'hidden',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border.gold,
            backgroundColor: colors.surfaceLight,
        },

        section: {
            paddingHorizontal: 18,
            paddingVertical: 20,
        },

        sectionDivider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border.subtle,
        },

        sectionTitle: {
            fontFamily: 'Inter_600SemiBold',
            fontSize: 15,
            lineHeight: 20,
            color: colors.text.primary,
            marginBottom: 10,
        },

        paragraph: {
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            lineHeight: 21,
            color: colors.text.secondary,
            marginBottom: 8,
        },

        // Footer
        footer: {
            marginTop: 18,
            paddingHorizontal: 8,
            fontFamily: 'Inter_400Regular',
            fontSize: 11,
            lineHeight: 17,
            color: colors.text.muted,
            textAlign: 'center',
        },

        pressed: {
            opacity: 0.7,
        },
    });