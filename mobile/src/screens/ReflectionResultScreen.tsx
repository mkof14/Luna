import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { defaultContextSignal, defaultReflectionResult } from '../data/mockData';
import { colors } from '../theme/tokens';

export function ReflectionResultScreen({
  onSeeRhythm,
  onSave,
  onShare,
  onBackToday,
  hasPattern = true,
}: {
  onSeeRhythm: () => void;
  onSave: () => void;
  onShare: () => void;
  onBackToday: () => void;
  hasPattern?: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.greeting}>Good evening, Anna</Text>
        <Text style={styles.subline}>Here is your reflection.</Text>
      </View>

      <SurfaceCard>
        {defaultReflectionResult.shortSummary.map((line) => (
          <Text key={line} style={styles.text}>{line}</Text>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>A small suggestion for tonight</Text>
        {defaultReflectionResult.suggestion.map((line) => (
          <Text key={line} style={styles.text}>{line}</Text>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.text}>Cycle{"\n"}{defaultContextSignal.cycle}</Text>
        <Text style={styles.text}>Energy{"\n"}{defaultContextSignal.energy}</Text>
        <Text style={styles.text}>Mood{"\n"}{defaultContextSignal.mood}</Text>
        <Text style={styles.text}>Sleep{"\n"}{defaultContextSignal.sleep}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Something Luna is starting to notice</Text>
        <Text style={styles.text}>
          {hasPattern
            ? defaultReflectionResult.pattern
            : 'Luna is still learning about you. The more you reflect, the clearer your rhythm becomes.'}
        </Text>
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
});
