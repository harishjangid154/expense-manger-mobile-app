import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
  delay: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, icon, color, delay }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  opacity.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));
  scale.value = withDelay(delay, withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: interpolate(opacity.value, [0, 1], [20, 0]) }
      ],
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.icon, { color }]}>{icon}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </GlassCard>
    </Animated.View>
  );
};

export const SummaryCards: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SummaryCard
          title="Net Worth"
          value="$45,280"
          subtitle="+12% this month"
          icon="💎"
          color="#00ffff"
          delay={100}
        />
        <SummaryCard
          title="Monthly Savings"
          value="$3,450"
          subtitle="$550 to goal"
          icon="💰"
          color="#00ff00"
          delay={200}
        />
      </View>
      <View style={styles.row}>
        <SummaryCard
          title="Health Score"
          value="87/100"
          subtitle="Great progress!"
          icon="❤️"
          color="#ff00ff"
          delay={300}
        />
        <SummaryCard
          title="Discipline"
          value="21 days"
          subtitle="🔥 Current streak"
          icon="⚡"
          color="#ff00aa"
          delay={400}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  card: {
    minHeight: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
