import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Colors } from '@/constants';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Copy,
  Check,
} from 'lucide-react-native';

interface PaymentReferenceInputProps {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export function PaymentReferenceInput({
  value,
  onChangeText,
  editable = true,
}: PaymentReferenceInputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      await Clipboard.setStringAsync(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reference Number</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="GCash / Maya / Bank reference"
          placeholderTextColor={Colors.text.muted}
          maxLength={30}
        />
        {value ? (
          <TouchableOpacity
            onPress={handleCopy}
            style={styles.copyButton}
          >
            {copied ? (
              <Check
                size={16}
                color={Colors.surface}
              />
            ) : (
              <Copy
                size={16}
                color={Colors.surface}
              />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {value ? (
        <Text style={styles.successText}>✓ Looks good (optional)</Text>
      ) : (
        <Text style={styles.optional}>Optional</Text>
      )}

      <Text style={styles.hint}>Used to verify your payment faster.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceLight,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    color: Colors.text.primary,
  },
  copyButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.gold.DEFAULT,
    borderRadius: 6,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.surface,
  },
  successText: {
    fontSize: 12,
    color: Colors.status.success,
    marginTop: 4,
  },
  optional: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.muted,
    marginTop: 2,
  },
});
