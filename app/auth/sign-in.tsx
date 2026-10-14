import * as Haptics from 'expo-haptics';
import { Eye, EyeClosed, LockKeyhole, Mail } from 'lucide-react-native';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useNavigation, useRouter } from 'expo-router';
import { useAuth } from '@/hooks';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import BackButton from '@/components/navigation/BackButton';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, ImageBackground } from 'react-native';
import type { View as NativeView } from 'react-native';
import type { AppColors } from '@/constants/themes';

export default function SignInScreen() {
  const { colors } = useTheme();
  const isDark = colors.primary === '#0A0A0A';
  const styles = createStyles(colors);
  const router = useRouter();
  const navigation = useNavigation();
  const { signIn, isLoading } = useAuth();
  const blurTargetRef = useRef<NativeView>(null);

  const [isClosing, setIsClosing] = useState(false);
  const blurMethod = Platform.OS === 'android'
    ? (isDark || isClosing ? 'none' : 'dimezisBlurViewSdk31Plus')
    : undefined;
  const inputBlurMethod = Platform.OS === 'android' ? 'none' : undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => navigation.addListener('beforeRemove', () => setIsClosing(true)),
    [navigation]
  );

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    const result = await signIn(email, password);

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
              style={styles.backgroundPhoto}
            />
            <View style={styles.photoTint} />
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cardGlow}>
            <View style={styles.cardClip}>
              <BlurView
                blurTarget={blurTargetRef}
                blurMethod={blurMethod}
                intensity={isDark ? 30 : 26}
                tint={isDark ? 'dark' : 'light'}
                style={styles.cardGlass}
              >
                <View style={styles.cardHighlight} pointerEvents="none" />

                <View style={styles.cardContent}>
                  <View style={styles.header}>
                    <BackButton
                      onPress={() => router.back()}
                    />
                  </View>

                  <View style={styles.brandSection}>
                    <Text style={styles.brandTitle}>Welcome Back</Text>

                    <Text style={styles.brandSubtitle}>
                      Sign in to access your orders and exclusive offers
                    </Text>
                  </View>

                  {error && (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>

                    <BlurView
                      blurTarget={blurTargetRef}
                      blurMethod={inputBlurMethod}
                      intensity={isDark ? 18 : 20}
                      tint={isDark ? 'dark' : 'light'}
                      style={[
                        styles.inputWrapper,
                        focusedField === 'email' && styles.inputFocused,
                      ]}
                    >
                      <Mail
                        size={18}
                        color={
                          isDark
                            ? colors.gold.light
                            : colors.text.secondary
                        }
                      />

                      <TextInput
                        style={[styles.input, styles.webInputReset]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        placeholderTextColor={
                          isDark
                            ? '#B9A36C'
                            : colors.text.muted
                        }
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        underlineColorAndroid="transparent"
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </BlurView>
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>

                    <BlurView
                      blurTarget={blurTargetRef}
                      blurMethod={inputBlurMethod}
                      intensity={isDark ? 18 : 20}
                      tint={isDark ? 'dark' : 'light'}
                      style={[
                        styles.passwordInputWrapper,
                        focusedField === 'password' && styles.inputFocused,
                      ]}
                    >
                      <LockKeyhole
                        size={18}
                        color={
                          isDark
                            ? colors.gold.light
                            : colors.text.secondary
                        }
                      />

                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          styles.webInputReset,
                        ]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor={
                          isDark
                            ? '#B9A36C'
                            : colors.text.muted
                        }
                        secureTextEntry={!showPassword}
                        underlineColorAndroid="transparent"
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                      />

                      <Pressable
                        onPress={() =>
                          setShowPassword((visible) => !visible)
                        }
                        hitSlop={10}
                        style={styles.passwordToggle}
                        accessibilityLabel={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <Eye
                            size={20}
                            color={
                              isDark
                                ? colors.gold.light
                                : colors.text.secondary
                            }
                          />
                        ) : (
                          <EyeClosed
                            size={20}
                            color={
                              isDark
                                ? colors.gold.light
                                : colors.text.secondary
                            }
                          />
                        )}
                      </Pressable>
                    </BlurView>
                  </View>

                  {/* Forgot password */}
                  <Pressable
                    style={styles.forgotPassword}
                    onPress={() =>
                      router.push('/auth/forgot-password')
                    }
                  >
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </Pressable>

                  {/* Sign in */}
                  <Pressable
                    style={[
                      styles.button,
                      isLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleSignIn}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={colors.gold.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />

                    <Text style={styles.dividerText}>or</Text>

                    <View style={styles.dividerLine} />
                  </View>

                  {/* Register */}
                  <View style={styles.signUpSection}>
                    <Text style={styles.signUpText}>
                      Don&apos;t have an account?
                    </Text>

                    <Pressable
                      onPress={() =>
                        router.push('/auth/register')
                      }
                    >
                      <Text style={styles.signUpLink}>
                        Create Account
                      </Text>
                    </Pressable>
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

const createStyles = (colors: AppColors) => {
  const isDark = colors.primary === '#0A0A0A';
  const inputSurface = isDark
    ? 'rgba(18, 17, 15, 0.32)'
    : 'rgba(255,251,243,0.38)';

  return StyleSheet.create({
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
    backgroundPhoto: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    },
    photoTint: {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(8, 8, 7, 0.04)',
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      paddingVertical: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardGlow: {
      width: '100%',
      maxWidth: 460,
      borderRadius: 30,

      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.22 : 0.1,
      shadowRadius: 28,

      elevation: 9,
    },
    cardGlass: {
      position: 'relative',
      alignSelf: 'stretch',
      width: '100%',
      borderRadius: 29,
      overflow: 'hidden',

      backgroundColor: isDark
        ? 'rgba(14,13,12,0.2)'
        : 'rgba(255,251,243,0.32)',
    },
    cardClip: {
      width: '100%',
      borderRadius: 30,
      overflow: 'hidden',

      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255,244,220,0.3)'
        : 'rgba(151,119,59,0.34)',
    },
    cardHighlight: {
      position: 'absolute',
      top: 1,
      left: 28,
      right: 28,
      height: 1,

      backgroundColor: isDark
        ? 'rgba(255,255,255,0.24)'
        : 'rgba(255,255,255,0.7)',

      zIndex: isDark ? 3 : undefined,
    },
    cardContent: {
      width: '100%',
      position: isDark ? 'relative' : undefined,
      zIndex: isDark ? 2 : undefined,
      padding: 22,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 22,
    },
    brandSection: {
      marginBottom: 26,
    },
    brandTitle: {
      fontFamily: isDark ? 'Inter_600SemiBold' : 'CormorantGaramond_700Bold',
      fontSize: isDark ? 30 : 32,
      color: colors.text.primary,
      letterSpacing: -0.4,
      marginBottom: 4,
    },
    brandSubtitle: {
      fontFamily: 'Inter_400Regular',
      fontSize: isDark ? 13 : 16,
      color: isDark ? colors.gold.light : colors.text.secondary,
      lineHeight: isDark ? 19 : 24,
      maxWidth: 290,
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
      marginBottom: 20,
    },
    label: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: colors.text.primary,
      marginBottom: 6,
    },
    inputWrapper: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255,255,255,0.14)'
        : 'rgba(151,119,59,0.24)',
      backgroundColor: inputSurface,
      paddingHorizontal: 14,
      overflow: 'hidden',
      shadowColor: isDark ? '#000000' : '#78613B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.16 : 0,
      shadowRadius: 7,
      elevation: isDark ? 2 : 0,
    },
    inputFocused: {
      borderColor: isDark ? 'rgba(220,190,125,0.58)' : 'rgba(151,119,59,0.42)',
      shadowOpacity: isDark ? 0.2 : 0,
    },
    input: {
      flex: 1,
      minWidth: 0,
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderRadius: 10,
      paddingHorizontal: 4,
      paddingVertical: 10,
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      color: isDark ? '#F5F0E8' : colors.text.primary,
      textAlign: 'left',
      textAlignVertical: 'center',
    },
    webInputReset: Platform.select({
      web: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        boxShadow: 'none',
        outlineWidth: 0,
      },
      default: {},
    }),
    passwordInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 52,
      backgroundColor: inputSurface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark
        ? 'rgba(255,255,255,0.14)'
        : 'rgba(151,119,59,0.24)',
      paddingHorizontal: 14,
      overflow: 'hidden',
      shadowColor: isDark ? '#000000' : '#78613B',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.16 : 0,
      shadowRadius: 7,
      elevation: isDark ? 2 : 0,
    },
    passwordInput: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 10,
    },
    passwordToggle: {
      padding: 4,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 8,
      marginBottom: 20,
    },
    forgotPasswordText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colors.gold.DEFAULT,
    },
    button: {
      borderRadius: 28,
      overflow: 'hidden',
      shadowColor: colors.gold.DEFAULT,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0,
      shadowRadius: 16,
      elevation: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonGradient: {
      paddingVertical: 13,
      alignItems: 'center',
    },
    buttonText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 17,
      color: colors.primary === '#0A0A0A' ? '#33230A' : colors.primary,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.primary === '#0A0A0A'
        ? 'rgba(255, 255, 255, 0.18)'
        : colors.border.DEFAULT,
    },
    dividerText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colors.text.muted,
      marginHorizontal: 16,
    },
    signUpSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    signUpText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      color: colors.text.secondary,
    },
    signUpLink: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      color: colors.gold.DEFAULT,
    },
  });
};
