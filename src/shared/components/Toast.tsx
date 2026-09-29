import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Text } from './Text';
import { useTheme } from '@core/theme';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onDismiss, duration = 3000, action }) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info':
      default:
        return theme.colors.surface;
    }
  };

  const textColor = type === 'info' ? theme.colors.text : '#ffffff';

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          top: theme.spacing.xl,
        },
        theme.shadows.md,
      ]}
    >
      <Text style={{ color: textColor, flex: action ? 1 : undefined }}>{message}</Text>
      {action && (
        <TouchableOpacity onPress={() => { action.onPress(); onDismiss?.(); }} style={{ marginLeft: theme.spacing.md }}>
          <Text weight="bold" style={{ color: textColor }}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', alignSelf: 'center', zIndex: 9999, minWidth: 200, flexDirection: 'row', alignItems: 'center' }
});
