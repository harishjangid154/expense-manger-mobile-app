import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import {
  AppDataSnapshot,
  BrahmacharyaLog,
  Expense,
  FinancialProfile,
  Goal,
  HealthProfile,
  WorkoutLog,
} from '../Types';
import {
  APP_DATA_STORAGE_KEY,
  createSnapshot,
  validateSnapshot,
} from './backup';

SQLite.enablePromise(true);

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeExpense = (
  expense: Partial<Expense> & { [key: string]: unknown },
): Expense => ({
  id: String(expense.id ?? ''),
  description: String(expense.description ?? ''),
  amount: Number(expense.amount ?? 0),
  currency: String(expense.currency ?? ''),
  date: (expense.date as string | Date | undefined) ?? new Date().toISOString(),
  vendor: String(expense.vendor ?? ''),
  purpose: String(expense.purpose ?? ''),
  type: expense.type === 'online' ? 'online' : 'offline',
  bankAccount: String(expense.bankAccount ?? ''),
  transactionRecipt: String(
    expense.transactionRecipt ?? expense.transactionReceipt ?? '',
  ),
  transactionReceipt: String(
    expense.transactionReceipt ?? expense.transactionRecipt ?? '',
  ),
});

class SqLiteHandler {
  db: SQLiteDatabase = undefined as any;
  initialized: boolean = false;

  constructor({
    onInitialized,
  }: {
    onInitialized: (instance: SqLiteHandler) => void;
  }) {
    this.init(onInitialized);
  }

  async init(onInitialized: (instance: SqLiteHandler) => void) {
    try {
      this.db = await SQLite.openDatabase({
        name: 'expenses.db',
        location: 'default',
      });
      this.initialized = true;
      await this.createTables();
      await this.ensureFinancialProfileSeed();
      await this.ensureHealthSeed();
      await this.ensureGoalSeed();
      await this.syncSnapshotToStorage();
      onInitialized(this);
    } catch (error) {
      console.error('Error initializing database: ', error);
      onInitialized(false as any);
    }
  }

  private async createTables() {
    await this.db.executeSql(`CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY NOT NULL,
            description TEXT,
            amount REAL,
            currency TEXT,
            date TEXT,
            vendor TEXT,
            purpose TEXT,
            type TEXT,
            bankAccount TEXT,
            transactionReceipt TEXT
        )`);

    await this.db.executeSql(`CREATE TABLE IF NOT EXISTS financial_profile (
            id TEXT PRIMARY KEY NOT NULL,
            savings REAL DEFAULT 0,
            cash REAL DEFAULT 0,
            investments REAL DEFAULT 0,
            carValue REAL DEFAULT 0,
            carDepreciationRate REAL DEFAULT 0,
            loanBalance REAL DEFAULT 0,
            loanEmi REAL DEFAULT 0,
            loanTenureMonths INTEGER DEFAULT 0,
            creditCardBalance REAL DEFAULT 0,
            creditCardDueDate TEXT,
            monthlySavingsContribution REAL DEFAULT 0,
            monthlyInvestmentContribution REAL DEFAULT 0,
            updatedAt TEXT
        )`);

    await this.db.executeSql(`CREATE TABLE IF NOT EXISTS health_profile (
            id TEXT PRIMARY KEY NOT NULL,
            startingWeight REAL DEFAULT 0,
            currentWeight REAL DEFAULT 0,
            targetWeight REAL DEFAULT 0,
            updatedAt TEXT
        )`);

    await this.db.executeSql(`CREATE TABLE IF NOT EXISTS brahmacharya_logs (
            id TEXT PRIMARY KEY NOT NULL,
            date TEXT UNIQUE,
            status TEXT
        )`);

    await this.db.executeSql(`CREATE TABLE IF NOT EXISTS workout_logs (
            id TEXT PRIMARY KEY NOT NULL,
            date TEXT,
            exercise TEXT,
            reps INTEGER
        )`);

    await this.db.executeSql(`CREATE TABLE IF NOT EXISTS goals (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT,
            type TEXT,
            currentValue REAL DEFAULT 0,
            targetValue REAL DEFAULT 0,
            unit TEXT,
            deadline TEXT,
            createdAt TEXT,
            updatedAt TEXT,
            sourceText TEXT
        )`);
  }

