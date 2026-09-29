import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@shared/components';
import { useTheme } from '@core/theme';
import { TaskPriority } from '../types';

interface PriorityChipProps {
  priority: TaskPriority;
}

export const PriorityChip: React.FC<PriorityChipProps> = ({ priority }) => {
  const { theme } = useTheme();

  const getColor = () => {
    switch (priority) {
      case 'high': return theme.colors.priorityHigh;
      case 'medium': return theme.colors.priorityMedium;
      case 'low': return theme.colors.priorityLow;
    }
  };

  const color = getColor();

  return (
    <View style={[styles.container, { backgroundColor: color + '20', borderColor: color, borderRadius: theme.radius.full }]}>
      <Text variant="caption" weight="medium" style={{ color }}>{priority.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 } });
