import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@core/theme';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  color?: 'primary' | 'priorityHigh' | 'priorityMedium' | 'priorityLow' | 'secondary';
}

export const Chip: React.FC<ChipProps> = ({ label, onPress, selected = false, color = 'primary' }) => {
  const { theme } = useTheme();
  
  const chipColor = theme.colors[color as keyof typeof theme.colors] || theme.colors.primary;
  
  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: selected ? chipColor : 'transparent',
          borderColor: chipColor,
          borderRadius: theme.radius.full,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Text 
        variant="caption" 
        weight={selected ? 'medium' : 'regular'} 
        style={{ color: selected ? theme.colors.surface : chipColor }}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
