import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { ScreenContainer, Text, Button, IconButton } from '@shared/components';
import { useTheme } from '@core/theme';
import { ArrowRight, Check } from 'lucide-react-native';

const SLIDES = [
  { id: '1', title: 'Welcome to Tickd', description: 'Your personal task manager.' },
  { id: '2', title: 'Stay Organized', description: 'Create and track your tasks effortlessly.' },
  { id: '3', title: 'Never Miss a Beat', description: 'Get reminders for your important tasks.' },
];

export const OnboardingScreen = () => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const completeOnboarding = useOnboardingStore(state => state.completeOnboarding);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) setCurrentIndex(currentIndex + 1);
    else completeOnboarding();
  };

  const slide = SLIDES[currentIndex];

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.skipContainer}>
        {currentIndex < SLIDES.length - 1 && (
          <Button variant="outline" label="Skip" onPress={completeOnboarding} style={{ width: 80 }} />
        )}
      </View>
      
      <Animated.View key={slide.id} entering={FadeIn} exiting={FadeOut} style={styles.content}>
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary + '20', borderRadius: theme.radius.xl }]} />
        <Text variant="h1" align="center" style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }}>
          {slide.title}
        </Text>
        <Text variant="body" color="textSecondary" align="center">
          {slide.description}
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.indicators}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.border, borderRadius: theme.radius.full }
              ]}
            />
          ))}
        </View>
        <IconButton 
          icon={currentIndex === SLIDES.length - 1 ? <Check color="#fff" /> : <ArrowRight color="#fff" />} 
          backgroundColor={theme.colors.primary}
          onPress={handleNext}
          size={56}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  skipContainer: { alignItems: 'flex-end', height: 40, width: '100%' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imagePlaceholder: { width: 200, height: 200 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, width: '100%' },
  indicators: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10 },
});
