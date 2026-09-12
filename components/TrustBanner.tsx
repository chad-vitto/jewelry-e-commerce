import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Scale, Gem } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

export default function TrustBanner() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <TrustItem
        icon={<Gem size={14} color={colors.gold.DEFAULT} />}
        label="Authentic Gold"
        styles={styles}
      />
      <Divider styles={styles} />
      <TrustItem
        icon={<Scale size={14} color={colors.gold.DEFAULT} />}
        label="Verified Weight & Karat"
        styles={styles}
      />
      <Divider styles={styles} />
      <TrustItem
        icon={<ShieldCheck size={14} color={colors.gold.DEFAULT} />}
        label="Pawnable Quality"
        styles={styles}
      />
    </View>
  );
}

function TrustItem({
  icon,
  label,
  styles,
}: {
  icon: React.ReactNode;
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

function Divider({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.divider} />;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -22,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,

    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  iconWrap: {
    marginBottom: 2,
  },

  text: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: colors.text.muted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginHorizontal: 6,
  },
});
