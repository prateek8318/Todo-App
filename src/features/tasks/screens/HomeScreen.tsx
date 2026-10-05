import React, { useRef, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, FAB, GradientHeader, Card, Text } from '@shared/components';
import { TaskList, FilterBar, ProgressRing, TaskSheet, TaskSheetRef } from '../components';
import { useTasks, TaskFilter } from '../hooks/useTasks';
import { useTaskActions } from '../hooks/useTaskActions';
import { TaskPriority } from '../types';
import { useTheme } from '@core/theme';
import { useToast } from '@core/hooks/useToast';
import { useTaskStore } from '../store/taskStore';

export const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  
  const sheetRef = useRef<TaskSheetRef>(null);
  
  const tasks = useTasks(filter, searchQuery, priorityFilter);
  const { toggleTask, deleteTask, undoDelete } = useTaskActions();
  const allTasks = useTaskStore(state => state.tasks);
  
  const progressData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayTasks = allTasks.filter(t => t.dueAt && t.dueAt >= today.getTime() && t.dueAt < today.getTime() + 86400000);
    const completed = todayTasks.filter(t => t.completed).length;
    return { completed, total: todayTasks.length };
  }, [allTasks]);

  const handleDelete = (id: string) => {
    const taskToDelete = allTasks.find(t => t.id === id);
    if (!taskToDelete) return;
    deleteTask(id);
    showToast({ 
      message: 'Task deleted', 
      type: 'info', 
      action: { label: 'UNDO', onPress: () => undoDelete(taskToDelete) } 
    });
  };

  return (
    <ScreenContainer edges={['left', 'right']}>
      <GradientHeader title="My Tasks" />
      
      <View style={{ paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.md }}>
        <Card style={styles.progressCard}>
          <View style={styles.progressText}>
            <Text variant="h3" weight="bold">Today's Progress</Text>
            <Text variant="body" color="textSecondary">{progressData.completed} of {progressData.total} tasks completed</Text>
          </View>
          <ProgressRing completed={progressData.completed} total={progressData.total} size={80} strokeWidth={8} />
        </Card>
      </View>

      <FilterBar 
        filter={filter} setFilter={setFilter}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
      />
      
      <TaskList 
        tasks={tasks}
        onToggleTask={toggleTask}
        onPressTask={(id: string) => navigation.navigate('TaskDetail', { taskId: id })}
        onDeleteTask={handleDelete}
        emptyStateTitle={searchQuery ? "No results found" : "No tasks yet"}
        emptyStateDescription={searchQuery ? "Try adjusting your filters" : "Tap the + button to create a new task"}
      />
      
      <FAB onPress={() => sheetRef.current?.present()} />
      <TaskSheet ref={sheetRef} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  progressCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { flex: 1, marginRight: 16 }
});
