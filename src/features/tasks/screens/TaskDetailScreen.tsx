import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenContainer, Text, GradientHeader, IconButton, Card, Button } from '@shared/components';
import { PriorityChip } from '../components/PriorityChip';
import { useTaskStore, selectTaskById } from '../store/taskStore';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTheme } from '@core/theme';
import { ArrowLeft, Trash2, Calendar } from 'lucide-react-native';
import { formatDate, formatTime } from '@core/utils/date';
import { TaskSheet, TaskSheetRef } from '../components/TaskSheet';
import { nextOccurrence, repeatLabels } from '../utils/recurrence';

export const TaskDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const taskId = route.params?.taskId;
  
  const task = useTaskStore(selectTaskById(taskId));
  const { toggleTask, deleteTask } = useTaskActions();
  const sheetRef = useRef<TaskSheetRef>(null);

  if (!task) return null;

  const handleDelete = () => {
    deleteTask(task.id);
    navigation.goBack();
  };

  return (
    <ScreenContainer edges={['left', 'right']}>
      <GradientHeader 
        title="Details" 
        leftAction={<IconButton icon={<ArrowLeft color="#fff" />} onPress={() => navigation.goBack()} />}
        rightAction={<IconButton icon={<Trash2 color="#fff" />} onPress={handleDelete} />}
      />

      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text variant="h1" style={{ flex: 1, marginRight: 16 }}>{task.title}</Text>
          <PriorityChip priority={task.priority} />
        </View>

        {task.description ? (
          <Card>
            <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>Description</Text>
            <Text color="textSecondary">{task.description}</Text>
          </Card>
        ) : null}

        {task.dueAt && (
          <Card>
            <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>Due Date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Calendar color={theme.colors.textSecondary} />
              <Text color="textSecondary">{formatDate(task.dueAt)} at {formatTime(task.dueAt)}</Text>
            </View>
          </Card>
        )}

        {task.repeat && task.repeat !== 'none' && task.dueAt && (
          <Card>
            <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>Repeats {repeatLabels[task.repeat].toLowerCase()}</Text>
            <Text color="textSecondary">Next occurrence: {formatDate(nextOccurrence(task.dueAt, task.repeat, task.repeatAnchorAt))} at {formatTime(task.dueAt)}</Text>
            <Text variant="caption" color="textSecondary" style={{ marginTop: 8 }}>Completing this occurrence keeps the next one on your calendar. Edit Repeat to Once to stop the routine.</Text>
          </Card>
        )}

        <Button 
          variant={task.completed ? 'secondary' : 'primary'}
          label={task.completed ? 'Mark as Pending' : task.repeat && task.repeat !== 'none' ? 'Complete This Occurrence' : 'Mark as Completed'}
          onPress={() => toggleTask(task.id)} 
        />
        <Button label="Edit Task" variant="outline" onPress={() => sheetRef.current?.present(task)} />
      </ScrollView>
      <TaskSheet ref={sheetRef} />
    </ScreenContainer>
  );
};
