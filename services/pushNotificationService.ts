import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface PushRegistrationResult {
    success: boolean;
    token?: string;
    error?: string;
}

export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lockscreenVisibility:
                    Notifications.AndroidNotificationVisibility.PUBLIC,
            });
        }

        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== Notifications.PermissionStatus.GRANTED) {
            const { status } =
                await Notifications.requestPermissionsAsync();

            finalStatus = status;
        }

        if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
            return {
                success: false,
                error: 'Notification permission was not granted.',
            };
        }

        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
            return {
                success: false,
                error: 'EAS project ID is not configured.',
            };
        }

        const token = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;

        return {
            success: true,
            token,
        };
    } catch (error) {
        console.error(
            'Register Push Notifications:',
            error,
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Unable to register for push notifications.',
        };
    }
}

export async function savePushToken(
    token: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
            throw userError;
        }

        if (!user) {
            return {
                success: false,
                error: 'User is not authenticated.',
            };
        }

        const { error } = await supabase
            .from('device_tokens')
            .upsert(
                {
                    user_id: user.id,
                    expo_push_token: token,
                    platform:
                        Platform.OS === 'ios'
                            ? 'ios'
                            : 'android',
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'user_id,expo_push_token',
                },
            );

        if (error) {
            throw error;
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            'Save Push Token:',
            error,
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Unable to save push token.',
        };
    }
}

export async function registerAndSavePushToken(): Promise<PushRegistrationResult> {
    const registration = await registerForPushNotifications();

    if (!registration.success || !registration.token) {
        return registration;
    }

    const saved = await savePushToken(registration.token);

    if (!saved.success) {
        return {
            success: false,
            token: registration.token,
            error: saved.error,
        };
    }

    return registration;
}