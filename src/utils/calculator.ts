import {
  LoanParameters,
  CalculationResult,
  AmortizationMonth,
  AmortizationYear,
  DsrProfile,
  DsrResult,
  LumpSumPayment,
} from '../types/loan';

/**
 * Standard fixed rate monthly payment formula
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRatePct: number,
  months: number
): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualInterestRatePct <= 0) return principal / months;

  const monthlyRate = annualInterestRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const payment = (principal * monthlyRate * factor) / (factor - 1);
  return Number.isFinite(payment) ? payment : 0;
}

/**
 * Invert payment formula to find max principal given installment, rate, and tenure
 */
export function calculateMaxPrincipalFromPayment(
  monthlyPayment: number,
  annualInterestRatePct: number,
  months: number
): number {
  if (monthlyPayment <= 0 || months <= 0) return 0;
  if (annualInterestRatePct <= 0) return monthlyPayment * months;

  const monthlyRate = annualInterestRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const principal = (monthlyPayment * (factor - 1)) / (monthlyRate * factor);
  return Number.isFinite(principal) ? Math.max(0, principal) : 0;
}

/**
 * Get annual interest rate active for a specific month
 */
export function getRateForMonth(params: LoanParameters, monthIndex: number): number {
  if (params.rateType === 'fixed') {
    return params.fixedAnnualRate;
  }

  // Variable rate stages sorted by startMonth
  const stages = [...params.variableStages].sort((a, b) => a.startMonth - b.startMonth);
  if (stages.length === 0) return params.fixedAnnualRate;

  let currentRate = stages[0].annualRate;
  for (const stage of stages) {
    if (monthIndex >= stage.startMonth) {
      if (stage.endMonth === undefined || monthIndex <= stage.endMonth) {
        currentRate = stage.annualRate;
      }
    }
  }
  return currentRate;
}

/**
 * Format month index to calendar month and year
 */
export function getMonthDate(startDateStr: string, monthIndex: number): { dateStr: string; calendarYear: number } {
  const [yearStr, monthStr] = startDateStr.split('-');
  const startYear = parseInt(yearStr, 10) || 2026;
  const startMonth = parseInt(monthStr, 10) || 1; // 1-12

  // monthIndex 1 is the first payment month
  const targetDate = new Date(startYear, startMonth - 1 + (monthIndex - 1), 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    dateStr: `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`,
    calendarYear: targetDate.getFullYear(),
  };
}

/**
 * Compute full amortization schedule with variable rates and lump sums
 */
