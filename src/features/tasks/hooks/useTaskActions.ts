import { useCallback } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { generateId } from '@core/utils/id';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';
import { NotificationService } from '@core/notifications/NotificationService';
import { refreshRecurringTask } from '../utils/recurrence';

export const useTaskActions = () => {
  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
      const now = Date.now();
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        completed: false,
        createdAt: now,
        updatedAt: now,
        repeatAnchorAt: taskData.repeat && taskData.repeat !== 'none' ? taskData.dueAt : undefined,
      };
      useTaskStore.getState().addTask(newTask);
      return newTask.id;
    },
    [],
  );

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const store = useTaskStore.getState();
    const task = store.tasks.find(item => item.id === taskId);
    if (!task) return;
    const updatedTask = { ...task, ...updates, updatedAt: Date.now(), notificationId: undefined };
    const scheduleChanged = updatedTask.dueAt !== task.dueAt || updatedTask.repeat !== task.repeat;
    if (scheduleChanged) {
      updatedTask.repeatAnchorAt =
        updatedTask.repeat && updatedTask.repeat !== 'none' ? updatedTask.dueAt : undefined;
      updatedTask.completed = false;
      updatedTask.completedAt = undefined;
    }
    store.updateTask(updatedTask);
  }, []);

  const toggleTask = useCallback(async (taskId: string) => {
    const store = useTaskStore.getState();
    const stored = store.tasks.find(item => item.id === taskId);
    if (!stored) return;
    const now = Date.now();
    const task = refreshRecurringTask(stored, now);
    const completed = !task.completed;
    store.updateTask({
      ...task,
      completed,
      completedAt: completed ? now : undefined,
      notificationId: undefined,
      updatedAt: now,
    });
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    useTaskStore.getState().deleteTask(taskId);
  }, []);

  const undoDelete = useCallback(async (task: Task) => {
    const store = useTaskStore.getState();
    if (store.tasks.some(item => item.id === task.id)) return;
    store.addTask(refreshRecurringTask({ ...task, notificationId: undefined }, Date.now()));
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    useSettingsStore.getState().toggleNotifications(enabled);
    if (enabled) return NotificationService.requestPermissions();
    return true;
  }, []);

  return { addTask, updateTask, toggleTask, deleteTask, undoDelete, setNotificationsEnabled };
};
