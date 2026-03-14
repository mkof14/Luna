import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function MonthlyReflectionScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Your month with Luna" subtitle="A gentle monthly summary." onBack={onBack} />

      <SurfaceCard>
        <Text style={styles.item}>Your energy tends to dip before your cycle.</Text>
        <Text style={styles.item}>Sleep affects mood during work days.</Text>
        <Text style={styles.item}>Evenings were calmer on days with voice notes.</Text>
      </SurfaceCard>

      <View style={styles.actions}>
        <LunaButton variant="secondary" onPress={() => {}}>Share this reflection</LunaButton>
        <LunaButton variant="ghost" onPress={onBack}>Back to Today</LunaButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  item: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  actions: {
    gap: 8,
  },
});
