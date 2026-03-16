import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

const TASKS = ['Evening check-in', 'Gentle support message', 'Prepare calmer morning'];

export function FamilyMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: { title: 'Family', subtitle: 'Shared understanding without pressure.', done: 'Done today' },
    ru: { title: 'Семья', subtitle: 'Общее понимание без давления.', done: 'Выполнено сегодня' },
    es: { title: 'Familia', subtitle: 'Entendimiento compartido sin presion.', done: 'Hecho hoy' },
  }[lang];

  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('family', { done: [] as string[] });
      if (Array.isArray(loaded.done)) {
        setDone(loaded.done.filter((item) => typeof item === 'string'));
      }
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('family', { done });
  }, [done]);

  function toggle(item: string) {
    setDone((current) => (current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.text}>Plan one short family check-in each evening: what felt heavy, what helped, and what can be gentler tomorrow.</Text>
      </SurfaceCard>

      <SurfaceCard style={styles.cardAlt}>
        <Text style={styles.cardTitle}>Family plan</Text>
        <View style={styles.stack}>
          {TASKS.map((task) => (
            <LunaButton key={task} variant={done.includes(task) ? 'primary' : 'secondary'} onPress={() => toggle(task)}>
              {task}
            </LunaButton>
          ))}
        </View>
        <Text style={styles.meta}>{copy.done}: {done.length}/{TASKS.length}</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  cardTitle: { fontSize: 18, color: colors.textPrimary, fontWeight: '700' },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  stack: { gap: 8 },
  meta: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
