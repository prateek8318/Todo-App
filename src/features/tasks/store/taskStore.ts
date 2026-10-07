import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from '@core/storage';
import { Task } from '../types';
import { refreshRecurringTask, startOfDay } from '../utils/recurrence';

interface TaskState {
  tasks: Task[];
  _hasHydrated: boolean;
  today: number;
}

interface TaskActions {
  setHydrated: (state: boolean) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  setTasks: (tasks: Task[]) => void;
  refreshRoutines: () => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      _hasHydrated: false,
      today: startOfDay(Date.now()),
      refreshRoutines: () => set((state) => {
        const now = Date.now();
        const today = startOfDay(now);
        const tasks = state.tasks.map(task => refreshRecurringTask(task, now));
        if (today === state.today && tasks.every((task, index) => task === state.tasks[index])) return state;
        return { tasks, today };
      }),
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
