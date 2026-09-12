import { supabase } from '@/lib/supabase';

export interface NotificationPreferences {
    user_id: string;
    order_updates: boolean;
    promotions: boolean;
    wishlist_alerts: boolean;
    new_arrivals: boolean;
}
export type NotificationPreferencesUpdate = Partial<
    Omit<NotificationPreferences, 'user_id'>
>;



/**
 * Get notification preferences for a user.
 * If no record exists, create one with defaults and return it.
 */
export async function getNotificationPreferences(
    userId: string,
): Promise<NotificationPreferences | null> {
    try {
        const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows found
            throw error;
        }

        if (!data) {
            // Create default record
            const defaults: NotificationPreferences = {
                user_id: userId,
                order_updates: true,
                promotions: true,
                wishlist_alerts: true,
                new_arrivals: false,
            };

            const { data: inserted, error: insertError } = await supabase
                .from('notification_preferences')
                .insert(defaults)
                .select()
                .single();

            if (insertError) throw insertError;

            return inserted;
        }

        return {
            user_id: data.user_id,
            order_updates: data.order_updates,
            promotions: data.promotions,
            wishlist_alerts: data.wishlist_alerts,
            new_arrivals: data.new_arrivals,
        };
    } catch (err) {
        console.error('Error fetching notification preferences:', err);
        return null;
    }
}

/**
 * Update notification preferences for a user.
 * Only updates the provided fields, without overwriting others.
 */
export async function updateNotificationPreferences(
    userId: string,
    updates: NotificationPreferencesUpdate,
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notification_preferences')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error updating notification preferences:', err);
        return false;
    }
}
