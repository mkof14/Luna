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
  { key: 'about', url: 'https://luna-eta-rust.vercel.app/about' },
  { key: 'how', url: 'https://luna-eta-rust.vercel.app/how-it-works' },
  { key: 'contact', url: 'https://luna-eta-rust.vercel.app/contact' },
  { key: 'privacy', url: 'https://luna-eta-rust.vercel.app/privacy' },
  { key: 'terms', url: 'https://luna-eta-rust.vercel.app/terms' },
  { key: 'medical', url: 'https://luna-eta-rust.vercel.app/disclaimer' },
  { key: 'cookies', url: 'https://luna-eta-rust.vercel.app/cookies' },
  { key: 'dataRights', url: 'https://luna-eta-rust.vercel.app/data-rights' },
] as const;

const copyByLang: Record<MobileLang, Record<string, string>> = {
  en: {
    title: 'Footer links',
    subtitle: 'Public and legal links from Luna footer.',
    websiteLinks: 'Website links',
    publicTitle: 'Public pages',
    legalTitle: 'Legal pages',
    internalTitle: 'App navigation',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    about: 'About Luna',
    how: 'How It Works',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    medical: 'Disclaimer',
    cookies: 'Cookies',
    dataRights: 'Data Rights',
    menu: 'Menu',
    member: 'Member Zone',
    admin: 'Admin Zone',
  },
  ru: {
    title: 'Ссылки футера',
    subtitle: 'Публичные и правовые ссылки из футера Luna.',
    websiteLinks: 'Ссылки сайта',
    publicTitle: 'Публичные страницы',
    legalTitle: 'Юридические страницы',
    internalTitle: 'Навигация приложения',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    about: 'About Luna',
    how: 'How It Works',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    medical: 'Disclaimer',
    cookies: 'Cookies',
    dataRights: 'Data Rights',
    menu: 'Меню',
    member: 'Мембер Зона',
    admin: 'Админ Зона',
  },
  es: {
    title: 'Links del footer',
    subtitle: 'Links publicos y legales del footer de Luna.',
    websiteLinks: 'Links del sitio',
    publicTitle: 'Paginas publicas',
    legalTitle: 'Paginas legales',
    internalTitle: 'Navegacion de app',
    home: 'Home',
    ritual: 'Ritual Path',
    body: 'Body Map',
    bridge: 'The Bridge',
    pricing: 'Pricing',
    faq: 'FAQ',
    about: 'About Luna',
    how: 'How It Works',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    medical: 'Disclaimer',
    cookies: 'Cookies',
    dataRights: 'Data Rights',
    menu: 'Menu',
    member: 'Zona miembro',
    admin: 'Zona admin',
  },
};

export function FooterLinksScreen({
  onBack,
  onOpenMemberZone,
  onOpenAdmin,
  onOpenServices,
  lang,
}: {
  onBack: () => void;
  onOpenMemberZone: () => void;
  onOpenAdmin: () => void;
  onOpenServices: () => void;
  lang: MobileLang;
}) {
  const copy = copyByLang[lang];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground source={require('../../assets/bg-soft-3.webp')} imageStyle={styles.heroImage} style={styles.heroCard}>
        <View style={styles.heroOverlay}>
          <MobileScreenHeader title={copy.title} subtitle={copy.subtitle} onBack={onBack} tone="light" />
        </View>
      </ImageBackground>

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.publicTitle}</Text>
        <View style={styles.stack}>
          {links.slice(0, 9).map((item) => (
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

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.legalTitle}</Text>
        <View style={styles.stack}>
          {links.slice(9).map((item) => (
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

      <SurfaceCard style={styles.linksCard}>
        <Text style={styles.cardTitle}>{copy.internalTitle}</Text>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={onOpenServices}>{copy.menu}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenMemberZone}>{copy.member}</LunaButton>
          <LunaButton variant="secondary" onPress={onOpenAdmin}>{copy.admin}</LunaButton>
        </View>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4a3960',
  },
  stack: {
    gap: 8,
  },
  heroCard: {
    minHeight: 146,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(198, 165, 223, 0.58)',
    overflow: 'hidden',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(60, 40, 83, 0.22)',
  },
  linksCard: {
    backgroundColor: 'rgba(255, 249, 255, 0.94)',
    borderColor: 'rgba(209,183,227,0.68)',
  },
});
