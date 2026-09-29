import { useCallback } from 'react';
import { useTaskStore, selectAllTasks } from '../store/taskStore';
import { Task } from '../types';
import { noOpReminderService } from '../services/reminderService';
import { generateId } from '@core/utils/id';

export const useTaskActions = () => {
  const addTaskState = useTaskStore(state => state.addTask);
  const updateTaskState = useTaskStore(state => state.updateTask);
  const deleteTaskState = useTaskStore(state => state.deleteTask);
  const tasks = useTaskStore(selectAllTasks);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // schedule reminder (no-op in phase 3)
    if (newTask.dueAt) {
      newTask.notificationId = await noOpReminderService.scheduleReminder(newTask);
    }

    addTaskState(newTask);
    return newTask.id;
  }, [addTaskState]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask: Task = { ...task, ...updates, updatedAt: Date.now() };

    // handle reminder changes
    if (updates.dueAt !== undefined || updates.title !== undefined) {
      if (task.notificationId) {
        await noOpReminderService.cancelReminder(task.notificationId);
      }
      if (updatedTask.dueAt) {
        updatedTask.notificationId = await noOpReminderService.scheduleReminder(updatedTask);
      } else {
        updatedTask.notificationId = undefined;
      }
    }

    updateTaskState(updatedTask);
  }, [tasks, updateTaskState]);

  const toggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const completed = !task.completed;
    const completedAt = completed ? Date.now() : undefined;
    
    // cancel reminder if completed
    if (completed && task.notificationId) {
      await noOpReminderService.cancelReminder(task.notificationId);
    }

    updateTaskState({ ...task, completed, completedAt, updatedAt: Date.now() });
  }, [tasks, updateTaskState]);

  const deleteTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.notificationId) {
      await noOpReminderService.cancelReminder(task.notificationId);
    }
    deleteTaskState(taskId);
  }, [tasks, deleteTaskState]);

  const undoDelete = useCallback((task: Task) => {
    addTaskState(task);
  }, [addTaskState]);

  return { addTask, updateTask, toggleTask, deleteTask, undoDelete };
};
