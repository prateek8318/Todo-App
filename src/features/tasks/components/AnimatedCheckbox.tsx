import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useTheme } from '@core/theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export const AnimatedCheckbox: React.FC<AnimatedCheckboxProps> = ({ checked, onToggle }) => {
  const { theme } = useTheme();
  const scale = useSharedValue(checked ? 1 : 0);
  const opacity = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(checked ? 1 : 0.5);
    opacity.value = withTiming(checked ? 1 : 0, { duration: 200 });
  }, [checked, scale, opacity]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    onToggle();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.container,
        {
          borderColor: checked ? theme.colors.primary : theme.colors.border,
          backgroundColor: checked ? theme.colors.primary : 'transparent',
          borderRadius: theme.radius.sm,
        }
      ]}
    >
      <Animated.View style={animatedIconStyle}>
        <Check size={16} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { width: 24, height: 24, borderWidth: 2, justifyContent: 'center', alignItems: 'center' }
});
