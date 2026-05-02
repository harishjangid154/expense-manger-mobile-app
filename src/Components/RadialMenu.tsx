import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface RadialAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

interface RadialMenuProps {
  actions: RadialAction[];
}

const RadialButton: React.FC<{
  action: RadialAction;
  angle: number;
  radius: number;
  delay: number;
  isOpen: boolean;
}> = ({ action, angle, radius, delay, isOpen }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(angle);

  const animatedStyle = useAnimatedStyle(() => {
    // Chinese fan effect - items unfold from center with rotation
    const fanProgress = rotation.value / angle; // 0 to 1 as it unfolds
    const x = interpolate(fanProgress, [0, 1], [0, Math.cos(angle * Math.PI / 180) * radius]);
    const y = interpolate(fanProgress, [0, 1], [0, Math.sin(angle * Math.PI / 180) * radius]);
    
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: scale.value }
        // Remove rotation to keep icons and text upright
      ],
      opacity: opacity.value,
    };
  });

  React.useEffect(() => {
    if (isOpen) {
      // Chinese fan unfolding effect - staggered rotation and scale
      scale.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));
      opacity.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }));
      rotation.value = withDelay(delay, withTiming(angle, { duration: 500, easing: Easing.out(Easing.ease) }));
    } else {
      scale.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.ease) });
      opacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) });
      rotation.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
    }
  }, [isOpen]);

  const handlePress = () => {
    scale.value = withTiming(0.9, { duration: 100, easing: Easing.out(Easing.ease) });
    setTimeout(() => {
      action.onPress();
    }, 100);
  };

  const wedgePath = `M 0,0 L 40,-15 A 40,40 0 0,1 40,15 Z`;

  return (
    <Animated.View style={[styles.radialButton, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.wedgeButton}
      >
        <View style={styles.wedgeContent}>
          <Text style={[styles.wedgeIcon, { color: action.color }]}>{action.icon}</Text>
          <Text style={styles.wedgeLabel}>{action.label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RadialMenu: React.FC<RadialMenuProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const toggleMenu = () => {
    if (isOpen) {
      rotation.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
      scale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
    } else {
      rotation.value = withTiming(180, { duration: 400, easing: Easing.out(Easing.ease) });
      scale.value = withTiming(1.05, { duration: 400, easing: Easing.out(Easing.ease) });
    }
    setIsOpen(!isOpen);
  };

  const centralButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  const getActionAngle = (index: number, total: number) => {
    // Adjust angles clockwise to prevent cutoff (150° to 210°)
    const startAngle = 160; // Start more clockwise
    const angleStep = 50; // Spread items 30° apart for better visibility
    return startAngle + (index * angleStep);
  };

  return (
    <View style={styles.container}>
      {/* Radial Action Buttons */}
      {actions.map((action, index) => (
        <RadialButton
          key={action.id}
          action={action}
          angle={getActionAngle(index, actions.length)}
          radius={60}
          delay={index * 80}
          isOpen={isOpen}
        />
      ))}

      {/* Central Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleMenu}
        style={styles.centralButton}
      >
        <Animated.View style={[styles.centralButtonInner, centralButtonStyle]}>
          <View style={styles.centralIcon}>
            <View style={[styles.centralLine, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.centralLine, { transform: [{ rotate: '-45deg' }] }]} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '15%',
    right: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialButton: {
    position: 'absolute',
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wedgeButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wedgeSvg: {
    position: 'absolute',
  },
  wedgeContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 20,
  },
  wedgeIcon: {
    fontSize: 16,
    marginBottom: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  wedgeLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  centralButton: {
    width: 40,
    height: 40,
    borderRadius:'50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00ffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 10,
  },
  centralButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralLine: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#00ffff',
    borderRadius: 1,
  },
});
