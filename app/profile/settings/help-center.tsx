import { GoldButton } from '@/components';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { ChevronLeft, Search, ChevronRight, ShoppingBag, CreditCard, Settings, MessageCircle, Mail, CircleHelp, } from 'lucide-react-native';

import type { AppColors } from '@/constants/themes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconComponent = typeof ShoppingBag;

interface HelpItem {
    title: string;
    icon?: IconComponent;
}

export default function HelpCenterScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();

    const styles = createStyles(colors);
    const insets = useSafeAreaInsets();

    const faqCategories: HelpItem[] = [
        {
            title: t.helpCenter.ordersShipping,
            icon: ShoppingBag,
        },
        {
            title: t.helpCenter.paymentsBilling,
            icon: CreditCard,
        },
        {
            title: t.helpCenter.accountSettings,
            icon: Settings,
        },
    ];

    const commonQuestions: HelpItem[] = [
        {
            title: t.helpCenter.trackOrder,
        },
        {
            title: t.helpCenter.resetPassword,
        },
        {
            title: t.helpCenter.updateAddress,
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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
                        accessibilityLabel={t.helpCenter.back}
                    >
                        <ChevronLeft
                            size={20}
                            color={colors.gold.DEFAULT}
                        />
                    </Pressable>

                    <View style={styles.headerIcon}>
                        <CircleHelp
                            size={22}
                            color={colors.gold.DEFAULT}
                        />
                    </View>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            {t.helpCenter.title}
                        </Text>

                        <Text style={styles.subtitle}>
                            {t.helpCenter.description}
                        </Text>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Search
                        size={19}
                        color={colors.text.secondary}
                    />

                    <TextInput
                        style={styles.searchInput}
                        placeholder={t.helpCenter.searchPlaceholder}
                        placeholderTextColor={colors.text.muted}
                        accessibilityLabel={t.helpCenter.searchPlaceholder}
                        returnKeyType="search"
                    />
                </View>

                {/* FAQ Categories */}
                <HelpSection
                    title={t.helpCenter.faqCategories}
                    styles={styles}
                    colors={colors}
                >
                    {faqCategories.map((item, index) => (
                        <HelpRow
                            key={item.title}
                            item={item}
                            styles={styles}
                            colors={colors}
                            showDivider={index < faqCategories.length - 1}
                        />
                    ))}
                </HelpSection>

                {/* Common Questions */}
                <HelpSection
                    title={t.helpCenter.commonQuestions}
                    styles={styles}
                    colors={colors}
                >
                    {commonQuestions.map((item, index) => (
                        <HelpRow
                            key={item.title}
                            item={item}
                            styles={styles}
                            colors={colors}
                            showDivider={index < commonQuestions.length - 1}
                        />
                    ))}
                </HelpSection>

                {/* Contact Support */}
                <HelpSection
                    title={t.helpCenter.needMoreHelp}
                    styles={styles}
                    colors={colors}
                >
                    <HelpRow
                        item={{
                            title: t.helpCenter.liveChat,
                            icon: MessageCircle,
                        }}
                        styles={styles}
                        colors={colors}
                        showDivider
                    />

                    <HelpRow
                        item={{
                            title: t.helpCenter.emailSupport,
                            icon: Mail,
                        }}
                        styles={styles}
                        colors={colors}
                        showDivider={false}
                    />
                </HelpSection>

                {/* Contact CTA */}
                <View style={styles.actionContainer}>
                    <GoldButton
                        title={t.helpCenter.contactSupport}
                        variant="gradient"
                        size="lg"
                        onPress={() => {
                            // TODO: Connect to support email/chat.
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

interface HelpSectionProps {
    title: string;
    children: React.ReactNode;
    styles: ReturnType<typeof createStyles>;
    colors: AppColors;
}

function HelpSection({
    title,
    children,
    styles,
}: HelpSectionProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>
                {title}
            </Text>

            <View style={styles.card}>
                {children}
            </View>
        </View>
    );
}

interface HelpRowProps {
    item: HelpItem;
    styles: ReturnType<typeof createStyles>;
    colors: AppColors;
    showDivider: boolean;
}

function HelpRow({
    item,
    styles,
    colors,
    showDivider,
}: HelpRowProps) {
    const Icon = item.icon;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.row,
                showDivider && styles.rowDivider,
                pressed && styles.pressedRow,
            ]}
            accessibilityRole="button"
            accessibilityLabel={item.title}
        >
            <View style={styles.rowContent}>
                {Icon ? (
                    <View style={styles.iconContainer}>
                        <Icon
                            size={18}
                            color={colors.gold.DEFAULT}
                        />
                    </View>
                ) : null}

                <Text
                    style={[
                        styles.label,
                        !Icon && styles.questionLabel,
                    ]}
                >
                    {item.title}
                </Text>
            </View>

            <ChevronRight
                size={18}
                color={colors.text.muted}
            />
        </Pressable>
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
        header: {
            position: 'relative',
            alignItems: 'center',
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
        headerText: {
            alignItems: 'center',
            paddingHorizontal: 48,
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
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            lineHeight: 20,
            color: colors.text.secondary,
            textAlign: 'center',
        },
        searchContainer: {
            minHeight: 50,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 28,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border.subtle,
            backgroundColor: colors.surfaceLight,
        },
        searchInput: {
            flex: 1,
            marginLeft: 10,
            paddingVertical: 0,
            fontFamily: 'Inter_400Regular',
            fontSize: 14,
            color: colors.text.primary,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            marginBottom: 10,
            paddingHorizontal: 2,
            fontFamily: 'Inter_600SemiBold',
            fontSize: 14,
            letterSpacing: 0.2,
            color: colors.text.secondary,
            textTransform: 'uppercase',
        },
        card: {
            overflow: 'hidden',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.border.gold,
            backgroundColor: colors.surfaceLight,
        },
        row: {
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        rowDivider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border.subtle,
        },
        rowContent: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 12,
        },
        iconContainer: {
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border.gold,
        },
        label: {
            flex: 1,
            fontFamily: 'Inter_500Medium',
            fontSize: 14,
            lineHeight: 20,
            color: colors.text.primary,
        },
        questionLabel: {
            paddingLeft: 2,
        },
        pressed: {
            opacity: 0.7,
        },
        pressedRow: {
            backgroundColor: colors.surface,
        },
        actionContainer: {
            marginTop: 2,
        },
    });