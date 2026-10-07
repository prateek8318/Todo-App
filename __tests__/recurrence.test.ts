import { Task } from '../src/features/tasks/types';
import {
  endOfDay,
  isTaskForToday,
  nextOccurrence,
  refreshRecurringTask,
  startOfDay,
} from '../src/features/tasks/utils/recurrence';
import { buildReminderPlan } from '../src/features/tasks/utils/reminderPlan';

const date = (year: number, month: number, day: number, hour = 9, minute = 0) =>
  new Date(year, month - 1, day, hour, minute).getTime();
const task = (overrides: Partial<Task> = {}): Task => ({
  id: 'routine',
  title: 'Online class',
  priority: 'medium',
  completed: false,
  createdAt: date(2026, 1, 1),
  updatedAt: date(2026, 1, 1),
  ...overrides,
});

describe('calendar routines', () => {
  test('month-end returns to the original day after February', () => {
    const anchor = date(2026, 1, 31, 18, 30);
    const february = nextOccurrence(anchor, 'monthly', anchor);
    expect(february).toBe(date(2026, 2, 28, 18, 30));
    expect(nextOccurrence(february, 'monthly', anchor)).toBe(date(2026, 3, 31, 18, 30));
  });

  test('monthly routines include leap day and year transitions', () => {
    const anchor = date(2028, 1, 31);
    expect(nextOccurrence(anchor, 'monthly', anchor)).toBe(date(2028, 2, 29));
    expect(nextOccurrence(date(2026, 12, 31), 'monthly')).toBe(date(2027, 1, 31));
  });

  test('a completed daily occurrence stays checked today, then resets tomorrow', () => {
    const original = task({
      dueAt: date(2026, 10, 7),
      repeat: 'daily',
      completed: true,
      completedAt: date(2026, 10, 7, 10),
    });
    expect(refreshRecurringTask(original, date(2026, 10, 7, 22))).toBe(original);
    const refreshed = refreshRecurringTask(original, date(2026, 10, 8, 0));
    expect(refreshed.dueAt).toBe(date(2026, 10, 8));
    expect(refreshed.completed).toBe(false);
    expect(refreshed.completedAt).toBeUndefined();
  });

  test('weekly routines keep the same weekday and skip missed weeks', () => {
    const original = task({ dueAt: date(2026, 10, 5, 14), repeat: 'weekly', completed: true });
    expect(refreshRecurringTask(original, date(2026, 10, 11))).toBe(original);
    expect(refreshRecurringTask(original, date(2026, 10, 21)).dueAt).toBe(date(2026, 10, 19, 14));
  });

  test('monthly refresh preserves its anchor through missed months', () => {
    const original = task({ dueAt: date(2026, 1, 31), repeat: 'monthly', completed: true });
    const refreshed = refreshRecurringTask(original, date(2026, 3, 31, 0));
    expect(refreshed.dueAt).toBe(date(2026, 3, 31));
    expect(refreshed.repeatAnchorAt).toBe(original.dueAt);
    expect(refreshed.completed).toBe(false);
  });

  test('one-time and future routines do not reset', () => {
    const once = task({ dueAt: date(2026, 1, 1), completed: true });
    const future = task({ dueAt: date(2026, 12, 1), repeat: 'daily' });
    expect(refreshRecurringTask(once, date(2026, 10, 7))).toBe(once);
    expect(refreshRecurringTask(future, date(2026, 10, 7))).toBe(future);
  });

  test('today includes undated tasks created today and excludes tomorrow', () => {
    const today = date(2026, 10, 7);
    expect(isTaskForToday(task({ createdAt: today }), today)).toBe(true);
    expect(isTaskForToday(task({ createdAt: date(2026, 10, 6) }), today)).toBe(false);
    expect(isTaskForToday(task({ dueAt: date(2026, 10, 7, 23, 59) }), today)).toBe(true);
    expect(isTaskForToday(task({ dueAt: date(2026, 10, 8, 0) }), today)).toBe(false);
  });

  test('calendar day boundaries and reminder times survive DST changes', () => {
    const beforeSpring = date(2026, 3, 7, 9, 30);
    expect(nextOccurrence(beforeSpring, 'daily')).toBe(date(2026, 3, 8, 9, 30));
    expect(endOfDay(date(2026, 3, 8))).toBe(startOfDay(date(2026, 3, 9)));
    const original = task({ dueAt: beforeSpring, repeat: 'daily' });
    expect(refreshRecurringTask(original, date(2026, 3, 10, 0)).dueAt).toBe(
      date(2026, 3, 10, 9, 30),
    );
  });
});

describe('reminder planning', () => {
  const now = date(2026, 10, 7, 8);
  test('completed recurring tasks skip only the checked occurrence', () => {
    const plan = buildReminderPlan(
      [task({ dueAt: date(2026, 10, 7), repeat: 'daily', completed: true })],
      now,
    );
    expect(plan[0].timestamp).toBe(date(2026, 10, 8));
    expect(plan).toHaveLength(40);
  });

  test('completed and overdue one-time tasks have no reminders', () => {
    expect(
      buildReminderPlan(
        [
          task({ dueAt: date(2026, 10, 7), completed: true }),
          task({ id: 'old', dueAt: date(2026, 10, 6) }),
          task({ id: 'undated' }),
        ],
        now,
      ),
    ).toEqual([]);
  });

  test('pending routines skip elapsed reminder times without firing immediately', () => {
    const plan = buildReminderPlan([task({ dueAt: date(2026, 10, 7, 7), repeat: 'daily' })], now);
    expect(plan[0].timestamp).toBe(date(2026, 10, 8, 7));
    expect(plan.every(item => item.timestamp > now)).toBe(true);
  });

  test('first reminder respects a future start date', () => {
    const plan = buildReminderPlan([task({ dueAt: date(2026, 12, 1), repeat: 'weekly' })], now);
    expect(plan[0].timestamp).toBe(date(2026, 12, 1));
    expect(plan[1].timestamp).toBe(date(2026, 12, 8));
  });

  test('monthly reminders keep calendar month lengths', () => {
    const plan = buildReminderPlan(
      [task({ dueAt: date(2026, 1, 31), repeat: 'monthly' })],
      date(2026, 1, 1),
      3,
    );
    expect(plan.map(item => item.timestamp)).toEqual([
      date(2026, 1, 31),
      date(2026, 2, 28),
      date(2026, 3, 31),
    ]);
  });

  test('shared reminder limit keeps the earliest reminders across tasks', () => {
    const plan = buildReminderPlan(
      [
        task({ dueAt: date(2026, 10, 7, 10), repeat: 'daily' }),
        task({ id: 'exam', dueAt: date(2026, 10, 7, 9) }),
        task({ id: 'weekly', dueAt: date(2026, 10, 8, 8), repeat: 'weekly' }),
      ],
      now,
      4,
    );
    expect(plan.map(item => item.task.id)).toEqual(['exam', 'routine', 'weekly', 'routine']);
    expect(new Set(plan.map(item => item.id)).size).toBe(4);
  });
});
