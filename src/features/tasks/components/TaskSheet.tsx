import React, { useState, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button, Chip } from '@shared/components';
import { useTheme } from '@core/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Task, TaskPriority, TaskRepeat } from '../types';
import { repeatLabels } from '../utils/recurrence';
import { useTaskActions } from '../hooks/useTaskActions';
import { validateTaskTitle } from '../utils/validation';
import { formatDate, formatTime } from '@core/utils/date';
import { aiService } from '@features/ai/services/aiService';
import { Wand2 } from 'lucide-react-native';

export interface TaskSheetRef {
  present: (task?: Task) => void;
  dismiss: () => void;
}

export const TaskSheet = forwardRef<TaskSheetRef, {}>((_, ref) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { addTask, updateTask } = useTaskActions();
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />, []);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueAt, setDueAt] = useState<Date | undefined>(undefined);
  const [repeat, setRepeat] = useState<TaskRepeat>('none');
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    present: (task) => {
      if (task) {
        setEditingId(task.id);
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setDueAt(task.dueAt ? new Date(task.dueAt) : undefined);
        setRepeat(task.repeat ?? 'none');
      } else {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueAt(undefined);
        setRepeat('none');
      }
      setError(null);
      setShowDatePicker(false);
      setShowTimePicker(false);
      bottomSheetRef.current?.present();
    },
    dismiss: () => bottomSheetRef.current?.dismiss()
  }));

  const handleSave = async () => {
    if (isSaving) return;
    const val = validateTaskTitle(title);
    if (!val.valid) {
      setError(val.error || null);
      return;
    }
    if (repeat !== 'none' && !dueAt) {
      setError('Choose a start date and reminder time for your routine.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const data = { title: title.trim(), description: description.trim(), priority, dueAt: dueAt?.getTime(), repeat };
      if (editingId) await updateTask(editingId, data);
      else await addTask(data);
      bottomSheetRef.current?.dismiss();
    } catch {
      setError('Could not save your task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiParse = async () => {
    if (!title.trim()) return;
    if (!aiService.isConfigured()) {
      setError('AI is not configured yet. You can still save this task manually.');
      return;
    }
    setIsAiLoading(true);
    setError(null);
    try {
      const parsed = await aiService.parseTaskFromText(title);
      if (parsed) {
        setTitle(parsed.title);
        setDescription(parsed.description || description);
        setPriority(parsed.priority);
        if (parsed.dueAt) setDueAt(new Date(parsed.dueAt));
      } else {
        setError('AI parse failed. Please check your API key or try again.');
      }
    } catch {
      setError('An error occurred while connecting to AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['50%', '90%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <BottomSheetScrollView contentContainerStyle={[styles.container, { padding: theme.spacing.lg, paddingBottom: insets.bottom + 20 }]}>
          <Text variant="h2" weight="bold" style={{ marginBottom: theme.spacing.md }}>{editingId ? 'Edit Task' : 'New Task'}</Text>
          
          <View style={[styles.inputRow, { borderColor: error ? theme.colors.error : theme.colors.border }]}>
            <BottomSheetTextInput
              style={[styles.flexInput, { color: theme.colors.text }]}
              placeholder="Task Title (e.g. Call mom tomorrow at 5pm)"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={(t) => { setTitle(t); setError(null); }}
            />
            <TouchableOpacity onPress={handleAiParse} style={styles.aiButton} disabled={isAiLoading || !title.trim()}>
              {isAiLoading ? <ActivityIndicator size="small" color={theme.colors.primary} /> : <Wand2 size={20} color={title.trim() ? theme.colors.primary : theme.colors.textSecondary} />}
            </TouchableOpacity>
          </View>
          {error && <Text color="error" variant="caption" style={{ marginBottom: theme.spacing.md }}>{error}</Text>}
          
          <BottomSheetTextInput
            style={[styles.input, { height: 80, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="Description (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          <Text variant="h3" style={{ marginVertical: theme.spacing.sm }}>Priority</Text>
          <View style={styles.row}>
            {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
              <Chip key={p} label={p.toUpperCase()} selected={priority === p} onPress={() => setPriority(p)} color={p === 'high' ? 'priorityHigh' : p === 'medium' ? 'priorityMedium' : 'priorityLow'} />
            ))}
          </View>

          <Text variant="h3" style={{ marginVertical: theme.spacing.sm }}>Date & Reminder Time</Text>
          <View style={[styles.row, { marginBottom: theme.spacing.sm, flexWrap: 'wrap' }]}>
            <Chip label="Today" selected={!!dueAt && dueAt.toDateString() === new Date().toDateString()} onPress={() => {
              const today = new Date();
              today.setHours(dueAt?.getHours() ?? Math.max(9, Math.min(today.getHours() + 1, 23)), dueAt?.getMinutes() ?? (today.getHours() === 23 ? 59 : 0), 0, 0);
              setDueAt(today);
            }} />
            {dueAt && <Chip label="Clear date" onPress={() => { setDueAt(undefined); setRepeat('none'); }} />}
          </View>
          <View style={styles.row}>
            <Button variant="outline" label={dueAt ? formatDate(dueAt) : 'Select Date'} onPress={() => setShowDatePicker(true)} fullWidth={false} style={{ flex: 1 }} />
            <Button variant="outline" label={dueAt ? formatTime(dueAt) : 'Select Time'} onPress={() => setShowTimePicker(true)} fullWidth={false} style={{ flex: 1 }} disabled={!dueAt} />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueAt || new Date()}
              mode="date"
              onChange={(event, date) => { setShowDatePicker(false); if(event.type === 'set' && date) setDueAt(date); }}
            />
          )}
          
          {showTimePicker && dueAt && (
            <DateTimePicker
              value={dueAt}
              mode="time"
              onChange={(event, date) => { setShowTimePicker(false); if(event.type === 'set' && date) setDueAt(date); }}
            />
          )}

          {dueAt && dueAt.getTime() <= Date.now() && <Text variant="caption" color="textSecondary" style={{ marginTop: theme.spacing.sm }}>{repeat === 'none' ? 'This time has passed. Choose a future time to receive a reminder.' : 'This reminder time has passed. Reminders will start with the next occurrence.'}</Text>}

          <Text variant="h3" style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>Repeat</Text>
          <View style={[styles.row, { flexWrap: 'wrap', gap: 8 }]}>
            {(['none', 'daily', 'weekly', 'monthly'] as TaskRepeat[]).map(option => (
              <Chip key={option} label={repeatLabels[option]} selected={repeat === option} onPress={() => setRepeat(option)} />
            ))}
          </View>
          <Text variant="caption" color="textSecondary" style={{ marginTop: theme.spacing.sm }}>
            {repeat === 'none' ? 'Add a date and time to get a reminder for this task.' : 'Complete each occurrence once. Your routine becomes pending again on its next scheduled day.'}
          </Text>
          {repeat === 'monthly' && <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>Shorter months use their last day, then return to your chosen day.</Text>}

          <Button label={isSaving ? 'Saving...' : 'Save Task'} disabled={isSaving || isAiLoading} onPress={handleSave} style={{ marginTop: theme.spacing.xl }} />
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, marginBottom: 16, paddingRight: 8 },
  flexInput: { flex: 1, padding: 12, fontSize: 16 },
  aiButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12 }
});
