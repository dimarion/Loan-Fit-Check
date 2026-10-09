import React, { useState, useMemo } from 'react';
import {
  LoanParameters,
  DsrProfile,
} from './types/loan';
import {
  calculateFullLoan,
  calculateDsr,
  formatCurrency,
} from './utils/calculator';
import { Header } from './components/Header';
import { LoanInputs } from './components/LoanInputs';
import { DsrCalculator } from './components/DsrCalculator';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { AnnualAllocationCard } from './components/AnnualAllocationCard';
import { PdfExportModal } from './components/PdfExportModal';
import {
  CreditCard,
  Percent,
  ArrowUpRight,
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Loan parameters state
  const [loanParams, setLoanParams] = useState<LoanParameters>({
    principal: 400000,
    tenureYears: 30,
    tenureMonths: 0,
    rateType: 'fixed',
    fixedAnnualRate: 6.25,
    variableStages: [],
    lumpSums: [
      { id: 'ls1', month: 24, amount: 20000, effect: 'reduce_tenure', note: 'Year 2 Bonus', frequency: 'one_time' },
    ],
    currency: 'USD',
    currencySymbol: '$',
    startDate: '2026-11',
  });

  // DSR Profile state
  const [dsrProfile, setDsrProfile] = useState<DsrProfile>({
    grossMonthlyIncome: 8500,
    coBorrowerIncome: 0,
    netMonthlyIncome: 6800,
    existingDebts: [
      { id: 'd1', name: 'Car Loan', monthlyAmount: 450, type: 'car' },
      { id: 'd2', name: 'Credit Cards', monthlyAmount: 180, type: 'credit_card' },
      { id: 'd3', name: 'Student Loan', monthlyAmount: 220, type: 'student' },
    ],
    dsrBasis: 'gross',
    targetDsrLimit: 60,
  });

  // Execute calculation engine
  const calcResult = useMemo(() => {
    return calculateFullLoan(loanParams);
  }, [loanParams]);

  // Execute DSR calculation
  const dsrResult = useMemo(() => {
    const totalMonths = loanParams.tenureYears * 12 + loanParams.tenureMonths;
    const initialRate = loanParams.fixedAnnualRate;

    return calculateDsr(
      dsrProfile,
      calcResult.initialMonthlyInstallment,
      initialRate,
      totalMonths
    );
  }, [dsrProfile, calcResult.initialMonthlyInstallment, loanParams]);

  const handleUpdateLoanParams = (updated: Partial<LoanParameters>) => {
    setLoanParams((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateDsr = (updated: Partial<DsrProfile>) => {
    setDsrProfile((prev) => ({ ...prev, ...updated }));
  };

  const currency = loanParams.currencySymbol;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-16">
      {/* Top Bar adhering to strict 3-zone contract */}
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Hero Section & Context Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-200/80 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                {activeSection === 'dsr' ? 'Affordability Engine' : 'Installment Engine'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200/60 text-[11px]">
                {activeSection === 'dsr' ? 'Debt Service Ratio (DSR)' : 'Amortization & Schedule'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {activeSection === 'dsr'
                ? 'Debt Service Ratio Calculator'
                : 'Loan Installment Calculator'}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {activeSection === 'dsr'
                ? 'Assess borrowing capacity, disposable income buffer, and debt servicing limits across income streams and commitments.'
                : 'Model loan installments, stress-test prepayment lump sums, and evaluate bank borrowing eligibility with instant amortization schedules.'}
            </p>
          </div>

          {/* Quick PDF Action trigger */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Full PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Loan Installment Calculator */}
        {activeSection === 'overview' && (
          <div className="space-y-6 mt-6">
            {/* Split Section: Loan Configuration on Left, Monthly Installment & Total Interest Cards on Right */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Side: Loan Configuration & Lump Sum Prepayment Section */}
              <div className="md:col-span-7 lg:col-span-7 xl:col-span-7">
                <LoanInputs
                  params={loanParams}
                  onChange={handleUpdateLoanParams}
                />
              </div>

              {/* Right Side: Monthly Installment and Total Interest Cards + Annual Allocation Card */}
              <div className="md:col-span-5 lg:col-span-5 xl:col-span-5 flex flex-col gap-4 md:sticky md:top-20">
                {/* Card 1: Monthly Installment (Emerald/Teal Theme) */}
                <div className="bg-gradient-to-br from-white via-emerald-50/25 to-teal-50/35 border border-emerald-200/90 rounded-xl p-5 shadow-xs ring-1 ring-emerald-100/60 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shadow-2xs">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
                          Monthly Installment
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200/60">
                        Monthly Repayment
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-emerald-700 mt-3">
                      {formatCurrency(calcResult.initialMonthlyInstallment, currency)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Estimated recurring monthly repayment based on configured principal, tenure, and interest rate.
                    </p>
                  </div>
                </div>

                {/* Card 2: Total Loan Interest (Warm Rose/Amber Theme) */}
                <div className="bg-gradient-to-br from-white via-rose-50/25 to-amber-50/35 border border-rose-200/90 rounded-xl p-5 shadow-xs ring-1 ring-rose-100/60 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shadow-2xs">
                          <Percent className="w-4 h-4" />
                        </div>
                        <span className="font-bold uppercase tracking-wider text-[11px] text-rose-800">
                          Total Loan Interest
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full border border-rose-200/60">
                        Borrowing Cost
                      </span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-rose-600 mt-3">
                      {formatCurrency(calcResult.totalInterest, currency)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Cumulative borrowing financing cost paid across the active tenure of the facility.
                    </p>
                  </div>
                </div>

                {/* Card 3: Annual Allocation Card (Below the total loan interest card) */}
                <AnnualAllocationCard
                  yearlySchedule={calcResult.yearlySchedule}
                  currencySymbol={currency}
                />
              </div>
            </section>

            {/* Interactive Amortization Schedule preview */}
            <AmortizationSchedule
              calcResult={calcResult}
              params={loanParams}
            />
          </div>
        )}

        {/* Tab 2: Debt Service Ratio (DSR) & Affordability Only */}
        {activeSection === 'dsr' && (
          <div className="mt-6">
            <DsrCalculator
              dsrProfile={dsrProfile}
              dsrResult={dsrResult}
              currencySymbol={currency}
              onChange={handleUpdateDsr}
            />
          </div>
        )}

        {/* Tab 3: Amortization Schedule */}
        {activeSection === 'schedule' && (
          <div className="space-y-6 mt-6">
            <AmortizationSchedule
              calcResult={calcResult}
              params={loanParams}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 The Loan Calculator. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neutral-600">
            <span>Fixed & Floating Amortization</span>
            <span>·</span>
            <span>DSR Affordability</span>
            <span>·</span>
            <span>Prepayment Recasting</span>
          </div>
        </footer>
      </main>

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        loanParams={loanParams}
        calcResult={calcResult}
        dsrProfile={dsrProfile}
        dsrResult={dsrResult}
      />
    </div>
  );
}
