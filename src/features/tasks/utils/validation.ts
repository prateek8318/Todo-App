export const validateTaskTitle = (title: string): { valid: boolean; error?: string } => {
  const trimmed = title.trim();
  if (!trimmed) {
    return { valid: false, error: 'Title is required' };
  }
  return { valid: true };
};

export const validateTaskDueDate = (dueAt?: number): { valid: boolean; error?: string } => {
  if (dueAt && dueAt < Date.now()) {
    return { valid: false, error: 'Due date cannot be in the past' };
  }
  return { valid: true };
};
