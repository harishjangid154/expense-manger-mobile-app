import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const animationValue = useSharedValue(0);
  const animationValue2 = useSharedValue(0);

  useEffect(() => {
    animationValue.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    animationValue2.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => {
    const translateX = interpolate(animationValue.value, [0, 1], [-width * 0.3, width * 0.3]);
    const translateY = interpolate(animationValue.value, [0, 1], [-height * 0.2, height * 0.2]);
    
    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: `${interpolate(animationValue.value, [0, 1], [0, 360])}deg` }
      ],
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    const translateX = interpolate(animationValue2.value, [0, 1], [width * 0.3, -width * 0.3]);
    const translateY = interpolate(animationValue2.value, [0, 1], [height * 0.2, -height * 0.2]);
    
    return {
      transform: [
        { translateX },
        { translateY },
        { rotate: `${interpolate(animationValue2.value, [0, 1], [360, 0])}deg` }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#0a0a0a']}
        style={styles.baseGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOrb1: {
    position: 'absolute',
    top: -height * 0.3,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
  },
  gradientOrb2: {
    position: 'absolute',
    bottom: -height * 0.3,
    right: -width * 0.3,
    width: width * 0.6,
    height: width * 0.6,
  },
  orb: {
    flex: 1,
    borderRadius: width * 0.4,
    opacity: 0.15,
    filter: 'blur(60px)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