  private async ensureFinancialProfileSeed() {
    const results = await this.db.executeSql(
      'SELECT id FROM financial_profile LIMIT 1',
    );

    if (results[0].rows.length > 0) {
      return;
    }

    const now = new Date().toISOString();
    await this.db.executeSql(
      `INSERT INTO financial_profile (
                id,
                savings,
                cash,
                investments,
                carValue,
                carDepreciationRate,
                loanBalance,
                loanEmi,
                loanTenureMonths,
                creditCardBalance,
                creditCardDueDate,
                monthlySavingsContribution,
                monthlyInvestmentContribution,
                updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'primary',
        240000,
        18000,
        420000,
        760000,
        1.5,
        350000,
        22000,
        24,
        28000,
        '2026-04-19',
        18000,
        12000,
        now,
      ],
    );
  }

  private async ensureHealthSeed() {
    await this.ensureHealthProfileSeed();
    await this.ensureBrahmacharyaSeed();
    await this.ensureWorkoutSeed();
  }

  private async ensureHealthProfileSeed() {
    const results = await this.db.executeSql(
      'SELECT id FROM health_profile LIMIT 1',
    );

    if (results[0].rows.length > 0) {
      return;
    }

    await this.db.executeSql(
      `INSERT INTO health_profile (
          id,
          startingWeight,
          currentWeight,
          targetWeight,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?)`,
      ['primary', 84, 79.2, 74, new Date().toISOString()],
    );
  }

  private async ensureBrahmacharyaSeed() {
    const results = await this.db.executeSql(
      'SELECT id FROM brahmacharya_logs LIMIT 1',
    );

    if (results[0].rows.length > 0) {
      return;
    }

    const statuses: Array<'yes' | 'no'> = [
      'yes',
      'yes',
      'yes',
      'yes',
      'yes',
      'yes',
    ];

    for (let index = 0; index < statuses.length; index += 1) {
      const date = new Date();
      date.setDate(date.getDate() - (statuses.length - index));
      await this.db.executeSql(
        'INSERT INTO brahmacharya_logs (id, date, status) VALUES (?, ?, ?)',
        [createId('brahma'), getDateKey(date), statuses[index]],
      );
    }
  }

  private async ensureWorkoutSeed() {
    const results = await this.db.executeSql(
      'SELECT id FROM workout_logs LIMIT 1',
    );

    if (results[0].rows.length > 0) {
      return;
    }

    const sampleWorkouts = [
      { offset: 6, exercise: 'Pushups', reps: 32 },
      { offset: 5, exercise: 'Squats', reps: 40 },
      { offset: 4, exercise: 'Lunges', reps: 22 },
      { offset: 2, exercise: 'Pushups', reps: 38 },
      { offset: 1, exercise: 'Mountain Climbers', reps: 28 },
    ];

    for (const workout of sampleWorkouts) {
      const date = new Date();
      date.setDate(date.getDate() - workout.offset);
      date.setHours(7 + workout.offset, 15, 0, 0);
      await this.db.executeSql(
        'INSERT INTO workout_logs (id, date, exercise, reps) VALUES (?, ?, ?, ?)',
        [
          createId('workout'),
          date.toISOString(),
          workout.exercise,
          workout.reps,
        ],
      );
    }
  }

  private async ensureGoalSeed() {
    const results = await this.db.executeSql('SELECT id FROM goals LIMIT 1');

    if (results[0].rows.length > 0) {
      return;
    }

    const now = new Date().toISOString();
    await this.db.executeSql(
      `INSERT INTO goals (
          id,
          title,
          type,
          currentValue,
          targetValue,
          unit,
          deadline,
          createdAt,
          updatedAt,
          sourceText
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createId('goal'),
        'Emergency fund',
        'financial',
        120000,
        300000,
        'Rs',
        '2026-12-31',
        now,
        now,
        'Save Rs 300000 for emergency fund by Dec 31',
      ],
    );

    await this.db.executeSql(
      `INSERT INTO goals (
          id,
          title,
          type,
          currentValue,
          targetValue,
          unit,
          deadline,
          createdAt,
          updatedAt,
          sourceText
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createId('goal'),
        'Lose body weight',
        'fitness',
        4,
        10,
        'kg',
        '2026-09-15',
        now,
        now,
        'Lose 10 kg by September',
      ],
    );

    await this.db.executeSql(
      `INSERT INTO goals (
          id,
          title,
          type,
          currentValue,
          targetValue,
          unit,
          deadline,
          createdAt,
          updatedAt,
          sourceText
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createId('goal'),
        'Brahmacharya streak',
        'discipline',
        21,
        90,
        'days',
        '2026-08-01',
        now,
        now,
        'Reach 90 days discipline streak by August',
      ],
    );
  }

