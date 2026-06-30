import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldX, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export default function AccessDenied({
  title = 'Access Denied',
  message = 'You do not have permission to access this page.',
  showBackButton = true,
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldX size={64} color={Colors.status.error} />
        </View>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.message}>
          {message}
        </Text>

        {showBackButton && (
          <Pressable
            style={styles.button}
            onPress={() => router.back()}
          >
            <ArrowLeft size={18} color={Colors.primary} />
            <Text style={styles.buttonText}>Go Back</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },

  iconContainer: {
    marginBottom: 24,
  },

  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: Colors.status.error,
    marginBottom: 12,
    textAlign: 'center',
  },

  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gold.DEFAULT,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },

  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
});