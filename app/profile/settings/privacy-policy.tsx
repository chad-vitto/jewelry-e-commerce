import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppColors } from '@/constants/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PolicySection {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
}

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const sections: PolicySection[] = [
        {
            title: t.privacyPolicy.introductionTitle,
            paragraphs: [t.privacyPolicy.introduction],
        },
        {
            title: t.privacyPolicy.informationTitle,
            bullets: [
                t.privacyPolicy.accountProfile,
                t.privacyPolicy.shippingAddresses,
                t.privacyPolicy.ordersItems,
                t.privacyPolicy.wishlistData,
                t.privacyPolicy.paymentProofs,
                t.privacyPolicy.productImages,
                t.privacyPolicy.notificationPreferences,
                t.privacyPolicy.authenticationData,
                t.privacyPolicy.storageDatabase,
            ],
        },
        {
            title: t.privacyPolicy.usageTitle,
            bullets: [
                t.privacyPolicy.provideServices,
                t.privacyPolicy.fulfillOrders,
                t.privacyPolicy.manageAccount,
                t.privacyPolicy.communicate,
                t.privacyPolicy.security,
            ],
        },
        {
            title: t.privacyPolicy.storageSecurityTitle,
            paragraphs: [
                t.privacyPolicy.storageSecurity,
                t.privacyPolicy.authorizedAccess,
            ],
        },
        {
            title: t.privacyPolicy.sharingTitle,
            paragraphs: [t.privacyPolicy.noSale],
            bullets: [
                t.privacyPolicy.serviceProviders,
                t.privacyPolicy.legalRequirements,
            ],
        },
        {
            title: t.privacyPolicy.rightsTitle,
            bullets: [
                t.privacyPolicy.accessUpdate,
                t.privacyPolicy.manageNotifications,
                t.privacyPolicy.requestDeletion,
                t.privacyPolicy.contactSupport,
            ],
        },
        {
            title: t.privacyPolicy.contactTitle,
            paragraphs: [t.privacyPolicy.contactDescription],
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
                        accessibilityLabel={t.privacyPolicy.back}
                    >
                        <ChevronLeft
                            size={20}
                            color={colors.gold.DEFAULT}
                        />
                    </Pressable>

                    <View style={styles.headerIcon}>
                        <ShieldCheck
                            size={22}
                            color={colors.gold.DEFAULT}
                        />
                    </View>

                    <Text style={styles.title}>
                        {t.privacyPolicy.title}
                    </Text>

                    <Text style={styles.subtitle}>
                        {t.privacyPolicy.description}
                    </Text>
                </View>

                {/* Policy */}
                <View style={styles.policyCard}>
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

                            {section.paragraphs?.map((paragraph) => (
                                <Text
                                    key={paragraph}
                                    style={styles.paragraph}
                                >
                                    {paragraph}
                                </Text>
                            ))}

                            {section.bullets?.map((bullet) => (
                                <View
                                    key={bullet}
                                    style={styles.bulletRow}
                                >
                                    <View style={styles.bullet} />

                                    <Text style={styles.bulletText}>
                                        {bullet}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                <Text style={styles.footer}>
                    {t.privacyPolicy.footer}
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

        // Policy Card
        policyCard: {
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
        },

        bulletRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginTop: 9,
        },

        bullet: {
            width: 5,
            height: 5,
            borderRadius: 2.5,
            marginTop: 8,
            marginRight: 10,
            backgroundColor: colors.gold.DEFAULT,
        },

        bulletText: {
            flex: 1,
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            lineHeight: 21,
            color: colors.text.secondary,
        },

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