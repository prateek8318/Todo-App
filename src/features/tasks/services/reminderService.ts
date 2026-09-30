import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { Task } from '../types';

export interface ReminderService {
  scheduleReminder(task: Task): Promise<string | undefined>;
  cancelReminder(notificationId: string): Promise<void>;
}

export const reminderService: ReminderService = {
  scheduleReminder: async (task: Task) => {
    if (!task.dueAt) return undefined;
    
    if (task.dueAt < Date.now()) return undefined;

    const notificationId = task.notificationId || `task-${task.id}`;

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: task.dueAt,
    };

    try {
      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: 'Task Due: ' + task.title,
          body: task.description || 'It is time to complete your task.',
          android: {
            channelId: 'task-reminders',
            sound: 'default',
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger
      );
      return notificationId;
    } catch (e) {
      console.error('Failed to schedule reminder', e);
      return undefined;
    }
  },

  cancelReminder: async (notificationId: string) => {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (e) {
      console.error('Failed to cancel reminder', e);
    }
  }
};
