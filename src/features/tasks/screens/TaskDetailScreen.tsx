import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScreenContainer, Text, GradientHeader, IconButton, Card, Button } from '@shared/components';
import { PriorityChip } from '../components/PriorityChip';
import { useTaskStore, selectTaskById } from '../store/taskStore';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTheme } from '@core/theme';
import { ArrowLeft, Trash2, Calendar } from 'lucide-react-native';
import { formatDate, formatTime } from '@core/utils/date';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TaskDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const taskId = route.params?.taskId;
  
  const task = useTaskStore(selectTaskById(taskId));
  const { toggleTask, deleteTask } = useTaskActions();

  if (!task) return null;

  const handleDelete = () => {
    deleteTask(task.id);
    navigation.goBack();
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <GradientHeader 
        title="Details" 
        rightAction={<IconButton icon={<Trash2 color="#fff" />} onPress={handleDelete} />}
      />
      
      <View style={{ position: 'absolute', top: insets.top + 8, left: 16, zIndex: 10 }}>
         <IconButton icon={<ArrowLeft color="#fff" />} onPress={() => navigation.goBack()} />
      </View>

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

        <Button 
          variant={task.completed ? 'secondary' : 'primary'}
          label={task.completed ? 'Mark as Pending' : 'Mark as Completed'} 
          onPress={() => toggleTask(task.id)} 
        />
      </ScrollView>
    </ScreenContainer>
  );
};
