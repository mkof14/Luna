import React, { useMemo, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { mobileCopy, MobileLang } from '../i18n/mobileCopy';

type OnboardingAction = 'speak' | 'write' | 'skip';

export function OnboardingScreen({
  onBeginVoice,
  onComplete,
  lang,
}: {
  onBeginVoice: () => void;
  onComplete: () => void;
  lang: MobileLang;
}) {
  const copy = mobileCopy[lang].onboarding;
  const localized = {
    reasonTitle: lang === 'ru' ? 'Что привело вас в Luna?' : lang === 'es' ? 'Que te trajo a Luna?' : 'What brought you to Luna?',
    reasons:
      lang === 'ru'
        ? ['Понять эмоции', 'Отслеживать цикл', 'Отражать свой день', 'Понять тело']
        : lang === 'es'
          ? ['Entender mis emociones', 'Seguir mi ciclo', 'Reflexionar sobre mis dias', 'Entender mi cuerpo']
          : ['Understand my emotions', 'Track my cycle', 'Reflect on my days', 'Understand my body'],
    signalsTitle:
      lang === 'ru'
        ? 'Luna работает через три простых сигнала'
        : lang === 'es'
          ? 'Luna funciona a traves de tres senales simples'
          : 'Luna works through three simple signals',
    body: lang === 'ru' ? 'Тело' : lang === 'es' ? 'Cuerpo' : 'Body',
    bodyText:
      lang === 'ru'
        ? 'Ритмы тела и контекст цикла.'
        : lang === 'es'
          ? 'Ritmo corporal y contexto del ciclo.'
          : 'Body rhythm and cycle context.',
    senses: lang === 'ru' ? 'Ощущения' : lang === 'es' ? 'Sensaciones' : 'Senses',
    sensesText:
      lang === 'ru'
        ? 'Ежедневные чувства и эмоциональный тон.'
        : lang === 'es'
          ? 'Sensaciones diarias y tono emocional.'
          : 'Daily feelings and emotional tone.',
    words: lang === 'ru' ? 'Слова' : lang === 'es' ? 'Palabras' : 'Words',
    wordsText:
      lang === 'ru'
        ? 'Голосовые заметки и короткие отражения.'
        : lang === 'es'
          ? 'Notas de voz y reflexiones cortas.'
          : 'Voice notes and short reflections.',
    helpfulTitle:
      lang === 'ru'
        ? 'Luna становится полезнее, когда вы отражаете день регулярно.'
        : lang === 'es'
          ? 'Luna se vuelve mas util cuanto mas reflexionas.'
          : 'Luna becomes more helpful the more you reflect.',
    helpfulText:
      lang === 'ru'
        ? 'Достаточно 30–60 секунд в день.'
        : lang === 'es'
          ? 'Solo 30-60 segundos al dia son suficientes.'
          : 'Just 30-60 seconds a day is enough.',
    startFirst:
      lang === 'ru' ? 'Начать первую заметку' : lang === 'es' ? 'Empezar mi primera reflexion' : 'Start my first reflection',
    onboarding: lang === 'ru' ? 'Онбординг' : lang === 'es' ? 'Onboarding' : 'Onboarding',
    step: lang === 'ru' ? 'Шаг' : lang === 'es' ? 'Paso' : 'Step',
    speak: lang === 'ru' ? 'Голос' : lang === 'es' ? 'Hablar' : 'Speak',
    write: lang === 'ru' ? 'Текст' : lang === 'es' ? 'Escribir' : 'Write',
    skip: lang === 'ru' ? 'Пропустить' : lang === 'es' ? 'Saltar' : 'Skip',
  };
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState<string | null>(null);

  const content = useMemo(() => {
    if (step === 1) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>{copy.welcome}</Text>
          <Text style={styles.text}>{copy.welcomeBody}</Text>
          <LunaButton onPress={() => setStep(2)}>{copy.begin}</LunaButton>
        </SurfaceCard>
      );
    }

    if (step === 2) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>{localized.reasonTitle}</Text>
          <View style={styles.optionsWrap}>
            {localized.reasons.map((item) => (
              <Pressable key={item} onPress={() => setReason(item)} style={[styles.option, reason === item && styles.optionActive]}>
                <Text style={[styles.optionText, reason === item && styles.optionTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <LunaButton onPress={() => setStep(3)}>{copy.continue}</LunaButton>
        </SurfaceCard>
      );
    }

    if (step === 3) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>{localized.signalsTitle}</Text>
          <Text style={styles.signalTitle}>{localized.body}</Text>
          <Text style={styles.signalText}>{localized.bodyText}</Text>
          <Text style={styles.signalTitle}>{localized.senses}</Text>
          <Text style={styles.signalText}>{localized.sensesText}</Text>
          <Text style={styles.signalTitle}>{localized.words}</Text>
          <Text style={styles.signalText}>{localized.wordsText}</Text>
          <LunaButton onPress={() => setStep(4)}>{copy.continue}</LunaButton>
        </SurfaceCard>
      );
    }

    if (step === 4) {
      return (
        <SurfaceCard>
          <Text style={styles.title}>{localized.helpfulTitle}</Text>
          <Text style={styles.text}>{localized.helpfulText}</Text>
          <LunaButton onPress={() => setStep(5)}>{localized.startFirst}</LunaButton>
        </SurfaceCard>
      );
    }

    const actions: Array<{ id: OnboardingAction; label: string }> = [
      { id: 'speak', label: localized.speak },
      { id: 'write', label: localized.write },
      { id: 'skip', label: localized.skip },
    ];

    return (
      <SurfaceCard>
        <Text style={styles.title}>{copy.firstQuestion}</Text>
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
              {action.id === 'speak' ? copy.speak : action.id === 'write' ? copy.write : copy.skip}
            </LunaButton>
          ))}
        </View>
      </SurfaceCard>
    );
  }, [copy.begin, copy.continue, copy.firstQuestion, copy.skip, copy.speak, copy.welcome, copy.welcomeBody, copy.write, localized.body, localized.bodyText, localized.helpfulText, localized.helpfulTitle, localized.reasonTitle, localized.reasons, localized.senses, localized.sensesText, localized.signalsTitle, localized.speak, localized.skip, localized.startFirst, localized.words, localized.wordsText, localized.write, onBeginVoice, onComplete, reason, step]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>{localized.onboarding}</Text>
            <Text style={styles.progress}>{localized.step} {step} / 5</Text>
          </View>
        </View>
      </ImageBackground>
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
  heroCard: {
    minHeight: 88,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: 'rgba(67, 44, 92, 0.22)',
  },
  eyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#f6eafa',
  },
  progress: {
    fontSize: 12,
    color: '#f7ecfb',
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
