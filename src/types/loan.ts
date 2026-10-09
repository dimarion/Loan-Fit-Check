export type RateType = 'fixed' | 'variable';

export type PrepaymentEffect = 'reduce_tenure' | 'reduce_installment';

export type LumpSumFrequency = 'one_time' | 'annually' | 'semi_annually' | 'quarterly' | 'monthly';

export interface VariableRateStage {
  id: string;
  startMonth: number; // e.g. 1, 25, 61
  endMonth?: number; // optional, e.g. 24, 60 or undefined for remainder
  annualRate: number; // e.g. 4.25%
  label: string; // e.g. "Year 1-2 (Promotional)", "Year 3-5", "Year 6+"
}

export interface LumpSumPayment {
  id: string;
  month: number; // 1-indexed payment month
  year?: number; // Specific year if tenure > 1 year
  amount: number;
  effect: PrepaymentEffect;
  frequency?: LumpSumFrequency;
  note?: string;
}

export interface ExistingDebtCommitment {
  id: string;
  name: string;
  monthlyAmount: number;
  type: 'housing' | 'car' | 'credit_card' | 'student' | 'personal' | 'other';
}

export interface DsrProfile {
  grossMonthlyIncome: number;
  coBorrowerIncome: number;
  netMonthlyIncome: number;
  existingDebts: ExistingDebtCommitment[];
  dsrBasis: 'gross' | 'net';
  targetDsrLimit: number; // e.g. 60 or 70% bank cap
}

export interface LoanParameters {
  principal: number;
  tenureYears: number;
  tenureMonths: number; // total tenure = tenureYears * 12 + tenureMonths
  rateType: RateType;
  fixedAnnualRate: number; // e.g. 4.5%
  variableStages: VariableRateStage[];
  lumpSums: LumpSumPayment[];
  currency: string;
  currencySymbol: string;
  startDate: string; // YYYY-MM
}

export interface AmortizationMonth {
  monthIndex: number; // 1, 2, ...
  dateStr: string; // e.g. "Nov 2026"
  yearNumber: number; // 1, 2, ...
  beginningBalance: number;
  regularInstallment: number;
  interestPaid: number;
  principalPaid: number;
  lumpSumPaid: number;
  totalPayment: number;
  endingBalance: number;
  annualRate: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface AmortizationYear {
  yearNumber: number;
  calendarYear: number;
  beginningBalance: number;
  totalPrincipal: number;
  totalInterest: number;
  totalLumpSum: number;
  totalPaid: number;
  endingBalance: number;
  months: AmortizationMonth[];
}

export interface CalculationResult {
  initialMonthlyInstallment: number;
  maxMonthlyInstallment: number;
  minMonthlyInstallment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalLumpSum: number;
  totalRepayment: number;
  totalMonthsPaid: number;
  originalTotalMonths: number;
  monthsSaved: number;
  interestSavedComparedToBase: number;
  payoffDate: string;
  originalPayoffDate: string;
  monthlySchedule: AmortizationMonth[];
  yearlySchedule: AmortizationYear[];
  baseCalculationWithoutLumpSums: {
    totalInterest: number;
    totalRepayment: number;
    totalMonths: number;
  };
}

export interface DsrResult {
  totalMonthlyIncome: number;
  totalExistingMonthlyDebts: number;
  proposedInstallment: number;
  currentDsr: number; // %
  newDsr: number; // %
  remainingDisposableIncome: number;
  riskLevel: 'healthy' | 'moderate' | 'high' | 'critical';
  maxAllowedInstallment: number;
  maxAffordableLoan: number; // estimated loan principal supported at target DSR
}
