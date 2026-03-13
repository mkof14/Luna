import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { ContextSignal, ReflectionPayload } from '../types';

export function ReflectionResultScreen({
  userName,
  reflection,
  context,
  recentEntries,
  onSeeRhythm,
  onSave,
  onShare,
  onBackToday,
  hasPattern = true,
}: {
  userName: string;
  reflection: ReflectionPayload;
  context: ContextSignal;
  recentEntries: Array<{ id: string; label: string; text: string }>;
  onSeeRhythm: () => void;
  onSave: () => void;
  onShare: () => void;
  onBackToday: () => void;
  hasPattern?: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.greeting}>Good evening, {userName}</Text>
        <Text style={styles.subline}>Here is your reflection.</Text>
        <Text style={styles.continuity}>{reflection.continuity}</Text>
      </View>

      <SurfaceCard>
        {reflection.shortSummary.map((line) => (
          <Text key={line} style={styles.text}>{line}</Text>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>A small suggestion for tonight</Text>
        {reflection.suggestion.map((line) => (
          <Text key={line} style={styles.text}>{line}</Text>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.text}>Cycle: {context.cycle}</Text>
        <Text style={styles.text}>Energy: {context.energy}</Text>
        <Text style={styles.text}>Mood: {context.mood}</Text>
        <Text style={styles.text}>Sleep: {context.sleep}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Something Luna is starting to notice</Text>
        <Text style={styles.text}>
          {hasPattern
            ? reflection.pattern
            : 'Luna is still learning about you. The more you reflect, the clearer your rhythm becomes.'}
        </Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Recent thread</Text>
        {recentEntries.length === 0 ? (
          <Text style={styles.text}>Your story with Luna is just beginning.</Text>
        ) : (
          recentEntries.slice(0, 4).map((entry) => (
            <View key={entry.id} style={styles.timelineItem}>
              <Text style={styles.timelineLabel}>{entry.label}</Text>
              <Text style={styles.text}>{entry.text}</Text>
            </View>
          ))
        )}
      </SurfaceCard>

      <View style={styles.actionsRow}>
        <LunaButton variant="secondary" onPress={onSeeRhythm}>See your rhythm</LunaButton>
        <LunaButton variant="secondary" onPress={onSave}>Save reflection</LunaButton>
        <LunaButton variant="secondary" onPress={onShare}>Share reflection</LunaButton>
      </View>
      <LunaButton variant="ghost" onPress={onBackToday}>Back to Today</LunaButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  headerWrap: {
    gap: 4,
  },
  greeting: {
    fontSize: 27,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subline: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  continuity: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  actionsRow: {
    gap: 8,
  },
  timelineItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timelineLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.accentStrong,
    fontWeight: '700',
    marginBottom: 4,
  },
});
