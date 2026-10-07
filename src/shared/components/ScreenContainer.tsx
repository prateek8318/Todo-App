import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@core/theme';
import { useResponsive } from '@core/hooks/useResponsive';
import { useSettingsStore } from '@features/settings/store/useSettingsStore';
import { Wallpaper } from './Wallpaper';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ 
  children, 
  style, 
  edges = ['top', 'left', 'right'] 
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { contentMaxWidth } = useResponsive();
  const wallpaper = useSettingsStore(state => state.wallpaper);

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[containerStyle, styles.outer]}>
      {wallpaper !== 'none' && <View pointerEvents="none" style={StyleSheet.absoluteFill}><Wallpaper id={wallpaper} /></View>}
      <View style={[styles.inner, { maxWidth: contentMaxWidth }, style]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    flex: 1,
  }
});
