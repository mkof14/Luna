import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, shadow } from '../theme/tokens';

export function SurfaceCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, shadow.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(209,183,227,0.68)',
    backgroundColor: 'rgba(255, 250, 255, 0.9)',
    padding: 18,
    gap: 12,
  },
});
