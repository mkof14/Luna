import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SurfaceCard } from './SurfaceCard';
import { colors } from '../theme/tokens';

export function PlaceholderScreen({
  title,
  subtitle,
  phase = 'Phase 2',
}: {
  title: string;
  subtitle: string;
  phase?: string;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <SurfaceCard>
        <Text style={styles.phase}>{phase}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
  title: {
    fontSize: 27,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  phase: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: colors.accentStrong,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
