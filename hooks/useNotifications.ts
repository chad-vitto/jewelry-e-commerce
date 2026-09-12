import { useState, useEffect, useCallback } from 'react';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    type NotificationPreferences,
    type NotificationPreferencesUpdate,
} from '@/services/notificationService';


export interface UseNotificationsResult {
    settings: NotificationPreferences | null;
    isLoading: boolean;
    isSaving: boolean;

    updateSetting: (
        key: keyof NotificationPreferencesUpdate,
        value: boolean,
    ) => void;

    saveSettings: () => Promise<boolean>;

    reload: () => Promise<void>;
}

export function useNotifications(userId?: string): UseNotificationsResult {
    const [settings, setSettings] = useState<NotificationPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const reload = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const prefs = await getNotificationPreferences(userId);
            if (prefs) setSettings(prefs);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        reload();
    }, [reload]);

    const updateSetting = useCallback((key: keyof NotificationPreferencesUpdate, value: boolean) => {
        setSettings((prev) =>
            prev ? { ...prev, [key]: value } : prev,
        );
    }, []);

    const saveSettings = useCallback(async () => {
        if (!settings || !userId) return false;

        setIsSaving(true);

        try {
            const { user_id, ...updates } = settings;

            const success = await updateNotificationPreferences(
                userId,
                updates,
            );
            if (success) {
                await reload();
            }
            return success;

        } catch (err) {
            console.error(
                'Save Notification Preferences:',
                err,
            );

            return false;
        } finally {
            setIsSaving(false);
        }
    }, [reload, settings, userId]);

    return {
        settings,
        isLoading,
        isSaving,
        updateSetting,
        saveSettings,
        reload,
    };
}
