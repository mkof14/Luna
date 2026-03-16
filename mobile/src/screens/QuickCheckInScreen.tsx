import React, { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang } from '../i18n/mobileCopy';

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

const copyByLang: Record<MobileLang, Record<string, string>> = {
  en: {
    title: 'Quick check-in',
    subtitle: 'A calm 30-second snapshot for tonight.',
    energy: 'Energy',
    mood: 'Mood',
    stress: 'Stress',
    sleep: 'Sleep',
    snapshot: 'Tonight snapshot',
    save: 'Save check-in',
    quickSummary: 'Quick check-in today',
  },
  ru: {
    title: 'Быстрый check-in',
    subtitle: 'Спокойный снимок состояния за 30 секунд.',
    energy: 'Энергия',
    mood: 'Настроение',
    stress: 'Стресс',
    sleep: 'Сон',
    snapshot: 'Снимок вечера',
    save: 'Сохранить check-in',
    quickSummary: 'Быстрый check-in сегодня',
  },
  es: {
    title: 'Check-in rapido',
    subtitle: 'Una vista tranquila de 30 segundos para esta noche.',
    energy: 'Energia',
    mood: 'Estado de animo',
    stress: 'Estres',
    sleep: 'Sueno',
    snapshot: 'Resumen de esta noche',
    save: 'Guardar check-in',
    quickSummary: 'Check-in rapido de hoy',
  },
};

export function QuickCheckInScreen({
  onBack,
  onSubmit,
  lang,
}: {
  onBack: () => void;
  onSubmit: (entryText: string) => void;
  lang: MobileLang;
}) {
  const copy = copyByLang[lang];
  const [energy, setEnergy] = useState<(typeof energyOptions)[number]>('Medium');
  const [mood, setMood] = useState<(typeof moodOptions)[number]>('Sensitive');
  const [stress, setStress] = useState<(typeof stressOptions)[number]>('Medium');
  const [sleep, setSleep] = useState<(typeof sleepOptions)[number]>('Okay');

  const entryText = `${copy.quickSummary}: ${copy.energy.toLowerCase()} ${energy.toLowerCase()}, ${copy.mood.toLowerCase()} ${mood.toLowerCase()}, ${copy.stress.toLowerCase()} ${stress.toLowerCase()}, ${copy.sleep.toLowerCase()} ${sleep.toLowerCase()}.`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.energy}</Text>
        <View style={styles.row}>
          {energyOptions.map((option) => (
            <ChoicePill key={option} selected={option === energy} label={option} onPress={() => setEnergy(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.mood}</Text>
        <View style={styles.row}>
          {moodOptions.map((option) => (
            <ChoicePill key={option} selected={option === mood} label={option} onPress={() => setMood(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.stress}</Text>
        <View style={styles.row}>
          {stressOptions.map((option) => (
            <ChoicePill key={option} selected={option === stress} label={option} onPress={() => setStress(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.sleep}</Text>
        <View style={styles.row}>
          {sleepOptions.map((option) => (
            <ChoicePill key={option} selected={option === sleep} label={option} onPress={() => setSleep(option)} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.previewCard}>
        <Text style={styles.previewTitle}>{copy.snapshot}</Text>
        <Text style={styles.previewText}>{entryText}</Text>
      </SurfaceCard>

      <View style={styles.actions}>
        <LunaButton onPress={() => onSubmit(entryText)}>{copy.save}</LunaButton>
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
  heroCard: {
    minHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(58, 40, 80, 0.25)',
  },
  previewCard: {
    backgroundColor: 'rgba(245, 236, 253, 0.84)',
  },
});
