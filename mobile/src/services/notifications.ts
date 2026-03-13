export type ReminderPermissionState = 'granted' | 'denied' | 'undetermined';

export async function getReminderPermissionState(): Promise<ReminderPermissionState> {
  // Push provider wiring is prepared for next phase.
  return 'undetermined';
}

export async function requestReminderPermission(): Promise<ReminderPermissionState> {
  // Placeholder: integrate expo-notifications in next phase.
  return 'granted';
}

export async function scheduleEveningReflectionReminder(): Promise<void> {
  // Placeholder: schedule local/push reminder in next phase.
}
