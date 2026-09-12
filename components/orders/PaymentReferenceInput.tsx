import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Colors } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';
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
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
          placeholderTextColor={colors.text.muted}
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
                color={colors.surface}
              />
            ) : (
              <Copy
                size={16}
                color={colors.surface}
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    marginVertical: 12,
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceLight,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    color: colors.text.primary,
  },
  copyButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 6,
  },
  successText: {
    fontSize: 12,
    color: colors.status.success,
    marginTop: 4,
  },
  optional: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
});