  private async syncSnapshotToStorage() {
    const snapshot = await this.readAllDataSnapshot();
    await AsyncStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(snapshot));
  }

  private async bulkInsertExpenses(expenses: Expense[]) {
    for (const expenseItem of expenses) {
      const expense = normalizeExpense(
        expenseItem as Expense & { [key: string]: unknown },
      );
      await this.db.executeSql(
        `INSERT INTO expenses (
            id,
            description,
            amount,
            currency,
            date,
            vendor,
            purpose,
            type,
            bankAccount,
            transactionReceipt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          expense.id,
          expense.description,
          expense.amount,
          expense.currency,
          expense.date instanceof Date
            ? expense.date.toISOString()
            : expense.date,
          expense.vendor,
          expense.purpose,
          expense.type,
          expense.bankAccount,
          expense.transactionRecipt,
        ],
      );
    }
  }

  private async bulkInsertFinancialProfile(profile: FinancialProfile | null) {
    if (!profile) {
      return;
    }

    await this.db.executeSql(
      `INSERT INTO financial_profile (
          id,
          savings,
          cash,
          investments,
          carValue,
          carDepreciationRate,
          loanBalance,
          loanEmi,
          loanTenureMonths,
          creditCardBalance,
          creditCardDueDate,
          monthlySavingsContribution,
          monthlyInvestmentContribution,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.savings,
        profile.cash,
        profile.investments,
        profile.carValue,
        profile.carDepreciationRate,
        profile.loanBalance,
        profile.loanEmi,
        profile.loanTenureMonths,
        profile.creditCardBalance,
        profile.creditCardDueDate,
        profile.monthlySavingsContribution,
        profile.monthlyInvestmentContribution,
        profile.updatedAt,
      ],
    );
  }

  private async bulkInsertHealthProfile(profile: HealthProfile | null) {
    if (!profile) {
      return;
    }

    await this.db.executeSql(
      `INSERT INTO health_profile (
          id,
          startingWeight,
          currentWeight,
          targetWeight,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.startingWeight,
        profile.currentWeight,
        profile.targetWeight,
        profile.updatedAt,
      ],
    );
  }

  private async bulkInsertBrahmacharyaLogs(logs: BrahmacharyaLog[]) {
    for (const log of logs) {
      await this.db.executeSql(
        'INSERT INTO brahmacharya_logs (id, date, status) VALUES (?, ?, ?)',
        [log.id, log.date, log.status],
      );
    }
  }

  private async bulkInsertWorkoutLogs(logs: WorkoutLog[]) {
    for (const log of logs) {
      await this.db.executeSql(
        'INSERT INTO workout_logs (id, date, exercise, reps) VALUES (?, ?, ?, ?)',
        [log.id, log.date, log.exercise, log.reps],
      );
    }
  }

  private async bulkInsertGoals(goals: Goal[]) {
    for (const goal of goals) {
      await this.db.executeSql(
        `INSERT INTO goals (
            id,
            title,
            type,
            currentValue,
            targetValue,
            unit,
            deadline,
            createdAt,
            updatedAt,
            sourceText
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          goal.id,
          goal.title,
          goal.type,
          goal.currentValue,
          goal.targetValue,
          goal.unit,
          goal.deadline,
          goal.createdAt,
          goal.updatedAt,
          goal.sourceText,
        ],
      );
    }
  }

  getDatabase() {
    if (this.initialized) {
      return this.db;
    }
    throw new Error('Database not initialized yet');
  }

  async readExpenses(): Promise<Expense[]> {
    const query = 'SELECT * FROM expenses';
    try {
      const results = await this.db.executeSql(query);
      const expenses: Expense[] = [];

      for (let i = 0; i < results[0].rows.length; i++) {
        expenses.push(
          normalizeExpense(
            results[0].rows.item(i) as Partial<Expense> &
              Record<string, unknown>,
          ),
        );
      }
      return expenses;
    } catch (error) {
      throw error;
    }
  }

  async readFinancialProfile(): Promise<FinancialProfile | null> {
    const query = 'SELECT * FROM financial_profile LIMIT 1';
    try {
      const results = await this.db.executeSql(query);
      if (results[0].rows.length === 0) {
        return null;
      }

      return results[0].rows.item(0) as FinancialProfile;
    } catch (error) {
      throw error;
    }
  }

  async readHealthProfile(): Promise<HealthProfile | null> {
    const query = 'SELECT * FROM health_profile LIMIT 1';
    try {
      const results = await this.db.executeSql(query);
      if (results[0].rows.length === 0) {
        return null;
      }

      return results[0].rows.item(0) as HealthProfile;
    } catch (error) {
      throw error;
    }
  }

  async readBrahmacharyaLogs(): Promise<BrahmacharyaLog[]> {
    const query = 'SELECT * FROM brahmacharya_logs ORDER BY date DESC';
    try {
      const results = await this.db.executeSql(query);
      const logs: BrahmacharyaLog[] = [];

      for (let i = 0; i < results[0].rows.length; i++) {
        logs.push(results[0].rows.item(i) as BrahmacharyaLog);
      }

      return logs;
    } catch (error) {
      throw error;
    }
  }

  async readWorkoutLogs(): Promise<WorkoutLog[]> {
    const query = 'SELECT * FROM workout_logs ORDER BY date DESC';
    try {
      const results = await this.db.executeSql(query);
      const logs: WorkoutLog[] = [];

      for (let i = 0; i < results[0].rows.length; i++) {
        logs.push(results[0].rows.item(i) as WorkoutLog);
      }

      return logs;
    } catch (error) {
      throw error;
    }
  }

  async readGoals(): Promise<Goal[]> {
    const query = 'SELECT * FROM goals ORDER BY updatedAt DESC';
    try {
      const results = await this.db.executeSql(query);
      const goals: Goal[] = [];

      for (let i = 0; i < results[0].rows.length; i++) {
        goals.push(results[0].rows.item(i) as Goal);
      }

      return goals;
    } catch (error) {
      throw error;
    }
  }

  async readAllDataSnapshot(): Promise<AppDataSnapshot> {
    const [
      expenses,
      financialProfile,
      healthProfile,
      brahmacharyaLogs,
      workoutLogs,
      goals,
    ] = await Promise.all([
      this.readExpenses(),
      this.readFinancialProfile(),
      this.readHealthProfile(),
      this.readBrahmacharyaLogs(),
      this.readWorkoutLogs(),
      this.readGoals(),
    ]);

    return createSnapshot({
      expenses,
      financialProfile,
      healthProfile,
      brahmacharyaLogs,
      workoutLogs,
      goals,
    });
  }

  async readStoredSnapshot(): Promise<AppDataSnapshot | null> {
    const raw = await AsyncStorage.getItem(APP_DATA_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      const validation = validateSnapshot(parsed);
      if (!validation.isValid || !validation.snapshot) {
        return null;
      }

      return validation.snapshot;
    } catch (error) {
      console.error('Unable to parse stored snapshot', error);
      return null;
    }
  }

  async restoreSnapshot(snapshot: AppDataSnapshot) {
    const validation = validateSnapshot(snapshot);
    if (!validation.isValid || !validation.snapshot) {
      throw new Error(validation.errors.join(' '));
    }

    const rollbackSnapshot = await this.readAllDataSnapshot();

    try {
      await this.db.executeSql('BEGIN TRANSACTION');
      await this.db.executeSql('DELETE FROM expenses');
      await this.db.executeSql('DELETE FROM financial_profile');
      await this.db.executeSql('DELETE FROM health_profile');
      await this.db.executeSql('DELETE FROM brahmacharya_logs');
      await this.db.executeSql('DELETE FROM workout_logs');
      await this.db.executeSql('DELETE FROM goals');

      await this.bulkInsertExpenses(validation.snapshot.data.expenses);
      await this.bulkInsertFinancialProfile(
        validation.snapshot.data.financialProfile,
      );
      await this.bulkInsertHealthProfile(
        validation.snapshot.data.healthProfile,
      );
      await this.bulkInsertBrahmacharyaLogs(
        validation.snapshot.data.brahmacharyaLogs,
      );
      await this.bulkInsertWorkoutLogs(validation.snapshot.data.workoutLogs);
      await this.bulkInsertGoals(validation.snapshot.data.goals);
      await this.db.executeSql('COMMIT');
      await AsyncStorage.setItem(
        APP_DATA_STORAGE_KEY,
        JSON.stringify(validation.snapshot),
      );
    } catch (error) {
      try {
        await this.db.executeSql('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback failed', rollbackError);
      }

      try {
        await AsyncStorage.setItem(
          APP_DATA_STORAGE_KEY,
          JSON.stringify(rollbackSnapshot),
        );
      } catch (storageError) {
        console.error(
          'Failed to restore previous snapshot cache',
          storageError,
        );
      }

      throw error;
    }
  }

  async writeExpense(expense: Expense) {
    const query =
      'INSERT INTO expenses (id, description, amount, currency, date, vendor, purpose, type, bankAccount, transactionReceipt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    if (!this.initialized) {
      return { status: 'error', message: 'Database not initialized' };
    }

    const normalizedExpense = normalizeExpense(
      expense as Expense & { [key: string]: unknown },
    );
    const result = await this.db.executeSql(query, [
      normalizedExpense.id,
      normalizedExpense.description,
      normalizedExpense.amount,
      normalizedExpense.currency,
      normalizedExpense.date instanceof Date
        ? normalizedExpense.date.toISOString()
        : normalizedExpense.date,
      normalizedExpense.vendor,
      normalizedExpense.purpose,
      normalizedExpense.type,
      normalizedExpense.bankAccount,
      normalizedExpense.transactionRecipt,
    ]);
    await this.syncSnapshotToStorage();
    return result;
  }

  async upsertBrahmacharyaLog(date: string, status: 'yes' | 'no') {
    const result = await this.db.executeSql(
      `INSERT INTO brahmacharya_logs (id, date, status)
       VALUES (?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET status = excluded.status`,
      [createId('brahma'), date, status],
    );
    await this.syncSnapshotToStorage();
    return result;
  }

  async writeWorkoutLog(workout: WorkoutLog) {
    const result = await this.db.executeSql(
      'INSERT INTO workout_logs (id, date, exercise, reps) VALUES (?, ?, ?, ?)',
      [workout.id, workout.date, workout.exercise, workout.reps],
    );
    await this.syncSnapshotToStorage();
    return result;
  }

  async updateCurrentWeight(weight: number) {
    const result = await this.db.executeSql(
      `UPDATE health_profile
       SET currentWeight = ?, updatedAt = ?
       WHERE id = ?`,
      [weight, new Date().toISOString(), 'primary'],
    );
    await this.syncSnapshotToStorage();
    return result;
  }

  async writeGoal(goal: Goal) {
    const result = await this.db.executeSql(
      `INSERT INTO goals (
          id,
          title,
          type,
          currentValue,
          targetValue,
          unit,
          deadline,
          createdAt,
          updatedAt,
          sourceText
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.title,
        goal.type,
        goal.currentValue,
        goal.targetValue,
        goal.unit,
        goal.deadline,
        goal.createdAt,
        goal.updatedAt,
        goal.sourceText,
      ],
    );
    await this.syncSnapshotToStorage();
    return result;
  }

  async updateGoal(goal: Goal) {
    const result = await this.db.executeSql(
      `UPDATE goals
       SET title = ?,
           type = ?,
           currentValue = ?,
           targetValue = ?,
           unit = ?,
           deadline = ?,
           updatedAt = ?,
           sourceText = ?
       WHERE id = ?`,
      [
        goal.title,
        goal.type,
        goal.currentValue,
        goal.targetValue,
        goal.unit,
        goal.deadline,
        goal.updatedAt,
        goal.sourceText,
        goal.id,
      ],
    );
    await this.syncSnapshotToStorage();
    return result;
  }

  async deleteGoal(goalId: string) {
    const result = await this.db.executeSql('DELETE FROM goals WHERE id = ?', [
      goalId,
    ]);
    await this.syncSnapshotToStorage();
    return result;
  }
}

export { SqLiteHandler };
