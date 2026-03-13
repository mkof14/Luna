import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function OnboardingScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Welcome</Text>
      <SurfaceCard>
        <Text style={styles.title}>Welcome to Luna</Text>
        <Text style={styles.text}>
          A quiet place to understand how your body and emotions move together.
        </Text>
        <LunaButton onPress={onBegin}>Begin</LunaButton>
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
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
    color: colors.textMuted,
  },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});
