import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  blurAmount?: number;
  opacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  blurAmount = 10,
  opacity = 0.1,
}) => {
  const scaleValue = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const CardContent = (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      <View style={[styles.blurEffect, { backgroundColor: `rgba(255, 255, 255, ${opacity * 0.3})` }]} />
      <View style={[styles.content, { backgroundColor: `rgba(255, 255, 255, ${opacity})` }]}>
        {children}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  blurEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  content: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
