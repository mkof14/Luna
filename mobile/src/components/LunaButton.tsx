import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

type LunaButtonProps = PropsWithChildren<{
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}>;

export function LunaButton({ onPress, variant = 'primary', children }: LunaButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'ghost' && styles.ghostText,
          variant === 'danger' && styles.primaryText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 47,
    borderRadius: 999,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#8b68a6',
    shadowOpacity: 0.15,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  primary: {
    borderColor: 'rgba(180,116,213,0.86)',
    backgroundColor: 'rgba(183,109,213,0.94)',
  },
  secondary: {
    borderColor: 'rgba(215,188,234,0.74)',
    backgroundColor: 'rgba(255, 248, 255, 0.9)',
  },
  ghost: {
    borderColor: 'rgba(215,188,234,0.42)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.25,
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
