import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LunaButton } from '../components/LunaButton';
import { MobileScreenHeader } from '../components/MobileScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { getReminderPreview } from '../features/reminders';
import { freeFeatures, paidFeatures } from '../features/subscription';
import {
  getReminderPermissionState,
  requestReminderPermission,
  scheduleEveningReflectionReminder,
  type ReminderPermissionState,
} from '../services/notifications';
import { colors } from '../theme/tokens';

export function YouScreen({
  dayOfMonth,
  onSignOut,
  onOpenPaywall,
  onOpenMonthly,
  onBack,
}: {
  dayOfMonth: number;
  onSignOut: () => Promise<void>;
  onOpenPaywall?: () => void;
  onOpenMonthly?: () => void;
  onBack?: () => void;
}) {
  const reminder = getReminderPreview(dayOfMonth);
  const [permission, setPermission] = useState<ReminderPermissionState>('undetermined');

  useEffect(() => {
    void (async () => {
      const state = await getReminderPermissionState();
      setPermission(state);
    })();
  }, []);

  async function enableReminders() {
    const state = await requestReminderPermission();
    setPermission(state);
    if (state === 'granted') {
      await scheduleEveningReflectionReminder();
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileScreenHeader title="You" subtitle="Profile, reminders, privacy, and subscription." onBack={onBack} />

      <SurfaceCard>
        <Text style={styles.cardTitle}>Profile</Text>
        <Text style={styles.text}>Preferences, privacy, and data controls.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Reminder preview</Text>
        <Text style={styles.text}>{reminder}</Text>
        <Text style={styles.meta}>Push permission: {permission}</Text>
        <LunaButton variant="secondary" onPress={enableReminders}>Enable evening reminders</LunaButton>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Subscription preparation</Text>
        <Text style={styles.blockTitle}>Free</Text>
        <View style={styles.stack}>{freeFeatures.map((item) => <Text key={item} style={styles.text}>• {item}</Text>)}</View>
        <Text style={styles.blockTitle}>Paid later</Text>
        <View style={styles.stack}>{paidFeatures.map((item) => <Text key={item} style={styles.text}>• {item}</Text>)}</View>
        <View style={styles.stack}>
          <LunaButton variant="secondary" onPress={() => onOpenPaywall?.()}>Unlock deeper insights</LunaButton>
          <LunaButton variant="secondary" onPress={() => onOpenMonthly?.()}>Your month with Luna</LunaButton>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={styles.cardTitle}>Account</Text>
        <LunaButton variant="ghost" onPress={() => void onSignOut()}>Sign out</LunaButton>
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
    display: 'none',
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
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
  stack: {
    gap: 4,
  },
});