export function computeAmortizationSchedule(
  params: LoanParameters,
  includeLumpSums = true
): {
  monthlySchedule: AmortizationMonth[];
  yearlySchedule: AmortizationYear[];
  initialPayment: number;
  maxPayment: number;
  minPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  totalLumpSum: number;
  totalPaid: number;
  payoffDate: string;
} {
  const totalMonths = params.tenureYears * 12 + params.tenureMonths;
  if (totalMonths <= 0 || params.principal <= 0) {
    return {
      monthlySchedule: [],
      yearlySchedule: [],
      initialPayment: 0,
      maxPayment: 0,
      minPayment: 0,
      totalInterest: 0,
      totalPrincipal: 0,
      totalLumpSum: 0,
      totalPaid: 0,
      payoffDate: params.startDate,
    };
  }

  const lumpSumMap = new Map<number, LumpSumPayment[]>();
  if (includeLumpSums && params.lumpSums && params.lumpSums.length > 0) {
    for (const ls of params.lumpSums) {
      if (ls.amount > 0 && ls.month >= 1) {
        const freq = ls.frequency || 'one_time';
        let step = 0;
        if (freq === 'annually') step = 12;
        else if (freq === 'semi_annually') step = 6;
        else if (freq === 'quarterly') step = 3;
        else if (freq === 'monthly') step = 1;

        if (step > 0) {
          for (let m = ls.month; m <= totalMonths; m += step) {
            const existing = lumpSumMap.get(m) || [];
            existing.push(ls);
            lumpSumMap.set(m, existing);
          }
        } else {
          const existing = lumpSumMap.get(ls.month) || [];
          existing.push(ls);
          lumpSumMap.set(ls.month, existing);
        }
      }
    }
  }

  const initialRate = getRateForMonth(params, 1);
  let currentMonthlyInstallment = calculateMonthlyPayment(params.principal, initialRate, totalMonths);
  let remainingBalance = params.principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let previousRate = initialRate;

  const monthlySchedule: AmortizationMonth[] = [];
  let maxPayment = currentMonthlyInstallment;
  let minPayment = currentMonthlyInstallment;
  const initialPayment = currentMonthlyInstallment;

  for (let m = 1; m <= totalMonths && remainingBalance > 0.001; m++) {
    const rateForThisMonth = getRateForMonth(params, m);
    const remainingMonthsLeft = totalMonths - m + 1;

    // If variable rate changed, recalculate standard monthly installment for remaining tenure
    if (params.rateType === 'variable' && Math.abs(rateForThisMonth - previousRate) > 0.0001) {
      currentMonthlyInstallment = calculateMonthlyPayment(remainingBalance, rateForThisMonth, remainingMonthsLeft);
      previousRate = rateForThisMonth;
    }

    const monthlyInterestRate = rateForThisMonth / 100 / 12;
    const interestForMonth = remainingBalance * monthlyInterestRate;

    // Monthly regular installment
    let installment = currentMonthlyInstallment;
    let principalForMonth = installment - interestForMonth;

    // If remaining balance + interest is less than regular installment (last payment)
    if (remainingBalance + interestForMonth <= installment) {
      principalForMonth = remainingBalance;
      installment = principalForMonth + interestForMonth;
    }

    // Check for lump sums in this month
    const lumpSumsThisMonth = lumpSumMap.get(m) || [];
    let totalLumpSumThisMonth = 0;
    let shouldRecastInstallment = false;

    for (const ls of lumpSumsThisMonth) {
      totalLumpSumThisMonth += ls.amount;
      if (ls.effect === 'reduce_installment') {
        shouldRecastInstallment = true;
      }
    }

    // Cap lump sum so ending balance doesn't drop below 0
    const availablePrincipalLeft = Math.max(0, remainingBalance - principalForMonth);
    const appliedLumpSum = Math.min(totalLumpSumThisMonth, availablePrincipalLeft);

    const endingBalance = Math.max(0, remainingBalance - principalForMonth - appliedLumpSum);
    const totalMonthPayment = installment + appliedLumpSum;

    cumulativeInterest += interestForMonth;
    cumulativePrincipal += (principalForMonth + appliedLumpSum);

    const { dateStr } = getMonthDate(params.startDate, m);
    const yearNumber = Math.ceil(m / 12);

    monthlySchedule.push({
      monthIndex: m,
      dateStr,
      yearNumber,
      beginningBalance: remainingBalance,
      regularInstallment: installment,
      interestPaid: interestForMonth,
      principalPaid: principalForMonth,
      lumpSumPaid: appliedLumpSum,
      totalPayment: totalMonthPayment,
      endingBalance,
      annualRate: rateForThisMonth,
      cumulativeInterest,
      cumulativePrincipal,
    });

    maxPayment = Math.max(maxPayment, installment);
    minPayment = Math.min(minPayment, installment);

    remainingBalance = endingBalance;

    // Recast installment if requested by prepayment and loan is not paid off
    if (shouldRecastInstallment && remainingBalance > 0.01 && remainingMonthsLeft > 1) {
      currentMonthlyInstallment = calculateMonthlyPayment(
        remainingBalance,
        rateForThisMonth,
        remainingMonthsLeft - 1
      );
    }
  }

  // Roll up yearly schedule
  const yearlyMap = new Map<number, AmortizationMonth[]>();
  for (const mData of monthlySchedule) {
    const list = yearlyMap.get(mData.yearNumber) || [];
    list.push(mData);
    yearlyMap.set(mData.yearNumber, list);
  }

  const yearlySchedule: AmortizationYear[] = [];
  for (const [yearNum, months] of yearlyMap.entries()) {
    const firstMonth = months[0];
    const lastMonth = months[months.length - 1];
    const { calendarYear } = getMonthDate(params.startDate, firstMonth.monthIndex);

    let totPrincipal = 0;
    let totInterest = 0;
    let totLump = 0;
    let totPaid = 0;

    for (const m of months) {
      totPrincipal += m.principalPaid;
      totInterest += m.interestPaid;
      totLump += m.lumpSumPaid;
      totPaid += m.totalPayment;
    }

    yearlySchedule.push({
      yearNumber: yearNum,
      calendarYear,
      beginningBalance: firstMonth.beginningBalance,
      totalPrincipal: totPrincipal,
      totalInterest: totInterest,
      totalLumpSum: totLump,
      totalPaid: totPaid,
      endingBalance: lastMonth.endingBalance,
      months,
    });
  }

  const totalInterest = cumulativeInterest;
  const totalPrincipal = cumulativePrincipal;
  const totalLumpSum = monthlySchedule.reduce((sum, m) => sum + m.lumpSumPaid, 0);
  const totalPaid = totalInterest + totalPrincipal;
  const payoffDate = monthlySchedule.length > 0
    ? monthlySchedule[monthlySchedule.length - 1].dateStr
    : params.startDate;

  return {
    monthlySchedule,
    yearlySchedule,
    initialPayment,
    maxPayment,
    minPayment,
    totalInterest,
    totalPrincipal,
    totalLumpSum,
    totalPaid,
    payoffDate,
  };
}

