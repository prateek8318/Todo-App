import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';
import { Plus } from 'lucide-react-native';

interface FABProps {
  onPress: () => void;
  icon?: React.ReactNode;
}

export const FAB: React.FC<FABProps> = ({ onPress, icon }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: theme.colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
        },
        theme.shadows.md,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon ? icon : <Plus color="#ffffff" size={24} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
