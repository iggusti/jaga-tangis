import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { isMonitoringWindow } from '../utils/timeWindow';

export const BG_TASK = 'jaga-tangis-bg';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export function defineBackgroundTask(callback) {
  TaskManager.defineTask(BG_TASK, async () => {
    if (!isMonitoringWindow(new Date())) return;
    try {
      const hit = await callback?.();
      if (hit) {
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Jaga Tangis', body: 'Tangisan terdeteksi' },
          trigger: null,
        });
      }
    } catch {}
  });
}

export async function registerBackgroundTaskAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(BG_TASK);
    if (!registered) {
      await Notifications.scheduleNotificationAsync ? null : null;
    }
  } catch {}
  return true;
}
