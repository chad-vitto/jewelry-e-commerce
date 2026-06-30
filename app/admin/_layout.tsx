import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store';
import { Colors } from '@/constants';
import AccessDenied from '@/components/AccessDenied';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const canAccessDashboard = user?.role === 'admin' || user?.role === 'staff';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.gold.DEFAULT} />
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
          contentStyle: { backgroundColor: Colors.primary },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="products" options={{ presentation: 'card' }} />
        <Stack.Screen name="products/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen
          name="products/images"
          options={{ presentation: 'card' }}
        />
        <Stack.Screen name="orders" options={{ presentation: 'card' }} />
        <Stack.Screen name="orders/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="inquiries" options={{ presentation: 'card' }} />
        <Stack.Screen name="users" options={{ presentation: 'card' }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessDenied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  accessDeniedText: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: Colors.status.error,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
