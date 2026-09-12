import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store';
import { Colors } from '@/constants';
import AccessDenied from '@/components/AccessDenied';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

export default function AdminLayout() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const canAccessDashboard = user?.role === 'admin' || user?.role === 'staff';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
      </View>
    );
  }

  if (!isAuthenticated || !canAccessDashboard) {
    // Redirect non-admins to sign-in
    return <AccessDenied />;
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.primary },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="products" options={{ presentation: 'card' }} />
        <Stack.Screen name="products/images" options={{ presentation: 'card' }} />
        <Stack.Screen name="orders" options={{ presentation: 'card' }} />
        <Stack.Screen name="orders/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="inquiries" options={{ presentation: 'card' }} />
        <Stack.Screen name="users" options={{ presentation: 'card' }} />
      </Stack>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
