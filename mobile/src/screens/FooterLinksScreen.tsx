import React from 'react';
import { ImageBackground, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';
import { MobileLang } from '../i18n/mobileCopy';

const links = [
  { key: 'home', url: 'https://luna-eta-rust.vercel.app/' },
  { key: 'ritual', url: 'https://luna-eta-rust.vercel.app/ritual-path' },
  { key: 'body', url: 'https://luna-eta-rust.vercel.app/luna-balance' },
  { key: 'bridge', url: 'https://luna-eta-rust.vercel.app/the-bridge' },
  { key: 'pricing', url: 'https://luna-eta-rust.vercel.app/pricing' },
  { key: 'faq', url: 'https://luna-eta-rust.vercel.app/faq' },
  { key: 'privacy', url: 'https://luna-eta-rust.vercel.app/privacy' },
  { key: 'terms', url: 'https://luna-eta-rust.vercel.app/terms' },
] as const;

const copyByLang: Record<MobileLang, Record<string, string>> = {
  en: {
    title: 'Footer links',
    subtitle: 'Public and legal links from Luna footer.',
    websiteLinks: 'Website links',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  ru: {
    title: 'Ссылки футера',
    subtitle: 'Публичные и правовые ссылки из футера Luna.',
    websiteLinks: 'Ссылки сайта',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  es: {
    title: 'Links del footer',
    subtitle: 'Links publicos y legales del footer de Luna.',
    websiteLinks: 'Links del sitio',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    privacy: 'Privacy',
    terms: 'Terms',
  },
};

export function FooterLinksScreen({ onBack, lang }: { onBack: () => void; lang: MobileLang }) {
  const copy = copyByLang[lang];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.websiteLinks}</Text>
        <View style={styles.stack}>
          {links.map((item) => (
            <LunaButton
              key={item.url}
              variant="secondary"
              onPress={() => {
                void Linking.openURL(item.url);
              }}
            >
              {copy[item.key]}
            </LunaButton>
          ))}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stack: {
    gap: 8,
  },
  heroCard: {
    minHeight: 132,
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
    backgroundColor: 'rgba(60, 40, 83, 0.28)',
  },
  linksCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.86)',
  },
});
