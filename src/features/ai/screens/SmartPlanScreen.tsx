import React, { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AlarmClock, Check, Circle, Clock3, Flame, Sparkles } from 'lucide-react-native';
import { useTheme } from '@core/theme';
import { formatTime } from '@core/utils/date';
import { Button, Card, GradientHeader, ScreenContainer, Text } from '@shared/components';
import { TaskSheet, TaskSheetRef } from '@features/tasks/components';
import { useTaskActions } from '@features/tasks/hooks/useTaskActions';
import { useTaskStore } from '@features/tasks/store/taskStore';
import { Task } from '@features/tasks/types';

const startOfToday = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const endOfToday = (date: Date) => startOfToday(date) + 24 * 60 * 60 * 1000;

const urgency = (task: Task, now: number) => {
  const due = task.dueAt ?? Number.MAX_SAFE_INTEGER;
  const late = task.dueAt !== undefined && task.dueAt < now;
  const priority = task.priority === 'high' ? 0 : task.priority === 'medium' ? 1 : 2;
  return [late ? 0 : 1, due, priority] as const;
};

export const SmartPlanScreen = () => {
  const { theme } = useTheme();
  const tasks = useTaskStore(state => state.tasks);
  const { toggleTask } = useTaskActions();
  const sheet = useRef<TaskSheetRef>(null);
  const now = Date.now();
  const todayStart = startOfToday(new Date(now));
  const todayEnd = endOfToday(new Date(now));

  const plan = useMemo(() => {
    const open = tasks.filter(task => !task.completed);
    const today = tasks.filter(task => task.dueAt !== undefined && task.dueAt >= todayStart && task.dueAt < todayEnd);
    const overdue = open.filter(task => task.dueAt !== undefined && task.dueAt < now);
    const candidates = [...open].sort((a, b) => {
      const aa = urgency(a, now);
      const bb = urgency(b, now);
      return aa[0] - bb[0] || aa[1] - bb[1] || aa[2] - bb[2] || a.createdAt - b.createdAt;
    });
    const focus = candidates.slice(0, 3);
    const completedToday = tasks.filter(task => task.completed && (task.completedAt ?? 0) >= todayStart).length;
    return { open, today, overdue, focus, completedToday };
  }, [tasks, now, todayStart, todayEnd]);

  const completedCount = plan.today.filter(task => task.completed).length;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <GradientHeader title="Smart Plan" />
      <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing.md, gap: theme.spacing.md }]}>
        <Card style={[styles.hero, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.icon, { backgroundColor: `${theme.colors.primary}20` }]}><Sparkles size={21} color={theme.colors.primary} /></View>
          <Text variant="h2" weight="bold">{greeting} 👋</Text>
          <Text color="textSecondary">Aaj ke kaam, unki deadline aur priority ke hisaab se aapka simple focus plan.</Text>
          <View style={styles.stats}>
            <View style={styles.stat}><Text variant="h2" weight="bold">{plan.today.length}</Text><Text variant="caption" color="textSecondary">Due today</Text></View>
            <View style={styles.stat}><Text variant="h2" weight="bold">{completedCount}</Text><Text variant="caption" color="textSecondary">Done today</Text></View>
            <View style={styles.stat}><Text variant="h2" weight="bold">{plan.overdue.length}</Text><Text variant="caption" color="textSecondary">Overdue</Text></View>
          </View>
        </Card>

        {plan.overdue.length > 0 && (
          <Card style={[styles.notice, { borderColor: theme.colors.error }]}>
            <Flame size={19} color={theme.colors.error} />
            <View style={styles.flex}><Text weight="bold">Pehle overdue tasks niptao</Text><Text variant="caption" color="textSecondary">{plan.overdue.length} pending {plan.overdue.length === 1 ? 'task' : 'tasks'} deadline cross kar chuke hain.</Text></View>
          </Card>
        )}

        <View style={styles.sectionHeading}><Text variant="h3" weight="bold">Your focus list</Text><Text variant="caption" color="textSecondary">Top {plan.focus.length} priorities</Text></View>
        {plan.focus.length === 0 ? (
          <Card style={styles.empty}>
            <Check size={24} color={theme.colors.success} />
            <Text variant="h3" weight="bold">All clear!</Text>
            <Text color="textSecondary" style={styles.center}>Koi pending task nahi. Naya task add karke apna next goal plan karein.</Text>
            <Button label="Add a task" onPress={() => sheet.current?.present()} />
          </Card>
        ) : plan.focus.map((task, index) => {
          const isOverdue = task.dueAt !== undefined && task.dueAt < now;
          const dueLabel = task.dueAt === undefined ? 'No deadline' : isOverdue ? `Overdue · ${formatTime(task.dueAt)}` : `Due ${formatTime(task.dueAt)}`;
          const priorityColor = task.priority === 'high' ? theme.colors.priorityHigh : task.priority === 'low' ? theme.colors.priorityLow : theme.colors.priorityMedium;
          return (
            <Card key={task.id} style={styles.taskCard}>
              <View style={[styles.number, { backgroundColor: `${theme.colors.primary}18` }]}><Text weight="bold" style={{ color: theme.colors.primary }}>{index + 1}</Text></View>
              <View style={styles.flex}>
                <Text weight="bold">{task.title}</Text>
                {!!task.description && <Text variant="caption" color="textSecondary" numberOfLines={2} style={styles.description}>{task.description}</Text>}
                <View style={styles.meta}><Text variant="caption" style={{ color: priorityColor }}>{task.priority.toUpperCase()}</Text><View style={styles.meta}><Clock3 size={13} color={isOverdue ? theme.colors.error : theme.colors.textSecondary} /><Text variant="caption" color={isOverdue ? 'error' : 'textSecondary'}>{dueLabel}</Text></View></View>
              </View>
              <Button label="Done" onPress={() => toggleTask(task.id)} fullWidth={false} />
            </Card>
          );
        })}

        <Card style={styles.tip}>
          <AlarmClock size={18} color={theme.colors.primary} />
          <View style={styles.flex}><Text weight="bold">Keep reminders on time</Text><Text variant="caption" color="textSecondary">Task ki due date aur time set karein; notifications enabled hone par Tickd reminder schedule karega.</Text></View>
        </Card>
        {plan.open.length > 3 && <Text variant="caption" color="textSecondary" style={styles.center}>{plan.open.length - 3} aur pending tasks Home tab par hain.</Text>}
        {plan.completedToday > 0 && <View style={styles.meta}><Circle size={12} color={theme.colors.success} /><Text variant="caption" color="textSecondary">{plan.completedToday} task{plan.completedToday === 1 ? '' : 's'} completed today</Text></View>}
      </ScrollView>
      <TaskSheet ref={sheet} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 24 },
  hero: { gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', marginTop: 6 },
  stat: { flex: 1, gap: 2 },
  notice: { borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  taskCard: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  number: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 5 },
  description: { lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  empty: { alignItems: 'center', gap: 11 },
  center: { textAlign: 'center', lineHeight: 19 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
});
