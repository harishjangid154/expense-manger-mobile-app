import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Polyline,
  Rect,
  Stop,
} from 'react-native-svg';
import { AnimatedBackground } from './AnimatedBackground';
import { CommonLayout } from './CommonLayout';
import { GlassCard } from './GlassCard';
import { AppContext } from '../Context/AppContext';
import { Expense, FinancialProfile } from '../Types';
import { SqLiteHandler } from '../Utils/sqlite';

const { width: screenWidth } = Dimensions.get('window');
const LINE_CHART_HEIGHT = 164;
const BAR_CHART_HEIGHT = 164;
const CHART_WIDTH = screenWidth - 84;

type ExpenseFilter = 'today' | 'week' | 'month';

type FinancialState = {
  savings: number;
  cash: number;
  investments: number;
  carValue: number;
  loanBalance: number;
  loanTenureMonths: number;
  creditCardBalance: number;
};

type NetWorthPoint = {
  label: string;
  netWorth: number;
};

type AssetPoint = {
  label: string;
  value: number;
  color: string;
};

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const parseDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatCurrency = (value: number) => {
  const sign = value < 0 ? '-' : '';
  return `${sign}Rs ${Math.abs(value).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};

const formatDate = (value: string | Date) => {
  const date = parseDate(value);
  if (!date) {
    return 'Unknown date';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

const getMonthLabel = (monthsAway: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsAway);
  return MONTH_LABELS[date.getMonth()];
};

const toRate = (percentage: number) => percentage / 100;

const calculateTotalAssets = (state: FinancialState) =>
  state.savings + state.cash + state.investments + state.carValue;

const calculateTotalLiabilities = (state: FinancialState) =>
  state.loanBalance + state.creditCardBalance;

const calculateNetWorth = (state: FinancialState) =>
  calculateTotalAssets(state) - calculateTotalLiabilities(state);

const getCurrentState = (profile: FinancialProfile): FinancialState => ({
  savings: profile.savings,
  cash: profile.cash,
  investments: profile.investments,
  carValue: profile.carValue,
  loanBalance: profile.loanBalance,
  loanTenureMonths: profile.loanTenureMonths,
  creditCardBalance: profile.creditCardBalance,
});

const projectFutureState = (
  profile: FinancialProfile,
  monthsAhead: number,
): FinancialState => {
  const monthlyDepreciationRate = toRate(profile.carDepreciationRate);
  const nextState = { ...getCurrentState(profile) };

  for (let month = 0; month < monthsAhead; month += 1) {
    nextState.savings += profile.monthlySavingsContribution;
    nextState.investments += profile.monthlyInvestmentContribution;
    nextState.carValue *= 1 - monthlyDepreciationRate;

    if (nextState.loanTenureMonths > 0 && nextState.loanBalance > 0) {
      nextState.loanBalance = Math.max(
        0,
        nextState.loanBalance - profile.loanEmi,
      );
      nextState.loanTenureMonths -= 1;
    }
  }

  return nextState;
};

const estimatePastState = (
  profile: FinancialProfile,
  monthsAgo: number,
): FinancialState => {
  const monthlyDepreciationRate = Math.max(
    toRate(profile.carDepreciationRate),
    0.0001,
  );
  const reverseFactor = Math.pow(1 - monthlyDepreciationRate, monthsAgo);

  return {
    savings: Math.max(
      profile.savings - profile.monthlySavingsContribution * monthsAgo,
      0,
    ),
    cash: profile.cash,
    investments: Math.max(
      profile.investments - profile.monthlyInvestmentContribution * monthsAgo,
      0,
    ),
    carValue: profile.carValue / reverseFactor,
    loanBalance: profile.loanBalance + profile.loanEmi * monthsAgo,
    loanTenureMonths: profile.loanTenureMonths + monthsAgo,
    creditCardBalance: profile.creditCardBalance,
  };
};

const buildNetWorthHistory = (profile: FinancialProfile) => {
  const points: NetWorthPoint[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const state = estimatePastState(profile, index);
    points.push({
      label: getMonthLabel(-index),
      netWorth: calculateNetWorth(state),
    });
  }

  return points;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getWeekStart = (date: Date) => {
  const copy = new Date(date);
  const currentDay = copy.getDay();
  const distanceFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - distanceFromMonday);
  return copy;
};

const filterExpensesByRange = (expenses: Expense[], filter: ExpenseFilter) => {
  const now = new Date();
  const weekStart = getWeekStart(now);

  return expenses
    .filter(expense => {
      const expenseDate = parseDate(expense.date);
      if (!expenseDate) {
        return false;
      }

      switch (filter) {
        case 'today':
          return isSameDay(expenseDate, now);
        case 'week':
          return expenseDate >= weekStart && expenseDate <= now;
        case 'month':
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        default:
          return true;
      }
    })
    .sort((left, right) => {
      const leftDate = parseDate(left.date)?.getTime() ?? 0;
      const rightDate = parseDate(right.date)?.getTime() ?? 0;
      return rightDate - leftDate;
    });
};

const NeonLineChart = ({ points }: { points: NetWorthPoint[] }) => {
  if (points.length === 0) {
    return null;
  }

  const values = points.map(point => point.netWorth);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = Math.max(maxValue - minValue, 1);
  const chartPadding = 12;
  const chartWidth = CHART_WIDTH - chartPadding * 2;
  const chartHeight = LINE_CHART_HEIGHT - chartPadding * 2;

  const coordinates = points.map((point, index) => {
    const x =
      chartPadding + (index * chartWidth) / Math.max(points.length - 1, 1);
    const y =
      chartPadding +
      chartHeight -
      ((point.netWorth - minValue) / valueRange) * chartHeight;

    return { x, y };
  });

  const polylinePoints = coordinates
    .map(point => `${point.x},${point.y}`)
    .join(' ');
  const areaPath = `${coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')} L ${coordinates[coordinates.length - 1].x} ${
    LINE_CHART_HEIGHT - chartPadding
  } L ${coordinates[0].x} ${LINE_CHART_HEIGHT - chartPadding} Z`;

  return (
    <View style={styles.chartShell}>
      <Svg width={CHART_WIDTH} height={LINE_CHART_HEIGHT}>
        <Defs>
          <SvgLinearGradient
            id="netWorthArea"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <Stop offset="0%" stopColor="#18F7FF" stopOpacity={0.32} />
            <Stop offset="100%" stopColor="#18F7FF" stopOpacity={0.02} />
          </SvgLinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#netWorthArea)" />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke="#18F7FF"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coordinates.map((point, index) => (
          <Circle
            key={`${points[index].label}-${point.x}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#0A1017"
            stroke="#76FFF8"
            strokeWidth={2}
          />
        ))}
      </Svg>
      <View style={styles.chartLabelsRow}>
        {points.map(point => (
          <Text key={point.label} style={styles.chartLabel}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const NeonBarChart = ({ assets }: { assets: AssetPoint[] }) => {
  const maxValue = Math.max(...assets.map(asset => asset.value), 1);
  const barWidth = Math.max((CHART_WIDTH - 48) / assets.length - 10, 22);

  return (
    <View style={styles.chartShell}>
      <Svg width={CHART_WIDTH} height={BAR_CHART_HEIGHT}>
        {assets.map((asset, index) => {
          const barHeight = (asset.value / maxValue) * (BAR_CHART_HEIGHT - 44);
          const x = 20 + index * (barWidth + 12);
          const y = BAR_CHART_HEIGHT - barHeight - 20;

          return (
            <React.Fragment key={asset.label}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={10}
                fill={asset.color}
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
      <View style={styles.chartLabelsRow}>
        {assets.map(asset => (
          <Text key={asset.label} style={styles.chartLabel}>
            {asset.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const MetricTile = ({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string;
  accentColor: string;
}) => (
  <View style={styles.metricTile}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color: accentColor }]}>{value}</Text>
  </View>
);

const FinancialDashboard: React.FC = () => {
  const { sqliteHandler } = useContext(AppContext) as {
    sqliteHandler: SqLiteHandler | null;
  };
  const [financialProfile, setFinancialProfile] =
    useState<FinancialProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<ExpenseFilter>('month');
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = React.useCallback(async () => {
    if (!sqliteHandler) {
      return;
    }

    try {
      setIsLoading(true);
      const [profile, storedExpenses] = await Promise.all([
        sqliteHandler.readFinancialProfile(),
        sqliteHandler.readExpenses(),
      ]);
      setFinancialProfile(profile);
      setExpenses(storedExpenses);
    } catch (error) {
      console.error('Unable to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  }, [sqliteHandler]);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData]),
  );

  if (isLoading && !financialProfile) {
    return (
      <AnimatedBackground>
        <CommonLayout>
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#18F7FF" />
            <Text style={styles.loadingText}>
              Loading financial dashboard...
            </Text>
          </View>
        </CommonLayout>
      </AnimatedBackground>
    );
  }

  if (!financialProfile) {
    return (
      <AnimatedBackground>
        <CommonLayout>
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>
              No local financial profile found.
            </Text>
          </View>
        </CommonLayout>
      </AnimatedBackground>
    );
  }

  const currentState = getCurrentState(financialProfile);
  const totalAssets = calculateTotalAssets(currentState);
  const totalLiabilities = calculateTotalLiabilities(currentState);
  const netWorth = calculateNetWorth(currentState);
  const history = buildNetWorthHistory(financialProfile);
  const previousNetWorth = history[history.length - 2]?.netWorth ?? netWorth;
  const monthlyChange = netWorth - previousNetWorth;
  const projectedSixMonths = calculateNetWorth(
    projectFutureState(financialProfile, 6),
  );
  const projectedOneYear = calculateNetWorth(
    projectFutureState(financialProfile, 12),
  );
  const assetPoints: AssetPoint[] = [
    { label: 'Savings', value: financialProfile.savings, color: '#18F7FF' },
    { label: 'Cash', value: financialProfile.cash, color: '#64FFAE' },
    { label: 'Invest', value: financialProfile.investments, color: '#FF64D6' },
    { label: 'Car', value: financialProfile.carValue, color: '#FFC857' },
  ];
  const filteredExpenses = filterExpensesByRange(expenses, filter);

  const renderExpenseItem: ListRenderItem<Expense> = ({ item }) => (
    <GlassCard style={styles.expenseCard} opacity={0.1}>
      <View style={styles.expenseRow}>
        <View style={styles.expenseCopy}>
          <Text style={styles.expenseTitle}>
            {item.description || item.vendor || 'Expense'}
          </Text>
          <Text style={styles.expenseMeta}>
            {formatDate(item.date)} |{' '}
            {item.vendor || item.purpose || 'Manual entry'}
          </Text>
        </View>
        <Text style={styles.expenseAmount}>
          - {formatCurrency(item.amount)}
        </Text>
      </View>
    </GlassCard>
  );

  return (
    <AnimatedBackground>
      <CommonLayout>
        <FlatList
          data={filteredExpenses}
          keyExtractor={item => item.id}
          renderItem={renderExpenseItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Text style={styles.overline}>Personal finance</Text>
                <Text style={styles.screenTitle}>Financial Dashboard</Text>
                <Text style={styles.screenSubtitle}>
                  Local-first tracking with live assets, liabilities, and
                  projected net worth.
                </Text>
              </View>

              <GlassCard style={styles.heroCard} opacity={0.12}>
                <Text style={styles.sectionEyebrow}>Net worth</Text>
                <Text style={styles.netWorthValue}>
                  {formatCurrency(netWorth)}
                </Text>
                <View
                  style={[
                    styles.trendPill,
                    monthlyChange >= 0
                      ? styles.positivePill
                      : styles.negativePill,
                  ]}
                >
                  <Text
                    style={[
                      styles.trendText,
                      monthlyChange >= 0
                        ? styles.positiveText
                        : styles.negativeText,
                    ]}
                  >
                    {monthlyChange >= 0 ? '+' : ''}
                    {formatCurrency(monthlyChange)} this month
                  </Text>
                </View>

                <View style={styles.metricsRow}>
                  <MetricTile
                    label="Total assets"
                    value={formatCurrency(totalAssets)}
                    accentColor="#18F7FF"
                  />
                  <MetricTile
                    label="Total liabilities"
                    value={formatCurrency(totalLiabilities)}
                    accentColor="#FF7AD9"
                  />
                </View>

                <NeonLineChart points={history} />
              </GlassCard>

              <GlassCard style={styles.sectionCard} opacity={0.1}>
                <Text style={styles.sectionTitle}>Assets Breakdown</Text>
                <Text style={styles.sectionNote}>
                  Car value depreciates by{' '}
                  {financialProfile.carDepreciationRate}% every month.
                </Text>

                <View style={styles.assetList}>
                  {assetPoints.map(asset => (
                    <View key={asset.label} style={styles.assetRow}>
                      <View style={styles.assetLabelRow}>
                        <View
                          style={[
                            styles.assetDot,
                            {
                              backgroundColor: asset.color,
                              shadowColor: asset.color,
                            },
                          ]}
                        />
                        <Text style={styles.assetLabel}>{asset.label}</Text>
                      </View>
                      <Text style={styles.assetValue}>
                        {formatCurrency(asset.value)}
                      </Text>
                    </View>
                  ))}
                </View>

                <NeonBarChart assets={assetPoints} />
              </GlassCard>

              <GlassCard style={styles.sectionCard} opacity={0.1}>
                <Text style={styles.sectionTitle}>Liabilities</Text>
                <View style={styles.liabilityGrid}>
                  <View style={styles.liabilityTile}>
                    <Text style={styles.liabilityLabel}>Loans</Text>
                    <Text style={styles.liabilityValue}>
                      {formatCurrency(financialProfile.loanBalance)}
                    </Text>
                    <Text style={styles.liabilityMeta}>
                      EMI: {formatCurrency(financialProfile.loanEmi)}
                    </Text>
                    <Text style={styles.liabilityMeta}>
                      Tenure left: {financialProfile.loanTenureMonths} months
                    </Text>
                  </View>

                  <View style={styles.liabilityTile}>
                    <Text style={styles.liabilityLabel}>Credit cards</Text>
                    <Text style={styles.liabilityValue}>
                      {formatCurrency(financialProfile.creditCardBalance)}
                    </Text>
                    <Text style={styles.liabilityMeta}>
                      Bill due: {formatDate(financialProfile.creditCardDueDate)}
                    </Text>
                    <Text style={styles.liabilityMeta}>
                      Stored locally for quick glance
                    </Text>
                  </View>
                </View>
              </GlassCard>

              <GlassCard style={styles.sectionCard} opacity={0.1}>
                <Text style={styles.sectionTitle}>Projection</Text>
                <Text style={styles.sectionNote}>
                  Projection uses monthly savings, investments, loan paydown,
                  and car depreciation.
                </Text>

                <View style={styles.projectionRow}>
                  <View style={styles.projectionTile}>
                    <Text style={styles.projectionLabel}>6 months</Text>
                    <Text style={styles.projectionValue}>
                      {formatCurrency(projectedSixMonths)}
                    </Text>
                    <Text style={styles.projectionDelta}>
                      {projectedSixMonths >= netWorth ? '+' : ''}
                      {formatCurrency(projectedSixMonths - netWorth)}
                    </Text>
                  </View>
                  <View style={styles.projectionTile}>
                    <Text style={styles.projectionLabel}>1 year</Text>
                    <Text style={styles.projectionValue}>
                      {formatCurrency(projectedOneYear)}
                    </Text>
                    <Text style={styles.projectionDelta}>
                      {projectedOneYear >= netWorth ? '+' : ''}
                      {formatCurrency(projectedOneYear - netWorth)}
                    </Text>
                  </View>
                </View>
              </GlassCard>

              <View style={styles.expenseSectionHeader}>
                <Text style={styles.sectionTitle}>Expense List</Text>
                <View style={styles.filterRow}>
                  {(['today', 'week', 'month'] as ExpenseFilter[]).map(
                    range => (
                      <TouchableOpacity
                        key={range}
                        style={[
                          styles.filterChip,
                          filter === range && styles.filterChipActive,
                        ]}
                        onPress={() => setFilter(range)}
                      >
                        <Text
                          style={[
                            styles.filterText,
                            filter === range && styles.filterTextActive,
                          ]}
                        >
                          {range}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard} opacity={0.08}>
              <Text style={styles.emptyTitle}>
                No expenses in this range yet
              </Text>
              <Text style={styles.emptyText}>
                Add expenses locally and they will appear here with today, week,
                and month filters.
              </Text>
            </GlassCard>
          }
        />
      </CommonLayout>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  listContent: {
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
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  header: {
    marginBottom: 18,
  },
  overline: {
    color: '#18F7FF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(24, 247, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  screenSubtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 247, 255, 0.18)',
    shadowColor: '#18F7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  sectionCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  netWorthValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 14,
  },
  trendPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 18,
    borderWidth: 1,
  },
  positivePill: {
    backgroundColor: 'rgba(100, 255, 174, 0.12)',
    borderColor: 'rgba(100, 255, 174, 0.35)',
  },
  negativePill: {
    backgroundColor: 'rgba(255, 100, 164, 0.12)',
    borderColor: 'rgba(255, 100, 164, 0.35)',
  },
  trendText: {
    fontSize: 13,
    fontWeight: '700',
  },
  positiveText: {
    color: '#64FFAE',
  },
  negativeText: {
    color: '#FF89C0',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  metricTile: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartShell: {
    marginTop: 18,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 6,
  },
  chartLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    minWidth: 28,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 18,
  },
  assetList: {
    gap: 12,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  assetLabel: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    fontWeight: '600',
  },
  assetValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  liabilityGrid: {
    gap: 12,
  },
  liabilityTile: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  liabilityLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    marginBottom: 8,
  },
  liabilityValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  liabilityMeta: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 14,
    marginBottom: 4,
  },
  projectionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  projectionTile: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(24, 247, 255, 0.12)',
  },
  projectionLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  projectionValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  projectionDelta: {
    color: '#64FFAE',
    fontSize: 14,
    fontWeight: '700',
  },
  expenseSectionHeader: {
    marginTop: 4,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(24,247,255,0.14)',
    borderColor: 'rgba(24,247,255,0.34)',
    shadowColor: '#18F7FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  filterText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: '#18F7FF',
  },
  expenseCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  expenseCopy: {
    flex: 1,
  },
  expenseTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  expenseMeta: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
  },
  expenseAmount: {
    color: '#FF89C0',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.64)',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default FinancialDashboard;
