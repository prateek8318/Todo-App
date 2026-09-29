export const formatDate = (date: Date | number | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: Date | number | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isPast = (date: Date | number | string): boolean => {
  return new Date(date).getTime() < new Date().getTime();
};
