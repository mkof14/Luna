import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

const reasons = ['Understand my emotions', 'Track my cycle', 'Reflect on my days', 'Understand my body'] as const;

type OnboardingAction = 'speak' | 'write' | 'skip';

export function OnboardingScreen({
  onBeginVoice,
  onComplete,
}: {
  onBeginVoice: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<(typeof reasons)[number] | null>(null);

  const content = useMemo(() => {
    if (step === 1) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>Welcome to Luna</Text>
          <Text style={styles.text}>A quiet place to understand how your body and emotions move together.</Text>
          <LunaButton onPress={() => setStep(2)}>Begin</LunaButton>
        </SurfaceCard>
      );
    }

    if (step === 2) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>What brought you to Luna?</Text>
          <View style={styles.optionsWrap}>
            {reasons.map((item) => (
              <Pressable key={item} onPress={() => setReason(item)} style={[styles.option, reason === item && styles.optionActive]}>
                <Text style={[styles.optionText, reason === item && styles.optionTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <LunaButton onPress={() => setStep(3)}>Continue</LunaButton>
        </SurfaceCard>
      );
    }

    if (step === 3) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>Luna works through three simple signals</Text>
          <Text style={styles.signalTitle}>Body</Text>
          <Text style={styles.signalText}>Body rhythm and cycle context.</Text>
          <Text style={styles.signalTitle}>Senses</Text>
          <Text style={styles.signalText}>Daily feelings and emotional tone.</Text>
          <Text style={styles.signalTitle}>Words</Text>
          <Text style={styles.signalText}>Voice notes and short reflections.</Text>
          <LunaButton onPress={() => setStep(4)}>Continue</LunaButton>
        </SurfaceCard>
      );
    }

    if (step === 4) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>Luna becomes more helpful the more you reflect.</Text>
          <Text style={styles.text}>Just 30–60 seconds a day is enough.</Text>
          <LunaButton onPress={() => setStep(5)}>Start my first reflection</LunaButton>
        </SurfaceCard>
      );
    }

    const actions: Array<{ id: OnboardingAction; label: string }> = [
      { id: 'speak', label: 'Speak' },
      { id: 'write', label: 'Write' },
      { id: 'skip', label: 'Skip' },
    ];

    return (
      <SurfaceCard>
        <Text style={styles.title}>How does today feel so far?</Text>
        <View style={styles.actionsRow}>
          {actions.map((action) => (
            <LunaButton
              key={action.id}
              variant={action.id === 'speak' ? 'primary' : action.id === 'write' ? 'secondary' : 'ghost'}
              onPress={() => {
                if (action.id === 'speak') {
                  onBeginVoice();
                  return;
                }
                onComplete();
              }}
            >
              {action.label}
            </LunaButton>
          ))}
        </View>
      </SurfaceCard>
    );
  }, [onBeginVoice, onComplete, reason, step]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Onboarding</Text>
        <Text style={styles.progress}>Step {step} / 5</Text>
      </View>
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    color: colors.textMuted,
  },
  progress: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  optionsWrap: {
    gap: 8,
  },
  option: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  optionText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  optionTextActive: {
    color: colors.textPrimary,
  },
  signalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.accentStrong,
  },
  signalText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});
