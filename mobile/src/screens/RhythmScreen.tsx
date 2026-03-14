import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { defaultContextSignal } from '../data/mockData';
import { colors } from '../theme/tokens';

export function RhythmScreen({ stage, onBack }: { stage: 1 | 2 | 3; onBack?: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Rhythm" subtitle="A calm view of your cycle, energy, mood, and sleep trends." onBack={onBack} />

      <SurfaceCard>
        <Text style={styles.cardTitle}>Today rhythm</Text>
        <View style={styles.row}><Text style={styles.label}>Cycle</Text><Text style={styles.value}>{defaultContextSignal.cycle}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Energy</Text><Text style={styles.value}>{defaultContextSignal.energy}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Mood</Text><Text style={styles.value}>{defaultContextSignal.mood}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Sleep</Text><Text style={styles.value}>{defaultContextSignal.sleep}</Text></View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Something Luna is starting to notice</Text>
        {stage === 1 ? <Text style={styles.text}>Today may feel slower because sleep was shorter.</Text> : null}
        {stage === 2 ? <Text style={styles.text}>Energy often drops when sleep is shorter.</Text> : null}
        {stage === 3 ? (
          <View style={styles.stack}>
            <Text style={styles.text}>Your energy tends to dip before your cycle.</Text>
            <Text style={styles.text}>Sleep affects mood during the week.</Text>
          </View>
        ) : null}
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
    display: 'none',
  },
  subtitle: {
    display: 'none',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
  value: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  stack: {
    gap: 8,
  },
});
