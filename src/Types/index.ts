export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string | Date;
  vendor: string;
  purpose: string;
  type: 'online' | 'offline';
  bankAccount: string;
  transactionRecipt: string;
  transactionReceipt?: string;
}

export interface FinancialProfile {
  id: string;
  savings: number;
  cash: number;
  investments: number;
  carValue: number;
  carDepreciationRate: number;
  loanBalance: number;
  loanEmi: number;
  loanTenureMonths: number;
  creditCardBalance: number;
  creditCardDueDate: string;
  monthlySavingsContribution: number;
  monthlyInvestmentContribution: number;
  updatedAt: string;
}

export interface HealthProfile {
  id: string;
  startingWeight: number;
  currentWeight: number;
  targetWeight: number;
  updatedAt: string;
}

export interface BrahmacharyaLog {
  id: string;
  date: string;
  status: 'yes' | 'no';
}

export interface WorkoutLog {
  id: string;
  date: string;
  exercise: string;
  reps: number;
}

export type GoalType = 'financial' | 'fitness' | 'discipline';

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  sourceText: string;
}

export interface AppDataSnapshot {
  schemaVersion: number;
  exportedAt: string;
  data: {
    expenses: Expense[];
    financialProfile: FinancialProfile | null;
    healthProfile: HealthProfile | null;
    brahmacharyaLogs: BrahmacharyaLog[];
    workoutLogs: WorkoutLog[];
    goals: Goal[];
  };
}
