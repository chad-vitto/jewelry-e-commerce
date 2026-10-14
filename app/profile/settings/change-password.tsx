import { ChevronLeft, Eye, EyeClosed } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { GoldButton, GoldInput } from '@/components';
import { useCallback, useMemo, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, View, } from 'react-native';
import { useAuthStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function ChangePasswordScreen() {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { updatePassword, } = useAuthStore();
    const { t } = useTranslation();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Show/Hide toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Inline error messages
    const errors = useMemo(() => {
        const errs: Record<string, string> = {};
        if (!currentPassword.trim()) {
            errs.currentPassword = t.changePassword.currentPasswordRequired;
        }
        if (!newPassword.trim()) {
            errs.newPassword = t.changePassword.newPasswordRequired;
        } else if (newPassword.length < 8) {
            errs.newPassword = t.changePassword.passwordMinLength;
        } else if (newPassword === currentPassword) {
            errs.newPassword = t.changePassword.newPasswordDifferent;
        }
        if (!confirmPassword.trim()) {
            errs.confirmPassword = t.changePassword.confirmPasswordRequired;
        } else if (confirmPassword !== newPassword) {
            errs.confirmPassword = t.changePassword.passwordsDoNotMatch;
        }
        return errs;
    }, [currentPassword, newPassword, confirmPassword, t.changePassword.currentPasswordRequired, t.changePassword.newPasswordRequired, t.changePassword.passwordMinLength, t.changePassword.newPasswordDifferent, t.changePassword.confirmPasswordRequired, t.changePassword.passwordsDoNotMatch]);

    const formValid = Object.keys(errors).length === 0;

    const resetForm = useCallback(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);

        setSubmitted(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            return () => resetForm();
        }, [resetForm])
    );

    const handleUpdate = async () => {
        if (!formValid) {
            setSubmitted(true);
            return;
        }
        try {
            setIsSaving(true);
            const { error } = await updatePassword(currentPassword, newPassword);

            if (error) {
                Alert.alert(t.changePassword.error, error);
                return;
            }

            Alert.alert(t.changePassword.success, t.changePassword.passwordUpdated, [
                { text: t.changePassword.ok, onPress: () => { resetForm(); router.back() } },
            ]);

        } catch (err) {
            console.error(t.changePassword.error, err);

            Alert.alert(t.changePassword.error, t.changePassword.passwordUpdateFailed);
        } finally {
            setIsSaving(false);
        }
    };

    // Simple password strength indicator
    const passwordStrength = useMemo(() => {
        if (!newPassword) return '';
        if (newPassword.length < 8) return 'Weak';
        if (/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword)) {
            return 'Strong';
        }
        return 'Medium';
    }, [newPassword]);

    // Reusable toggle icon
    const renderToggle = (visible: boolean, toggle: () => void,) => (
        <Pressable
            onPress={toggle}
            hitSlop={10}
        >
            {visible ? (
                <Eye size={20} color={colors.text.secondary} />
            ) : (
                <EyeClosed  size={20} color={colors.text.secondary} />
            )}
        </Pressable>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.iconButton} onPress={() => router.back()}>
                        <ChevronLeft size={20} color={colors.gold.DEFAULT} />
                    </Pressable>
                    <Text style={styles.title}>{t.changePassword.title}</Text>
                    <Text style={styles.subtitle}>{t.changePassword.description}</Text>
                </View>

                {/* Current Password */}
                <GoldInput
                    label={t.changePassword.currentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrent}
                    placeholder={t.changePassword.currentPasswordPlaceholder}
                    rightIcon={renderToggle(showCurrent, () => setShowCurrent(!showCurrent),
                    )}
                />
                {submitted && errors.currentPassword && (
                    <Text style={styles.error}>{errors.currentPassword}</Text>
                )}

                {/* New Password */}
                <GoldInput
                    label={t.changePassword.newPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    placeholder={t.changePassword.newPasswordPlaceholder}
                    rightIcon={renderToggle(showNew, () => setShowNew(!showNew),
                    )}
                />
                {submitted && errors.newPassword && (
                    <Text style={styles.error}>{errors.newPassword}</Text>
                )}

                {passwordStrength ? (
                    <Text style={styles.strength}>
                        {t.changePassword.strength}:{' '}
                        {passwordStrength === 'Weak'
                            ? t.changePassword.weak
                            : passwordStrength === 'Medium'
                                ? t.changePassword.medium
                                : t.changePassword.strong}
                    </Text>
                ) : null}

                {/* Confirm Password */}
                <GoldInput
                    label={t.changePassword.confirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    placeholder={t.changePassword.confirmPasswordPlaceholder}
                    rightIcon={renderToggle(showConfirm, () => setShowConfirm(!showConfirm),
                    )}
                />

                {submitted && errors.confirmPassword && (
                    <Text style={styles.error}>{errors.confirmPassword}</Text>
                )}

                {/* Update Button */}
                <GoldButton
                    title={isSaving ? t.changePassword.updating : t.changePassword.updatePassword}
                    variant="gradient"
                    size="lg"
                    onPress={handleUpdate}
                    disabled={isSaving}
                />
            </ScrollView>
        </KeyboardAvoidingView >
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    iconButton: {
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
    error: {
        fontSize: 12,
        color: colors.status.error,
        marginTop: 4,
        marginBottom: 8,
    },
    strength: {
        fontSize: 12,
        color: colors.text.secondary,
        marginTop: 2,
        marginBottom: 12,
    },
});
