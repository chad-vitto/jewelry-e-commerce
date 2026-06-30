import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Scale, Gem } from 'lucide-react-native';
import { Colors } from '@/constants';

export default function TrustBanner() {
  return (
    <View style={styles.container}>
      <TrustItem icon={<Gem size={14} color={Colors.gold.DEFAULT} />} label="Authentic Gold" />
      <Divider />
      <TrustItem icon={<Scale size={14} color={Colors.gold.DEFAULT} />} label="Verified Weight & Karat" />
      <Divider />
      <TrustItem icon={<ShieldCheck size={14} color={Colors.gold.DEFAULT} />} label="Pawnable Quality" />
    </View>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.item}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -22,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
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
    color: Colors.text.muted,
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