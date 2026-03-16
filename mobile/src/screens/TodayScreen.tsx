import React, { useMemo } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageSelector } from '../components/LanguageSelector';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { eveningQuestions } from '../data/mockData';
import { colors } from '../theme/tokens';
import { ContextSignal } from '../types';
import { getMobileCopy, MobileLang, resolveLangBase } from '../i18n/mobileCopy';

export function TodayScreen({
  userName,
  title,
  explanation,
  continuity,
  context,
  remoteError,
  loading,
  onRefresh,
  onSpeak,
  onQuickCheckIn,
  onOpenTodayMirror,
  onOpenMyDay,
  onOpenMonthly,
  onOpenPaywall,
  onWrite,
  onSkip,
  onOpenServices,
  onOpenFooterLinks,
  onOpenSupport,
  onOpenLegal,
  onOpenPublicHome,
  onOpenAuth,
  lang,
  setLang,
  themeMode,
  onToggleTheme,
}: {
  userName: string;
  title: string;
  explanation: string;
  continuity: string;
  context: ContextSignal;
  remoteError?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onSpeak: () => void;
  onQuickCheckIn: () => void;
  onOpenTodayMirror: () => void;
  onOpenMyDay: () => void;
  onOpenMonthly: () => void;
  onOpenPaywall: () => void;
  onWrite: () => void;
  onSkip: () => void;
  onOpenServices: () => void;
  onOpenFooterLinks: () => void;
  onOpenSupport: () => void;
  onOpenLegal: () => void;
  onOpenPublicHome: () => void;
  onOpenAuth: () => void;
  lang: MobileLang;
  setLang: (lang: MobileLang) => void;
  themeMode: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const copy = getMobileCopy(lang);
  const baseLang = resolveLangBase(lang);
  const question = useMemo(() => {
    const index = new Date().getDate() % eveningQuestions.length;
    return eveningQuestions[index];
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SurfaceCard style={styles.controlsCard}>
        <Text style={styles.cardTitle}>{baseLang === 'ru' ? 'Быстрые настройки' : baseLang === 'es' ? 'Controles rapidos' : 'Quick controls'}</Text>
        <LanguageSelector lang={lang} setLang={setLang} />
        <View style={styles.actionsRow}>
          <LunaButton variant="secondary" onPress={onToggleTheme}>
            {(baseLang === 'ru' ? 'Тема' : baseLang === 'es' ? 'Tema' : 'Theme')}: {themeMode === 'light' ? (baseLang === 'ru' ? 'Светлая' : baseLang === 'es' ? 'Claro' : 'Light') : (baseLang === 'ru' ? 'Темная' : baseLang === 'es' ? 'Oscuro' : 'Dark')}
          </LunaButton>
          <LunaButton variant="secondary" onPress={onOpenServices}>{baseLang === 'ru' ? 'Меню' : baseLang === 'es' ? 'Menu' : 'Menu'}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenFooterLinks}>{baseLang === 'ru' ? 'Футер' : baseLang === 'es' ? 'Footer' : 'Footer'}</LunaButton>
        </View>
      </SurfaceCard>

      <ImageBackground source={require('../../assets/bg-soft-2.webp')} imageStyle={styles.leadImage} style={styles.leadWrap}>
        <View style={styles.leadTint}>
          <View style={styles.headerWrap}>
            <MobileScreenHeader title={`Good evening, ${userName}`} subtitle={title} tone="light" />
            <Text style={styles.explainer}>{explanation}</Text>
          </View>
        </View>
      </ImageBackground>

      {remoteError ? (
        <SurfaceCard style={styles.errorCard}>
          <Text style={styles.errorText}>{remoteError}</Text>
        </SurfaceCard>
      ) : null}

      <SurfaceCard style={styles.mainActionCard}>
        <Text style={styles.cardTitle}>{copy.today.reflection}</Text>
        <Text style={styles.detail}>{copy.today.chooseAction}</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onSpeak}>{copy.today.speak}</LunaButton>
          <LunaButton variant="secondary" onPress={onQuickCheckIn}>{copy.today.quick}</LunaButton>
        </View>
        {onRefresh ? (
          <LunaButton variant="ghost" onPress={onRefresh}>{loading ? (baseLang === 'ru' ? 'Обновляем...' : baseLang === 'es' ? 'Actualizando...' : 'Refreshing...') : copy.today.refresh}</LunaButton>
        ) : null}
      </SurfaceCard>

      <SurfaceCard style={styles.contextCard}>
        <Text style={styles.cardTitle}>Today</Text>
        <View style={styles.signalGrid}>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Cycle</Text>
            <Text style={styles.signalValue}>{context.cycle}</Text>
          </View>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Energy</Text>
            <Text style={styles.signalValue}>{context.energy}</Text>
          </View>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Mood</Text>
            <Text style={styles.signalValue}>{context.mood}</Text>
          </View>
          <View style={styles.signalPill}>
            <Text style={styles.signalLabel}>Sleep</Text>
            <Text style={styles.signalValue}>{context.sleep}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.servicesCard}>
        <Text style={styles.cardTitle}>Menu</Text>
        <View style={styles.actionsRow}>
          <LunaButton variant="secondary" onPress={onOpenPublicHome}>Public Home</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenServices}>{copy.today.services}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenTodayMirror}>Today Mirror</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMyDay}>My Day</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMonthly}>Your Month</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenPaywall}>Unlock Insights</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenSupport}>Support</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenLegal}>Legal</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAuth}>Sign in / Admin</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.continuityCard}>
        <Text style={styles.cardTitle}>Continuity</Text>
        <Text style={styles.detail}>{continuity}</Text>
        <Text style={styles.detailStrong}>How does today feel compared to yesterday?</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Evening Reflection</Text>
        <Text style={styles.detail}>A small reflection for tonight</Text>
        <Text style={styles.detailStrong}>{question}</Text>
        <View style={styles.actionsRow}>
          <LunaButton onPress={onSpeak}>Speak</LunaButton>
          <LunaButton variant="secondary" onPress={onWrite}>Write</LunaButton>
          <LunaButton variant="ghost" onPress={onSkip}>Skip today</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Footer</Text>
        <View style={styles.actionsRow}>
          <LunaButton variant="secondary" onPress={onOpenSupport}>Support & FAQ</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenLegal}>Legal & Privacy</LunaButton>
          <LunaButton variant="ghost" onPress={onOpenPublicHome}>Back to Public Home</LunaButton>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 15,
  },
  controlsCard: {
    backgroundColor: 'rgba(255, 248, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  headerWrap: {
    gap: 5,
    paddingTop: 2,
  },
  leadWrap: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(198, 165, 223, 0.58)',
    minHeight: 196,
  },
  leadImage: {
    resizeMode: 'cover',
  },
  leadTint: {
    flex: 1,
    padding: 18,
    backgroundColor: 'rgba(72, 49, 88, 0.17)',
  },
  greeting: {
    display: 'none',
  },
  sectionTitle: {
    display: 'none',
  },
  explainer: {
    fontSize: 15,
    lineHeight: 22,
    color: '#f6ebf9',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#4a3960',
  },
  detail: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  detailStrong: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4e3d66',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  signalGrid: {
    gap: 8,
  },
  signalPill: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.72)',
    backgroundColor: 'rgba(255, 250, 255, 0.86)',
  },
  signalLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    color: colors.textMuted,
  },
  signalValue: {
    marginTop: 3,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  errorCard: {
    borderColor: '#e5c2cf',
    backgroundColor: '#fff3f8',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9d4d67',
    fontWeight: '600',
  },
  mainActionCard: {
    backgroundColor: 'rgba(255, 246, 255, 0.92)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  contextCard: {
    backgroundColor: 'rgba(247, 239, 255, 0.82)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  servicesCard: {
    backgroundColor: 'rgba(255, 251, 255, 0.9)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
  continuityCard: {
    backgroundColor: 'rgba(244, 236, 253, 0.82)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
});
