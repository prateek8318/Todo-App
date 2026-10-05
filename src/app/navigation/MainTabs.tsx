import React, { useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Settings, Sparkles } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@core/theme';
import { MainTabsParamList } from './types';
import { HomeScreen } from '@features/tasks/screens/HomeScreen';
import { SmartPlanScreen } from '@features/ai/screens/SmartPlanScreen';
import { SettingsScreen } from '@features/settings/screens/SettingsScreen';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40;
const TAB_WIDTH = TAB_BAR_WIDTH / 3;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const TabIcon = ({ isFocused, routeName, theme, onPress, options }: any) => {
  const Icon = routeName === 'Home' ? Home : routeName === 'Assistant' ? Sparkles : Settings;
  const translateY = useSharedValue(0);
  
  useEffect(() => {
    translateY.value = withSpring(isFocused ? -22 : 0, { mass: 0.5, damping: 12, stiffness: 120 });
  }, [isFocused, translateY]);
  
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    backgroundColor: isFocused ? theme.colors.primary : 'transparent',
    shadowColor: isFocused ? theme.colors.primary : 'transparent',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: isFocused ? 0.4 : 0,
    shadowRadius: 8,
    elevation: isFocused ? 10 : 0,
  }));

  return (
    <TouchableOpacity
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      activeOpacity={1}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.iconWrapper, style]}>
        <Icon color={isFocused ? '#ffffff' : theme.colors.textSecondary} size={isFocused ? 26 : 24} strokeWidth={isFocused ? 2.5 : 2} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { theme } = useTheme();
  const translateX = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, { mass: 0.5, damping: 14, stiffness: 120 });
  }, [state.index, translateX]);

  const animatedProps = useAnimatedProps(() => {
    const x = translateX.value;
    const w = TAB_BAR_WIDTH;
    const h = 68;
    const r = 34; // Tab bar corner radius
    const cx = x + (TAB_WIDTH / 2); // Center of the active tab
    const nStart = cx - 36;
    const nEnd = cx + 36;
    const depth = 38;
    
    // Smooth SVG SVG Notch Path
    const d = `M ${r},0 L ${nStart},0 C ${nStart + 15},0 ${cx - 18},${depth} ${cx},${depth} C ${cx + 18},${depth} ${nEnd - 15},0 ${nEnd},0 L ${w - r},0 A ${r},${r} 0 0 1 ${w},${r} L ${w},${h - r} A ${r},${r} 0 0 1 ${w - r},${h} L ${r},${h} A ${r},${r} 0 0 1 0,${h - r} L 0,${r} A ${r},${r} 0 0 1 ${r},0 Z`;
    return { d };
  });

  return (
    <View style={styles.tabBarContainer}>
      <Svg width={TAB_BAR_WIDTH} height={68} style={StyleSheet.absoluteFill}>
        <AnimatedPath animatedProps={animatedProps} fill={theme.colors.surface} />
      </Svg>

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          ReactNativeHapticFeedback.trigger('impactLight');
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return <TabIcon key={index} isFocused={isFocused} routeName={route.name} theme={theme} onPress={onPress} options={options} />;
      })}
    </View>
  );
};

export const MainTabs = () => {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Assistant" component={SmartPlanScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 68,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  tabItem: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' },
  iconWrapper: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center' }
});
