import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withDelay,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { GlassCard } from './GlassCard';

interface CircularProgressProps {
  size: number;
  progress: number;
  strokeWidth: number;
  color: string;
  title: string;
  subtitle: string;
  delay: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  progress,
  strokeWidth,
  color,
  title,
  subtitle,
  delay,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const animatedProgress = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = progress;
  }, [progress, delay]);
  opacity.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));

  const animatedStyle = useAnimatedStyle(() => {
    const currentOffset = circumference - (animatedProgress.value / 100) * circumference;
    console.log('animatedProgress.value in animatedStyle:', animatedProgress.value);
    console.log('calculated percentage:', Math.round(animatedProgress.value));
    return {
      opacity: opacity.value,
      transform: [
        { scale: interpolate(opacity.value, [0, 1], [0.8, 1]) },
        { translateY: interpolate(opacity.value, [0, 1], [20, 0]) }
      ],
    };
  });

  const animatedStrokeDashoffset = useSharedValue(circumference);

  React.useEffect(() => {
    animatedStrokeDashoffset.value = strokeDashoffset;
  }, [strokeDashoffset, delay]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: animatedStrokeDashoffset.value,
    };
  });

  
  return (
    <Animated.View style={[styles.progressContainer, animatedStyle]}>
      <GlassCard style={styles.card}>
        <View style={styles.content}>
          <View style={styles.svgContainer}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeLinecap="round"
                animatedProps={animatedProps}
              />
            </Svg>
            <View style={styles.percentageContainer}>
              <Text style={[styles.percentage, { color }]}>
                {Math.round(animatedProgress.value)}%
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Progress Overview</Text>
      <View style={styles.progressRow}>
        <CircularProgress
          size={100}
          progress={75}
          strokeWidth={8}
          color="#00ffff"
          title="Fitness"
          subtitle="18/24 workouts"
          delay={100}
        />
        <CircularProgress
          size={100}
          progress={60}
          strokeWidth={8}
          color="#00ff00"
          title="Financial"
          subtitle="$3,450/$6,000"
          delay={200}
        />
        <CircularProgress
          size={100}
          progress={88}
          strokeWidth={8}
          color="#ff00ff"
          title="Discipline"
          subtitle="21 day streak"
          delay={300}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textShadowColor: '#ff00ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  card: {
    alignItems: 'center',
    height: 200,
  },
  content: {
    alignItems: 'center',
    flex: 1,
  },
  svgContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});
