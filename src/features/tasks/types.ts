export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueAt?: number;
  repeat?: TaskRepeat;
  repeatAnchorAt?: number;
  priority: TaskPriority;
  category?: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
  notificationId?: string;
}

export interface TaskRepository {
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  clearTasks(): Promise<void>;
}
