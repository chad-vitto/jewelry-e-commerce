import { Colors } from '@/constants';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
    
useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
  <GestureHandlerRootView style={{ flex: 1}}>
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.primary } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="auth/forgot-password" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      {/* <Stack.Screen name="product/[id]" options={{ headerShown: false, presentation: 'card' }} /> */}
      {/* <Stack.Screen name="cart" options={{ headerShown: false, presentation: 'card' }} /> */}
      </Stack>
      <StatusBar style="light" />
    </View>
  </GestureHandlerRootView>
  );
}
