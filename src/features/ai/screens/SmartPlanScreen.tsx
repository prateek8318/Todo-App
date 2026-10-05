import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { AlarmClock, Check, Circle, Clock3, Flame, Sparkles, IndianRupee, TrendingDown, Users } from 'lucide-react-native';
import { useTheme } from '@core/theme';
import { formatTime } from '@core/utils/date';
import { Button, Card, GradientHeader, ScreenContainer, Text } from '@shared/components';
import { TaskSheet, TaskSheetRef } from '@features/tasks/components';
import { useTaskActions } from '@features/tasks/hooks/useTaskActions';
import { useTaskStore } from '@features/tasks/store/taskStore';
import { useFinanceStore } from '../store/financeStore';
import { Task } from '@features/tasks/types';
import { aiService } from '../services/aiService';
import Animated, { withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

const ShimmerText = ({ width = '100%', height = 18 }: { width?: any, height?: number }) => {
  const opacity = useSharedValue(0.3);
  React.useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0.7, { duration: 800 }), withTiming(0.3, { duration: 800 })), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ width, height, backgroundColor: '#cbd5e1', borderRadius: 4, marginVertical: 2 }, style]} />;
};

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
  
  // Finance Store
  const { transactions, getTotalIncome, getTotalExpense, getSplitOwed, addTransaction, deleteTransaction } = useFinanceStore();
  const income = getTotalIncome();
  const expense = getTotalExpense();
  const owed = getSplitOwed();
  
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [financeInsight, setFinanceInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'finance'>('tasks');

  // Mini form state for finance
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [splitWith, setSplitWith] = useState('');

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

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingAi(true);
      const [insight, fInsight] = await Promise.all([
        aiService.generateDailyInsight(tasks),
        aiService.generateFinancialAdvice(income, expense, owed)
      ]);
      setAiInsight(insight);
      setFinanceInsight(fInsight);
      setLoadingAi(false);
    };
    fetchInsight();
  }, [tasks, income, expense, owed]);

  const handleAddTransaction = (type: 'income' | 'expense') => {
    if (!title || !amount) return;
    addTransaction({
      title,
      amount: Number(amount),
      type,
      splitWith: splitWith || undefined
    });
    setTitle('');
    setAmount('');
    setSplitWith('');
  };

  const completedCount = plan.today.filter(task => task.completed).length;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScreenContainer edges={['left', 'right']}>
      <GradientHeader title="Smart Dashboard" />
      
      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: theme.spacing.md, marginTop: theme.spacing.md, backgroundColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 4 }}>
        <TouchableOpacity style={{ flex: 1, padding: 8, alignItems: 'center', backgroundColor: activeTab === 'tasks' ? theme.colors.surface : 'transparent', borderRadius: theme.radius.md }} onPress={() => setActiveTab('tasks')}>
          <Text weight={activeTab === 'tasks' ? 'bold' : 'medium'} color={activeTab === 'tasks' ? 'primary' : 'textSecondary'}>Tasks Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, padding: 8, alignItems: 'center', backgroundColor: activeTab === 'finance' ? theme.colors.surface : 'transparent', borderRadius: theme.radius.md }} onPress={() => setActiveTab('finance')}>
          <Text weight={activeTab === 'finance' ? 'bold' : 'medium'} color={activeTab === 'finance' ? 'primary' : 'textSecondary'}>Smart Finance</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { padding: theme.spacing.md, gap: theme.spacing.md }]}>
        {activeTab === 'tasks' ? (
          <>
            <Card style={[styles.hero, { backgroundColor: theme.colors.surface }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={[styles.icon, { backgroundColor: `${theme.colors.primary}20` }]}><Sparkles size={21} color={theme.colors.primary} /></View>
                {loadingAi && <ActivityIndicator size="small" color={theme.colors.primary} />}
              </View>
              <Text variant="h2" weight="bold">{greeting} 👋</Text>
              
              {loadingAi ? (
                <View style={{ marginVertical: 4 }}>
                  <ShimmerText height={14} />
                  <ShimmerText width="80%" height={14} />
                </View>
              ) : (
                <Text color="textSecondary">
                  {aiInsight || 'Aaj ke kaam, unki deadline aur priority ke hisaab se aapka simple focus plan.'}
                </Text>
              )}
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
          </>
        ) : (
          <>
            <Card style={[styles.hero, { backgroundColor: theme.colors.surface }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={[styles.icon, { backgroundColor: `${theme.colors.success}20` }]}><IndianRupee size={21} color={theme.colors.success} /></View>
                {loadingAi && <ActivityIndicator size="small" color={theme.colors.primary} />}
              </View>
              <Text variant="h2" weight="bold">Smart Budget Advisor 💡</Text>
              
              {loadingAi ? (
                <View style={{ marginVertical: 8 }}>
                  <ShimmerText height={14} />
                  <ShimmerText width="80%" height={14} />
                </View>
              ) : (
                <Text color="textSecondary" style={{ lineHeight: 22, marginTop: 4 }}>
                  {financeInsight || 'Add your income and expenses to get a smart budget plan!'}
                </Text>
              )}
              
              <View style={[styles.stats, { marginTop: 16 }]}>
                <View style={styles.stat}><Text variant="h2" weight="bold" style={{ color: theme.colors.success }}>₹{income}</Text><Text variant="caption" color="textSecondary">Income</Text></View>
                <View style={styles.stat}><Text variant="h2" weight="bold" style={{ color: theme.colors.error }}>₹{expense}</Text><Text variant="caption" color="textSecondary">Spent</Text></View>
                <View style={styles.stat}><Text variant="h2" weight="bold" style={{ color: theme.colors.priorityLow }}>₹{owed}</Text><Text variant="caption" color="textSecondary">Owed to you</Text></View>
              </View>
            </Card>

            <Card>
              <Text variant="h3" weight="bold" style={{ marginBottom: 12 }}>Add Transaction</Text>
              <TextInput style={styles.financeInput} placeholder="Title (e.g. Salary, Dinner)" placeholderTextColor={theme.colors.textSecondary} value={title} onChangeText={setTitle} />
              <TextInput style={styles.financeInput} placeholder="Amount (₹)" placeholderTextColor={theme.colors.textSecondary} keyboardType="numeric" value={amount} onChangeText={setAmount} />
              <TextInput style={styles.financeInput} placeholder="Split With (e.g. Rahul) - Optional" placeholderTextColor={theme.colors.textSecondary} value={splitWith} onChangeText={setSplitWith} />
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Button label="Add Income" variant="outline" onPress={() => handleAddTransaction('income')} style={{ flex: 1, borderColor: theme.colors.success }} />
                <Button label="Add Expense" variant="outline" onPress={() => handleAddTransaction('expense')} style={{ flex: 1, borderColor: theme.colors.error }} />
              </View>
            </Card>

            <View style={styles.sectionHeading}>
              <Text variant="h3" weight="bold">Recent Transactions</Text>
              <Text variant="caption" color="textSecondary">{transactions.length} entries</Text>
            </View>

            {transactions.length === 0 ? (
              <Card style={styles.empty}>
                <IndianRupee size={24} color={theme.colors.textSecondary} />
                <Text color="textSecondary" style={styles.center}>No transactions yet. Start adding your income or expenses above.</Text>
              </Card>
            ) : (
              [...transactions].reverse().map((t) => (
                <Card key={t.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text weight="bold" style={{ fontSize: 16 }}>{t.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Text variant="caption" color="textSecondary">{new Date(t.createdAt).toLocaleDateString()}</Text>
                      {!!t.splitWith && <Text variant="caption" style={{ color: theme.colors.priorityLow }}>• Split: {t.splitWith}</Text>}
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text weight="bold" style={{ fontSize: 16, color: t.type === 'income' ? theme.colors.success : theme.colors.error }}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount}
                    </Text>
                    <TouchableOpacity onPress={() => deleteTransaction(t.id)}>
                      <Text variant="caption" color="error">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
      {activeTab === 'tasks' && <TaskSheet ref={sheet} />}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: 120 },
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
  financeInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 }
});
