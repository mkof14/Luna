import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

type LunaButtonProps = PropsWithChildren<{
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}>;

export function LunaButton({ onPress, variant = 'primary', children }: LunaButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.base, variant === 'primary' && styles.primary, variant === 'secondary' && styles.secondary, variant === 'ghost' && styles.ghost, variant === 'danger' && styles.danger]}>
      <Text style={[styles.text, variant === 'primary' && styles.primaryText, variant === 'secondary' && styles.secondaryText, variant === 'ghost' && styles.ghostText, variant === 'danger' && styles.primaryText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {
    borderColor: colors.accentStrong,
    backgroundColor: colors.accentStrong,
  },
  secondary: {
    borderColor: colors.border,
    backgroundColor: colors.cardStrong,
  },
  ghost: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  danger: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  ghostText: {
    color: colors.accentStrong,
  },
});
