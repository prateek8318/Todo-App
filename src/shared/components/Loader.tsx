import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, interpolate } from 'react-native-reanimated';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export const Loader = ({ size = 150 }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2500, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${-rotation.value * 1.5}deg` }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Shadow layer */}
      <AnimatedSvg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        style={[{ position: 'absolute', opacity: 0.2, transform: [{ translateX: 3 }, { translateY: 3 }] }, animatedStyle1]}
      >
        <Path 
          d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64" 
          fill="none" 
          stroke="#000" 
          strokeWidth="23" 
          strokeLinecap="round" 
          strokeDasharray="180 800" 
        />
        <Circle cx="100" cy="100" r="64" fill="none" stroke="#000" strokeWidth="23" strokeDasharray="26 54" strokeLinecap="round" />
      </AnimatedSvg>

      {/* Main Spinning Layer */}
      <AnimatedSvg width={size} height={size} viewBox="0 0 200 200" style={animatedStyle1}>
        <Defs>
          <LinearGradient id="gradient" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#f700a8" />
            <Stop offset="1" stopColor="#ff8000" />
          </LinearGradient>
        </Defs>
        
        {/* Outer Ring */}
        <Path 
          d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64" 
          fill="none" 
          stroke="url(#gradient)" 
          strokeWidth="23" 
          strokeLinecap="round" 
          strokeDasharray="180 800" 
        />
      </AnimatedSvg>

      {/* Inner Spinning Ring */}
      <AnimatedSvg width={size} height={size} viewBox="0 0 200 200" style={[{ position: 'absolute' }, animatedStyle2]}>
        <Circle cx="100" cy="100" r="64" fill="none" stroke="url(#gradient)" strokeWidth="23" strokeDasharray="26 54" strokeLinecap="round" />
      </AnimatedSvg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
