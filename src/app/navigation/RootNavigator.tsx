import React, { useEffect, useState } from 'react';
import { BackHandler, Modal, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@core/theme';
import { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '@features/onboarding/screens/OnboardingScreen';
import { AuthScreen } from '@features/auth/screens/AuthScreen';
import { useOnboardingStore } from '@features/onboarding/store/useOnboardingStore';
import { useAuthStore } from '@features/auth/store/useAuthStore';
import { TaskDetailScreen } from '@features/tasks/screens/TaskDetailScreen';
import { Text, Button, Card } from '@shared/components';
import { LogOut } from 'lucide-react-native';

// Safe Auth Wrapper
let safeAuth: any = () => ({
  onAuthStateChanged: (cb: any) => { cb(null); return () => {}; },
});
try {
  const fbAuth = require('@react-native-firebase/auth');
  if (typeof fbAuth === 'function') safeAuth = fbAuth;
  else if (fbAuth && typeof fbAuth.default === 'function') safeAuth = fbAuth.default;
  else if (fbAuth && typeof fbAuth.auth === 'function') safeAuth = fbAuth.auth;
} catch (e) {}

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const { theme, isDark } = useTheme();
  
  const { hasCompletedOnboarding, _hasHydrated: _onboardingHydrated } = useOnboardingStore();
  const { user, initializing, setUser, setInitializing } = useAuthStore();
  
  const [isReady, setIsReady] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Handle Firebase Auth state changes
  useEffect(() => {
    try {
      const subscriber = safeAuth().onAuthStateChanged((usr: any) => {
        setUser(usr);
        if (initializing) setInitializing(false);
      });
      return subscriber;
    } catch (e) {
      if (initializing) setInitializing(false);
    }
  }, [initializing, setUser, setInitializing]);

  useEffect(() => {
    if (_onboardingHydrated && !initializing) setIsReady(true);
  }, [_onboardingHydrated, initializing]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!navigationRef.isReady()) return false;
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }
      setShowExitModal(true);
      return true;
    });
    return () => subscription.remove();
  }, [navigationRef]);

  if (!isReady) return null;

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
    <>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasCompletedOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : !user ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      <Modal visible={showExitModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Card style={{ width: '100%', maxWidth: 400, alignItems: 'center', paddingVertical: 24 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.error + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <LogOut color={theme.colors.error} size={24} />
            </View>
            <Text variant="h2" weight="bold" style={{ marginBottom: 8 }}>Exit App?</Text>
            <Text color="textSecondary" align="center" style={{ marginBottom: 24 }}>
              Are you sure you want to close Tickd? Your progress is saved.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Button label="Stay" variant="outline" onPress={() => setShowExitModal(false)} style={{ flex: 1 }} />
              <Button label="Exit" onPress={() => {
                setShowExitModal(false);
                setTimeout(() => BackHandler.exitApp(), 100);
              }} style={{ flex: 1, backgroundColor: theme.colors.error }} />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
};
