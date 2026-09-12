import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
import { GoldButton, GoldInput } from '@/components';
import { useCallback, useMemo, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text, StyleSheet, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, View, } from 'react-native';
import { useAuthStore } from '@/store';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
    const router = useRouter();
    const { updatePassword, } = useAuthStore();

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
            errs.currentPassword = 'Current password is required';
        }
        if (!newPassword.trim()) {
            errs.newPassword = 'New password is required';
        } else if (newPassword.length < 8) {
            errs.newPassword = 'Password must be at least 8 characters';
        } else if (newPassword === currentPassword) {
            errs.newPassword = 'New password must be different from current password';
        }
        if (!confirmPassword.trim()) {
            errs.confirmPassword = 'Please confirm your new password';
        } else if (confirmPassword !== newPassword) {
            errs.confirmPassword = 'Passwords do not match';
        }
        return errs;
    }, [currentPassword, newPassword, confirmPassword]);

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
                Alert.alert('Error', error)
                return;
            }

            Alert.alert('Success', 'Password updated successfully.', [
                { text: 'OK', onPress: () => { resetForm(); router.back() } },
            ]);

        } catch (err) {
            console.error('Change Password Error:', err);

            Alert.alert('Error', 'Unable to update password.');
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
                <EyeOff size={20} color={colors.text.secondary} />
            )}
        </Pressable>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.iconButton} onPress={() => router.back()}>
                        <ArrowLeft size={20} color={colors.gold.DEFAULT} />
                    </Pressable>
                    <Text style={styles.title}>Change Password</Text>
                    <Text style={styles.subtitle}>Keep your account secure.</Text>
                </View>

                {/* Current Password */}
                <GoldInput
                    label="Current Password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrent}
                    placeholder="Enter current password"
                    rightIcon={renderToggle(showCurrent, () => setShowCurrent(!showCurrent),
                    )}
                />
                {submitted && errors.currentPassword && (
                    <Text style={styles.error}>{errors.currentPassword}</Text>
                )}

                {/* New Password */}
                <GoldInput
                    label="New Password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    placeholder="Enter new password"
                    rightIcon={renderToggle(showNew, () => setShowNew(!showNew),
                    )}
                />
                {submitted && errors.newPassword && (
                    <Text style={styles.error}>{errors.newPassword}</Text>
                )}

                {passwordStrength ? (
                    <Text style={styles.strength}>Strength: {passwordStrength}</Text>
                ) : null}

                {/* Confirm Password */}
                <GoldInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    placeholder="Confirm new password"
                    rightIcon={renderToggle(showConfirm, () => setShowConfirm(!showConfirm),
                    )}
                />

                {submitted && errors.confirmPassword && (
                    <Text style={styles.error}>{errors.confirmPassword}</Text>
                )}

                {/* Update Button */}
                <GoldButton
                    title={isSaving ? 'Updating...' : 'Update Password'}
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
    header: {
        alignItems: 'center',
        marginBottom: 28,
        position: 'relative',
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
    title: {
        fontSize: 32,
        fontFamily: 'CormorantGaramond_700Bold',
        color: colors.text.primary,
        textAlign: 'center',
        marginTop: 10,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 15,
        fontFamily: 'Inter_500Medium',
        color: colors.text.secondary,
        textAlign: 'center',
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
