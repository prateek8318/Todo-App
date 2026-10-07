import notifee from '@notifee/react-native';
import { reminderService } from '../src/features/tasks/services/reminderService';
import { Task } from '../src/features/tasks/types';

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    getTriggerNotificationIds: jest.fn(),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
    createTriggerNotification: jest.fn().mockResolvedValue('scheduled'),
  },
  TriggerType: { TIMESTAMP: 0 },
}));

const mockNotifee = jest.mocked(notifee);
const task = (overrides: Partial<Task> = {}): Task => ({
  id: 'test',
  title: 'Class',
  priority: 'medium',
  completed: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  dueAt: Date.now() + 3600000,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockNotifee.getTriggerNotificationIds.mockResolvedValue([]);
});

test('unchanged reminders are kept without rescheduling', async () => {
  const original = task({ id: 'unchanged' });
  mockNotifee.getTriggerNotificationIds.mockResolvedValueOnce([]).mockResolvedValueOnce([`task-unchanged-${original.dueAt}`]);
  await reminderService.syncReminders([original], true);
  await reminderService.syncReminders([original], true);
  expect(mockNotifee.createTriggerNotification).toHaveBeenCalledTimes(1);
});

test('changing Once to Daily updates the current reminder as well as future occurrences', async () => {
  const original = task({ id: 'metadata' });
  mockNotifee.getTriggerNotificationIds.mockResolvedValueOnce([]).mockResolvedValueOnce([`task-metadata-${original.dueAt}`]);
  await reminderService.syncReminders([original], true);
  await reminderService.syncReminders([{ ...original, repeat: 'daily' }], true);
  expect(mockNotifee.createTriggerNotification).toHaveBeenNthCalledWith(2,
    expect.objectContaining({ id: `task-metadata-${original.dueAt}`, title: 'Routine: Class' }),
    expect.objectContaining({ timestamp: original.dueAt }),
  );
});

test('disabling reminders cancels all task triggers, including legacy IDs', async () => {
  mockNotifee.getTriggerNotificationIds.mockResolvedValue([
    'task-old',
    'task-old-123',
    'unrelated',
  ]);
  await reminderService.syncReminders([task()], false);
  expect(mockNotifee.cancelNotification.mock.calls.map(call => call[0])).toEqual([
    'task-old',
    'task-old-123',
  ]);
  expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('editing a task removes its old trigger and schedules its new date and title', async () => {
  const edited = task({ title: 'New class time' });
  mockNotifee.getTriggerNotificationIds.mockResolvedValue(['task-test-old']);
  await reminderService.syncReminders([edited], true);
  expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('task-test-old');
  expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Task: New class time', data: { taskId: 'test' } }),
    expect.objectContaining({ timestamp: edited.dueAt }),
  );
});

test('deleting a routine cancels every queued occurrence', async () => {
  mockNotifee.getTriggerNotificationIds.mockResolvedValue(['task-test-1', 'task-test-2']);
  await reminderService.syncReminders([], true);
  expect(mockNotifee.cancelNotification).toHaveBeenCalledTimes(2);
  expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
});

test('rapid schedule then disable finishes with cancellation', async () => {
  const original = task();
  mockNotifee.getTriggerNotificationIds
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([`task-test-${original.dueAt}`]);
  await Promise.all([
    reminderService.syncReminders([original], true),
    reminderService.syncReminders([original], false),
  ]);
  expect(mockNotifee.cancelNotification).toHaveBeenCalledWith(`task-test-${original.dueAt}`);
});
