import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang } from '../i18n/mobileCopy';
import { loadSectionState, saveSectionState } from '../services/mobileState';

export function ResetRoomMobileScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = {
    en: { title: 'Reset Room', subtitle: 'A quiet place when everything feels too much.' },
    ru: { title: 'Reset Room', subtitle: 'Тихое пространство, когда всего слишком много.' },
    es: { title: 'Reset Room', subtitle: 'Un espacio tranquilo cuando todo se siente demasiado.' },
  }[lang];

  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    void (async () => {
      const loaded = await loadSectionState('reset_room', { seconds: 60, running: false });
      setSeconds(typeof loaded.seconds === 'number' ? loaded.seconds : 60);
      setRunning(Boolean(loaded.running) && (typeof loaded.seconds === 'number' ? loaded.seconds > 0 : true));
    })();
  }, []);

  useEffect(() => {
    void saveSectionState('reset_room', { seconds, running });
  }, [seconds, running]);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      return;
    }
    const timer = setInterval(() => setSeconds((current) => (current > 0 ? current - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [running, seconds]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.text}>Pause for one minute, breathe slower, and choose one gentle next step.</Text>
        <View style={styles.timerWrap}>
          <Text style={styles.timer}>{seconds}s</Text>
        </View>
        <View style={styles.stack}>
          <LunaButton variant={running ? 'secondary' : 'primary'} onPress={() => setRunning((current) => !current)}>
            {running ? 'Pause' : 'Start 60s reset'}
          </LunaButton>
          <LunaButton variant="ghost" onPress={() => { setSeconds(60); setRunning(false); }}>
            Reset timer
          </LunaButton>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  heroCard: { minHeight: 132, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  timerWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
    paddingVertical: 14,
    alignItems: 'center',
  },
  timer: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  stack: { gap: 8 },
});
