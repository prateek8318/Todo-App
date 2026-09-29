import { Task } from '../types';

export interface ReminderService {
  scheduleReminder(task: Task): Promise<string | undefined>;
  cancelReminder(notificationId: string): Promise<void>;
}

export const noOpReminderService: ReminderService = {
  scheduleReminder: async (task) => {
    return undefined; // No-op for now
  },
  cancelReminder: async (notificationId) => {
    // No-op for now
  }
};
