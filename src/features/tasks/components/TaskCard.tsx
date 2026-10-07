import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { SharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { Text, Card } from '@shared/components';
import { useTheme } from '@core/theme';
import { Task } from '../types';
import { AnimatedCheckbox } from './AnimatedCheckbox';
import { PriorityChip } from './PriorityChip';
import { formatDate, formatTime } from '@core/utils/date';
import { Calendar, Trash2, CheckCircle2, Repeat2 } from 'lucide-react-native';
import { repeatLabels } from '../utils/recurrence';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
}

const SwipeAction = ({ dragX, direction }: { dragX: SharedValue<number>; direction: 'left' | 'right' }) => {
  const { theme } = useTheme();
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(dragX.value, direction === 'right' ? [-100, 0] : [0, 100], direction === 'right' ? [1, 0] : [0, 1], 'clamp') }],
  }));
  const color = direction === 'right' ? theme.colors.error : theme.colors.success;
  return (
    <View style={[direction === 'right' ? styles.actionRight : styles.actionLeft, { backgroundColor: color + '20', borderRadius: theme.radius.lg }]}>
      <Animated.View style={style}>
        {direction === 'right' ? <Trash2 color={color} /> : <CheckCircle2 color={color} />}
      </Animated.View>
    </View>
  );
};

export const TaskCard: React.FC<TaskCardProps> = memo(({ task, onToggle, onPress, onDelete }) => {
  const { theme } = useTheme();

  const renderRightActions = (progress: SharedValue<number>, dragX: SharedValue<number>) => {
    return <SwipeAction dragX={dragX} direction="right" />;
  };

  const renderLeftActions = (progress: SharedValue<number>, dragX: SharedValue<number>) => {
    return <SwipeAction dragX={dragX} direction="left" />;
  };

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    ReactNativeHapticFeedback.trigger('impactMedium');
    if (direction === 'right' && onDelete) {
      onDelete(task.id);
    } else if (direction === 'left') {
      onToggle(task.id);
    }
  };

  return (
    <Swipeable 
      renderRightActions={onDelete ? renderRightActions : undefined} 
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={handleSwipeOpen}
      friction={2}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(task.id)}>
        <Card style={[styles.card, { opacity: task.completed ? 0.6 : 1 }]}>
          <View style={styles.header}>
            <AnimatedCheckbox checked={task.completed} onToggle={() => onToggle(task.id)} />
            <View style={styles.titleContainer}>
              <Text 
                variant="h3" 
                style={{ textDecorationLine: task.completed ? 'line-through' : 'none', color: task.completed ? theme.colors.textSecondary : theme.colors.text }}
              >
                {task.title}
              </Text>
            </View>
            <PriorityChip priority={task.priority} />
          </View>
          
          {(task.description || task.dueAt) && (
            <View style={[styles.body, { paddingLeft: 36, marginTop: theme.spacing.xs }]}>
              {task.description && (
                <Text variant="body" color="textSecondary" numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              
              {task.dueAt && (
                <View style={[styles.dateContainer, { marginTop: theme.spacing.xs }]}>
                  <Calendar size={14} color={theme.colors.textSecondary} />
                  <Text variant="caption" color="textSecondary" style={{ marginLeft: 4 }}>
                    {formatDate(task.dueAt)} · {formatTime(task.dueAt)}
                  </Text>
                </View>
              )}
              {task.repeat && task.repeat !== 'none' && (
                <View style={[styles.dateContainer, { marginTop: theme.spacing.xs }]}>
                  <Repeat2 size={14} color={theme.colors.primary} />
                  <Text variant="caption" style={{ marginLeft: 4, color: theme.colors.primary }}>{repeatLabels[task.repeat]}</Text>
                </View>
              )}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    </Swipeable>
  );
}, (prev, next) => prev.task === next.task);

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  titleContainer: { flex: 1, marginHorizontal: 12 },
  body: {},
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  actionRight: { width: 80, marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  actionLeft: { width: 80, marginBottom: 12, justifyContent: 'center', alignItems: 'center' }
});
