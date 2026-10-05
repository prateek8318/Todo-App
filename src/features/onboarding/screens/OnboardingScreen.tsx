import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { ScreenContainer, Text, IconButton } from '@shared/components';
import { useTheme } from '@core/theme';
import { ArrowRight, Check, Clock, ShieldCheck, Target } from 'lucide-react-native';

const SLIDES = [
  { id: '1', title: 'Welcome to Tickd', description: 'Your personal task manager to organize life.', icon: Target },
  { id: '2', title: 'Stay on Track', description: 'Never miss deadlines with smart tracking.', icon: Clock },
  { id: '3', title: 'Safe & Synced', description: 'Your data stays with you safely backed up.', icon: ShieldCheck },
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
  const Icon = slide.icon;

  return (
    <ScreenContainer edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.skipContainer}>
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding} style={{ padding: 8 }}>
            <Text weight="bold" color="textSecondary" style={{ fontSize: 16 }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Animated.View key={slide.id} entering={FadeIn} exiting={FadeOut} style={styles.content}>
        <View style={[styles.imageCircle, { backgroundColor: theme.colors.primary + '20' }]}>
          {Icon ? <Icon size={100} color={theme.colors.primary} /> : null}
        </View>
        <Text variant="h1" align="center" style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.md, paddingHorizontal: 20 }}>
          {slide.title}
        </Text>
        <Text variant="body" color="textSecondary" align="center" style={{ paddingHorizontal: 30 }}>
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
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  skipContainer: { alignItems: 'flex-end', height: 40, width: '100%', marginTop: 12 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imageCircle: { width: 220, height: 220, borderRadius: 110, justifyContent: 'center', alignItems: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', width: '100%' },
  indicators: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10 },
});
