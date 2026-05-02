import {
  AppDataSnapshot,
  BrahmacharyaLog,
  Expense,
  FinancialProfile,
  Goal,
  HealthProfile,
  WorkoutLog,
} from '../Types';

export const APP_DATA_SCHEMA_VERSION = 1;
export const APP_DATA_STORAGE_KEY = '@expense-manager/app-data-snapshot';
export const APP_DATA_EXPORT_META_KEY = '@expense-manager/export-meta';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const validateExpense = (expense: unknown) => {
  if (!isObject(expense)) {
    return false;
  }

  return (
    isString(expense.id) &&
    isString(expense.description) &&
    isNumber(expense.amount) &&
    isString(expense.currency) &&
    (isString(expense.date) || expense.date instanceof Date) &&
    isString(expense.vendor) &&
    isString(expense.purpose) &&
    (expense.type === 'online' || expense.type === 'offline') &&
    isString(expense.bankAccount) &&
    (isString(expense.transactionRecipt) ||
      isString(expense.transactionReceipt))
  );
};

const validateFinancialProfile = (profile: unknown) => {
  if (profile === null) {
    return true;
  }

  if (!isObject(profile)) {
    return false;
  }

  return (
    isString(profile.id) &&
    isNumber(profile.savings) &&
    isNumber(profile.cash) &&
    isNumber(profile.investments) &&
    isNumber(profile.carValue) &&
    isNumber(profile.carDepreciationRate) &&
    isNumber(profile.loanBalance) &&
    isNumber(profile.loanEmi) &&
    isNumber(profile.loanTenureMonths) &&
    isNumber(profile.creditCardBalance) &&
    isString(profile.creditCardDueDate) &&
    isNumber(profile.monthlySavingsContribution) &&
    isNumber(profile.monthlyInvestmentContribution) &&
    isString(profile.updatedAt)
  );
};

const validateHealthProfile = (profile: unknown) => {
  if (profile === null) {
    return true;
  }

  if (!isObject(profile)) {
    return false;
  }

  return (
    isString(profile.id) &&
    isNumber(profile.startingWeight) &&
    isNumber(profile.currentWeight) &&
    isNumber(profile.targetWeight) &&
    isString(profile.updatedAt)
  );
};

const validateBrahmacharyaLog = (log: unknown) => {
  if (!isObject(log)) {
    return false;
  }

  return (
    isString(log.id) &&
    isString(log.date) &&
    (log.status === 'yes' || log.status === 'no')
  );
};

const validateWorkoutLog = (log: unknown) => {
  if (!isObject(log)) {
    return false;
  }

  return (
    isString(log.id) &&
    isString(log.date) &&
    isString(log.exercise) &&
    isNumber(log.reps)
  );
};

const validateGoal = (goal: unknown) => {
  if (!isObject(goal)) {
    return false;
  }

  return (
    isString(goal.id) &&
    isString(goal.title) &&
    (goal.type === 'financial' ||
      goal.type === 'fitness' ||
      goal.type === 'discipline') &&
    isNumber(goal.currentValue) &&
    isNumber(goal.targetValue) &&
    isString(goal.unit) &&
    isString(goal.deadline) &&
    isString(goal.createdAt) &&
    isString(goal.updatedAt) &&
    isString(goal.sourceText)
  );
};

export const createSnapshot = (
  data: AppDataSnapshot['data'],
): AppDataSnapshot => ({
  schemaVersion: APP_DATA_SCHEMA_VERSION,
  exportedAt: new Date().toISOString(),
  data,
});

