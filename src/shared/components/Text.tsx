import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@core/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'text' | 'textSecondary';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'text',
  weight = 'regular',
  align = 'auto',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'h1': return { fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold };
      case 'h2': return { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold };
      case 'h3': return { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semiBold };
      case 'caption': return { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.regular };
      case 'body':
      default:
        return { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.regular };
    }
  };

  const getFontWeight = () => {
    return theme.typography.weights[weight];
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        {
          color: theme.colors[color],
          fontWeight: getFontWeight(),
          textAlign: align,
        },
        style,
      ]}
      {...props}
    />
  );
};
