import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';

interface IconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  size?: number;
  backgroundColor?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, size = 40, backgroundColor, style, ...props }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor || 'transparent',
        },
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
