import { useMemo } from 'react';
import { useTaskStore, selectAllTasks } from '../store/taskStore';
import { TaskPriority } from '../types';

export type TaskFilter = 'all' | 'pending' | 'completed';

export const useTasks = (
  filter: TaskFilter = 'all',
  searchQuery: string = '',
  priorityFilter?: TaskPriority,
  sortBy: 'createdAt' | 'dueAt' | 'priority' = 'createdAt'
) => {
  const tasks = useTaskStore(selectAllTasks);

  return useMemo(() => {
    let filtered = tasks;

    // Filter by status
    if (filter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Filter by priority
    if (priorityFilter) {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      if (sortBy === 'dueAt') {
        const aDue = a.dueAt ?? Infinity;
        const bDue = b.dueAt ?? Infinity;
        return aDue - bDue;
      }
      if (sortBy === 'priority') {
        const priorityScore: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }
      // default: createdAt descending
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, searchQuery, priorityFilter, sortBy]);
};
