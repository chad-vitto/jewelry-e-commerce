import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants';

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function SectionCard({
  title,
  icon,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon}

        <Text style={styles.title}>
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 20,
    padding: 18,
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
    alignItems: 'center',
    marginBottom: 14,
  },

  title: {
    marginLeft: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
  },
});