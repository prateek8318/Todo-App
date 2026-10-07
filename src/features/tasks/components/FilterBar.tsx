import React from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Chip } from '@shared/components';
import { useTheme } from '@core/theme';
import { TaskFilter } from '../hooks/useTasks';
import { TaskPriority } from '../types';
import { Search } from 'lucide-react-native';

interface FilterBarProps {
  filter: TaskFilter;
  setFilter: (f: TaskFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  priorityFilter?: TaskPriority;
  setPriorityFilter: (p?: TaskPriority) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter, setFilter, searchQuery, setSearchQuery, priorityFilter, setPriorityFilter
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: theme.spacing.sm }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md }]}>
        <Search size={20} color={theme.colors.textSecondary} style={{ marginLeft: theme.spacing.sm }} />
        <TextInput
          style={[styles.input, { color: theme.colors.text, padding: theme.spacing.sm }]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm, paddingHorizontal: theme.spacing.sm }}>
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Today" selected={filter === 'today'} onPress={() => setFilter('today')} />
        <Chip label="Routine" selected={filter === 'routine'} onPress={() => setFilter('routine')} />
        <Chip label="Pending" selected={filter === 'pending'} onPress={() => setFilter('pending')} />
        <Chip label="Completed" selected={filter === 'completed'} onPress={() => setFilter('completed')} />
        
        <View style={{ width: 1, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.xs }} />
        
        <Chip label="High" color="priorityHigh" selected={priorityFilter === 'high'} onPress={() => setPriorityFilter(priorityFilter === 'high' ? undefined : 'high')} />
        <Chip label="Medium" color="priorityMedium" selected={priorityFilter === 'medium'} onPress={() => setPriorityFilter(priorityFilter === 'medium' ? undefined : 'medium')} />
        <Chip label="Low" color="priorityLow" selected={priorityFilter === 'low'} onPress={() => setPriorityFilter(priorityFilter === 'low' ? undefined : 'low')} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12 },
  input: { flex: 1, fontSize: 16 }
});
