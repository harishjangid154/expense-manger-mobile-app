import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';

interface NavItemProps {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      onPress();
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const activeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: isActive ? 1 : 0,
    transform: [{ scale: isActive ? 1 : 0.5 }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.navItem}
    >
      <Animated.View style={animatedStyle}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, isActive && styles.activeIcon]}>
            {icon}
          </Text>
          <Animated.View
            style={[styles.activeIndicator, activeIndicatorStyle]}
          />
        </View>
        <Text style={[styles.label, isActive && styles.activeLabel]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const BottomNavigation: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const tabs = [
    { icon: 'H', label: 'Home', routeName: 'Home' },
    { icon: 'F', label: 'Finance', routeName: 'Finance' },
    { icon: 'He', label: 'Health', routeName: 'Health' },
    { icon: 'G', label: 'Goals', routeName: 'Goals' },
    { icon: 'I', label: 'Input', routeName: 'UniversalInput' },
    { icon: 'S', label: 'Settings', routeName: 'Settings' },
  ];

  const activeRouteName = (route as any)?.name;

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {tabs.map(tab => (
          <NavItem
            key={tab.routeName}
            icon={tab.icon}
            label={tab.label}
            isActive={activeRouteName === tab.routeName}
            onPress={() => (navigation as any).navigate(tab.routeName)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 5, 5, 0.92)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 10,
    minHeight: 72,
    justifyContent: 'space-between',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    minHeight: 46,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 6,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 22,
  },
  icon: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '800',
  },
  activeIcon: {
    color: '#00ffff',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    left: -4,
    right: -4,
    bottom: -2,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  label: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
    marginTop: 2,
  },
  activeLabel: {
    color: '#00ffff',
    fontWeight: '700',
  },
});
