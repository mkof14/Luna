import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

const energyOptions = ['Low', 'Medium', 'High'] as const;
const moodOptions = ['Calm', 'Sensitive', 'Overloaded'] as const;
const stressOptions = ['Low', 'Medium', 'High'] as const;
const sleepOptions = ['Rested', 'Okay', 'Short'] as const;

type ChoicePillProps = {
  selected: boolean;
  label: string;
  onPress: () => void;
};

function ChoicePill({ selected, label, onPress }: ChoicePillProps) {
  return (
    <LunaButton variant={selected ? 'primary' : 'secondary'} onPress={onPress}>
      {label}
    </LunaButton>
  );
}

export function QuickCheckInScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (entryText: string) => void;
}) {
  const [energy, setEnergy] = useState<(typeof energyOptions)[number]>('Medium');
  const [mood, setMood] = useState<(typeof moodOptions)[number]>('Sensitive');
  const [stress, setStress] = useState<(typeof stressOptions)[number]>('Medium');
  const [sleep, setSleep] = useState<(typeof sleepOptions)[number]>('Okay');

  const entryText = `Quick check-in today: energy ${energy.toLowerCase()}, mood ${mood.toLowerCase()}, stress ${stress.toLowerCase()}, sleep ${sleep.toLowerCase()}.`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Quick check-in" subtitle="A calm 30-second snapshot for tonight." onBack={onBack} />

      <SurfaceCard>
        <Text style={styles.cardTitle}>Energy</Text>
        <View style={styles.row}>
          {energyOptions.map((option) => (
            <ChoicePill key={option} selected={option === energy} label={option} onPress={() => setEnergy(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Mood</Text>
        <View style={styles.row}>
          {moodOptions.map((option) => (
            <ChoicePill key={option} selected={option === mood} label={option} onPress={() => setMood(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Stress</Text>
        <View style={styles.row}>
          {stressOptions.map((option) => (
            <ChoicePill key={option} selected={option === stress} label={option} onPress={() => setStress(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Sleep</Text>
        <View style={styles.row}>
          {sleepOptions.map((option) => (
            <ChoicePill key={option} selected={option === sleep} label={option} onPress={() => setSleep(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.previewTitle}>Tonight snapshot</Text>
        <Text style={styles.previewText}>{entryText}</Text>
      </SurfaceCard>

      <View style={styles.actions}>
        <LunaButton onPress={() => onSubmit(entryText)}>Save check-in</LunaButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  previewTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textMuted,
    fontWeight: '700',
  },
  previewText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  actions: {
    gap: 8,
  },
});
