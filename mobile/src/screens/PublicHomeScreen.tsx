import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function PublicHomeScreen({
  onOpenAuth,
  onOpenAboutFlow,
  loading = false,
}: {
  onOpenAuth: () => void;
  onOpenAboutFlow: () => void;
  loading?: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Luna Home</Text>
        <Text style={styles.title}>Your daily emotional mirror</Text>
        <Text style={styles.subtitle}>Understand yourself through body rhythms, daily observations, and voice notes.</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onOpenAuth}>{loading ? 'Loading...' : 'Start today'}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAboutFlow}>See how Luna works</LunaButton>
        </View>
      </View>

      <SurfaceCard>
        <Text style={styles.cardTitle}>A small daily ritual</Text>
        <View style={styles.pillars}>
          <View style={styles.pillar}>
            <Text style={styles.pillarTitle}>Your Body</Text>
            <Text style={styles.pillarText}>Rhythms and gentle context.</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarTitle}>Your Senses</Text>
            <Text style={styles.pillarText}>How the day felt to you.</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarTitle}>Your Words</Text>
            <Text style={styles.pillarText}>Voice notes and reflections.</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>What you can do in one minute</Text>
        <Text style={styles.listItem}>1. Speak to Luna</Text>
        <Text style={styles.listItem}>2. Make a quick check-in</Text>
        <Text style={styles.listItem}>3. Receive a gentle reflection</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    padding: 18,
    gap: 8,
  },
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '700',
    color: colors.textMuted,
  },
  title: {
    fontSize: 33,
    lineHeight: 37,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pillars: {
    gap: 8,
  },
  pillar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  pillarText: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
