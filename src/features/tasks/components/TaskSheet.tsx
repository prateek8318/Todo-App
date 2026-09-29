import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button, Chip } from '@shared/components';
import { useTheme } from '@core/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Task, TaskPriority } from '../types';
import { useTaskActions } from '../hooks/useTaskActions';
import { validateTaskTitle } from '../utils/validation';
import { formatDate, formatTime } from '@core/utils/date';

export interface TaskSheetRef {
  present: (task?: Task) => void;
  dismiss: () => void;
}

export const TaskSheet = forwardRef<TaskSheetRef, {}>((_, ref) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { addTask, updateTask } = useTaskActions();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueAt, setDueAt] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    present: (task) => {
      if (task) {
        setEditingId(task.id);
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setDueAt(task.dueAt ? new Date(task.dueAt) : undefined);
      } else {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueAt(undefined);
      }
      setError(null);
      bottomSheetRef.current?.present();
    },
    dismiss: () => bottomSheetRef.current?.dismiss()
  }));

  const handleSave = () => {
    const val = validateTaskTitle(title);
    if (!val.valid) {
      setError(val.error || null);
      return;
    }
    setError(null);
    
    if (editingId) {
      updateTask(editingId, { title: title.trim(), description: description.trim(), priority, dueAt: dueAt?.getTime() });
    } else {
      addTask({ title: title.trim(), description: description.trim(), priority, dueAt: dueAt?.getTime() });
    }
    bottomSheetRef.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['50%', '90%']}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <BottomSheetScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20, padding: theme.spacing.lg }]}>
          <Text variant="h2" weight="bold" style={{ marginBottom: theme.spacing.md }}>{editingId ? 'Edit Task' : 'New Task'}</Text>
          
          <BottomSheetTextInput
            style={[styles.input, { borderColor: error ? theme.colors.error : theme.colors.border, color: theme.colors.text }]}
            placeholder="Task Title"
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={(t) => { setTitle(t); setError(null); }}
          />
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

          <Text variant="h3" style={{ marginVertical: theme.spacing.sm }}>Due Date & Time</Text>
          <View style={styles.row}>
            <Button variant="outline" label={dueAt ? formatDate(dueAt) : 'Select Date'} onPress={() => setShowDatePicker(true)} fullWidth={false} style={{ flex: 1 }} />
            <Button variant="outline" label={dueAt ? formatTime(dueAt) : 'Select Time'} onPress={() => setShowTimePicker(true)} fullWidth={false} style={{ flex: 1 }} disabled={!dueAt} />
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueAt || new Date()}
              mode="date"
              onChange={(_, date) => { setShowDatePicker(false); if(date) setDueAt(date); }}
            />
          )}
          
          {showTimePicker && dueAt && (
            <DateTimePicker
              value={dueAt}
              mode="time"
              onChange={(_, date) => { setShowTimePicker(false); if(date) setDueAt(date); }}
            />
          )}

          <Button label="Save Task" onPress={handleSave} style={{ marginTop: theme.spacing.xl }} />
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 }
});
