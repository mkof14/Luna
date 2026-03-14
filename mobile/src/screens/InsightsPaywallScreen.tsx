import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function InsightsPaywallScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader
        title="Luna is beginning to understand your rhythm."
        subtitle="Unlock deeper insights about your body, energy, and emotional patterns."
        onBack={onBack}
      />

      <SurfaceCard>
        <Text style={styles.note}>Your energy often drops two days before your cycle begins.</Text>
        <Text style={styles.note}>Short sleep also makes the next day heavier.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.section}>Personal patterns</Text>
        <Text style={styles.section}>Monthly reflections</Text>
        <Text style={styles.section}>Deeper voice insights</Text>
        <Text style={styles.price}>$39 / year or $5.99 / month</Text>
        <LunaButton onPress={() => {}}>Unlock deeper insights</LunaButton>
        <Text style={styles.trial}>7-day free trial · Cancel anytime</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  note: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  section: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  trial: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
