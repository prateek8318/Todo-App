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
import { isTaskForToday } from '../utils/recurrence';

export const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { showToast } = useToast();
  
  const [filter, setFilter] = useState<TaskFilter>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined);
  
  const sheetRef = useRef<TaskSheetRef>(null);
  
  const tasks = useTasks(filter, searchQuery, priorityFilter);
  const { toggleTask, deleteTask, undoDelete } = useTaskActions();
  const allTasks = useTaskStore(state => state.tasks);
  const today = useTaskStore(state => state.today);
  
  const progressData = useMemo(() => {
    const todayTasks = allTasks.filter(t => isTaskForToday(t, today));
    const completed = todayTasks.filter(t => t.completed).length;
    return { completed, total: todayTasks.length };
  }, [allTasks, today]);

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
            <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>{progressData.total > 0 && progressData.completed === progressData.total ? 'All done. Make some time for yourself!' : 'Small steps, a lovely day.'}</Text>
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
        emptyStateTitle={searchQuery ? 'No results found' : filter === 'today' ? 'A fresh start for today' : filter === 'routine' ? 'Build your little routine' : 'No tasks here'}
        emptyStateDescription={searchQuery ? 'Try adjusting your filters' : filter === 'routine' ? 'Tap + and choose Daily, Weekly or Monthly to create a routine.' : filter === 'today' ? 'Tap + to plan today, or check All for your other tasks.' : 'Tap the + button to create a new task'}
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
