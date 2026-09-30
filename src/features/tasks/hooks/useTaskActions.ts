import { useCallback } from 'react';
import { useTaskStore, selectAllTasks } from '../store/taskStore';
import { Task } from '../types';
import { reminderService } from '../services/reminderService';
import { generateId } from '@core/utils/id';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';

export const useTaskActions = () => {
  const addTaskState = useTaskStore(state => state.addTask);
  const updateTaskState = useTaskStore(state => state.updateTask);
  const deleteTaskState = useTaskStore(state => state.deleteTask);
  const tasks = useTaskStore(selectAllTasks);
  const notificationsEnabled = useSettingsStore(state => state.notificationsEnabled);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // schedule reminder (no-op in phase 3)
    if (notificationsEnabled && newTask.dueAt) {
      newTask.notificationId = await reminderService.scheduleReminder(newTask);
    }

    addTaskState(newTask);
    return newTask.id;
  }, [addTaskState, notificationsEnabled]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = { ...task, ...updates, updatedAt: Date.now() };

    // handle reminder changes
    if (updates.dueAt !== undefined || updates.title !== undefined) {
      if (task.notificationId) {
        await reminderService.cancelReminder(task.notificationId);
      }
      if (notificationsEnabled && updatedTask.dueAt) {
        updatedTask.notificationId = await reminderService.scheduleReminder(updatedTask);
      } else {
        updatedTask.notificationId = undefined;
      }
    }

    updateTaskState(updatedTask);
  }, [tasks, updateTaskState, notificationsEnabled]);

  const toggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completed = !task.completed;
    const completedAt = completed ? Date.now() : undefined;
    
    // cancel reminder if completed
    let notificationId = task.notificationId;
    if (completed && notificationId) {
      await reminderService.cancelReminder(notificationId);
      notificationId = undefined;
    } else if (!completed && notificationsEnabled && task.dueAt && task.dueAt > Date.now()) {
      notificationId = await reminderService.scheduleReminder(task);
    }

    updateTaskState({ ...task, notificationId, completed, completedAt, updatedAt: Date.now() });
  }, [tasks, updateTaskState, notificationsEnabled]);

  const deleteTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.notificationId) {
      await reminderService.cancelReminder(task.notificationId);
    }
    deleteTaskState(taskId);
  }, [tasks, deleteTaskState]);

  const undoDelete = useCallback(async (task: Task) => {
    const restoredTask: Task = { ...task, notificationId: undefined };
    if (notificationsEnabled && !task.completed && task.dueAt && task.dueAt > Date.now()) {
      restoredTask.notificationId = await reminderService.scheduleReminder(restoredTask);
    }
    addTaskState(restoredTask);
  }, [addTaskState, notificationsEnabled]);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    useSettingsStore.getState().toggleNotifications(enabled);
    const currentTasks = useTaskStore.getState().tasks;

    for (const task of currentTasks) {
      if (task.completed || !task.dueAt) continue;

      if (!enabled && task.notificationId) {
        await reminderService.cancelReminder(task.notificationId);
        updateTaskState({ ...task, notificationId: undefined, updatedAt: Date.now() });
      } else if (enabled && !task.notificationId && task.dueAt > Date.now()) {
        const notificationId = await reminderService.scheduleReminder(task);
        updateTaskState({ ...task, notificationId, updatedAt: Date.now() });
      }
    }
  }, [updateTaskState]);

  return { addTask, updateTask, toggleTask, deleteTask, undoDelete, setNotificationsEnabled };
};
