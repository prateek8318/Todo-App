import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@core/storage';
import { Task } from '../types';

interface TaskState {
  tasks: Task[];
  _hasHydrated: boolean;
}

interface TaskActions {
  setHydrated: (state: boolean) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  setTasks: (tasks: Task[]) => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      _hasHydrated: false,
      setHydrated: (state: boolean) => set({ _hasHydrated: state }),
      addTask: (task: Task) => set((state: TaskStore) => ({ tasks: [...state.tasks, task] })),
      updateTask: (updatedTask: Task) => set((state: TaskStore) => ({
        tasks: state.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
      })),
      deleteTask: (taskId: string) => set((state: TaskStore) => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      })),
      setTasks: (tasks: Task[]) => set({ tasks }),
    }),
    {
      name: 'tasks-storage',
      storage: zustandStorage,
      version: 1,
      partialize: (state: TaskStore) => ({ tasks: state.tasks }), // persist only tasks
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // migration logic
        }
        return persistedState as TaskState;
      },
      onRehydrateStorage: () => (state?: TaskStore) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const selectAllTasks = (state: TaskStore) => state.tasks;
export const selectTaskById = (id: string) => (state: TaskStore) => state.tasks.find(t => t.id === id);
