import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { Task } from '../types';
import { buildReminderPlan } from '../utils/reminderPlan';

const fingerprints = new Map<string, string>();
let queue = Promise.resolve();

export const reminderService = {
  // Serialize updates so a rapid edit/delete cannot restore cancelled reminders.
  syncReminders: (tasks: Task[], enabled: boolean): Promise<void> => {
    queue = queue
      .then(async () => {
        const plan = enabled ? buildReminderPlan(tasks, Date.now()) : [];
        const desiredIds = new Set(plan.map(item => item.id));
        const existingIds = await notifee.getTriggerNotificationIds();
        const existing = new Set(existingIds);
        for (const id of existingIds) {
          if (id.startsWith('task-') && !desiredIds.has(id)) {
            await notifee.cancelNotification(id);
            fingerprints.delete(id);
          }
        }
        for (const item of plan) {
          const body = item.task.description || 'A little step for your day. You have got this!';
          const title = `${item.task.repeat && item.task.repeat !== 'none' ? 'Routine' : 'Task'}: ${item.task.title}`;
          const fingerprint = JSON.stringify([title, body, item.timestamp]);
          if (existing.has(item.id) && fingerprints.get(item.id) === fingerprint) continue;
          if (item.timestamp <= Date.now()) continue;
          const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: item.timestamp,
          };
          await notifee.createTriggerNotification(
            {
              id: item.id,
              title,
              body,
              data: { taskId: item.task.id },
              android: {
                channelId: 'task-reminders',
                sound: 'default',
                pressAction: { id: 'default' },
              },
              ios: { sound: 'default' },
            },
            trigger,
          );
          fingerprints.set(item.id, fingerprint);
        }
      })
      .catch(error => {
        console.warn('Task reminders could not be updated.', error);
      });
    return queue;
  },
};
