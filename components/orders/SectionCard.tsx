import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { AppColors } from '@/constants/themes';

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  rightContent?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  title,
  icon,
  rightContent,
  children,
}: SectionCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon}

          <Text style={styles.title}>
            {title}
          </Text>
        </View>

        {rightContent}
      </View>

      {children}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text.primary,
  },
});
