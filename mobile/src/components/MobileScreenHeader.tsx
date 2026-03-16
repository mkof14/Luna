import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

export function MobileScreenHeader({
  title,
  subtitle,
  onBack,
  tone = 'dark',
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  tone?: 'dark' | 'light';
}) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.backText, tone === 'light' && styles.backTextLight]}>← Back</Text>
        </Pressable>
      ) : null}
      <Text style={[styles.title, tone === 'light' && styles.titleLight]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, tone === 'light' && styles.subtitleLight]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 5,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(215,188,234,0.72)',
    backgroundColor: 'rgba(255, 250, 255, 0.84)',
    shadowColor: '#8f63aa',
    shadowOpacity: 0.15,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  backText: {
    fontSize: 14,
    color: '#8f50ac',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  backTextLight: {
    color: '#f7eefe',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  titleLight: {
    color: '#fff7ff',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  subtitleLight: {
    color: '#f1e4f7',
  },
});
