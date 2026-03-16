import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { mobileCopy, MobileLang } from '../i18n/mobileCopy';

export function ServicesHubScreen({
  onBack,
  onOpenMemberZone,
  onOpenFooterLinks,
  onOpenAdmin,
  onOpenBodyMap,
  onOpenRitualPath,
  onOpenBridge,
  onOpenKnowledge,
  onOpenHealthReports,
  onOpenSupport,
  onOpenVoice,
  onOpenRelationships,
  onOpenFamily,
  onOpenCreative,
  onOpenMedicationNotes,
  onOpenResetRoom,
  onOpenVoiceFiles,
  onOpenHowItWorks,
  onOpenContact,
  onOpenAbout,
  lang,
}: {
  onBack: () => void;
  onOpenMemberZone: () => void;
  onOpenFooterLinks: () => void;
  onOpenAdmin: () => void;
  onOpenBodyMap: () => void;
  onOpenRitualPath: () => void;
  onOpenBridge: () => void;
  onOpenKnowledge: () => void;
  onOpenHealthReports: () => void;
  onOpenSupport: () => void;
  onOpenVoice: () => void;
  onOpenRelationships: () => void;
  onOpenFamily: () => void;
  onOpenCreative: () => void;
  onOpenMedicationNotes: () => void;
  onOpenResetRoom: () => void;
  onOpenVoiceFiles: () => void;
  onOpenHowItWorks: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
  lang: MobileLang;
}) {
  const copy = mobileCopy[lang].services;
  const extraCopy: Record<string, string> = {
    en: {
      relationships: 'Relationships',
      family: 'Family',
      creative: 'Creative Studio',
      meds: 'Medication Notes',
      reset: 'Reset Room',
      voiceFiles: 'My Voice Files',
      how: 'How Luna works',
      contact: 'Contact',
      about: 'About Luna',
      includesTitle: 'What Luna services include',
      voiceTitle: 'Voice notes',
      voiceText: 'Speak naturally and receive a calm response.',
      reportsTitle: 'Health reports',
      reportsText: 'Build a simple report for doctor visits and sharing.',
      contextTitle: 'Body context',
      contextText: 'Read cycle, mood, sleep, and energy in one place.',
      safetyTitle: 'Support and safety',
      safetyText: 'FAQ, partner guidance, legal and privacy controls.',
      quickNav: 'Quick navigation',
      member: 'Member Zone',
      footer: 'Footer Links',
      admin: 'Admin Zone',
    },
    ru: {
      relationships: 'Relationships',
      family: 'Family',
      creative: 'Creative Studio',
      meds: 'Medication Notes',
      reset: 'Reset Room',
      voiceFiles: 'My Voice Files',
      how: 'Как работает Luna',
      contact: 'Контакты',
      about: 'О Luna',
      includesTitle: 'Что включает сервис Luna',
      voiceTitle: 'Голосовые заметки',
      voiceText: 'Говорите свободно и получайте спокойный ответ.',
      reportsTitle: 'Health Reports',
      reportsText: 'Создавайте простой отчет для врача и обмена.',
      contextTitle: 'Контекст тела',
      contextText: 'Цикл, настроение, сон и энергия в одном месте.',
      safetyTitle: 'Поддержка и безопасность',
      safetyText: 'FAQ, guidance для партнера, legal и privacy-контроли.',
      quickNav: 'Быстрая навигация',
      member: 'Мембер Зона',
      footer: 'Ссылки футера',
      admin: 'Админ Зона',
    },
    es: {
      relationships: 'Relationships',
      family: 'Family',
      creative: 'Creative Studio',
      meds: 'Medication Notes',
      reset: 'Reset Room',
      voiceFiles: 'My Voice Files',
      how: 'Como funciona Luna',
      contact: 'Contacto',
      about: 'Sobre Luna',
      includesTitle: 'Que incluyen los servicios de Luna',
      voiceTitle: 'Notas de voz',
      voiceText: 'Habla con naturalidad y recibe una respuesta calmada.',
      reportsTitle: 'Health Reports',
      reportsText: 'Crea un informe simple para visitas medicas y compartir.',
      contextTitle: 'Contexto corporal',
      contextText: 'Ciclo, estado, sueno y energia en un solo lugar.',
      safetyTitle: 'Soporte y seguridad',
      safetyText: 'FAQ, guia para pareja, controles legales y de privacidad.',
      quickNav: 'Navegacion rapida',
      member: 'Zona miembro',
      footer: 'Links del footer',
      admin: 'Zona admin',
    },
  }[lang];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} />

      <ImageBackground source={require('../../assets/home-hero.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
          <Text style={styles.heroText}>{copy.heroText}</Text>
          <LunaButton onPress={onOpenVoice}>{copy.speak}</LunaButton>
        </View>
      </ImageBackground>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{extraCopy.quickNav}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenMemberZone}>{extraCopy.member}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenFooterLinks}>{extraCopy.footer}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAdmin}>{extraCopy.admin}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>{copy.coreSections}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenBodyMap}>{copy.bodyMap}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenRitualPath}>{copy.ritualPath}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenBridge}>{copy.bridge}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenKnowledge}>{copy.knowledge}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenHealthReports}>{copy.reports}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenSupport}>{copy.support}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenRelationships}>{extraCopy.relationships}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenFamily}>{extraCopy.family}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenCreative}>{extraCopy.creative}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMedicationNotes}>{extraCopy.meds}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenResetRoom}>{extraCopy.reset}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenVoiceFiles}>{extraCopy.voiceFiles}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenHowItWorks}>{extraCopy.how}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenContact}>{extraCopy.contact}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAbout}>{extraCopy.about}</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.infoCard}>
        <Text style={styles.cardTitle}>{extraCopy.includesTitle}</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.voiceTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.voiceText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.reportsTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.reportsText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.contextTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.contextText}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoTitle}>{extraCopy.safetyTitle}</Text>
            <Text style={styles.infoText}>{extraCopy.safetyText}</Text>
          </View>
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
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 260,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(72, 47, 88, 0.28)',
    padding: 18,
    justifyContent: 'flex-end',
    gap: 8,
  },
  heroTitle: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '700',
    color: '#fff',
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#f8edf7',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stack: {
    gap: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.84)',
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(248, 238, 253, 0.8)',
    paddingHorizontal: 11,
    paddingVertical: 10,
    gap: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
