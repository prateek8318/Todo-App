import React, { useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@core/theme';
import { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '@features/onboarding/screens/OnboardingScreen';
import { useOnboardingStore } from '@features/onboarding/store/useOnboardingStore';
import { TaskDetailScreen } from '@features/tasks/screens/TaskDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const { theme, isDark } = useTheme();
  const { hasCompletedOnboarding, _hasHydrated } = useOnboardingStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      setIsReady(true);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!navigationRef.isReady()) return false;

      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      Alert.alert(
        'Exit Tickd?',
        'Your tasks are saved on this device. Do you want to close the app?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true },
      );
      return true;
    });

    return () => subscription.remove();
  }, [navigationRef]);

  if (!isReady) return null; // Prevent flash

  const navigationTheme = {
    ...(isDark ? NavDarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? NavDarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
