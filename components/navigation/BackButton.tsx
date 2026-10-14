import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface BackButtonProps {
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export default function BackButton({
  onPress,
  accessibilityLabel = 'Go back',
  disabled = false,
}: BackButtonProps) {
  const { colors } = useTheme();
  const isDark = colors.primary === '#0A0A0A';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        { shadowOpacity: isDark ? 0.2 : 0.12 },
        disabled && styles.buttonDisabled,
      ]}
    >
      <View
        style={[
          styles.buttonGlass,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,252,246,0.32)',
            borderColor: isDark
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(255,255,255,0.68)',
          },
        ]}
      >
        <ChevronLeft
          size={21}
          color={isDark ? '#F6EAC5' : '#493715'}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 7,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGlass: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
