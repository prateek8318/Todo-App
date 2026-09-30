import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Settings, Sparkles } from 'lucide-react-native';
import { useTheme } from '@core/theme';
import { MainTabsParamList } from './types';
import { HomeScreen } from '@features/tasks/screens/HomeScreen';
import { SmartPlanScreen } from '@features/ai/screens/SmartPlanScreen';
import { SettingsScreen } from '@features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          elevation: theme.shadows.md.elevation,
          height: 64,
          paddingTop: 7,
          paddingBottom: 7,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} 
      />
      <Tab.Screen
        name="Assistant"
        component={SmartPlanScreen}
        options={{
          title: 'Smart Plan',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} 
      />
    </Tab.Navigator>
  );
};
