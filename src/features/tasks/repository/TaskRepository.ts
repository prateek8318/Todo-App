import { Task, TaskRepository } from '../types';
import { storage } from '@core/storage';

const TASKS_STORAGE_KEY = 'tickd-tasks-data';

export const mmkvTaskRepository: TaskRepository = {
  getTasks: async (): Promise<Task[]> => {
    try {
      const data = storage.getString(TASKS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get tasks from MMKV', error);
      return [];
    }
  },
  
  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      storage.set(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to MMKV', error);
    }
  },

  clearTasks: async (): Promise<void> => {
    storage.remove(TASKS_STORAGE_KEY);
  }
};
