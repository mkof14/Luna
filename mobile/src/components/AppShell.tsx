import React, { PropsWithChildren } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

type AppShellProps = PropsWithChildren<{
  padded?: boolean;
  mode?: 'light' | 'dark';
}>;

export function AppShell({ children, padded = false, mode = 'light' }: AppShellProps) {
  const isDark = mode === 'dark';
  return (
    <ImageBackground source={require('../../assets/bg-soft-1.webp')} style={[styles.bg, isDark && styles.bgDark]} imageStyle={[styles.bgImage, isDark && styles.bgImageDark]}>
      <View style={[styles.overlayTop, isDark && styles.overlayTopDark]} />
      <View style={[styles.overlayBottom, isDark && styles.overlayBottomDark]} />
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.page,
  },
  bgDark: {
    backgroundColor: '#0f1421',
  },
  bgImage: {
    resizeMode: 'cover',
    opacity: 0.38,
  },
  bgImageDark: {
    opacity: 0.08,
  },
  overlayTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: '#f2cde7',
    opacity: 0.5,
  },
  overlayTopDark: {
    backgroundColor: '#2f1f4a',
    opacity: 0.62,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: -180,
    left: -80,
    width: 360,
    height: 360,
    borderRadius: 999,
    backgroundColor: '#e7dbff',
    opacity: 0.55,
  },
  overlayBottomDark: {
    backgroundColor: '#1f305d',
    opacity: 0.62,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
});
