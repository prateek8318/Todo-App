import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { useTheme } from '@core/theme';

interface GradientHeaderProps {
  title: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({ title, leftAction, rightAction }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: theme.spacing.md }]}>
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={theme.colors.gradientStart} stopOpacity="1" />
            <Stop offset="1" stopColor={theme.colors.gradientEnd} stopOpacity="1" />
          </LinearGradient>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
        </Svg>
      </View>
      
      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}>
        <View style={styles.leftSection}>
          {leftAction && <View style={styles.leftActionContainer}>{leftAction}</View>}
          <Text variant="h2" weight="bold" style={{ color: '#ffffff' }}>{title}</Text>
        </View>
        {rightAction && <View>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', overflow: 'hidden' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  leftActionContainer: { marginRight: 12 }
});
