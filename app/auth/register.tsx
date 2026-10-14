import * as Haptics from 'expo-haptics';
import { Eye, EyeClosed } from 'lucide-react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useNavigation, useRouter } from 'expo-router';
import { useAuth } from '@/hooks';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import BackButton from '@/components/navigation/BackButton';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { View as NativeView } from 'react-native';
import type { AppColors } from '@/constants/themes';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const isDark = colors.primary === '#0A0A0A';
  const styles = createStyles(colors);
  const router = useRouter();
  const navigation = useNavigation();
  const { signUp, isLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const blurTargetRef = useRef<NativeView>(null);

  const [isClosing, setIsClosing] = useState(false);
  const blurMethod = Platform.OS === 'android'
    ? (isDark || isClosing ? 'none' : 'dimezisBlurViewSdk31Plus')
    : undefined;
  const inputBlurMethod = Platform.OS === 'android' ? 'none' : undefined;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => navigation.addListener('beforeRemove', () => setIsClosing(true)),
    [navigation]
  );

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    const result = await signUp(email, password, fullName, phone || undefined);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <BlurTargetView ref={blurTargetRef} style={styles.backgroundTarget} pointerEvents="none">
        {isDark ? (
          <>
            <ImageBackground
              source={require('../../assets/images/auth-jewelry-macro.png')}
              resizeMode="cover"
              style={styles.gradient}
              imageStyle={styles.backgroundImage}
            />
            <View style={styles.backgroundTint} />
          </>
        ) : (
          <LinearGradient
            colors={['#F8F5ED', '#EEE6D5', '#FAF8F3']}
            locations={[0, 0.52, 1]}
            style={styles.gradient}
          />
        )}
      </BlurTargetView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(24, insets.top + 12),
              paddingBottom: Math.max(24, insets.bottom + 12),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.glassBorder}>
            <View style={styles.glassFrame}>
              <BlurView
                blurTarget={blurTargetRef}
                blurMethod={blurMethod}
                intensity={isDark ? 30 : 26}
                tint={isDark ? 'dark' : 'light'}
                style={styles.glass}
              >
                <View style={styles.glassHighlight} pointerEvents="none" />
                <View style={styles.glassContent}>
                  {/* Header */}
                  <View style={styles.header}>
                    <BackButton
                      onPress={() => router.back()}
                    />
                  </View>

                  {/* Brand */}
                  <View style={styles.brandSection}>
                    <Text style={styles.brandTitle}>Create Account</Text>
                    <Text style={styles.brandSubtitle}>
                      Join to access exclusive jewelry collections and special offers
                    </Text>
                  </View>

                  {/* Form */}
                  <View style={styles.form}>
                    {error && (
                      <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full Name *</Text>
                      <BlurView
                        blurTarget={blurTargetRef}
                        blurMethod={inputBlurMethod}
                        intensity={isDark ? 18 : 20}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.inputGlass}
                      >
                        <TextInput
                          style={styles.input}
                          value={fullName}
                          onChangeText={setFullName}
                          placeholder="Enter your full name"
                          placeholderTextColor={colors.text.muted}
                          autoCapitalize="words"
                        />
                      </BlurView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Email Address *</Text>
                      <BlurView
                        blurTarget={blurTargetRef}
                        blurMethod={inputBlurMethod}
                        intensity={isDark ? 18 : 20}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.inputGlass}
                      >
                        <TextInput
                          style={styles.input}
                          value={email}
                          onChangeText={setEmail}
                          placeholder="your@email.com"
                          placeholderTextColor={colors.text.muted}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </BlurView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Phone Number</Text>
                      <BlurView
                        blurTarget={blurTargetRef}
                        blurMethod={inputBlurMethod}
                        intensity={isDark ? 18 : 20}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.inputGlass}
                      >
                        <TextInput
                          style={styles.input}
                          value={phone}
                          onChangeText={setPhone}
                          placeholder="09XX XXX XXXX"
                          placeholderTextColor={colors.text.muted}
                          keyboardType="phone-pad"
                        />
                      </BlurView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Password *</Text>
                      <BlurView
                        blurTarget={blurTargetRef}
                        blurMethod={inputBlurMethod}
                        intensity={isDark ? 18 : 20}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.passwordInputWrapper}
                      >
                        <TextInput
                          style={[styles.input, styles.passwordInput]}
                          value={password}
                          onChangeText={setPassword}
                          placeholder="Create a password (min 6 characters)"
                          placeholderTextColor={colors.text.muted}
                          secureTextEntry={!showPassword}
                        />
                        <Pressable
                          onPress={() => setShowPassword((visible) => !visible)}
                          hitSlop={10}
                          style={styles.passwordToggle}
                          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <Eye size={20} color={colors.text.secondary} /> : <EyeClosed size={20} color={colors.text.secondary} />}
                        </Pressable>
                      </BlurView>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Confirm Password *</Text>
                      <BlurView
                        blurTarget={blurTargetRef}
                        blurMethod={inputBlurMethod}
                        intensity={isDark ? 18 : 20}
                        tint={isDark ? 'dark' : 'light'}
                        style={styles.passwordInputWrapper}
                      >
                        <TextInput
                          style={[styles.input, styles.passwordInput]}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Re-enter your password"
                          placeholderTextColor={colors.text.muted}
                          secureTextEntry={!showConfirmPassword}
                        />
                        <Pressable
                          onPress={() => setShowConfirmPassword((visible) => !visible)}
                          hitSlop={10}
                          style={styles.passwordToggle}
                          accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <Eye size={20} color={colors.text.secondary} /> : <EyeClosed size={20} color={colors.text.secondary} />}
                        </Pressable>
                      </BlurView>
                    </View>

                    <Pressable
                      style={[styles.button, isLoading && styles.buttonDisabled]}
                      onPress={handleRegister}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={isDark
                          ? colors.gold.gradient
                          : [colors.gold.DEFAULT, colors.gold.DEFAULT, colors.gold.DEFAULT]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Text>
                      </LinearGradient>
                    </Pressable>

                    {/* Sign In Link */}
                    <View style={styles.signInSection}>
                      <Text style={styles.signInText}>Already have an account?</Text>
                      <Pressable onPress={() => router.push('/auth/sign-in')}>
                        <Text style={styles.signInLink}>Sign In</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  backgroundTarget: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundImage: {
    opacity: 0.78,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary === '#0A0A0A'
      ? 'rgba(8,8,7,0.04)'
      : 'rgba(255,252,244,0.12)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  glassBorder: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: colors.primary === '#0A0A0A' ? 28 : 30,
    shadowColor: '#000000',
    shadowOpacity: colors.primary === '#0A0A0A' ? 0.22 : 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
  },
  glass: {
    alignSelf: 'stretch',
    width: '100%',
    position: 'relative',
    borderRadius: colors.primary === '#0A0A0A' ? 28 : 29,
    overflow: 'hidden',
    borderWidth: colors.primary === '#0A0A0A' ? 1 : 0,
    borderColor: colors.primary === '#0A0A0A'
      ? 'rgba(255,244,220,0.3)'
      : 'transparent',
    backgroundColor: colors.primary === '#0A0A0A'
      ? undefined
      : 'rgba(255,251,243,0.32)',
  },
  glassFrame: {
    position: 'relative',
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: colors.primary === '#0A0A0A' ? 0 : 1,
    borderColor: colors.primary === '#0A0A0A'
      ? 'transparent'
      : 'rgba(151,119,59,0.34)',
  },
  glassHighlight: {
    position: 'absolute',
    top: 1,
    left: 28,
    right: 28,
    height: 1,
    backgroundColor: colors.primary === '#0A0A0A'
      ? 'rgba(255,255,255,0.24)'
      : 'rgba(255,255,255,0.7)',
    zIndex: colors.primary === '#0A0A0A' ? 3 : undefined,
  },
  glassContent: {
    width: '100%',
    position: colors.primary === '#0A0A0A' ? 'relative' : undefined,
    zIndex: colors.primary === '#0A0A0A' ? 2 : undefined,
    paddingHorizontal: 22,
    paddingBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  brandSection: {
    marginBottom: 32,
  },
  brandTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: colors.primary === '#0A0A0A' ? 36 : 32,
    color: colors.text.primary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.status.error,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text.primary,
  },
  inputGlass: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.primary === '#0A0A0A'
      ? 'rgba(18,17,15,0.32)'
      : 'rgba(255,251,243,0.38)',
    borderWidth: 1,
    borderColor: colors.primary === '#0A0A0A'
      ? 'rgba(255,255,255,0.14)'
      : 'rgba(151,119,59,0.24)',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary === '#0A0A0A'
      ? 'rgba(18,17,15,0.32)'
      : 'rgba(255,251,243,0.38)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary === '#0A0A0A'
      ? 'rgba(255,255,255,0.14)'
      : 'rgba(151,119,59,0.24)',
    paddingRight: 16,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  passwordToggle: {
    padding: 4,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.primary,
  },
  signInSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  signInText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text.secondary,
  },
  signInLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.gold.DEFAULT,
  },
});
