import { Task } from '../types';
import { nextOccurrence, refreshRecurringTask } from './recurrence';

export interface PlannedReminder {
  id: string;
  task: Task;
  timestamp: number;
}

export const REMINDER_LIMIT = 40;

// One-shot calendar triggers work consistently on both platforms, including
// monthly routines and routines whose first occurrence is in the future.
export const buildReminderPlan = (
  tasks: Task[],
  now: number,
  limit = REMINDER_LIMIT,
): PlannedReminder[] => {
  const plan: PlannedReminder[] = [];
  for (const original of tasks) {
    const task = refreshRecurringTask(original, now);
    if (!task.dueAt) continue;
    const repeats = task.repeat && task.repeat !== 'none';
    if (!repeats) {
      if (!task.completed && task.dueAt > now) {
        plan.push({ id: `task-${task.id}-${task.dueAt}`, task, timestamp: task.dueAt });
      }
      continue;
    }
    let timestamp = task.dueAt;
    if (task.completed || timestamp <= now) {
      timestamp = nextOccurrence(timestamp, task.repeat!, task.repeatAnchorAt);
    }
    for (let index = 0; index < limit; index++) {
      plan.push({ id: `task-${task.id}-${timestamp}`, task, timestamp });
      timestamp = nextOccurrence(timestamp, task.repeat!, task.repeatAnchorAt ?? task.dueAt);
    }
  }
  return plan.sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id)).slice(0, limit);
};
