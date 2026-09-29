import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Task } from '../types';
import { TaskCard } from './TaskCard';
import { useResponsive } from '@core/hooks/useResponsive';
import { useTheme } from '@core/theme';
import { EmptyState } from '@shared/components';
import { ListTodo } from 'lucide-react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Task>);

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onPressTask: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onToggleTask, 
  onPressTask,
  onDeleteTask,
  emptyStateTitle = "No tasks found",
  emptyStateDescription
}) => {
  const { columns } = useResponsive();
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: Task }) => (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut} 
      layout={Layout.springify()} 
      style={{ flex: 1 / columns, paddingHorizontal: theme.spacing.sm }}
    >
      <TaskCard task={item} onToggle={onToggleTask} onPress={onPressTask} onDelete={onDeleteTask} />
    </Animated.View>
  );

  return (
    <AnimatedFlatList
      data={tasks}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      key={columns} // force re-render on column change
      numColumns={columns}
      contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
      ListEmptyComponent={
        <EmptyState 
          title={emptyStateTitle}
          description={emptyStateDescription}
          icon={<ListTodo size={64} color={theme.colors.border} />}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: 8, paddingTop: 16 }
});
