import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { eveningQuestions } from '../data/mockData';
import { colors } from '../theme/tokens';
import { ContextSignal } from '../types';

export function TodayScreen({
  userName,
  title,
  explanation,
  continuity,
  context,
  loading,
  onRefresh,
  onSpeak,
  onQuickCheckIn,
  onWrite,
  onSkip,
}: {
  userName: string;
  title: string;
  explanation: string;
  continuity: string;
  context: ContextSignal;
  loading?: boolean;
  onRefresh?: () => void;
  onSpeak: () => void;
  onQuickCheckIn: () => void;
  onWrite: () => void;
  onSkip: () => void;
}) {
  const question = useMemo(() => {
    const index = new Date().getDate() % eveningQuestions.length;
    return eveningQuestions[index];
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.greeting}>Good evening, {userName}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.explainer}>{explanation}</Text>
      </View>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Today’s reflection</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onSpeak}>Speak to Luna</LunaButton>
          <LunaButton variant="secondary" onPress={onQuickCheckIn}>Quick check-in</LunaButton>
          {onRefresh ? (
            <LunaButton variant="ghost" onPress={onRefresh}>{loading ? 'Refreshing...' : 'Refresh'}</LunaButton>
          ) : null}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Today</Text>
        <View style={styles.signalGrid}>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Cycle</Text>
            <Text style={styles.signalValue}>{context.cycle}</Text>
          </View>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Energy</Text>
            <Text style={styles.signalValue}>{context.energy}</Text>
          </View>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Mood</Text>
            <Text style={styles.signalValue}>{context.mood}</Text>
          </View>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Sleep</Text>
            <Text style={styles.signalValue}>{context.sleep}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Continuity</Text>
        <Text style={styles.detail}>{continuity}</Text>
        <Text style={styles.detailStrong}>How does today feel compared to yesterday?</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Evening Reflection</Text>
        <Text style={styles.detail}>A small reflection for tonight</Text>
        <Text style={styles.detailStrong}>{question}</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onSpeak}>Speak</LunaButton>
          <LunaButton variant="secondary" onPress={onWrite}>Write</LunaButton>
          <LunaButton variant="ghost" onPress={onSkip}>Skip today</LunaButton>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  headerWrap: {
    gap: 5,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 29,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  explainer: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  detail: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  detailStrong: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signalGrid: {
    gap: 8,
  },
  signalPill: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
  },
  signalLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    color: colors.textMuted,
  },
  signalValue: {
    marginTop: 3,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
