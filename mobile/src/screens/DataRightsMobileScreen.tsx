import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { colors } from '../theme/tokens';

export function DataRightsMobileScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="Data Rights" subtitle="Access, correction, export, deletion." onBack={onBack} />
      <SurfaceCard>
        <Text style={styles.text}>You can request access, correction, export, or deletion of your personal data under applicable privacy laws.</Text>
      </SurfaceCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  text: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
});
