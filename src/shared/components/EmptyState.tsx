import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@core/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { padding: theme.spacing.xl }]}>
      {icon && <View style={{ marginBottom: theme.spacing.lg }}>{icon}</View>}
      <Text variant="h3" align="center" style={{ marginBottom: theme.spacing.sm }}>{title}</Text>
      {description && (
        <Text color="textSecondary" align="center" style={{ marginBottom: theme.spacing.lg }}>
          {description}
        </Text>
      )}
      {action && <View style={{ marginTop: theme.spacing.md }}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
