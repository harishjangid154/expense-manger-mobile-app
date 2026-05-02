import React, { useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { AnimatedBackground } from './AnimatedBackground';
import { CommonLayout } from './CommonLayout';
import { GlassCard } from './GlassCard';
import { AppContext } from '../Context/AppContext';
import { BrahmacharyaLog, HealthProfile, WorkoutLog } from '../Types';
import { SqLiteHandler } from '../Utils/sqlite';

const { width: screenWidth } = Dimensions.get('window');
const GRAPH_WIDTH = screenWidth - 84;
const GRAPH_HEIGHT = 150;

const EXERCISE_OPTIONS = [
  { exercise: 'Pushups', reps: 20, color: '#18F7FF' },
  { exercise: 'Squats', reps: 30, color: '#78FF9C' },
  { exercise: 'Lunges', reps: 18, color: '#FF7AE5' },
  { exercise: 'Mountain Climbers', reps: 24, color: '#FFC857' },
];

const DIET_LIBRARY = {
  cut: {
    title: 'Lean vegetarian plate',
    meals: [
      'Breakfast: moong chilla with curd',
      'Lunch: dal, brown rice, paneer salad',
      'Dinner: tofu stir fry with sauteed vegetables',
    ],
  },
  maintain: {
    title: 'Balanced satvik plate',
    meals: [
      'Breakfast: oats, banana, peanut butter',
      'Lunch: roti, rajma, cucumber salad',
      'Dinner: khichdi with curd and sprouts',
    ],
  },
  bulk: {
    title: 'Protein-rich vegetarian gain plate',
    meals: [
      'Breakfast: paneer sandwich with milk',
      'Lunch: rice, chole, paneer, nuts',
      'Dinner: soy chunks pulao with dal',
    ],
  },
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string) => {
  const date = parseDate(value);
  if (!date) {
    return 'Today';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const calculateStreak = (logs: BrahmacharyaLog[]) => {
  const logMap = new Map(logs.map(log => [log.date, log.status]));
  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);
  const todayStatus = logMap.get(getDateKey(today));

  if (todayStatus === 'no') {
    return 0;
  }

  if (!todayStatus) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (logMap.get(getDateKey(cursor)) === 'yes') {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const calculateHealthScore = (streak: number) =>
  Math.max(20, Math.min(100, 38 + streak * 7));

const buildWeeklyWorkoutData = (logs: WorkoutLog[]) => {
  const now = new Date();
  const data = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    const key = getDateKey(date);
    const totalReps = logs.reduce((sum, log) => {
      const logDate = parseDate(log.date);
      if (!logDate || getDateKey(logDate) !== key) {
        return sum;
      }

      return sum + log.reps;
    }, 0);

    data.push({
      key,
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2),
      totalReps,
    });
  }

  return data;
};

const getPersonalRecords = (logs: WorkoutLog[]) => {
  const prMap = new Map<string, number>();

  logs.forEach(log => {
    const current = prMap.get(log.exercise) ?? 0;
    prMap.set(log.exercise, Math.max(current, log.reps));
  });

  return Array.from(prMap.entries())
    .map(([exercise, reps]) => ({ exercise, reps }))
    .sort((left, right) => right.reps - left.reps);
};

const getNextWorkoutRecommendation = (logs: WorkoutLog[]) => {
  const counts = new Map<string, number>();
  EXERCISE_OPTIONS.forEach(option => counts.set(option.exercise, 0));

  logs.slice(0, 8).forEach(log => {
    counts.set(log.exercise, (counts.get(log.exercise) ?? 0) + 1);
  });

  const sorted = EXERCISE_OPTIONS.slice().sort(
    (left, right) =>
      (counts.get(left.exercise) ?? 0) - (counts.get(right.exercise) ?? 0),
  );

  const top = sorted[0];
  return {
    title: `${top.exercise} focus`,
    note: `Try ${
      top.reps + 6
    } reps next. Mock logic picked the least-trained movement from your recent logs.`,
  };
};

const getDietPlan = (profile: HealthProfile) => {
  if (profile.currentWeight > profile.targetWeight + 1) {
    return DIET_LIBRARY.cut;
  }

  if (profile.currentWeight < profile.targetWeight - 1) {
    return DIET_LIBRARY.bulk;
  }

  return DIET_LIBRARY.maintain;
};

const getBodyGoalProgress = (profile: HealthProfile) => {
  const totalDistance = Math.abs(profile.startingWeight - profile.targetWeight);
  const completed = Math.abs(profile.startingWeight - profile.currentWeight);

  if (totalDistance === 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, (completed / totalDistance) * 100));
};

const WeeklyProgressGraph = ({ logs }: { logs: WorkoutLog[] }) => {
  const data = useMemo(() => buildWeeklyWorkoutData(logs), [logs]);
  const maxValue = Math.max(...data.map(item => item.totalReps), 1);
  const barWidth = Math.max((GRAPH_WIDTH - 40) / data.length - 8, 20);

  return (
    <View style={styles.graphWrapper}>
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
        {data.map((item, index) => {
          const barHeight = (item.totalReps / maxValue) * (GRAPH_HEIGHT - 34);
          const x = 16 + index * (barWidth + 8);
          const y = GRAPH_HEIGHT - barHeight - 18;

          return (
            <React.Fragment key={item.key}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={10}
                fill="#18F7FF"
                opacity={0.9}
              />
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={10}
                fill="#FFFFFF"
                opacity={0.08}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.graphLabels}>
        {data.map(item => (
          <Text key={item.key} style={styles.graphLabel}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const HealthDisciplineScreen: React.FC = () => {
  const { sqliteHandler } = useContext(AppContext) as {
    sqliteHandler: SqLiteHandler | null;
  };
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(
    null,
  );
  const [brahmacharyaLogs, setBrahmacharyaLogs] = useState<BrahmacharyaLog[]>(
    [],
  );
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const streakGlow = useSharedValue(0.18);
  const streakScale = useSharedValue(1);

  const loadHealthData = React.useCallback(async () => {
    if (!sqliteHandler) {
      return;
    }

    try {
      setIsLoading(true);
      const [profile, logs, workouts] = await Promise.all([
        sqliteHandler.readHealthProfile(),
        sqliteHandler.readBrahmacharyaLogs(),
        sqliteHandler.readWorkoutLogs(),
      ]);

      setHealthProfile(profile);
      setBrahmacharyaLogs(logs);
      setWorkoutLogs(workouts);
    } catch (error) {
      console.error('Unable to load health dashboard', error);
    } finally {
      setIsLoading(false);
    }
  }, [sqliteHandler]);

  useFocusEffect(
    React.useCallback(() => {
      loadHealthData();
    }, [loadHealthData]),
  );

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
    shadowColor: '#78FF9C',
    shadowOpacity: streakGlow.value,
    shadowRadius: 18 + streakGlow.value * 40,
    shadowOffset: { width: 0, height: 0 },
  }));

  const todayKey = getDateKey(new Date());
  const todayStatus =
    brahmacharyaLogs.find(log => log.date === todayKey)?.status ?? null;
  const streak = calculateStreak(brahmacharyaLogs);
  const healthScore = calculateHealthScore(streak);
  const personalRecords = getPersonalRecords(workoutLogs);
  const workoutRecommendation = getNextWorkoutRecommendation(workoutLogs);
  const dietPlan = healthProfile ? getDietPlan(healthProfile) : null;
  const bodyGoalProgress = healthProfile
    ? getBodyGoalProgress(healthProfile)
    : 0;

  const updateStreakGlow = () => {
    streakGlow.value = withSequence(
      withTiming(0.9, { duration: 220, easing: Easing.out(Easing.ease) }),
      withTiming(0.24, { duration: 600, easing: Easing.out(Easing.ease) }),
    );
    streakScale.value = withSequence(withSpring(1.03), withSpring(1));
  };

  const upsertLocalLog = (status: 'yes' | 'no') => {
    const nextLog: BrahmacharyaLog = {
      id: `brahma-${todayKey}`,
      date: todayKey,
      status,
    };

    return [
      nextLog,
      ...brahmacharyaLogs.filter(log => log.date !== todayKey),
    ].sort((left, right) => right.date.localeCompare(left.date));
  };

  const handleBrahmacharyaToggle = async (status: 'yes' | 'no') => {
    if (!sqliteHandler) {
      return;
    }

    const previousStreak = streak;
    const updatedLogs = upsertLocalLog(status);

    try {
      await sqliteHandler.upsertBrahmacharyaLog(todayKey, status);
      setBrahmacharyaLogs(updatedLogs);

      const nextStreak = calculateStreak(updatedLogs);
      if (status === 'yes' && nextStreak > previousStreak) {
        updateStreakGlow();
      }
    } catch (error) {
      console.error('Unable to update brahmacharya log', error);
    }
  };

  const handleWorkoutLog = async (exercise: string, reps: number) => {
    if (!sqliteHandler) {
      return;
    }

    const workout: WorkoutLog = {
      id: `workout-${Date.now()}`,
      date: new Date().toISOString(),
      exercise,
      reps,
    };

    try {
      await sqliteHandler.writeWorkoutLog(workout);
      setWorkoutLogs(current => [workout, ...current]);
    } catch (error) {
      console.error('Unable to log workout', error);
    }
  };

  const handleWeightAdjust = async (delta: number) => {
    if (!sqliteHandler || !healthProfile) {
      return;
    }

    const nextWeight = Math.max(
      35,
      Number((healthProfile.currentWeight + delta).toFixed(1)),
    );

    try {
      await sqliteHandler.updateCurrentWeight(nextWeight);
      setHealthProfile(current =>
        current
          ? {
              ...current,
              currentWeight: nextWeight,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
    } catch (error) {
      console.error('Unable to update current weight', error);
    }
  };

  if (isLoading && !healthProfile) {
    return (
      <AnimatedBackground>
        <CommonLayout>
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#18F7FF" />
            <Text style={styles.loadingText}>
              Loading health and discipline...
            </Text>
          </View>
        </CommonLayout>
      </AnimatedBackground>
    );
  }

  if (!healthProfile || !dietPlan) {
    return (
      <AnimatedBackground>
        <CommonLayout>
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>
              No local health profile found.
            </Text>
          </View>
        </CommonLayout>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <CommonLayout>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            <Text style={styles.overline}>Health quest</Text>
            <Text style={styles.title}>Health & Discipline</Text>
            <Text style={styles.subtitle}>
              Build streaks, level up workouts, and keep your body goals visible
              every day.
            </Text>
          </View>

          <Animated.View style={streakAnimatedStyle}>
            <GlassCard style={styles.heroCard} opacity={0.13}>
              <Text style={styles.sectionEyebrow}>Brahmacharya Tracker</Text>
              <Text style={styles.heroValue}>{streak} day streak</Text>
              <Text style={styles.heroSubtext}>
                Health score {healthScore}/100 based on your current streak.
              </Text>

              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    todayStatus === 'yes' && styles.toggleButtonYesActive,
                  ]}
                  onPress={() => handleBrahmacharyaToggle('yes')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      todayStatus === 'yes' && styles.toggleTextYesActive,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    todayStatus === 'no' && styles.toggleButtonNoActive,
                  ]}
                  onPress={() => handleBrahmacharyaToggle('no')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      todayStatus === 'no' && styles.toggleTextNoActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.scoreTrack}>
                <View
                  style={[styles.scoreFill, { width: `${healthScore}%` }]}
                />
              </View>
            </GlassCard>
          </Animated.View>

          <GlassCard style={styles.sectionCard} opacity={0.1}>
            <Text style={styles.sectionTitle}>Exercise Tracker</Text>
            <Text style={styles.sectionNote}>
              Tap a movement to log a quick workout and keep the weekly graph
              moving.
            </Text>

            <View style={styles.exerciseButtons}>
              {EXERCISE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.exercise}
                  style={[
                    styles.exerciseButton,
                    { borderColor: `${option.color}44` },
                  ]}
                  onPress={() => handleWorkoutLog(option.exercise, option.reps)}
                >
                  <Text
                    style={[
                      styles.exerciseButtonTitle,
                      { color: option.color },
                    ]}
                  >
                    {option.exercise}
                  </Text>
                  <Text style={styles.exerciseButtonSubtext}>
                    +{option.reps} reps
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subsectionTitle}>Personal Records</Text>
            <View style={styles.prGrid}>
              {personalRecords.slice(0, 4).map(record => (
                <View key={record.exercise} style={styles.prCard}>
                  <Text style={styles.prExercise}>{record.exercise}</Text>
                  <Text style={styles.prValue}>{record.reps} reps</Text>
                </View>
              ))}
            </View>

            <Text style={styles.subsectionTitle}>Weekly Progress</Text>
            <WeeklyProgressGraph logs={workoutLogs} />
          </GlassCard>

          <GlassCard style={styles.sectionCard} opacity={0.1}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>Next workout</Text>
              <Text style={styles.recommendationTitle}>
                {workoutRecommendation.title}
              </Text>
              <Text style={styles.recommendationText}>
                {workoutRecommendation.note}
              </Text>
            </View>

            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>Vegetarian diet</Text>
              <Text style={styles.recommendationTitle}>{dietPlan.title}</Text>
              {dietPlan.meals.map(meal => (
                <Text key={meal} style={styles.recommendationText}>
                  {meal}
                </Text>
              ))}
            </View>
          </GlassCard>

          <GlassCard style={styles.sectionCard} opacity={0.1}>
            <Text style={styles.sectionTitle}>Body Goals</Text>
            <View style={styles.bodyGoalRow}>
              <View style={styles.bodyGoalMetric}>
                <Text style={styles.bodyGoalLabel}>Current weight</Text>
                <Text style={styles.bodyGoalValue}>
                  {healthProfile.currentWeight.toFixed(1)} kg
                </Text>
              </View>
              <View style={styles.bodyGoalMetric}>
                <Text style={styles.bodyGoalLabel}>Target weight</Text>
                <Text style={styles.bodyGoalValue}>
                  {healthProfile.targetWeight.toFixed(1)} kg
                </Text>
              </View>
            </View>

            <View style={styles.weightAdjustRow}>
              <TouchableOpacity
                style={styles.weightButton}
                onPress={() => handleWeightAdjust(-0.5)}
              >
                <Text style={styles.weightButtonText}>-0.5 kg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.weightButton}
                onPress={() => handleWeightAdjust(0.5)}
              >
                <Text style={styles.weightButtonText}>+0.5 kg</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.goalProgressTrack}>
              <View
                style={[
                  styles.goalProgressFill,
                  { width: `${bodyGoalProgress}%` },
                ]}
              />
            </View>
            <Text style={styles.goalProgressText}>
              {Math.round(bodyGoalProgress)}% of the way from{' '}
              {healthProfile.startingWeight.toFixed(1)} kg to your target.
            </Text>
          </GlassCard>

          <GlassCard style={styles.sectionCard} opacity={0.08}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {workoutLogs.slice(0, 4).map(log => (
              <View key={log.id} style={styles.activityRow}>
                <Text style={styles.activityTitle}>
                  {log.exercise} - {log.reps} reps
                </Text>
                <Text style={styles.activityDate}>{formatDate(log.date)}</Text>
              </View>
            ))}
          </GlassCard>
        </ScrollView>
      </CommonLayout>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
  },
  header: {
    marginBottom: 18,
  },
  overline: {
    color: '#78FF9C',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(120, 255, 156, 0.28)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(120,255,156,0.18)',
    shadowColor: '#78FF9C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
    elevation: 8,
  },
  sectionCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleButtonYesActive: {
    backgroundColor: 'rgba(120,255,156,0.14)',
    borderColor: 'rgba(120,255,156,0.34)',
  },
  toggleButtonNoActive: {
    backgroundColor: 'rgba(255,122,145,0.14)',
    borderColor: 'rgba(255,122,145,0.34)',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  toggleTextYesActive: {
    color: '#78FF9C',
  },
  toggleTextNoActive: {
    color: '#FF90AA',
  },
  scoreTrack: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#78FF9C',
    shadowColor: '#78FF9C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionNote: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  exerciseButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  exerciseButton: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
  },
  exerciseButtonTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  exerciseButtonSubtext: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
  },
  subsectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 4,
  },
  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  prCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  prExercise: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    marginBottom: 8,
  },
  prValue: {
    color: '#18F7FF',
    fontSize: 18,
    fontWeight: '800',
  },
  graphWrapper: {
    marginTop: 4,
  },
  graphLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 6,
  },
  graphLabel: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 11,
    minWidth: 28,
    textAlign: 'center',
  },
  recommendationCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginTop: 10,
  },
  recommendationLabel: {
    color: '#78FF9C',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  recommendationText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  bodyGoalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  bodyGoalMetric: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bodyGoalLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    marginBottom: 8,
  },
  bodyGoalValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  weightAdjustRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  weightButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(24,247,255,0.18)',
  },
  weightButtonText: {
    color: '#18F7FF',
    fontSize: 14,
    fontWeight: '800',
  },
  goalProgressTrack: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#18F7FF',
  },
  goalProgressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  activityDate: {
    color: 'rgba(255,255,255,0.56)',
    fontSize: 13,
  },
});

export default HealthDisciplineScreen;
