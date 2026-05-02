import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AnimatedBackground } from './AnimatedBackground';
import { CommonLayout } from './CommonLayout';
import { GlassCard } from './GlassCard';
import { AppContext } from '../Context/AppContext';
import { Goal, GoalType } from '../Types';
import { SqLiteHandler } from '../Utils/sqlite';

type GoalDraft = {
  title: string;
  type: GoalType;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  sourceText: string;
};

type GoalStatus = 'completed' | 'on-track' | 'started' | 'overdue';

const capitalizeWords = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const createGoalId = () =>
  `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDeadline = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const parseNumber = (rawValue?: string | null) => {
  if (!rawValue) {
    return null;
  }

  const cleaned = rawValue.replace(/,/g, '').trim().toLowerCase();

  if (cleaned.endsWith('k')) {
    return Number.parseFloat(cleaned.slice(0, -1)) * 1000;
  }

  if (cleaned.includes('lakh')) {
    return Number.parseFloat(cleaned.replace('lakh', '').trim()) * 100000;
  }

  return Number.parseFloat(cleaned);
};

const inferType = (text: string): GoalType => {
  const value = text.toLowerCase();

  if (
    /(save|invest|money|fund|rupees|rs|salary|income|debt|loan|buy)/.test(value)
  ) {
    return 'financial';
  }

  if (
    /(weight|kg|run|pushup|pushups|squat|squats|workout|fitness|muscle|walk)/.test(
      value,
    )
  ) {
    return 'fitness';
  }

  return 'discipline';
};

const inferUnit = (text: string, type: GoalType) => {
  const value = text.toLowerCase();

  if (
    /(rs|rupees|money|fund|save|invest)/.test(value) ||
    type === 'financial'
  ) {
    return 'Rs';
  }

  if (/\bkg\b|weight/.test(value)) {
    return 'kg';
  }

  if (/\breps?\b|pushups?|squats?/.test(value)) {
    return 'reps';
  }

  if (
    /\bdays?\b|streak|discipline|brahmacharya/.test(value) ||
    type === 'discipline'
  ) {
    return 'days';
  }

  return type === 'fitness' ? 'sessions' : 'points';
};

const inferTitle = (text: string, type: GoalType) => {
  const trimmed = text
    .replace(/\bby\s+.+$/i, '')
    .replace(
      /\b(save|reach|lose|gain|build|complete|achieve|target|want to|aim to)\b/gi,
      '',
    )
    .replace(/\b\d+([.,]\d+)?\s*(k|kg|days?|reps?|rupees|rs|lakh)?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (trimmed.length > 2) {
    return capitalizeWords(trimmed);
  }

  switch (type) {
    case 'financial':
      return 'Financial Goal';
    case 'fitness':
      return 'Fitness Goal';
    default:
      return 'Discipline Goal';
  }
};

const inferTarget = (text: string, type: GoalType) => {
  const match = text.match(/(\d[\d,]*(?:\.\d+)?)\s*(k|kg|days?|reps?|lakh)?/i);
  const rawNumber = parseNumber(
    match?.[1] ? `${match[1]}${match?.[2] ?? ''}` : null,
  );

  if (rawNumber && rawNumber > 0) {
    return rawNumber;
  }

  switch (type) {
    case 'financial':
      return 100000;
    case 'fitness':
      return 12;
    default:
      return 30;
  }
};

const inferDeadline = (text: string) => {
  const byMatch = text.match(/\bby\s+(.+)$/i);
  if (byMatch?.[1]) {
    const parsed = new Date(byMatch[1]);
    if (!Number.isNaN(parsed.getTime())) {
      return toDateKey(parsed);
    }
  }

  const fallback = new Date();
  fallback.setMonth(fallback.getMonth() + 3);
  return toDateKey(fallback);
};

const parseNaturalGoal = (text: string): GoalDraft => {
  const type = inferType(text);
  const unit = inferUnit(text, type);
  const targetValue = inferTarget(text, type);

  return {
    title: inferTitle(text, type),
    type,
    currentValue: 0,
    targetValue,
    unit,
    deadline: inferDeadline(text),
    sourceText: text.trim(),
  };
};

const calculateProgress = (goal: Goal | GoalDraft) => {
  if (goal.targetValue <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)),
  );
};

const getGoalStatus = (goal: Goal): GoalStatus => {
  const progress = calculateProgress(goal);

  if (progress >= 100) {
    return 'completed';
  }

  const deadline = new Date(goal.deadline);
  const now = new Date();
  if (!Number.isNaN(deadline.getTime()) && deadline < now) {
    return 'overdue';
  }

  if (progress >= 55) {
    return 'on-track';
  }

  return 'started';
};

const getStatusColor = (status: GoalStatus) => {
  switch (status) {
    case 'completed':
      return '#78FF9C';
    case 'on-track':
      return '#18F7FF';
    case 'overdue':
      return '#FF7D9A';
    default:
      return '#FFC857';
  }
};

const getTypeAccent = (type: GoalType) => {
  switch (type) {
    case 'financial':
      return '#18F7FF';
    case 'fitness':
      return '#78FF9C';
    default:
      return '#FF7AE5';
  }
};

const getProgressStep = (goal: Goal) => {
  if (goal.unit === 'Rs') {
    return Math.max(1000, Math.round(goal.targetValue / 10));
  }

  if (goal.unit === 'kg') {
    return 0.5;
  }

  return 1;
};

const GoalManagementScreen: React.FC = () => {
  const { sqliteHandler } = useContext(AppContext) as {
    sqliteHandler: SqLiteHandler | null;
  };
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [draft, setDraft] = useState<GoalDraft | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<GoalDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGoals = React.useCallback(async () => {
    if (!sqliteHandler) {
      return;
    }

    try {
      setIsLoading(true);
      const storedGoals = await sqliteHandler.readGoals();
      setGoals(storedGoals);
    } catch (error) {
      console.error('Unable to load goals', error);
    } finally {
      setIsLoading(false);
    }
  }, [sqliteHandler]);

  useFocusEffect(
    React.useCallback(() => {
      loadGoals();
    }, [loadGoals]),
  );

  const handleParseGoal = () => {
    if (!goalInput.trim()) {
      return;
    }

    setDraft(parseNaturalGoal(goalInput));
  };

  const handleAddGoal = async () => {
    if (!sqliteHandler || !draft) {
      return;
    }

    const now = new Date().toISOString();
    const goal: Goal = {
      id: createGoalId(),
      title: draft.title,
      type: draft.type,
      currentValue: draft.currentValue,
      targetValue: draft.targetValue,
      unit: draft.unit,
      deadline: draft.deadline,
      createdAt: now,
      updatedAt: now,
      sourceText: draft.sourceText,
    };

    try {
      await sqliteHandler.writeGoal(goal);
      setGoals(current => [goal, ...current]);
      setGoalInput('');
      setDraft(null);
    } catch (error) {
      console.error('Unable to create goal', error);
    }
  };

  const handleProgressAdjust = async (goal: Goal, direction: 1 | -1) => {
    if (!sqliteHandler) {
      return;
    }

    const step = getProgressStep(goal);
    const nextValue = Math.max(
      0,
      Number((goal.currentValue + step * direction).toFixed(1)),
    );
    const updatedGoal: Goal = {
      ...goal,
      currentValue: Math.min(nextValue, goal.targetValue),
      updatedAt: new Date().toISOString(),
    };

    try {
      await sqliteHandler.updateGoal(updatedGoal);
      setGoals(current =>
        current.map(item => (item.id === goal.id ? updatedGoal : item)),
      );
    } catch (error) {
      console.error('Unable to update progress', error);
    }
  };

  const startEditingGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditDraft({
      title: goal.title,
      type: goal.type,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
      unit: goal.unit,
      deadline: goal.deadline,
      sourceText: goal.sourceText,
    });
  };

  const handleSaveGoal = async (goal: Goal) => {
    if (!sqliteHandler || !editDraft) {
      return;
    }

    const updatedGoal: Goal = {
      ...goal,
      title: editDraft.title,
      type: editDraft.type,
      currentValue: editDraft.currentValue,
      targetValue: editDraft.targetValue,
      unit: editDraft.unit,
      deadline: editDraft.deadline,
      sourceText: editDraft.sourceText,
      updatedAt: new Date().toISOString(),
    };

    try {
      await sqliteHandler.updateGoal(updatedGoal);
      setGoals(current =>
        current.map(item => (item.id === goal.id ? updatedGoal : item)),
      );
      setEditingGoalId(null);
      setEditDraft(null);
    } catch (error) {
      console.error('Unable to save goal', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!sqliteHandler) {
      return;
    }

    try {
      await sqliteHandler.deleteGoal(goalId);
      setGoals(current => current.filter(goal => goal.id !== goalId));
      if (editingGoalId === goalId) {
        setEditingGoalId(null);
        setEditDraft(null);
      }
    } catch (error) {
      console.error('Unable to delete goal', error);
    }
  };

  if (isLoading && goals.length === 0) {
    return (
      <AnimatedBackground>
        <CommonLayout>
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#18F7FF" />
            <Text style={styles.loadingText}>Loading goal management...</Text>
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
            <Text style={styles.overline}>Mission control</Text>
            <Text style={styles.title}>Goal Management</Text>
            <Text style={styles.subtitle}>
              Add goals naturally, track progress live, and keep every target
              visible in one place.
            </Text>
          </View>

          <GlassCard style={styles.inputCard} opacity={0.12}>
            <Text style={styles.sectionTitle}>Add Goal Via Natural Input</Text>
            <TextInput
              style={styles.input}
              placeholder="Try: Save 500000 for bike by Dec 31"
              placeholderTextColor="rgba(255,255,255,0.42)"
              value={goalInput}
              onChangeText={setGoalInput}
              multiline
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleParseGoal}
              >
                <Text style={styles.primaryButtonText}>Parse Goal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setGoalInput('');
                  setDraft(null);
                }}
              >
                <Text style={styles.secondaryButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {draft && (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Parsed Preview</Text>
                <Text style={styles.previewTitle}>{draft.title}</Text>
                <Text style={styles.previewText}>
                  {capitalizeWords(draft.type)} goal - {draft.targetValue}{' '}
                  {draft.unit}
                </Text>
                <Text style={styles.previewText}>
                  Deadline: {formatDeadline(draft.deadline)}
                </Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleAddGoal}
                >
                  <Text style={styles.createButtonText}>Create Goal</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>

          <View style={styles.goalList}>
            {goals.length === 0 ? (
              <GlassCard style={styles.goalCard} opacity={0.08}>
                <Text style={styles.goalTitle}>No goals yet</Text>
                <Text style={styles.goalMeta}>
                  Parse a natural-language goal above to create your first one.
                </Text>
              </GlassCard>
            ) : (
              goals.map(goal => {
                const progress = calculateProgress(goal);
                const status = getGoalStatus(goal);
                const accentColor = getTypeAccent(goal.type);
                const isEditing = editingGoalId === goal.id && editDraft;

                return (
                  <GlassCard
                    key={goal.id}
                    style={styles.goalCard}
                    opacity={0.1}
                  >
                    {!isEditing ? (
                      <>
                        <View style={styles.goalHeader}>
                          <View style={styles.goalHeaderCopy}>
                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text
                              style={[styles.goalType, { color: accentColor }]}
                            >
                              {capitalizeWords(goal.type)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                borderColor: `${getStatusColor(status)}55`,
                                backgroundColor: `${getStatusColor(status)}18`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: getStatusColor(status) },
                              ]}
                            >
                              {capitalizeWords(status.replace('-', ' '))}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.goalMeta}>
                          Deadline: {formatDeadline(goal.deadline)}
                        </Text>
                        <Text style={styles.goalMeta}>
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </Text>

                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${progress}%`,
                                backgroundColor: accentColor,
                                shadowColor: accentColor,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {progress}% complete
                        </Text>

                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.adjustButton}
                            onPress={() => handleProgressAdjust(goal, -1)}
                          >
                            <Text style={styles.adjustButtonText}>
                              - Progress
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.adjustButton}
                            onPress={() => handleProgressAdjust(goal, 1)}
                          >
                            <Text style={styles.adjustButtonText}>
                              + Progress
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => startEditingGoal(goal)}
                          >
                            <Text style={styles.editButtonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteGoal(goal.id)}
                          >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.sectionTitle}>Edit Goal</Text>
                        <TextInput
                          style={styles.editInput}
                          value={editDraft.title}
                          onChangeText={text =>
                            setEditDraft(current =>
                              current ? { ...current, title: text } : current,
                            )
                          }
                          placeholder="Title"
                          placeholderTextColor="rgba(255,255,255,0.42)"
                        />
                        <View style={styles.typeSelectorRow}>
                          {(
                            ['financial', 'fitness', 'discipline'] as GoalType[]
                          ).map(type => (
                            <TouchableOpacity
                              key={type}
                              style={[
                                styles.typeChip,
                                editDraft.type === type &&
                                  styles.typeChipActive,
                              ]}
                              onPress={() =>
                                setEditDraft(current =>
                                  current ? { ...current, type } : current,
                                )
                              }
                            >
                              <Text
                                style={[
                                  styles.typeChipText,
                                  editDraft.type === type &&
                                    styles.typeChipTextActive,
                                ]}
                              >
                                {capitalizeWords(type)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TextInput
                          style={styles.editInput}
                          value={editDraft.currentValue.toString()}
                          onChangeText={text =>
                            setEditDraft(current =>
                              current
                                ? {
                                    ...current,
                                    currentValue: Number.parseFloat(text) || 0,
                                  }
                                : current,
                            )
                          }
                          placeholder="Current progress"
                          placeholderTextColor="rgba(255,255,255,0.42)"
                          keyboardType="numeric"
                        />
                        <TextInput
                          style={styles.editInput}
                          value={editDraft.targetValue.toString()}
                          onChangeText={text =>
                            setEditDraft(current =>
                              current
                                ? {
                                    ...current,
                                    targetValue: Number.parseFloat(text) || 1,
                                  }
                                : current,
                            )
                          }
                          placeholder="Target"
                          placeholderTextColor="rgba(255,255,255,0.42)"
                          keyboardType="numeric"
                        />
                        <TextInput
                          style={styles.editInput}
                          value={editDraft.deadline}
                          onChangeText={text =>
                            setEditDraft(current =>
                              current
                                ? { ...current, deadline: text }
                                : current,
                            )
                          }
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="rgba(255,255,255,0.42)"
                        />
                        <TextInput
                          style={styles.editInput}
                          value={editDraft.sourceText}
                          onChangeText={text =>
                            setEditDraft(current =>
                              current
                                ? { ...current, sourceText: text }
                                : current,
                            )
                          }
                          placeholder="Original goal text"
                          placeholderTextColor="rgba(255,255,255,0.42)"
                          multiline
                        />

                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => handleSaveGoal(goal)}
                          >
                            <Text style={styles.editButtonText}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => {
                              setEditingGoalId(null);
                              setEditDraft(null);
                            }}
                          >
                            <Text style={styles.secondaryButtonText}>
                              Cancel
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </GlassCard>
                );
              })
            )}
          </View>
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
    color: 'rgba(255,255,255,0.74)',
    textAlign: 'center',
  },
  header: {
    marginBottom: 18,
  },
  overline: {
    color: '#18F7FF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(24,247,255,0.28)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
  },
  inputCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(24,247,255,0.18)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  input: {
    minHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(24,247,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(24,247,255,0.34)',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#18F7FF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '700',
  },
  previewCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  previewLabel: {
    color: '#18F7FF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  previewText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  createButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#18F7FF',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#051017',
    fontSize: 15,
    fontWeight: '800',
  },
  goalList: {
    gap: 14,
  },
  goalCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  goalHeaderCopy: {
    flex: 1,
  },
  goalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  goalType: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  goalMeta: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    marginBottom: 6,
  },
  progressBarTrack: {
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 14,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  typeChipActive: {
    backgroundColor: 'rgba(24,247,255,0.16)',
    borderColor: 'rgba(24,247,255,0.26)',
  },
  typeChipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: '#18F7FF',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  adjustButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  editButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(24,247,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(24,247,255,0.28)',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#18F7FF',
    fontSize: 14,
    fontWeight: '800',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,125,154,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,125,154,0.28)',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF7D9A',
    fontSize: 14,
    fontWeight: '800',
  },
  editInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
});

export default GoalManagementScreen;
