import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { SurfaceCard } from '../components/SurfaceCard';
import { getReminderPreview } from '../features/reminders';
import { freeFeatures, paidFeatures } from '../features/subscription';
import { colors } from '../theme/tokens';

export function YouScreen({ dayOfMonth }: { dayOfMonth: number }) {
  const reminder = getReminderPreview(dayOfMonth);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>You</Text>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Profile</Text>
        <Text style={styles.text}>Preferences, privacy, and data controls.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Reminder preview</Text>
        <Text style={styles.text}>{reminder}</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Subscription preparation</Text>
        <Text style={styles.blockTitle}>Free</Text>
        <View style={styles.stack}>{freeFeatures.map((item) => <Text key={item} style={styles.text}>• {item}</Text>)}</View>
        <Text style={styles.blockTitle}>Paid later</Text>
        <View style={styles.stack}>{paidFeatures.map((item) => <Text key={item} style={styles.text}>• {item}</Text>)}</View>
        <LunaButton variant="secondary" onPress={() => {}}>Unlock deeper insights</LunaButton>
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
  title: {
    fontSize: 27,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  blockTitle: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: colors.textMuted,
    fontWeight: '700',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  stack: {
    gap: 4,
  },
});
