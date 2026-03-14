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
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />
        <Text style={styles.eyebrow}>Luna Home</Text>
        <Text style={styles.title}>Your daily emotional mirror</Text>
        <Text style={styles.subtitle}>Understand yourself through body rhythms, daily observations, and voice notes.</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onOpenAuth}>{loading ? 'Loading...' : 'Start today'}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAboutFlow}>See how Luna works</LunaButton>
        </View>
        <Text style={styles.heroHint}>Private. Calm. Personal.</Text>
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

      <SurfaceCard style={styles.patternCard}>
        <Text style={styles.patternLabel}>Pattern preview</Text>
        <Text style={styles.patternText}>Energy can feel lower when sleep is shorter.</Text>
        <Text style={styles.patternText}>Luna helps you notice this early and stay gentle with your day.</Text>
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
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f8eef8',
    padding: 18,
    gap: 8,
  },
  heroGlowTop: {
    position: 'absolute',
    width: 180,
    height: 180,
    right: -40,
    top: -50,
    borderRadius: 999,
    backgroundColor: '#f0d9ff',
    opacity: 0.55,
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 220,
    height: 160,
    left: -60,
    bottom: -60,
    borderRadius: 999,
    backgroundColor: '#fbdde7',
    opacity: 0.5,
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
  heroHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textMuted,
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
    backgroundColor: '#fff9ff',
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
  patternCard: {
    borderColor: '#e9d2ec',
    backgroundColor: '#f9f3fb',
  },
  patternLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  patternText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
