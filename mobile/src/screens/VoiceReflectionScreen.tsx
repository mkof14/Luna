import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function VoiceReflectionScreen({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setSeconds((current) => {
        if (current >= 60) {
          setRecording(false);
          return 60;
        }
        return current + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [recording]);

  const waveform = useMemo(() => {
    const amplitude = recording ? (seconds % 8) + 4 : 2;
    return new Array(12).fill(null).map((_, index) => {
      const relative = ((index + amplitude) % 6) + 1;
      return relative;
    });
  }, [recording, seconds]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Speak freely. Luna is listening.</Text>

      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.cardTitle}>Voice Reflection</Text>
        <Text style={styles.text}>Record a short reflection about how you feel and what happened during your day.</Text>
        <View style={[styles.recordOrb, recording && styles.recordOrbActive]}>
          <Text style={styles.recordOrbLabel}>{recording ? 'Recording' : 'Ready'}</Text>
          <Text style={styles.timer}>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</Text>
        </View>
        <View style={styles.waveWrap}>
          {waveform.map((bar, index) => (
            <View key={index} style={[styles.waveBar, { height: 6 + bar * 4, opacity: recording ? 0.9 : 0.35 }]} />
          ))}
        </View>
        <Text style={styles.textMuted}>30–60 seconds is enough.</Text>

        <View style={styles.actionsRow}>
          {!recording ? (
            <LunaButton onPress={() => setRecording(true)}>Tap to record</LunaButton>
          ) : (
            <LunaButton variant="danger" onPress={() => setRecording(false)}>Stop</LunaButton>
          )}
          <LunaButton variant="secondary" onPress={onFinish}>Finish</LunaButton>
          <LunaButton variant="ghost" onPress={onBack}>Discard</LunaButton>
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
  headerTitle: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroCard: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  textMuted: {
    fontSize: 13,
    color: colors.textMuted,
  },
  recordOrb: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recordOrbActive: {
    borderColor: colors.danger,
    backgroundColor: '#ffe8ef',
  },
  recordOrbLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '700',
  },
  timer: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  waveWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    minHeight: 32,
  },
  waveBar: {
    width: 8,
    borderRadius: 99,
    backgroundColor: colors.accent,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
