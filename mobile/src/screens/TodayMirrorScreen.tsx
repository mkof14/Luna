import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { ContextSignal } from '../types';
import { colors } from '../theme/tokens';

export function TodayMirrorScreen({
  userName,
  explanation,
  continuity,
  context,
  onSpeak,
  onQuickCheckIn,
  onBack,
}: {
  userName: string;
  explanation: string;
  continuity: string;
  context: ContextSignal;
  onSpeak: () => void;
  onQuickCheckIn: () => void;
  onBack: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title={`Good evening, ${userName}`} subtitle="Today with Luna" onBack={onBack} />

      <SurfaceCard>
        <Text style={styles.text}>{explanation}</Text>
        <Text style={styles.textStrong}>How does today feel compared to yesterday?</Text>
        <Text style={styles.textMuted}>{continuity}</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onSpeak}>Speak to Luna</LunaButton>
          <LunaButton variant="secondary" onPress={onQuickCheckIn}>Quick check-in</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.sectionTitle}>Today</Text>
        <View style={styles.signalGrid}>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>Cycle</Text><Text style={styles.signalValue}>{context.cycle}</Text></View>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>Energy</Text><Text style={styles.signalValue}>{context.energy}</Text></View>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>Mood</Text><Text style={styles.signalValue}>{context.mood}</Text></View>
          <View style={styles.signalPill}><Text style={styles.signalLabel}>Sleep</Text><Text style={styles.signalValue}>{context.sleep}</Text></View>
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  textStrong: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  textMuted: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
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
