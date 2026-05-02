import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

interface ActionButtonProps {
  icon: string;
  label: string;
  color: string;
  delay: number;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, color, delay, onPress }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      onPress();
    }, 100);
  };

  scale.value = withDelay(delay, withSpring(1, { damping: 20, stiffness: 300 }));
  opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: interpolate(opacity.value, [0, 1], [50, 0]) }
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.actionButton, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[styles.buttonContainer, { borderColor: color }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={[styles.icon, { color }]}>{icon}</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const FloatingActions: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuScale = useSharedValue(0);
  const menuOpacity = useSharedValue(0);

  const handleAddExpense = () => {
    console.log('Add Expense pressed');
    setIsMenuOpen(false);
  };

  const handleAddGoal = () => {
    console.log('Add Goal pressed');
    setIsMenuOpen(false);
  };

  const handleLogActivity = () => {
    console.log('Log Activity pressed');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      menuScale.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.ease) });
      menuOpacity.value = withTiming(0, { duration: 200 });
    } else {
      menuScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      menuOpacity.value = withTiming(1, { duration: 200 });
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: menuScale.value }],
      opacity: menuOpacity.value,
    };
  });

  const hamburgerLineTopStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(isMenuOpen ? 7 : 0, { duration: 300, easing: Easing.out(Easing.ease) }) },
        { rotate: withTiming(isMenuOpen ? '45deg' : '0deg', { duration: 300, easing: Easing.out(Easing.ease) }) }
      ],
    };
  });

  const hamburgerLineMiddleStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isMenuOpen ? 0 : 1, { duration: 200, easing: Easing.out(Easing.ease) }),
    };
  });

  const hamburgerLineBottomStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(isMenuOpen ? -7 : 0, { duration: 300, easing: Easing.out(Easing.ease) }) },
        { rotate: withTiming(isMenuOpen ? '-45deg' : '0deg', { duration: 300, easing: Easing.out(Easing.ease) }) }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.actionMenu, menuAnimatedStyle]}>
        <ActionButton
          icon="💸"
          label="Add Expense"
          color="#00ffff"
          delay={0}
          onPress={handleAddExpense}
        />
        <ActionButton
          icon="🎯"
          label="Add Goal"
          color="#00ff00"
          delay={50}
          onPress={handleAddGoal}
        />
        <ActionButton
          icon="📊"
          label="Log Activity"
          color="#ff00ff"
          delay={100}
          onPress={handleLogActivity}
        />
      </Animated.View>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleMenu}
        style={styles.hamburgerButton}
      >
        <View style={styles.hamburgerIcon}>
          <Animated.View style={[styles.hamburgerLine, hamburgerLineTopStyle]} />
          <Animated.View style={[styles.hamburgerLine, hamburgerLineMiddleStyle]} />
          <Animated.View style={[styles.hamburgerLine, hamburgerLineBottomStyle]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '12%',
    right: '5%',
    alignItems: 'flex-end',
  },
  actionMenu: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  actionButton: {
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  hamburgerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hamburgerIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
});