/**
 * Complete loan calculation comparing base scenario vs with lump-sums
 */
export function calculateFullLoan(params: LoanParameters): CalculationResult {
  const withPrepayments = computeAmortizationSchedule(params, true);
  const baseWithoutPrepayments = computeAmortizationSchedule(params, false);

  const originalTotalMonths = params.tenureYears * 12 + params.tenureMonths;
  const actualMonthsPaid = withPrepayments.monthlySchedule.length;
  const monthsSaved = Math.max(0, baseWithoutPrepayments.monthlySchedule.length - actualMonthsPaid);
  const interestSaved = Math.max(0, baseWithoutPrepayments.totalInterest - withPrepayments.totalInterest);

  return {
    initialMonthlyInstallment: withPrepayments.initialPayment,
    maxMonthlyInstallment: withPrepayments.maxPayment,
    minMonthlyInstallment: withPrepayments.minPayment,
    totalPrincipal: params.principal,
    totalInterest: withPrepayments.totalInterest,
    totalLumpSum: withPrepayments.totalLumpSum,
    totalRepayment: withPrepayments.totalPaid,
    totalMonthsPaid: actualMonthsPaid,
    originalTotalMonths,
    monthsSaved,
    interestSavedComparedToBase: interestSaved,
    payoffDate: withPrepayments.payoffDate,
    originalPayoffDate: baseWithoutPrepayments.payoffDate,
    monthlySchedule: withPrepayments.monthlySchedule,
    yearlySchedule: withPrepayments.yearlySchedule,
    baseCalculationWithoutLumpSums: {
      totalInterest: baseWithoutPrepayments.totalInterest,
      totalRepayment: baseWithoutPrepayments.totalPaid,
      totalMonths: baseWithoutPrepayments.monthlySchedule.length,
    },
  };
}

/**
 * Calculate Debt Service Ratio (DSR) & Affordability
 */
export function calculateDsr(
  dsrProfile: DsrProfile,
  proposedMonthlyInstallment: number,
  initialAnnualRatePct: number,
  tenureMonths: number
): DsrResult {
  const totalIncome = dsrProfile.dsrBasis === 'gross'
    ? (dsrProfile.grossMonthlyIncome + dsrProfile.coBorrowerIncome)
    : dsrProfile.netMonthlyIncome;

  const totalExistingMonthlyDebts = dsrProfile.existingDebts.reduce(
    (acc, d) => acc + (d.monthlyAmount || 0),
    0
  );

  const safeIncome = Math.max(1, totalIncome);
  const currentDsr = (totalExistingMonthlyDebts / safeIncome) * 100;
  const totalDebtsWithProposed = totalExistingMonthlyDebts + proposedMonthlyInstallment;
  const newDsr = (totalDebtsWithProposed / safeIncome) * 100;

  const remainingDisposableIncome = Math.max(0, safeIncome - totalDebtsWithProposed);

  // Risk benchmark
  let riskLevel: 'healthy' | 'moderate' | 'high' | 'critical' = 'healthy';
  if (newDsr > 70) {
    riskLevel = 'critical';
  } else if (newDsr > 55) {
    riskLevel = 'high';
  } else if (newDsr > 35) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'healthy';
  }

  // Max allowed monthly installment given target DSR threshold
  const targetThresholdPct = dsrProfile.targetDsrLimit || 60;
  const maxTotalCommitmentsAllowed = safeIncome * (targetThresholdPct / 100);
  const maxAllowedInstallment = Math.max(0, maxTotalCommitmentsAllowed - totalExistingMonthlyDebts);

  // Maximum loan principal that this max installment can support
  const maxAffordableLoan = calculateMaxPrincipalFromPayment(
    maxAllowedInstallment,
    initialAnnualRatePct,
    tenureMonths
  );

  return {
    totalMonthlyIncome: safeIncome,
    totalExistingMonthlyDebts,
    proposedInstallment: proposedMonthlyInstallment,
    currentDsr: Number.isFinite(currentDsr) ? currentDsr : 0,
    newDsr: Number.isFinite(newDsr) ? newDsr : 0,
    remainingDisposableIncome,
    riskLevel,
    maxAllowedInstallment,
    maxAffordableLoan,
  };
}

/**
 * Format currency with code or symbol
 */
export function formatCurrency(amount: number, symbol = '$', decimals = 2): string {
  if (isNaN(amount) || !Number.isFinite(amount)) return `${symbol}0.00`;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return `${symbol}${formatted}`;
}

export function formatNumber(amount: number, decimals = 2): string {
  if (isNaN(amount) || !Number.isFinite(amount)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