export const validateSnapshot = (
  value: unknown,
): { isValid: boolean; errors: string[]; snapshot?: AppDataSnapshot } => {
  const errors: string[] = [];

  if (!isObject(value)) {
    return { isValid: false, errors: ['Snapshot must be an object.'] };
  }

  if (value.schemaVersion !== APP_DATA_SCHEMA_VERSION) {
    errors.push(`Unsupported schema version: ${String(value.schemaVersion)}.`);
  }

  if (!isString(value.exportedAt)) {
    errors.push('Missing exportedAt timestamp.');
  }

  if (!isObject(value.data)) {
    errors.push('Missing data payload.');
  } else {
    const { data } = value;

    if (
      !Array.isArray(data.expenses) ||
      !data.expenses.every(validateExpense)
    ) {
      errors.push('Invalid expenses array.');
    }

    if (!validateFinancialProfile(data.financialProfile)) {
      errors.push('Invalid financial profile.');
    }

    if (!validateHealthProfile(data.healthProfile)) {
      errors.push('Invalid health profile.');
    }

    if (
      !Array.isArray(data.brahmacharyaLogs) ||
      !data.brahmacharyaLogs.every(validateBrahmacharyaLog)
    ) {
      errors.push('Invalid brahmacharya logs.');
    }

    if (
      !Array.isArray(data.workoutLogs) ||
      !data.workoutLogs.every(validateWorkoutLog)
    ) {
      errors.push('Invalid workout logs.');
    }

    if (!Array.isArray(data.goals) || !data.goals.every(validateGoal)) {
      errors.push('Invalid goals array.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    snapshot:
      errors.length === 0 ? (value as unknown as AppDataSnapshot) : undefined,
  };
};

const escapeCsv = (value: string | number | null | undefined) => {
  const normalized =
    value === null || value === undefined
      ? ''
      : String(value).replace(/"/g, '""');
  return `"${normalized}"`;
};

const csvRow = (columns: Array<string | number | null | undefined>) =>
  `${columns.map(escapeCsv).join(',')}\n`;

export const snapshotToCsv = (snapshot: AppDataSnapshot) => {
  let csv =
    'collection,id,title,type,currentValue,targetValue,unit,deadline,date,status,amount,vendor,purpose,exercise,reps,notes\n';

  snapshot.data.expenses.forEach((expense: Expense) => {
    csv += csvRow([
      'expenses',
      expense.id,
      expense.description,
      '',
      '',
      '',
      expense.currency,
      '',
      expense.date instanceof Date ? expense.date.toISOString() : expense.date,
      expense.type,
      expense.amount,
      expense.vendor,
      expense.purpose,
      '',
      '',
      expense.transactionRecipt ??
        expense.transactionReceipt ??
        expense.bankAccount,
    ]);
  });

  if (snapshot.data.financialProfile) {
    const profile: FinancialProfile = snapshot.data.financialProfile;
    csv += csvRow([
      'financial_profile',
      profile.id,
      'Financial Profile',
      '',
      profile.savings + profile.cash + profile.investments + profile.carValue,
      '',
      'Rs',
      profile.creditCardDueDate,
      profile.updatedAt,
      '',
      '',
      '',
      '',
      '',
      '',
      JSON.stringify(profile),
    ]);
  }

  if (snapshot.data.healthProfile) {
    const profile: HealthProfile = snapshot.data.healthProfile;
    csv += csvRow([
      'health_profile',
      profile.id,
      'Health Profile',
      '',
      profile.currentWeight,
      profile.targetWeight,
      'kg',
      '',
      profile.updatedAt,
      '',
      '',
      '',
      '',
      '',
      '',
      JSON.stringify(profile),
    ]);
  }

  snapshot.data.brahmacharyaLogs.forEach((log: BrahmacharyaLog) => {
    csv += csvRow([
      'brahmacharya_logs',
      log.id,
      'Brahmacharya',
      '',
      '',
      '',
      'days',
      '',
      log.date,
      log.status,
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  });

  snapshot.data.workoutLogs.forEach((log: WorkoutLog) => {
    csv += csvRow([
      'workout_logs',
      log.id,
      log.exercise,
      'fitness',
      log.reps,
      '',
      'reps',
      '',
      log.date,
      '',
      '',
      '',
      '',
      log.exercise,
      log.reps,
      '',
    ]);
  });

  snapshot.data.goals.forEach((goal: Goal) => {
    csv += csvRow([
      'goals',
      goal.id,
      goal.title,
      goal.type,
      goal.currentValue,
      goal.targetValue,
      goal.unit,
      goal.deadline,
      goal.updatedAt,
      '',
      '',
      '',
      '',
      '',
      '',
      goal.sourceText,
    ]);
  });

  return csv;
};
