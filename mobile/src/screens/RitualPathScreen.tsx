import React, { useEffect, useMemo, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang, resolveLangBase } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

export function RitualPathScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: {
      title: 'Ritual Path',
      subtitle: 'Morning, midday, evening rhythm.',
      hero: 'A path, not a task list. Keep the signal, drop the noise.',
      m: 'Morning',
      mBody: 'Name your baseline before the world sets your pace.',
      d: 'Midday',
      dBody: 'Re-check capacity and adjust plans with respect for your energy.',
      e: 'Evening',
      eBody: 'Close the day with a short note to preserve signal, not noise.',
    },
    ru: {
      title: 'Ritual Path',
      subtitle: 'Утро, день, вечер в едином ритме.',
      hero: 'Это путь, а не список задач. Сохраняйте сигнал, убирайте шум.',
      m: 'Утро',
      mBody: 'Назовите базовое состояние до того, как мир задаст темп.',
      d: 'День',
      dBody: 'Переоцените ресурс и скорректируйте планы с уважением к энергии.',
      e: 'Вечер',
      eBody: 'Закройте день короткой заметкой, чтобы сохранить сигнал, а не шум.',
    },
    es: {
      title: 'Ritual Path',
      subtitle: 'Ritmo de manana, mediodia y noche.',
      hero: 'Un camino, no una lista de tareas. Conserva la senal, suelta el ruido.',
      m: 'Manana',
      mBody: 'Nombra tu base antes de que el mundo marque tu ritmo.',
      d: 'Mediodia',
      dBody: 'Revisa capacidad y ajusta planes con respeto por tu energia.',
      e: 'Noche',
      eBody: 'Cierra el dia con una nota breve para preservar senal, no ruido.',
    },
  }[resolveLangBase(lang)];

  const [done, setDone] = useState({ morning: false, midday: false, evening: false });

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('ritual_path', { done: { morning: false, midday: false, evening: false } });
      if (loaded && typeof loaded === 'object' && loaded.done && typeof loaded.done === 'object') {
        setDone({
          morning: Boolean((loaded as { done?: { morning?: boolean } }).done?.morning),
          midday: Boolean((loaded as { done?: { midday?: boolean } }).done?.midday),
          evening: Boolean((loaded as { done?: { evening?: boolean } }).done?.evening),
        });
      }
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('ritual_path', { done });
  }, [done]);

  const score = useMemo(() => Object.values(done).filter(Boolean).length, [done]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} />

      <ImageBackground source={require('../../assets/bg-soft-1.webp')} imageStyle={styles.image} style={styles.hero}>
        <View style={styles.overlay}>
          <Text style={styles.heroText}>{copy.hero}</Text>
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.m}</Text>
        <Text style={styles.text}>{copy.mBody}</Text>
        <LunaButton variant={done.morning ? 'primary' : 'secondary'} onPress={() => setDone((c) => ({ ...c, morning: !c.morning }))}>
          {done.morning ? 'Completed' : 'Mark complete'}
        </LunaButton>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.d}</Text>
        <Text style={styles.text}>{copy.dBody}</Text>
        <LunaButton variant={done.midday ? 'primary' : 'secondary'} onPress={() => setDone((c) => ({ ...c, midday: !c.midday }))}>
          {done.midday ? 'Completed' : 'Mark complete'}
        </LunaButton>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.e}</Text>
        <Text style={styles.text}>{copy.eBody}</Text>
        <LunaButton variant={done.evening ? 'primary' : 'secondary'} onPress={() => setDone((c) => ({ ...c, evening: !c.evening }))}>
          {done.evening ? 'Completed' : 'Mark complete'}
        </LunaButton>
      </SurfaceCard>

      <SurfaceCard style={styles.cardAlt}>
        <Text style={styles.cardTitle}>Daily ritual progress</Text>
        <Text style={styles.text}>{score}/3 completed today</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  hero: { minHeight: 165, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  image: { resizeMode: 'cover' },
  overlay: { flex: 1, backgroundColor: 'rgba(55, 42, 75, 0.3)', justifyContent: 'flex-end', padding: 14 },
  heroText: { color: '#fff', fontSize: 16, lineHeight: 22, fontWeight: '600' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  cardAlt: { backgroundColor: 'rgba(248, 239, 255, 0.82)' },
});
