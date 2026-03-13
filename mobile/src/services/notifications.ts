import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type ReminderPermissionState = 'granted' | 'denied' | 'undetermined';

const toReminderPermission = (status: Notifications.PermissionStatus): ReminderPermissionState => {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
};

export async function getReminderPermissionState(): Promise<ReminderPermissionState> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return toReminderPermission(permissions.status);
  } catch {
    return 'undetermined';
  }
}

export async function requestReminderPermission(): Promise<ReminderPermissionState> {
  try {
    const permissions = await Notifications.requestPermissionsAsync();
    return toReminderPermission(permissions.status);
  } catch {
    return 'denied';
  }
}

export async function scheduleEveningReflectionReminder(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('evening-reflection', {
        name: 'Evening Reflection',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Luna',
        body: 'A quiet moment with Luna tonight.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 30,
      },
    });
  } catch {
    // Ignore scheduling failures in development environments.
  }
}
