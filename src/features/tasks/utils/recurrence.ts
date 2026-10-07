import { Task, TaskRepeat } from '../types';

export const repeatLabels: Record<TaskRepeat, string> = {
  none: 'Once',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export const startOfDay = (timestamp: number): number => {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const endOfDay = (timestamp: number): number => {
  const date = new Date(startOfDay(timestamp));
  date.setDate(date.getDate() + 1);
  return date.getTime();
};

export const isTaskForToday = (task: Task, today: number): boolean => {
  const date = task.dueAt ?? task.createdAt;
  return date >= startOfDay(today) && date < endOfDay(today);
};

// Use calendar dates, rather than fixed milliseconds, to preserve local reminder
// times across daylight-saving changes and the original day of monthly routines.
export const nextOccurrence = (dueAt: number, repeat: TaskRepeat, anchorAt = dueAt): number => {
  const date = new Date(dueAt);
  if (repeat === 'monthly') {
    const anchor = new Date(anchorAt);
    const targetMonth = date.getMonth() + 1;
    const lastDay = new Date(date.getFullYear(), targetMonth + 1, 0).getDate();
    date.setDate(1);
    date.setMonth(targetMonth);
    date.setDate(Math.min(anchor.getDate(), lastDay));
    date.setHours(
      anchor.getHours(),
      anchor.getMinutes(),
      anchor.getSeconds(),
      anchor.getMilliseconds(),
    );
  } else if (repeat === 'daily' || repeat === 'weekly') {
    date.setDate(date.getDate() + (repeat === 'daily' ? 1 : 7));
    const anchor = new Date(anchorAt);
    date.setHours(
      anchor.getHours(),
      anchor.getMinutes(),
      anchor.getSeconds(),
      anchor.getMilliseconds(),
    );
  }
  return date.getTime();
};

export const refreshRecurringTask = (task: Task, now: number): Task => {
  if (!task.dueAt || !task.repeat || task.repeat === 'none') return task;
  const today = startOfDay(now);
  let dueAt = task.dueAt;
  const anchor = task.repeatAnchorAt ?? task.dueAt;
  // Skip missed occurrences without duplicating a routine or building a backlog.
  // Daily and weekly jumps keep old persisted tasks inexpensive to refresh.
  if (task.repeat !== 'monthly' && startOfDay(dueAt) < today) {
    const original = new Date(dueAt);
    const current = new Date(today);
    const days = Math.round(
      (Date.UTC(current.getFullYear(), current.getMonth(), current.getDate()) -
        Date.UTC(original.getFullYear(), original.getMonth(), original.getDate())) /
        86400000,
    );
    const period = task.repeat === 'weekly' ? 7 : 1;
    original.setDate(original.getDate() + Math.floor(days / period) * period);
    const anchorDate = new Date(anchor);
    original.setHours(
      anchorDate.getHours(),
      anchorDate.getMinutes(),
      anchorDate.getSeconds(),
      anchorDate.getMilliseconds(),
    );
    dueAt = original.getTime();
  }
  let next = nextOccurrence(dueAt, task.repeat, anchor);
  while (startOfDay(next) <= today) {
    dueAt = next;
    next = nextOccurrence(dueAt, task.repeat, anchor);
  }
  if (dueAt === task.dueAt) return task;
  return {
    ...task,
    dueAt,
    repeatAnchorAt: anchor,
    completed: false,
    completedAt: undefined,
    notificationId: undefined,
    updatedAt: now,
  };
};
